import { mysqlTable, int, varchar, text, timestamp, decimal, boolean } from "drizzle-orm/mysql-core";
import { InferModel } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  email: text("email"),
  name: text("name"),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in"),
});

export const accounts = mysqlTable("accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default("0.00"),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 7 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  accountId: int("account_id").notNull(),
  categoryId: int("category_id").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  description: text("description"),
  notes: text("notes"),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const recurringTransactions = mysqlTable("recurring_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  accountId: int("account_id").notNull(),
  categoryId: int("category_id").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  frequency: varchar("frequency", { length: 20 }).notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const taxConfigs = mysqlTable("tax_configs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).notNull().default("0.00"),
  incomeTaxRate: decimal("income_tax_rate", { precision: 5, scale: 2 }).notNull().default("0.00"),
  taxYear: int("tax_year").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"),
  action: varchar("action", { length: 100 }).notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// แก้ไขจุดที่เคย Error โดยการใช้ "select" และ "insert" เท่านั้น
export type User = InferModel<typeof users, "select">;
export type InsertUser = InferModel<typeof users, "insert">;

export type Account = InferModel<typeof accounts, "select">;
export type InsertAccount = InferModel<typeof accounts, "insert">;

export type Category = InferModel<typeof categories, "select">;
export type InsertCategory = InferModel<typeof categories, "insert">;

export type Transaction = InferModel<typeof transactions, "select">;
export type InsertTransaction = InferModel<typeof transactions, "insert">;

export type RecurringTransaction = InferModel<typeof recurringTransactions, "select">;
export type InsertRecurringTransaction = InferModel<typeof recurringTransactions, "insert">;

export type TaxConfig = InferModel<typeof taxConfigs, "select">;
export type InsertTaxConfig = InferModel<typeof taxConfigs, "insert">;

export type AuditLog = InferModel<typeof auditLogs, "select">;
export type InsertAuditLog = InferModel<typeof auditLogs, "insert">;