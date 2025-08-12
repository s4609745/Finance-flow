import {
  type User,
  type RegisterUser,
  type Category,
  type InsertCategory,
  type Transaction,
  type InsertTransaction,
  type TransactionWithCategory,
  type UserStats,
} from "../shared/schema.js";
import { UserModel } from "./models/User.js";
import { CategoryModel } from "./models/Category.js";
import { TransactionModel } from "./models/Transaction.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: RegisterUser): Promise<User>;
  
  // Admin user operations
  getAllUsers(): Promise<User[]>;
  updateUserStatus(id: string, isActive: boolean): Promise<User | undefined>;
  updateUserRole(id: string, role: "user" | "admin"): Promise<User | undefined>;
  
  // Category operations
  getCategories(type?: "income" | "expense"): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  
  // Transaction operations
  getTransactions(userId: string, limit?: number, offset?: number): Promise<TransactionWithCategory[]>;
  getTransactionById(id: string, userId: string): Promise<TransactionWithCategory | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, userId: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string, userId: string): Promise<boolean>;
  
  // Analytics operations
  getUserStats(userId: string, month?: number, year?: number): Promise<UserStats>;
  getRecentTransactions(userId: string, limit?: number): Promise<TransactionWithCategory[]>;
  getCategoryExpenses(userId: string, month?: number, year?: number): Promise<Array<{ category: Category; amount: number; percentage: number }>>;
  
  // Admin analytics
  getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalCategories: number;
    totalTransactions: number;
  }>;
}

