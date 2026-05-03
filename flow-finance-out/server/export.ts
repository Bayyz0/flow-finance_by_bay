import { Transaction } from "../drizzle/schema";

/**
 * Export utilities for financial data
 * Supports CSV and Excel formats for professional accounting software
 */

/**
 * Converts transactions to CSV format
 * Compatible with accounting software (QuickBooks, Xero, etc.)
 */
export function transactionsToCSV(transactions: Transaction[]): string {
  // CSV Header
  const headers = [
    "Date",
    "Transaction ID",
    "Description",
    "Category",
    "Amount",
    "Type",
    "Account",
    "Notes",
    "Real Value",
    "Tax Amount",
    "Status",
  ];

  // CSV Body
  const rows = transactions.map((tx) => [
    new Date(tx.date).toISOString().split("T")[0], // Date in YYYY-MM-DD
    tx.id,
    tx.description || "",
    tx.categoryId || "",
    tx.amount,
    tx.type || "",
    tx.accountId || "",
    tx.notes || "",
    tx.inflationAdjustedAmount || tx.amount,
    tx.taxAmount || 0,
    "completed",
  ]);

  // Escape CSV values
  const escapedRows = rows.map((row) =>
    row.map((cell) => {
      const cellStr = String(cell);
      // Escape quotes and wrap in quotes if contains comma or quote
      if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    })
  );

  // Combine headers and rows
  const csv = [headers, ...escapedRows].map((row) => row.join(",")).join("\n");

  return csv;
}

/**
 * Generates Excel-compatible CSV with proper formatting
 * Can be opened directly in Excel, Google Sheets, etc.
 */
export function transactionsToExcelCSV(transactions: Transaction[]): string {
  // Add BOM for UTF-8 encoding (Excel compatibility)
  const bom = "\uFEFF";

  // Excel-compatible headers with formatting
  const headers = [
    "Date",
    "Transaction ID",
    "Description",
    "Category",
    "Amount",
    "Type",
    "Account",
    "Notes",
    "Real Value (Inflation Adjusted)",
    "Tax Amount",
    "Status",
  ];

  // Format transactions for Excel
  const rows = transactions.map((tx) => {
    const date = new Date(tx.date).toISOString().split("T")[0];
    const amount = parseFloat(String(tx.amount)).toFixed(2);
    const realValue = tx.inflationAdjustedAmount
      ? parseFloat(String(tx.inflationAdjustedAmount)).toFixed(2)
      : amount;
    const taxAmount = tx.taxAmount ? parseFloat(String(tx.taxAmount)).toFixed(2) : "0.00";

    return [
      date,
      tx.id,
      tx.description || "",
      tx.categoryId || "",
      amount,
      tx.type || "",
      tx.accountId || "",
      tx.notes || "",
      realValue,
      taxAmount,
      "completed",
    ];
  });

  // Escape and format for Excel
  const escapedRows = rows.map((row) =>
    row.map((cell) => {
      const cellStr = String(cell);
      if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    })
  );

  // Combine with BOM
  const csv = bom + [headers, ...escapedRows].map((row) => row.join(",")).join("\n");

  return csv;
}

/**
 * Generates a summary report for accounting purposes
 */
export function generateAccountingSummary(
  transactions: Transaction[]
): {
  totalIncome: string;
  totalExpense: string;
  netIncome: string;
  totalTax: string;
  byCategory: Record<string, { count: number; amount: string }>;
  byMonth: Record<string, { income: string; expense: string }>;
} {
  let totalIncome = 0;
  let totalExpense = 0;
  let totalTax = 0;
  const byCategory: Record<string, { count: number; amount: number }> = {};
  const byMonth: Record<string, { income: number; expense: number }> = {};

  for (const tx of transactions) {
    const amount = parseFloat(String(tx.amount));
    const taxAmount = tx.taxAmount ? parseFloat(String(tx.taxAmount)) : 0;
    const category = String(tx.categoryId) || "Uncategorized";
    const monthKey = new Date(tx.date).toISOString().substring(0, 7); // YYYY-MM

    // Track by type
    if (tx.type === "income") {
      totalIncome += amount;
    } else {
      totalExpense += amount;
    }

    totalTax += taxAmount;

    // Track by category
    if (!byCategory[category]) {
      byCategory[category] = { count: 0, amount: 0 };
    }
    byCategory[category].count += 1;
    byCategory[category].amount += amount;

    // Track by month
    if (!byMonth[monthKey]) {
      byMonth[monthKey] = { income: 0, expense: 0 };
    }
    if (tx.type === "income") {
      byMonth[monthKey].income += amount;
    } else {
      byMonth[monthKey].expense += amount;
    }
  }

  // Convert to strings with proper formatting
  const byCategoryFormatted: Record<string, { count: number; amount: string }> = {};
  for (const [cat, data] of Object.entries(byCategory)) {
    byCategoryFormatted[cat] = {
      count: data.count,
      amount: data.amount.toFixed(2),
    };
  }

  const byMonthFormatted: Record<string, { income: string; expense: string }> = {};
  for (const [month, data] of Object.entries(byMonth)) {
    byMonthFormatted[month] = {
      income: data.income.toFixed(2),
      expense: data.expense.toFixed(2),
    };
  }

  return {
    totalIncome: totalIncome.toFixed(2),
    totalExpense: totalExpense.toFixed(2),
    netIncome: (totalIncome - totalExpense).toFixed(2),
    totalTax: totalTax.toFixed(2),
    byCategory: byCategoryFormatted,
    byMonth: byMonthFormatted,
  };
}

/**
 * Creates a filename for export with timestamp
 */
export function generateExportFilename(format: "csv" | "excel", suffix?: string): string {
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const name = suffix ? `transactions-${suffix}-${timestamp}` : `transactions-${timestamp}`;
  const ext = format === "excel" ? "csv" : "csv"; // Both use CSV, but Excel format has BOM
  return `${name}.${ext}`;
}
