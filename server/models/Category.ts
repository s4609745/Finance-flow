import mongoose, { Schema, Document } from 'mongoose';
import { Category as CategoryInterface } from '@shared/schema';

export interface CategoryDocument extends Omit<CategoryInterface, '_id'>, Document {}

const categorySchema = new Schema<CategoryDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  icon: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Create indexes
categorySchema.index({ type: 1, isActive: 1 });
categorySchema.index({ name: 1 });

export const CategoryModel = mongoose.model<CategoryDocument>('Category', categorySchema);