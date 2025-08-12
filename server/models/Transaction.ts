import mongoose, { Schema, Document } from 'mongoose';
import { Transaction as TransactionInterface } from '@shared/schema';

export interface TransactionDocument extends Omit<TransactionInterface, '_id'>, Document {}

const transactionSchema = new Schema<TransactionDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Category',
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

// Create indexes
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ categoryId: 1 });
transactionSchema.index({ date: -1 });

export const TransactionModel = mongoose.model<TransactionDocument>('Transaction', transactionSchema);