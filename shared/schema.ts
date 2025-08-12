import { z } from "zod";

// MongoDB Schema Types using Mongoose-style interfaces

// User Schema
export interface User {
  _id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  role: "user" | "admin";
  isActive: boolean;
  currency: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

// Category Schema
export interface Category {
  _id?: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
  isActive: boolean;
  createdAt: Date;
}

// Transaction Schema
export interface Transaction {
  _id?: string;
  userId: string;
  categoryId: string;
  amount: number;
  description: string;
  type: "income" | "expense";
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Zod validation schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  currency: z.string().min(1, "Currency is required"),
  country: z.string().min(1, "Country is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const insertCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().min(1, "Color is required"),
  type: z.enum(["income", "expense"]),
});

export const insertTransactionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  categoryId: z.string().min(1, "Category is required"),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["income", "expense"]),
  date: z.string().min(1, "Date is required"),
});

// Types
export type RegisterUser = z.infer<typeof registerSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// Extended types for API responses
export type TransactionWithCategory = Transaction & {
  category: Category;
};

export type UserStats = {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
};
