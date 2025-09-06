import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "../storage.js";
import { type InsertUser } from "../../shared/schema.js";

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || "supersecret123";
  private readonly JWT_EXPIRES_IN = "24h";

  async register(userData: InsertUser & { confirmPassword: string }): Promise<{ user: any; token: string }> {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    // Create user (remove confirmPassword and replace password with hash)
    const { confirmPassword, password, ...userDataToStore } = userData;
    const newUser = await storage.createUser({
      ...userDataToStore,
      passwordHash,
    });

    // Generate JWT
    const token = this.generateToken(newUser.id);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword, token };
  }

  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT
    const token = this.generateToken(user.id);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async refreshToken(currentToken: string): Promise<string> {
    try {
      const decoded = jwt.verify(currentToken, this.JWT_SECRET) as any;
      const user = await storage.getUser(decoded.userId);
      
      if (!user) {
        throw new Error("User not found");
      }

      return this.generateToken(user.id);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  private generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );
  }

  async verifyToken(token: string): Promise<{ userId: string }> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      return { userId: decoded.userId };
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}

export const authService = new AuthService();