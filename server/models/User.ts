import mongoose, { Schema, Document } from 'mongoose';
import { User as UserInterface } from '@shared/schema';

export interface UserDocument extends Omit<UserInterface, '_id'>, Document {}

const userSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  profileImageUrl: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  country: {
    type: String,
    default: 'US',
  },
}, {
  timestamps: true,
});

// Create indexes
userSchema.index({ email: 1 });
userSchema.index({ isActive: 1 });

export const UserModel = mongoose.model<UserDocument>('User', userSchema);