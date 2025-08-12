import { connectDB } from "./db";
import { CategoryModel } from "./models/Category";

const defaultCategories = [
  // Income categories
  { name: "Salary", icon: "Briefcase", color: "#16a34a", type: "income" },
  { name: "Freelance", icon: "User", color: "#059669", type: "income" },
  { name: "Investment", icon: "TrendingUp", color: "#0d9488", type: "income" },
  { name: "Bonus", icon: "Gift", color: "#0891b2", type: "income" },
  { name: "Other Income", icon: "Plus", color: "#0284c7", type: "income" },

  // Expense categories
  { name: "Food & Dining", icon: "UtensilsCrossed", color: "#dc2626", type: "expense" },
  { name: "Transportation", icon: "Car", color: "#ea580c", type: "expense" },
  { name: "Shopping", icon: "ShoppingBag", color: "#d97706", type: "expense" },
  { name: "Entertainment", icon: "Gamepad2", color: "#ca8a04", type: "expense" },
  { name: "Bills & Utilities", icon: "Receipt", color: "#65a30d", type: "expense" },
  { name: "Healthcare", icon: "Heart", color: "#16a34a", type: "expense" },
  { name: "Education", icon: "GraduationCap", color: "#0891b2", type: "expense" },
  { name: "Travel", icon: "Plane", color: "#0284c7", type: "expense" },
  { name: "Home & Garden", icon: "Home", color: "#7c3aed", type: "expense" },
  { name: "Other Expenses", icon: "Minus", color: "#be123c", type: "expense" },
];

export async function seedCategories() {
  try {
    await connectDB();
    console.log('Connected to MongoDB for seeding...');

    // Check if categories already exist
    const existingCategories = await CategoryModel.countDocuments();
    
    if (existingCategories > 0) {
      console.log(`Found ${existingCategories} existing categories. Skipping seed.`);
      return;
    }

    // Insert default categories
    await CategoryModel.insertMany(defaultCategories);
    console.log(`Successfully seeded ${defaultCategories.length} default categories.`);
    
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
}

// Run if this file is executed directly
seedCategories().then(() => {
  process.exit(0);
});