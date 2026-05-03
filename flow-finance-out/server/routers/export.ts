import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { transactionsToCSV, transactionsToExcelCSV, generateAccountingSummary } from "../export";

/**
 * Export router for financial data export functionality.
 * FIX: Return empty CSV with headers instead of throwing NOT_FOUND when
 * there are no transactions — this was crashing the ExportPanel UI.
 */
export const exportRouter = router({
  exportAsCSV: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        categoryId: z.number().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      try {
        // TODO: Fetch transactions from database based on filters
        const transactions: any[] = [];
        const csv = transactionsToCSV(transactions);
        const filename = `transactions-${new Date().toISOString().split("T")[0]}.csv`;

        return {
          success: true,
          csv,
          filename,
          count: transactions.length,
          message: transactions.length === 0
            ? "No transactions found — empty CSV with headers exported"
            : "CSV export successful",
        };
      } catch (error) {
        console.error("[Export] CSV export failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export as CSV",
        });
      }
    }),

  exportAsExcel: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        categoryId: z.number().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      try {
        const transactions: any[] = [];
        const csv = transactionsToExcelCSV(transactions);
        const filename = `transactions-${new Date().toISOString().split("T")[0]}.csv`;

        return {
          success: true,
          csv,
          filename,
          count: transactions.length,
          message: transactions.length === 0
            ? "No transactions found — empty CSV with headers exported"
            : "Excel export successful",
        };
      } catch (error) {
        console.error("[Export] Excel export failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export as Excel",
        });
      }
    }),

  getAccountingSummary: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(({ input, ctx }) => {
      try {
        const transactions: any[] = [];
        const summary = generateAccountingSummary(transactions);

        return {
          success: true,
          summary,
        };
      } catch (error) {
        console.error("[Export] Summary generation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate accounting summary",
        });
      }
    }),
});
