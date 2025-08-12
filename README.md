# FinanceFlow

A comprehensive personal finance management application built with modern web technologies.

## Features

- **Multi-Currency Support**: Support for 20+ currencies with automatic country-based selection
- **Expense Tracking**: Add, edit, and categorize income and expense transactions
- **Real-time Analytics**: Interactive charts and insights into spending patterns
- **Category Management**: Customizable income and expense categories with icons and colors
- **Data Export**: Export transaction data to CSV format
- **Admin Panel**: User management and system statistics for administrators
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Secure Authentication**: JWT-based authentication with password hashing

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Wouter** for routing
- **TanStack Query** for data fetching and caching
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Zod** for schema validation

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FinanceFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB_NAME=financeflow
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=http://localhost:5000
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   EMAIL_FROM=FinanceFlow <no-reply@financeflow.com>
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production build
   npm run build
   npm start
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## Project Structure

```
FinanceFlow/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and configurations
│   │   ├── pages/          # Page components
│   │   └── main.tsx        # Application entry point
│   ├── index.html          # HTML template
│   └── package.json        # Frontend dependencies
├── server/                 # Node.js backend application
│   ├── models/             # MongoDB data models
│   ├── utils/              # Server utility functions
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
│   ├── schema.ts           # Zod schemas and TypeScript types
│   └── currency.ts         # Currency utilities
├── .env                    # Environment variables
├── package.json            # Root dependencies
└── README.md              # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/auth/user` - Get current user profile

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create new transaction
- `PATCH /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/export/csv` - Export transactions to CSV

### Categories
- `GET /api/categories` - Get categories
- `POST /api/categories` - Create category (admin only)
- `PATCH /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Analytics
- `GET /api/analytics/stats` - Get user financial statistics
- `GET /api/analytics/recent-transactions` - Get recent transactions
- `GET /api/analytics/category-expenses` - Get category-wise expenses

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `PATCH /api/admin/users/:id/status` - Update user status (admin only)
- `PATCH /api/admin/users/:id/role` - Update user role (admin only)
- `GET /api/admin/stats` - Get system statistics (admin only)

## Features in Detail

### Multi-Currency Support
- 20+ supported currencies including USD, EUR, GBP, JPY, INR, etc.
- Automatic currency selection based on country during registration
- Consistent currency display throughout the application

### Analytics Dashboard
- Monthly and yearly financial insights
- Income vs expenses visualization
- Savings rate calculation
- Category-wise expense breakdown
- Interactive charts and graphs

### Data Export
- Export transaction data to CSV format
- Includes all transaction details with proper currency formatting
- Organized and clear data structure for external analysis

### Admin Features
- User management with role-based access control
- System statistics and monitoring
- Category management for all users
- User activation/deactivation capabilities

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named `financeflow`
3. Update the `MONGODB_URI` in your `.env` file

### Creating an Admin User
To create an admin user, you can either:

1. Register a normal user and update their role in the database:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

2. Or use the provided script in `create-admin.js`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@financeflow.com or create an issue in the repository.