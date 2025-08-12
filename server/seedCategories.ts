import { connectDB } from './db';
import { CategoryModel } from './models/Category';

const defaultCategories = [
  // Income categories
  { name: 'Salary', icon: '💰', color: '#10B981', type: 'income' },
  { name: 'Freelance', icon: '💻', color: '#3B82F6', type: 'income' },
  { name: 'Investment', icon: '📈', color: '#8B5CF6', type: 'income' },
  { name: 'Business', icon: '🏢', color: '#F59E0B', type: 'income' },
  { name: 'Other Income', icon: '💵', color: '#06B6D4', type: 'income' },

  // Expense categories
  { name: 'Food & Dining', icon: '🍽️', color: '#EF4444', type: 'expense' },
  { name: 'Transportation', icon: '🚗', color: '#F97316', type: 'expense' },
  { name: 'Shopping', icon: '🛍️', color: '#EC4899', type: 'expense' },
  { name: 'Entertainment', icon: '🎬', color: '#8B5CF6', type: 'expense' },
  { name: 'Bills & Utilities', icon: '⚡', color: '#EF4444', type: 'expense' },
  { name: 'Healthcare', icon: '🏥', color: '#10B981', type: 'expense' },
  { name: 'Education', icon: '📚', color: '#3B82F6', type: 'expense' },
  { name: 'Travel', icon: '✈️', color: '#06B6D4', type: 'expense' },
  { name: 'Home & Garden', icon: '🏠', color: '#84CC16', type: 'expense' },
  { name: 'Other Expenses', icon: '💸', color: '#6B7280', type: 'expense' },
];

async function seedCategories() {
  try {
    await connectDB();
    
    // Check if categories already exist
    const existingCategories = await CategoryModel.countDocuments();
    if (existingCategories > 0) {
      console.log('Categories already exist, skipping seed');
      return;
    }

    // Insert default categories
    await CategoryModel.insertMany(defaultCategories);
    console.log('Default categories seeded successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedCategories();
}

export { seedCategories };