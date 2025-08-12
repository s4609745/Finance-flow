import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

dotenv.config();

// MongoDB Models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  currency: { type: String, default: 'USD' },
  country: { type: String, default: 'US' }
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category' },
  amount: { type: Number, required: true, min: 0 },
  description: { type: String, required: true, trim: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  date: { type: Date, required: true }
}, { timestamps: true });

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
const CategoryModel = mongoose.models.Category || mongoose.model('Category', categorySchema);
const TransactionModel = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be set');
  }
  
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || 'financeflow'
  });
  
  // Seed categories if none exist
  const categoryCount = await CategoryModel.countDocuments();
  if (categoryCount === 0) {
    const defaultCategories = [
      { name: 'Salary', icon: '💰', color: '#10B981', type: 'income' },
      { name: 'Freelance', icon: '💻', color: '#3B82F6', type: 'income' },
      { name: 'Food & Dining', icon: '🍽️', color: '#EF4444', type: 'expense' },
      { name: 'Transportation', icon: '🚗', color: '#F97316', type: 'expense' },
      { name: 'Shopping', icon: '🛍️', color: '#EC4899', type: 'expense' },
      { name: 'Bills & Utilities', icon: '⚡', color: '#EF4444', type: 'expense' }
    ];
    await CategoryModel.insertMany(defaultCategories);
  }
  
  isConnected = true;
};

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'false');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.post('/api/register', async (req, res) => {
  try {
    await connectDB();
    
    const { email, password, firstName, lastName, currency, country } = req.body;
    
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new UserModel({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      currency,
      country
    });
    
    const savedUser = await user.save();
    
    const token = jwt.sign(
      { id: savedUser._id, email: savedUser.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      user: {
        _id: savedUser._id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        currency: savedUser.currency,
        country: savedUser.country
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    await connectDB();
    
    const { email, password } = req.body;
    
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
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
        country: user.country
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Auth middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  try {
    await connectDB();
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await UserModel.findById(decoded.id);

    if (!user || !user.isActive) {
      console.log('User not found or inactive');
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = { id: user._id, email: user.email, role: user.role };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

app.get('/api/categories', authenticateToken, async (req, res) => {
  try {
    await connectDB();
    const { type } = req.query;
    const query: any = { isActive: true };
    if (type) query.type = type;
    
    const categories = await CategoryModel.find(query).sort({ name: 1 });
    
    const formattedCategories = categories.map(c => ({
      _id: c._id,
      name: c.name || 'Unknown',
      icon: c.icon || '📝',
      color: c.color || '#6B7280',
      type: c.type || 'expense',
      isActive: c.isActive !== false,
      createdAt: c.createdAt
    }));
    
    res.json(formattedCategories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

app.get('/api/transactions', authenticateToken, async (req: any, res) => {
  try {
    await connectDB();
    const { limit = '50', offset = '0' } = req.query;
    const transactions = await TransactionModel.find({ userId: req.user.id })
      .populate('categoryId')
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const formattedTransactions = transactions.map(t => ({
      _id: t._id,
      userId: t.userId,
      categoryId: t.categoryId?._id || t.categoryId,
      amount: t.amount,
      description: t.description,
      type: t.type,
      date: t.date,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      category: t.categoryId ? {
        _id: t.categoryId._id,
        name: t.categoryId.name || 'Unknown',
        icon: t.categoryId.icon || '📝',
        color: t.categoryId.color || '#6B7280',
        type: t.categoryId.type || t.type,
        isActive: t.categoryId.isActive !== false
      } : null
    }));
    
    res.json(formattedTransactions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

app.post('/api/transactions', authenticateToken, async (req: any, res) => {
  try {
    await connectDB();
    const transaction = new TransactionModel({
      ...req.body,
      userId: req.user.id,
      amount: parseFloat(req.body.amount),
      date: new Date(req.body.date)
    });
    const saved = await transaction.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create transaction' });
  }
});

app.get('/api/analytics/stats', authenticateToken, async (req: any, res) => {
  try {
    await connectDB();
    const stats = await TransactionModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);
    
    const income = stats.find(s => s._id === 'income')?.total || 0;
    const expenses = stats.find(s => s._id === 'expense')?.total || 0;
    
    res.json({
      totalBalance: income - expenses,
      monthlyIncome: income,
      monthlyExpenses: expenses,
      savingsRate: income > 0 ? Math.round(((income - expenses) / income) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

app.get('/api/analytics/recent-transactions', authenticateToken, async (req: any, res) => {
  try {
    await connectDB();
    const transactions = await TransactionModel.find({ userId: req.user.id })
      .populate('categoryId')
      .sort({ date: -1 })
      .limit(5);
    
    const formattedTransactions = transactions.map(t => ({
      _id: t._id,
      userId: t.userId,
      categoryId: t.categoryId?._id || t.categoryId,
      amount: t.amount,
      description: t.description,
      type: t.type,
      date: t.date,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      category: t.categoryId ? {
        _id: t.categoryId._id,
        name: t.categoryId.name || 'Unknown',
        icon: t.categoryId.icon || '📝',
        color: t.categoryId.color || '#6B7280',
        type: t.categoryId.type || t.type,
        isActive: t.categoryId.isActive !== false
      } : null
    }));
    
    res.json(formattedTransactions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recent transactions' });
  }
});

app.get('/api/analytics/category-expenses', authenticateToken, async (req: any, res) => {
  try {
    await connectDB();
    const expenses = await TransactionModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id), type: 'expense' } },
      { $group: { _id: '$categoryId', amount: { $sum: '$amount' } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $sort: { amount: -1 } }
    ]);
    
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
    const result = expenses.map(item => ({
      category: item.category,
      amount: item.amount,
      percentage: total > 0 ? Math.round((item.amount / total) * 100) : 0
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch category expenses' });
  }
});

app.get('/api/auth/user', authenticateToken, async (req: any, res) => {
  try {
    await connectDB();
    const user = await UserModel.findById(req.user.id);
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
      country: user.country
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

export default async (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};