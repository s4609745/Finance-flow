# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-12

### Added
- Initial release of FinanceFlow
- User authentication system with JWT tokens
- Multi-currency support (20+ currencies)
- Transaction management (create, read, update, delete)
- Category management with customizable icons and colors
- Real-time analytics dashboard with interactive charts
- CSV export functionality for transactions
- Admin panel for user and system management
- Responsive design for mobile and desktop
- Role-based access control
- Password hashing with bcrypt
- Email notifications for new user registration

### Features
- **Authentication**: Secure user registration and login
- **Transactions**: Full CRUD operations for financial transactions
- **Categories**: Customizable income and expense categories
- **Analytics**: Monthly/yearly insights with visual charts
- **Export**: CSV export with proper currency formatting
- **Admin**: User management and system statistics
- **Multi-Currency**: Support for global currencies with automatic selection
- **Responsive**: Mobile-first design approach

### Technical
- React 18 with TypeScript frontend
- Node.js with Express backend
- MongoDB database with Mongoose ODM
- Tailwind CSS for styling
- Radix UI for accessible components
- TanStack Query for data management
- Zod for schema validation
- JWT for secure authentication