import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { InsertUser, UpdateUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let poolConnection: mysql.Pool | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  const databaseUrl = process.env.DATABASE_URL ?? ENV.databaseUrl;
  
  if (!_db && databaseUrl) {
    try {
      if (!poolConnection) {
        // สร้าง Connection Pool เพื่อใช้กับ Drizzle MySQL2
        poolConnection = mysql.createPool(databaseUrl);
      }
      _db = drizzle(poolConnection);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }

  if (!_db && !databaseUrl) {
    console.warn("[Database] DATABASE_URL is not configured");
  }

  return _db;
}

function assertDb(db: ReturnType<typeof drizzle> | null): asserts db is ReturnType<typeof drizzle> {
  if (!db) {
    throw new Error(
      "Database not available. Ensure DATABASE_URL is configured and the database is running."
    );
  }
}

export async function upsertUser(user: UpdateUser): Promise<void> {
  if (!user.username) {
    throw new Error("User username is required for upsert");
  }

  const db = await getDb();
  assertDb(db);

  try {
    // If passwordHash is not provided, this is an update operation
    if (user.passwordHash === undefined) {
      const updateData: Partial<Omit<InsertUser, 'id' | 'createdAt' | 'updatedAt'>> = {};
      
      if (user.name !== undefined) updateData.name = user.name;
      if (user.email !== undefined) updateData.email = user.email;
      if (user.role !== undefined) updateData.role = user.role;
      if (user.lastSignedIn !== undefined) updateData.lastSignedIn = user.lastSignedIn;
      
      if (Object.keys(updateData).length > 0) {
        await db.update(users).set(updateData).where(eq(users.username, user.username));
      }
      return;
    }

    const insertValues: InsertUser = {
      username: user.username,
      passwordHash: user.passwordHash,
      lastSignedIn: user.lastSignedIn || new Date(),
    };

    if (user.name !== undefined) insertValues.name = user.name;
    if (user.email !== undefined) insertValues.email = user.email;
    if (user.role !== undefined) insertValues.role = user.role;

    const updateSet: Partial<Omit<InsertUser, 'id' | 'createdAt' | 'updatedAt'>> = {
      passwordHash: user.passwordHash,
      lastSignedIn: insertValues.lastSignedIn,
    };

    if (user.name !== undefined) updateSet.name = user.name;
    if (user.email !== undefined) updateSet.email = user.email;
    if (user.role !== undefined) updateSet.role = user.role;

    await db.insert(users).values(insertValues).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  assertDb(db);

  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByUsernameAndPassword(username: string, passwordHash: string) {
  const db = await getDb();
  assertDb(db);

  const result = await db
    .select()
    .from(users)
    .where(and(eq(users.username, username), eq(users.passwordHash, passwordHash)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.
