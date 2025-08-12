import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { storage } from "./storage.js";
import { sendWelcomeEmail } from "./utils/email.js";
import { registerSchema, loginSchema, insertCategorySchema, insertTransactionSchema } from "../shared/schema.js";

// JWT Authentication middleware
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await storage.getUser(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = {
      id: user._id!,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

// Admin middleware
const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<void> {
  // Auth routes
  app.post('/api/register', async (req, res) => {
    try {
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: 'Invalid input',
          errors: validation.error.errors
        });
      }

      const { email, password, firstName, lastName, currency, country } = validation.data;

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create user
      const user = await storage.createUser({
        email,
        password,
        firstName,
        lastName,
        currency,
        country,
      });

      // Send welcome email (async, don't wait)
      sendWelcomeEmail(email, firstName).catch(console.error);

      // Generate token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          currency: user.currency,
          country: user.country,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: 'Invalid input',
          errors: validation.error.errors
        });
      }

      const { email, password } = validation.data;

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          currency: user.currency,
          country: user.country,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.get('/api/auth/user', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        currency: user.currency,
        country: user.country,
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  // Admin routes
  app.get('/api/admin/users', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(user => ({
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      })));
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.patch('/api/admin/users/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'isActive must be a boolean' });
      }

      const targetUserId = req.params.id;

      const updatedUser = await storage.updateUserStatus(targetUserId, isActive);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        _id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({ message: 'Failed to update user status' });
    }
  });

  app.patch('/api/admin/users/:id/role', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { role } = req.body;

      if (!role || !['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Role must be either "user" or "admin"' });
      }

      const targetUserId = req.params.id;

      const updatedUser = await storage.updateUserRole(targetUserId, role);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        _id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ message: 'Failed to update user role' });
    }
  });

  app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ message: 'Failed to fetch admin stats' });
    }
  });

  // Category routes
  app.get('/api/categories', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { type } = req.query;
      const categories = await storage.getCategories(type as "income" | "expense");
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

  app.post('/api/categories', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const validation = insertCategorySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: 'Invalid input',
          errors: validation.error.errors
        });
      }

      const category = await storage.createCategory(validation.data);
      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ message: 'Failed to create category' });
    }
  });

  app.patch('/api/categories/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const validation = insertCategorySchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: 'Invalid input',
          errors: validation.error.errors
        });
      }

      const categoryId = req.params.id;
      const updatedCategory = await storage.updateCategory(categoryId, validation.data);

      if (!updatedCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.json(updatedCategory);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ message: 'Failed to update category' });
    }
  });

  app.delete('/api/categories/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const categoryId = req.params.id;
      const deleted = await storage.deleteCategory(categoryId);

      if (!deleted) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: 'Failed to delete category' });
    }
  });

  // Transaction routes
  app.get('/api/transactions', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { limit = '50', offset = '0' } = req.query;
      const transactions = await storage.getTransactions(
        req.user!.id,
        parseInt(limit as string),
        parseInt(offset as string)
      );
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
  });

  app.get('/api/transactions/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const transactionId = req.params.id;
      const transaction = await storage.getTransactionById(transactionId, req.user!.id);

      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      res.json(transaction);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      res.status(500).json({ message: 'Failed to fetch transaction' });
    }
  });

  app.post('/api/transactions', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validation = insertTransactionSchema.safeParse({
        ...req.body,
        userId: req.user!.id
      });

      if (!validation.success) {
        return res.status(400).json({
          message: 'Invalid input',
          errors: validation.error.errors
        });
      }

      const transaction = await storage.createTransaction(validation.data);
      res.status(201).json(transaction);
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ message: 'Failed to create transaction' });
    }
  });

  app.patch('/api/transactions/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validation = insertTransactionSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: 'Invalid input',
          errors: validation.error.errors
        });
      }

      const transactionId = req.params.id;
      const updatedTransaction = await storage.updateTransaction(
        transactionId,
        req.user!.id,
        validation.data
      );

      if (!updatedTransaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      res.json(updatedTransaction);
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(500).json({ message: 'Failed to update transaction' });
    }
  });

  app.delete('/api/transactions/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const transactionId = req.params.id;
      const deleted = await storage.deleteTransaction(transactionId, req.user!.id);

      if (!deleted) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({ message: 'Failed to delete transaction' });
    }
  });

  app.get('/api/transactions/export/csv', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      const transactions = await storage.getTransactions(req.user!.id, 1000, 0);
      
      const csvHeader = 'Date,Description,Category,Type,Amount,Currency\n';
      const csvRows = transactions.map(t => 
        `${new Date(t.date).toLocaleDateString()},"${t.description}","${t.category?.name || 'Unknown'}",${t.type},${t.amount},${user?.currency || 'USD'}`
      ).join('\n');
      
      const csv = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } catch (error) {
      console.error('Error exporting transactions:', error);
      res.status(500).json({ message: 'Failed to export transactions' });
    }
  });

  // Analytics routes
  app.get('/api/analytics/stats', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { month, year } = req.query;
      const stats = await storage.getUserStats(
        req.user!.id,
        month ? parseInt(month as string) : undefined,
        year ? parseInt(year as string) : undefined
      );
      res.json(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ message: 'Failed to fetch user stats' });
    }
  });

  app.get('/api/analytics/recent-transactions', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { limit = '5' } = req.query;
      const transactions = await storage.getRecentTransactions(
        req.user!.id,
        parseInt(limit as string)
      );
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      res.status(500).json({ message: 'Failed to fetch recent transactions' });
    }
  });

  app.get('/api/analytics/category-expenses', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { month, year } = req.query;
      const categoryExpenses = await storage.getCategoryExpenses(
        req.user!.id,
        month ? parseInt(month as string) : undefined,
        year ? parseInt(year as string) : undefined
      );
      res.json(categoryExpenses);
    } catch (error) {
      console.error('Error fetching category expenses:', error);
      res.status(500).json({ message: 'Failed to fetch category expenses' });
    }
  });

  // Routes registered successfully
}