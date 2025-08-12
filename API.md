# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "currency": "USD",
  "country": "US"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "_id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "currency": "USD",
    "country": "US"
  }
}
```

#### Login User
```http
POST /login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /auth/user
```
*Requires authentication*

### Transactions

#### Get Transactions
```http
GET /transactions?limit=50&offset=0
```
*Requires authentication*

#### Create Transaction
```http
POST /transactions
```
*Requires authentication*

**Request Body:**
```json
{
  "amount": "100.50",
  "description": "Grocery shopping",
  "categoryId": "category-id",
  "type": "expense",
  "date": "2025-01-12"
}
```

#### Update Transaction
```http
PATCH /transactions/:id
```
*Requires authentication*

#### Delete Transaction
```http
DELETE /transactions/:id
```
*Requires authentication*

#### Export Transactions
```http
GET /transactions/export/csv
```
*Requires authentication*

Returns CSV file download.

### Categories

#### Get Categories
```http
GET /categories?type=expense
```
*Requires authentication*

Query Parameters:
- `type` (optional): "income" or "expense"

#### Create Category
```http
POST /categories
```
*Requires authentication and admin role*

**Request Body:**
```json
{
  "name": "Food",
  "icon": "🍽️",
  "color": "#ef4444",
  "type": "expense"
}
```

#### Update Category
```http
PATCH /categories/:id
```
*Requires authentication and admin role*

#### Delete Category
```http
DELETE /categories/:id
```
*Requires authentication and admin role*

### Analytics

#### Get User Stats
```http
GET /analytics/stats?month=1&year=2025
```
*Requires authentication*

**Response:**
```json
{
  "totalBalance": 5000,
  "monthlyIncome": 3000,
  "monthlyExpenses": 2000,
  "savingsRate": 33
}
```

#### Get Recent Transactions
```http
GET /analytics/recent-transactions?limit=5
```
*Requires authentication*

#### Get Category Expenses
```http
GET /analytics/category-expenses?month=1&year=2025
```
*Requires authentication*

### Admin

#### Get All Users
```http
GET /admin/users
```
*Requires authentication and admin role*

#### Update User Status
```http
PATCH /admin/users/:id/status
```
*Requires authentication and admin role*

**Request Body:**
```json
{
  "isActive": true
}
```

#### Update User Role
```http
PATCH /admin/users/:id/role
```
*Requires authentication and admin role*

**Request Body:**
```json
{
  "role": "admin"
}
```

#### Get Admin Stats
```http
GET /admin/stats
```
*Requires authentication and admin role*

## Error Responses

All endpoints return errors in the following format:

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error