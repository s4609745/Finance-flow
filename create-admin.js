// Script to create admin user or update existing user to admin
// Run this in MongoDB shell or use MongoDB Compass

// Method 1: Update existing user to admin by email
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
);

// Method 2: Create new admin user (you'll need to hash the password first)
// Use bcrypt to hash password: bcrypt.hash("your-password", 12)
db.users.insertOne({
  email: "admin@financeflow.com",
  password: "$2a$12$hashedPasswordHere", // Replace with actual hashed password
  firstName: "Admin",
  lastName: "User",
  role: "admin",
  isActive: true,
  currency: "USD",
  country: "US",
  createdAt: new Date(),
  updatedAt: new Date()
});

// Method 3: Find all users and their roles
db.users.find({}, { email: 1, firstName: 1, lastName: 1, role: 1 });