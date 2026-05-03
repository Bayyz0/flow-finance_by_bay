import { getDb } from "./db";
import { auditLogs, InsertAuditLog, Transaction } from "../drizzle/schema";

/**
 * Audit logging utilities for tracking transaction modifications
 * Provides security and compliance tracking for all data changes
 */

export interface AuditLogEntry {
  userId: number;
  transactionId: number;
  action: "create" | "update" | "delete" | "view";
  beforeValue?: Record<string, unknown>;
  afterValue?: Record<string, unknown>;
  changedFields?: string[];
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Logs a transaction action to the audit log
 */
export async function logAuditEntry(entry: AuditLogEntry): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[AuditLog] Database not available, skipping audit log");
    return;
  }

  try {
    const auditEntry: InsertAuditLog = {
      userId: entry.userId,
      transactionId: entry.transactionId,
      action: entry.action,
      beforeValue: entry.beforeValue ? JSON.stringify(entry.beforeValue) : null,
      afterValue: entry.afterValue ? JSON.stringify(entry.afterValue) : null,
      changedFields: entry.changedFields?.join(","),
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
    };

    await db.insert(auditLogs).values(auditEntry);
  } catch (error) {
    console.error("[AuditLog] Failed to log audit entry:", error);
    // Don't throw - audit logging should not block operations
  }
}

/**
 * Retrieves audit log entries for a specific transaction
 */
export async function getTransactionAuditLog(
  userId: number,
  transactionId: number,
  limit: number = 50
) {
  const db = await getDb();
  if (!db) {
    console.warn("[AuditLog] Database not available");
    return [];
  }

  try {
    // Note: In a real implementation, you'd use Drizzle's query builder
    // For now, this is a placeholder showing the structure
    // Actual implementation would use proper Drizzle query syntax
    return [];
  } catch (error) {
    console.error("[AuditLog] Failed to retrieve audit logs:", error);
    return [];
  }
}

/**
 * Compares two transaction objects and identifies changed fields
 */
export function getChangedFields(
  before: Partial<Transaction>,
  after: Partial<Transaction>
): {
  changedFields: string[];
  beforeValues: Record<string, unknown>;
  afterValues: Record<string, unknown>;
} {
  const changedFields: string[] = [];
  const beforeValues: Record<string, unknown> = {};
  const afterValues: Record<string, unknown> = {};

  const allKeys = Object.keys(before).concat(Object.keys(after));
  const uniqueKeys = Array.from(new Set(allKeys));

  for (const key of uniqueKeys) {
    const beforeVal = before[key as keyof Transaction];
    const afterVal = after[key as keyof Transaction];

    if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
      changedFields.push(key);
      if (beforeVal !== undefined) {
        beforeValues[key] = beforeVal;
      }
      if (afterVal !== undefined) {
        afterValues[key] = afterVal;
      }
    }
  }

  return { changedFields, beforeValues, afterValues };
}

/**
 * Creates an audit log entry for a transaction creation
 */
export async function logTransactionCreated(
  userId: number,
  transactionId: number,
  transaction: Partial<Transaction>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEntry({
    userId,
    transactionId,
    action: "create",
    afterValue: transaction as Record<string, unknown>,
    ipAddress,
    userAgent,
  });
}

/**
 * Creates an audit log entry for a transaction update
 */
export async function logTransactionUpdated(
  userId: number,
  transactionId: number,
  before: Partial<Transaction>,
  after: Partial<Transaction>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const { changedFields, beforeValues, afterValues } = getChangedFields(before, after);

  await logAuditEntry({
    userId,
    transactionId,
    action: "update",
    beforeValue: beforeValues,
    afterValue: afterValues,
    changedFields,
    ipAddress,
    userAgent,
  });
}

/**
 * Creates an audit log entry for a transaction deletion
 */
export async function logTransactionDeleted(
  userId: number,
  transactionId: number,
  transaction: Partial<Transaction>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEntry({
    userId,
    transactionId,
    action: "delete",
    beforeValue: transaction as Record<string, unknown>,
    ipAddress,
    userAgent,
  });
}

/**
 * Creates an audit log entry for a transaction view
 */
export async function logTransactionViewed(
  userId: number,
  transactionId: number,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEntry({
    userId,
    transactionId,
    action: "view",
    ipAddress,
    userAgent,
  });
}
