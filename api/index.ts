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

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be set');
  }
  
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || 'financeflow'
  });
  
  isConnected = true;
};

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
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

export default async (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};