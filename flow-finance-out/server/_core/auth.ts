import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

export type SessionPayload = {
  userId: number;
  username: string;
  name: string;
};

const SALT_ROUNDS = 12;

/**
 * Hash a password using PBKDF2 with SHA-256
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = createHash("sha256")
    .update(password)
    .update(salt)
    .digest("hex");
  return `${salt.toString("hex")}:${hash}`;
}

/**
 * Verify a password against its hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  const [saltHex, storedHash] = hash.split(":");
  if (!saltHex || !storedHash) return false;

  const salt = Buffer.from(saltHex, "hex");
  const computedHash = createHash("sha256")
    .update(password)
    .update(salt)
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));
  } catch {
    return false;
  }
}

class AuthService {
  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  private getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }

  /**
   * Create a session token for a user
   */
  async createSessionToken(user: User, options: { expiresInMs?: number } = {}): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      userId: user.id,
      username: user.username,
      name: user.name || "",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  async verifySession(cookieValue: string | undefined | null): Promise<SessionPayload | null> {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { userId, username, name } = payload as Record<string, unknown>;

      if (
        typeof userId !== "number" ||
        typeof username !== "string" ||
        typeof name !== "string"
      ) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }

      return {
        userId,
        username,
        name,
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }

  /**
   * Authenticate a request by verifying the session cookie
   */
  async authenticateRequest(req: Request): Promise<User> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    const user = await db.getUserByUsername(session.username);
    if (!user) {
      throw ForbiddenError("User not found");
    }

    // Update last signed in
    await db.upsertUser({
      username: user.username,
      lastSignedIn: new Date(),
    });

    return user;
  }

  /**
   * Register a new user
   */
  async registerUser(username: string, password: string, email?: string, name?: string): Promise<User> {
    // Check if user already exists
    const existingUser = await db.getUserByUsername(username);
    if (existingUser) {
      throw new Error("Username already exists");
    }

    const passwordHash = hashPassword(password);

    const userData = {
      username,
      passwordHash,
      email: email || null,
      name: name || null,
      lastSignedIn: new Date(),
    };

    await db.upsertUser(userData);
    const user = await db.getUserByUsername(username);
    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  }

  /**
   * Authenticate user login
   */
  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await db.getUserByUsername(username);
    if (!user) {
      return null;
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return null;
    }

    // Update last signed in
    await db.upsertUser({
      username: user.username,
      lastSignedIn: new Date(),
    });

    return user;
  }
}

export const authService = new AuthService();