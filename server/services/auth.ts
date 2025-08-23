import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { type User, type InsertUser } from "@shared/schema";
import { storage } from "../storage";

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export interface AuthTokenPayload {
  userId: string;
  email: string;
  tenantId: string | null;
}

export class AuthService {
  async register(userData: InsertUser & { confirmPassword: string }): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword,
      tenantId: userData.tenantId || "default-tenant",
    });

    // Generate JWT token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
    });

    return { user: this.sanitizeUser(user), token };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Find user
    const user = await storage.getUserByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
    });

    return { user: this.sanitizeUser(user), token };
  }

  async verifyToken(token: string): Promise<AuthTokenPayload> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  async refreshToken(token: string): Promise<string> {
    const payload = await this.verifyToken(token);
    return this.generateToken(payload);
  }

  private generateToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  private sanitizeUser(user: User): User {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser as User;
  }
}

export const authService = new AuthService();