export class MongoStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findById(id).lean();
      return user ? this.transformUser(user) : undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();
      return user ? this.transformUserWithPassword(user) : undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(userData: RegisterUser): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new UserModel({
        ...userData,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
      });
      
      const savedUser = await user.save();
      return this.transformUser(savedUser.toObject());
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  // Admin user operations
  async getAllUsers(): Promise<User[]> {
    try {
      const users = await UserModel.find({}).sort({ createdAt: -1 }).lean();
      return users.map(user => this.transformUser(user));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }
  
  async updateUserStatus(id: string, isActive: boolean): Promise<User | undefined> {
    try {
      const user = await UserModel.findByIdAndUpdate(
        id,
        { isActive, updatedAt: new Date() },
        { new: true }
      ).lean();
      return user ? this.transformUser(user) : undefined;
    } catch (error) {
      console.error('Error updating user status:', error);
      return undefined;
    }
  }
  
  async updateUserRole(id: string, role: "user" | "admin"): Promise<User | undefined> {
    try {
      const user = await UserModel.findByIdAndUpdate(
        id,
        { role, updatedAt: new Date() },
        { new: true }
      ).lean();
      return user ? this.transformUser(user) : undefined;
    } catch (error) {
      console.error('Error updating user role:', error);
      return undefined;
    }
  }
  
  // Category operations
  async getCategories(type?: "income" | "expense"): Promise<Category[]> {
    try {
      const query: any = { isActive: true };
      if (type) {
        query.type = type;
      }
      
      const categories = await CategoryModel.find(query).sort({ name: 1 }).lean();
      return categories.map(cat => this.transformCategory(cat));
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }
  
  async createCategory(categoryData: InsertCategory): Promise<Category> {
    try {
      const category = new CategoryModel(categoryData);
      const savedCategory = await category.save();
      return this.transformCategory(savedCategory.toObject());
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }
  
  async updateCategory(id: string, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    try {
      const category = await CategoryModel.findByIdAndUpdate(
        id,
        categoryData,
        { new: true }
      ).lean();
      return category ? this.transformCategory(category) : undefined;
    } catch (error) {
      console.error('Error updating category:', error);
      return undefined;
    }
  }
  
  async deleteCategory(id: string): Promise<boolean> {
    try {
      const result = await CategoryModel.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );
      return !!result;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }
  
  // Transaction operations
  async getTransactions(userId: string, limit = 50, offset = 0): Promise<TransactionWithCategory[]> {
    try {
      const transactions = await TransactionModel.find({ userId: new mongoose.Types.ObjectId(userId) })
        .populate('categoryId')
        .sort({ date: -1 })
        .limit(limit)
        .skip(offset)
        .lean();
      
      return transactions.map(transaction => this.transformTransactionWithCategory(transaction));
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }
  
  async getTransactionById(id: string, userId: string): Promise<TransactionWithCategory | undefined> {
    try {
      const transaction = await TransactionModel.findOne({ _id: id, userId: new mongoose.Types.ObjectId(userId) })
        .populate('categoryId')
        .lean();
      
      return transaction ? this.transformTransactionWithCategory(transaction) : undefined;
    } catch (error) {
      console.error('Error getting transaction by id:', error);
      return undefined;
    }
  }
  
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    try {
      const amount = parseFloat(transactionData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }
      
      console.log('Creating transaction with data:', transactionData);
      
      const transaction = new TransactionModel({
        ...transactionData,
        userId: new mongoose.Types.ObjectId(transactionData.userId),
        categoryId: new mongoose.Types.ObjectId(transactionData.categoryId),
        amount,
        date: new Date(transactionData.date),
      });
      
      const savedTransaction = await transaction.save();
      console.log('Transaction saved:', savedTransaction.toObject());
      return this.transformTransaction(savedTransaction.toObject());
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }
  
  async updateTransaction(id: string, userId: string, transactionData: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    try {
      const updateData: any = { ...transactionData, updatedAt: new Date() };
      
      if (transactionData.amount) {
        const amount = parseFloat(transactionData.amount);
        if (isNaN(amount) || amount <= 0) {
          throw new Error('Invalid amount');
        }
        updateData.amount = amount;
      }
      if (transactionData.date) {
        updateData.date = new Date(transactionData.date);
      }
      
      const transaction = await TransactionModel.findOneAndUpdate(
        { _id: id, userId: new mongoose.Types.ObjectId(userId) },
        updateData,
        { new: true }
      ).lean();
      
      return transaction ? this.transformTransaction(transaction) : undefined;
    } catch (error) {
      console.error('Error updating transaction:', error);
      return undefined;
    }
  }
  
  async deleteTransaction(id: string, userId: string): Promise<boolean> {
    try {
      const result = await TransactionModel.findOneAndDelete({ _id: id, userId: new mongoose.Types.ObjectId(userId) });
      return !!result;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
  }
  
  // Analytics operations
  async getUserStats(userId: string, month?: number, year?: number): Promise<UserStats> {
    try {
      const currentMonth = month || new Date().getMonth() + 1;
      const currentYear = year || new Date().getFullYear();
      
      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
      
      console.log('getUserStats called with:', { userId, month, year, currentMonth, currentYear, startDate, endDate });
      console.log('Current date for reference:', new Date());
      
      // First check if user has any transactions at all
      const totalTransactionCount = await TransactionModel.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });
      console.log('Total transactions for user:', totalTransactionCount);
      
      // Test: Get all transactions for this user regardless of date
      const allUserTransactions = await TransactionModel.find({ userId: new mongoose.Types.ObjectId(userId) }).lean();
      console.log('All user transactions:', allUserTransactions.length, allUserTransactions.map(t => ({ amount: t.amount, type: t.type, date: t.date })));
      
      // Check transactions in date range
      const monthlyTransactionCount = await TransactionModel.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      });
      console.log('Monthly transactions for user:', monthlyTransactionCount);
      
      // Get monthly stats
      const monthlyStats = await TransactionModel.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      // Get total stats
      const totalStats = await TransactionModel.aggregate([
        {
          $match: { userId: new mongoose.Types.ObjectId(userId) }
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      console.log('Monthly stats:', monthlyStats);
      console.log('Total stats:', totalStats);
      
      // Also check what transactions exist
      const sampleTransactions = await TransactionModel.find({ userId: new mongoose.Types.ObjectId(userId) }).limit(3).lean();
      console.log('Sample transactions:', sampleTransactions);
      
      const monthlyIncome = monthlyStats.find(s => s._id === 'income')?.total || 0;
      const monthlyExpenses = monthlyStats.find(s => s._id === 'expense')?.total || 0;
      
      const totalIncome = totalStats.find(s => s._id === 'income')?.total || 0;
      const totalExpenses = totalStats.find(s => s._id === 'expense')?.total || 0;
      const totalBalance = totalIncome - totalExpenses;
      
      const savingsRate = monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0;
      
      return {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        savingsRate,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        savingsRate: 0,
      };
    }
  }
  
  async getRecentTransactions(userId: string, limit = 5): Promise<TransactionWithCategory[]> {
    return await this.getTransactions(userId, limit, 0);
  }
  
  async getCategoryExpenses(userId: string, month?: number, year?: number): Promise<Array<{ category: Category; amount: number; percentage: number }>> {
    try {
      const currentMonth = month || new Date().getMonth() + 1;
      const currentYear = year || new Date().getFullYear();
      
      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
      
      console.log('getCategoryExpenses called with:', { userId, month, year, currentMonth, currentYear, startDate, endDate });
      
      const categoryExpenses = await TransactionModel.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            type: 'expense',
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$categoryId',
            amount: { $sum: '$amount' }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: '$category'
        },
        {
          $sort: { amount: -1 }
        }
      ]);
      
      const totalExpenses = categoryExpenses.reduce((sum, item) => sum + item.amount, 0);
      
      return categoryExpenses.map(item => ({
        category: this.transformCategory(item.category),
        amount: item.amount,
        percentage: totalExpenses > 0 ? Math.round((item.amount / totalExpenses) * 100) : 0,
      }));
    } catch (error) {
      console.error('Error getting category expenses:', error);
      return [];
    }
  }
  
  // Admin analytics
  async getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalCategories: number;
    totalTransactions: number;
  }> {
    try {
      const [totalUsers, activeUsers, totalCategories, totalTransactions] = await Promise.all([
        UserModel.countDocuments({}),
        UserModel.countDocuments({ isActive: true }),
        CategoryModel.countDocuments({ isActive: true }),
        TransactionModel.countDocuments({}),
      ]);
      
      return {
        totalUsers,
        activeUsers,
        totalCategories,
        totalTransactions,
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalCategories: 0,
        totalTransactions: 0,
      };
    }
  }
  
  // Helper methods to transform MongoDB documents
  private transformUser(user: any): User {
    return {
      _id: user._id.toString(),
      email: user.email,
      password: '', // Never expose password
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
      isActive: user.isActive,
      currency: user.currency || 'USD',
      country: user.country || 'US',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
  
  private transformUserWithPassword(user: any): User {
    return {
      _id: user._id.toString(),
      email: user.email,
      password: user.password, // Keep password for authentication
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
      isActive: user.isActive,
      currency: user.currency || 'USD',
      country: user.country || 'US',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
  
  private transformCategory(category: any): Category {
    return {
      _id: category._id.toString(),
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
      isActive: category.isActive,
      createdAt: category.createdAt,
    };
  }
  
  private transformTransaction(transaction: any): Transaction {
    return {
      _id: transaction._id.toString(),
      userId: transaction.userId,
      categoryId: transaction.categoryId,
      amount: transaction.amount,
      description: transaction.description,
      type: transaction.type,
      date: transaction.date,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
  
  private transformTransactionWithCategory(transaction: any): TransactionWithCategory {
    return {
      _id: transaction._id.toString(),
      userId: transaction.userId,
      categoryId: transaction.categoryId,
      amount: transaction.amount,
      description: transaction.description,
      type: transaction.type,
      date: transaction.date,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      category: transaction.categoryId ? this.transformCategory(transaction.categoryId) : undefined,
    };
  }
}

export const storage = new MongoStorage();
