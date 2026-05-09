import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise"; // ต้องมีบรรทัดนี้
// ... 

export async function getDb() {
  const databaseUrl = process.env.DATABASE_URL ?? ENV.databaseUrl;
  if (!_db && databaseUrl) {
    try {
      const pool = mysql.createPool(databaseUrl); // สร้าง Pool ก่อน
      _db = drizzle(pool); 
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
