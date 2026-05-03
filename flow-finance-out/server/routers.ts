import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { exportRouter } from "./routers/export";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { authService } from "./_core/auth";
import {
  calculateRealValue,
  calculateNominalValue,
  calculateVAT,
  calculateIncomeTax,
  analyzeSpendingPower,
} from "./calculations";
import { encryptAmount, decryptAmount } from "./encryption";
import { getDb } from "./db";
import {
  accounts, categories, transactions, recurringTransactions,
  taxConfigs, auditLogs,
  type InsertAccount, type InsertCategory, type InsertTransaction,
  type InsertRecurringTransaction, type InsertTaxConfig,
} from "../drizzle/schema";
import { eq, and, desc, between, sql } from "drizzle-orm";

// ── Input schemas ──────────────────────────────────────────────────────────
const accountSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(["asset", "liability"]),
  currency: z.string().length(3).default("USD"),
  initialBalance: z.string().default("0"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional(),
  isActive: z.boolean().default(true),
});

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["income", "expense"]),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#3B82F6"),
});

const transactionSchema = z.object({
  accountId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  type: z.enum(["income", "expense"]),
  description: z.string().min(1).max(255),
  amount: z.string(), // decimal string
  date: z.string(), // ISO date string
  notes: z.string().optional(),
  tags: z.string().optional(),
  isRecurring: z.boolean().default(false),
});

const recurringSchema = z.object({
  accountId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  type: z.enum(["income", "expense"]),
  description: z.string().min(1).max(255),
  amount: z.string(),
  frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"]),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
});

const taxConfigSchema = z.object({
  vatRate: z.string().default("7.00"),
  incomeTaxRate: z.string().default("0"),
  taxYear: z.number().int().min(2000).max(2100),
  currency: z.string().length(3).default("USD"),
});

// ── Helper ─────────────────────────────────────────────────────────────────
async function requireDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  return db;
}

// ══════════════════════════════════════════════════════════════════════════════
export const appRouter = router({
  system: systemRouter,

  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),

    register: publicProcedure
      .input(z.object({
        username: z.string().min(3).max(50),
        password: z.string().min(6),
        email: z.string().email().optional(),
        name: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const user = await authService.registerUser(
            input.username, input.password, input.email, input.name
          );
          return { success: true, user: { id: user.id, username: user.username, name: user.name } };
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error instanceof Error ? error.message : "Registration failed",
          });
        }
      }),

    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const user = await authService.authenticateUser(input.username, input.password);
        if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password" });
        const sessionToken = await authService.createSessionToken(user);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true, user: { id: user.id, username: user.username, name: user.name } };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    // Update profile (name, email, password)
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        currentPassword: z.string().optional(),
        newPassword: z.string().min(6).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { upsertUser, getUserByUsername } = await import("./db");
        const user = ctx.user!;
        if (input.newPassword) {
          if (!input.currentPassword) throw new TRPCError({ code: "BAD_REQUEST", message: "Current password required" });
          const valid = await authService.authenticateUser(user.username, input.currentPassword);
          if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password incorrect" });
          const { hashPassword } = await import("./_core/auth");
          await upsertUser({ username: user.username, passwordHash: hashPassword(input.newPassword) });
        }
        const updateData: Record<string, string | undefined> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.email !== undefined) updateData.email = input.email;
        if (Object.keys(updateData).length > 0) await upsertUser({ username: user.username, ...updateData });
        return { success: true };
      }),
  }),

  // ── Accounts CRUD ─────────────────────────────────────────────────────────
  accounts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
      return db.select().from(accounts)
        .where(eq(accounts.userId, ctx.user!.id))
        .orderBy(desc(accounts.createdAt));
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const db = await requireDb();
        const rows = await db.select().from(accounts)
          .where(and(eq(accounts.id, input.id), eq(accounts.userId, ctx.user!.id)))
          .limit(1);
        if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
        return rows[0];
      }),

    create: protectedProcedure
      .input(accountSchema)
      .mutation(async ({ input, ctx }) => {
        const db = await requireDb();
        const data: InsertAccount = { ...input, userId: ctx.user!.id };
        await db.insert(accounts).values(data);
        const rows = await db.select().from(accounts)
          .where(eq(accounts.userId, ctx.user!.id))
          .orderBy(desc(accounts.createdAt)).limit(1);
        return rows[0];
      }),

    update: protectedProcedure
      .input(z.object({ id: z.number(), data: accountSchema.partial() }))
      .mutation(async ({ input, ctx }) => {
        const db = await requireDb();
        await db.update(accounts).set(input.data)
          .where(and(eq(accounts.id, input.id), eq(accounts.userId, ctx.user!.id)));
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await requireDb();
        await db.delete(accounts)
          .where(and(eq(accounts.id, input.id), eq(accounts.userId, ctx.user!.id)));
        return { success: true };
      }),
  }),

  // ── Categories CRUD ───────────────────────────────────────────────────────
  categories: router({
    list: protectedProcedure
      .input(z.object({ type: z.enum(["income", "expense", "all"]).default("all") }))
      .query(async ({ input, ctx }) => {
        const db = await requireDb();
        const base = db.select().from(categories).where(eq(categories.userId, ctx.user!.id));
        if (input.type === "all") return base.orderBy(categories.name);
        return db.select().from(categories)
          .where(and(eq(categories.userId, ctx.user!.id), eq(categories.type, input.type)))
          .orderBy(categories.name);
      }),

    create: protectedProcedure
      .input(categorySchema)
      .mutation(async ({ input, ctx }) => {
        const db = await requireDb();
        const data: InsertCategory = { ...input, userId: ctx.user!.id };
        await db.insert(categories).values(data);
        const rows = await db.select().from(categories)
          .where(eq(categories.userId, ctx.user!.id))
          .orderBy(desc(categories.createdAt)).limit(1);
        return rows[0];
      }),

    update: protectedProcedure
      .input(z.object({ id: z.number(), data: categorySchema.partial() }))
      .mutation(async ({ input, ctx }) => {
        const db = await requireDb();
        await db.update(categories).set(input.data)
          .where(and(eq(categories.id, input.id), eq(categories.userId, ctx.user!.id)));
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await requireDb();
        await db.delete(categories)
          .where(and(eq(categories.id, input.id), eq(categories.userId, ctx.user!.id)));
        return { success: true };
      }),

    // Seed default categories for a new user
    seedDefaults: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await requireDb();
      const defaults = [
        { name: "Salary", type: "income" as const, icon: "💼", color: "#10B981" },
        { name: "Freelance", type: "income" as const, icon: "💻", color: "#3B82F6" },
        { name: "Investment", type: "income" as const, icon: "📈", color: "#8B5CF6" },
        { name: "Food & Dining", type: "expense" as const, icon: "🍜", color: "#F59E0B" },
        { name: "Transport", type: "expense" as const, icon: "🚗", color: "#EF4444" },
        { name: "Shopping", type: "expense" as const, icon: "🛒", color: "#EC4899" },
        { name: "Utilities", type: "expense" as const, icon: "⚡", color: "#6366F1" },
        { name: "Healthcare", type: "expense" as const, icon: "🏥", color: "#14B8A6" },
        { name: "Entertainment", type: "expense" as const, icon: "🎮", color: "#F97316" },
      ];
      await db.insert(categories).values(defaults.map(d => ({ ...d, userId: ctx.user!.id })));
      return { success: true, count: defaults.length };
    }),
  }),

  // ── Transactions CRUD ─────────────────────────────────────────────────────
  transactions: router({
    list: protectedProcedure
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        type: z.enum(["income", "expense", "all"]).default("all"),
        accountId: z.number().optional(),
        categoryId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const db = await requireDb();
        // Build conditions
        const conditions = [eq(transactions.userId, ctx.user!.id)];
        if (input.type !== "all") conditions.push(eq(transactions.type, input.type));
        if (input.accountId) conditions.push(eq(transactions.accountId, input.accountId));
        if (input.categoryId) conditions.push(eq(transactions.categoryId, input.categoryId));
        if (input.startDate && input.endDate) {
          conditions.push(between(transactions.date, new Date(input.startDate), new Date(input.endDate)));
        }

        const rows = await db.select({
          transaction: transactions,
          account: { id: accounts.id, name: accounts.name },
          category: { id: categories.id, name: categories.name, icon: categories.icon, color: categories.color },
        })
          .from(transactions)
          .leftJoin(accounts, eq(transactions.accountId, accounts.id))
          .leftJoin(categories, eq(transactions.categoryId, categories.id))
          .where(and(...conditions))
          .orderBy(desc(transactions.date))
          .limit(input.limit)
          .offset(input.offset);

        const total = await db.select({ count: sql<number>`count(*)` })
          .from(transactions).where(and(...conditions));

        return { rows, total: total[0]?.count ?? 0 };
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const db = await requireDb();
        const rows = await db.select().from(transactions)
          .where(and(eq(transactions.id, input.id), eq(transactions.userId, ctx.user!.id))).limit(1);
        if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND" });
        return rows[0];
      }),

    create: protectedProcedure
      .input(transactionSchema)
      .mutation(async ({ input, ctx }) => {
        const db = await requireDb();
        const data: InsertTransaction = {
          ...input,
          userId: ctx.user!.id,
          date: new Date(input.date),
        };
        await db.insert(transactions).values(data);
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({ id: z.number(), data: transactionSchema.partial() }))
      .mutation(async ({ input, ctx }) => {
        const db = await requireDb();
        const updateData = { ...input.data } as Record<string, unknown>;
        if (input.data?.date) updateData.date = new Date(input.data.date);
        await db.update(transactions).set(updateData)
          .where(and(eq(transactions.id, input.id), eq(transactions.userId, ctx.user!.id)));
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await requireDb();
        await db.delete(transactions)
          .where(and(eq(transactions.id, input.id), eq(transactions.userId, ctx.user!.id)));
        return { success: true };
      }),

    // Summary stats for dashboard
    summary: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const db = await requireDb();
        const conditions = [eq(transactions.userId, ctx.user!.id)];
        if (input.startDate && input.endDate) {
          conditions.push(between(transactions.date, new Date(input.startDate), new Date(input.endDate)));
        }
        const rows = await db.select({
          type: transactions.type,
          total: sql<string>`SUM(${transactions.amount})`,
          count: sql<number>`COUNT(*)`,
        }).from(transactions).where(and(...conditions)).groupBy(transactions.type);

        const income = rows.find(r => r.type === "income");
        const expense = rows.find(r => r.type === "expense");
        const totalIncome = parseFloat(income?.total ?? "0");
        const totalExpense = parseFloat(expense?.total ?? "0");
        return {
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          incomeCount: income?.count ?? 0,
          expenseCount: expense?.count ?? 0,
        };
      }),
  }),

  // ── Recurring Transactions CRUD ───────────────────────────────────────────
  recurring: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
      return db.select().from(recurringTransactions)
        .where(eq(recurringTransactions.userId, ctx.user!.id))
        .orderBy(desc(recurringTransactions.createdAt));
    }),

    create: protectedProcedure.input(recurringSchema).mutation(async ({ input, ctx }) => {
      const db = await requireDb();
      const data: InsertRecurringTransaction = {
        ...input,
        userId: ctx.user!.id,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : undefined,
      };
      await db.insert(recurringTransactions).values(data);
      return { success: true };
    }),

    update: protectedProcedure
      .input(z.object({ id: z.number(), data: recurringSchema.partial() }))
      .mutation(async ({ input, ctx }) => {
        const db = await requireDb();
        const updateData = { ...input.data } as Record<string, unknown>;
        if (input.data?.startDate) updateData.startDate = new Date(input.data.startDate);
        if (input.data?.endDate) updateData.endDate = new Date(input.data.endDate);
        await db.update(recurringTransactions).set(updateData)
          .where(and(eq(recurringTransactions.id, input.id), eq(recurringTransactions.userId, ctx.user!.id)));
        return { success: true };
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const db = await requireDb();
      await db.delete(recurringTransactions)
        .where(and(eq(recurringTransactions.id, input.id), eq(recurringTransactions.userId, ctx.user!.id)));
      return { success: true };
    }),
  }),

  // ── Settings (Tax Config) CRUD ────────────────────────────────────────────
  settings: router({
    getTaxConfig: protectedProcedure
      .input(z.object({ taxYear: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        const db = await requireDb();
        const year = input.taxYear ?? new Date().getFullYear();
        const rows = await db.select().from(taxConfigs)
          .where(and(eq(taxConfigs.userId, ctx.user!.id), eq(taxConfigs.taxYear, year))).limit(1);
        return rows[0] ?? null;
      }),

    upsertTaxConfig: protectedProcedure
      .input(taxConfigSchema)
      .mutation(async ({ input, ctx }) => {
        const db = await requireDb();
        const existing = await db.select({ id: taxConfigs.id }).from(taxConfigs)
          .where(and(eq(taxConfigs.userId, ctx.user!.id), eq(taxConfigs.taxYear, input.taxYear))).limit(1);

        if (existing[0]) {
          await db.update(taxConfigs).set(input).where(eq(taxConfigs.id, existing[0].id));
        } else {
          const data: InsertTaxConfig = { ...input, userId: ctx.user!.id };
          await db.insert(taxConfigs).values(data);
        }
        return { success: true };
      }),

    listTaxConfigs: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
      return db.select().from(taxConfigs)
        .where(eq(taxConfigs.userId, ctx.user!.id))
        .orderBy(desc(taxConfigs.taxYear));
    }),

    deleteTaxConfig: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await requireDb();
        await db.delete(taxConfigs)
          .where(and(eq(taxConfigs.id, input.id), eq(taxConfigs.userId, ctx.user!.id)));
        return { success: true };
      }),
  }),

  // ── Financial calculations ─────────────────────────────────────────────────
  calculations: router({
    getRealValue: protectedProcedure
      .input(z.object({ nominalAmount: z.number().positive(), inflationRate: z.number().min(0).max(100), yearsAgo: z.number().min(0) }))
      .query(({ input }) => {
        const realValue = calculateRealValue(input.nominalAmount, input.inflationRate, input.yearsAgo);
        return { nominalAmount: input.nominalAmount.toFixed(2), realValue, inflationRate: input.inflationRate, yearsAgo: input.yearsAgo };
      }),
    getNominalValue: protectedProcedure
      .input(z.object({ realAmount: z.number().positive(), inflationRate: z.number().min(0).max(100), yearsAgo: z.number().min(0) }))
      .query(({ input }) => {
        const nominalValue = calculateNominalValue(input.realAmount, input.inflationRate, input.yearsAgo);
        return { realAmount: input.realAmount.toFixed(2), nominalValue, inflationRate: input.inflationRate, yearsAgo: input.yearsAgo };
      }),
    analyzeSpendingPower: protectedProcedure
      .input(z.object({ historicalAmount: z.number().positive(), inflationRate: z.number().min(0).max(100), yearsAgo: z.number().min(0) }))
      .query(({ input }) => analyzeSpendingPower(input.historicalAmount, input.inflationRate, input.yearsAgo)),
  }),

  tax: router({
    calculateVAT: protectedProcedure
      .input(z.object({ amount: z.number().positive(), vatRate: z.number().min(0).max(100) }))
      .query(({ input }) => calculateVAT(input.amount, input.vatRate)),
    calculateIncomeTax: protectedProcedure
      .input(z.object({ income: z.number().positive(), taxRate: z.number().min(0).max(100) }))
      .query(({ input }) => calculateIncomeTax(input.income, input.taxRate)),
  }),

  encryption: router({
    encryptAmount: protectedProcedure
      .input(z.object({ amount: z.union([z.number(), z.string()]) }))
      .mutation(({ input }) => {
        const key = process.env.ENCRYPTION_KEY || "default-key";
        return { success: true, encrypted: encryptAmount(input.amount, key) };
      }),
    decryptAmount: protectedProcedure
      .input(z.object({ encrypted: z.string() }))
      .mutation(({ input }) => {
        const key = process.env.ENCRYPTION_KEY || "default-key";
        return { success: true, decrypted: decryptAmount(input.encrypted, key) };
      }),
  }),

  export: exportRouter,
});

export type AppRouter = typeof appRouter;
