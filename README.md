# Online Ayurvedic Product Distribution System

A comprehensive web application for buying, selling, and managing Ayurvedic products with multi-user roles (Customer, Seller, Admin).

## 🌿 Overview

The Online Ayurvedic Product Distribution System is a full-stack MERN application designed to create an ecosystem for the distribution and sale of Ayurvedic products. The platform connects customers with sellers of authentic Ayurvedic products while providing robust administration features.

![Dashboard Screenshot](https://placeholder-for-screenshot.jpg)

## ✨ Features

### Multi-User Roles

- **Customers**: Browse products, manage cart, place orders, track deliveries
- **Sellers**: List products, manage inventory, track sales, receive orders
- **Administrators**: User management, product approval, analytics, system configuration

### Key Functionalities

- **User Authentication**: Secure login, registration, and role-based access control
- **Product Management**: Comprehensive product listings with descriptions, images, and categories
- **Shopping Cart**: Add, remove, and modify cart items before purchase
- **Order Processing**: Complete checkout flow with shipping and payment options
- **Seller Dashboard**: Sales analytics, inventory management, and order fulfillment
- **Admin Controls**: User management, seller approval, and system monitoring
- **Seller Request System**: Allow customers to request seller privileges
- **Reviews & Ratings**: Product feedback and quality assurance

## 🚀 Technology Stack

### Frontend

- React.js
- TailwindCSS
- Axios
- React Router
- Context API for state management

### Backend

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- REST API

### DevOps & Tools

- Git & GitHub
- MongoDB Atlas (Cloud Database)
- VS Code

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/ChiranLK/Online-Ayurvedic-Product-Distribution-System.git
cd Online-Ayurvedic-Product-Distribution-System
```

### 2. Setup MongoDB

Follow the instructions in [MONGODB_SETUP.md](MONGODB_SETUP.md)

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 5. Environment Variables

Create `.env` files in both the backend and frontend directories:

**Backend `.env`**:

```plaintext
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ayurvedicdb
JWT_SECRET=your_secure_jwt_secret_here
NODE_ENV=development
```

**Frontend `.env`**:

```plaintext
REACT_APP_API_URL=http://localhost:5000
```

### 6. Run the Application

**Development Mode (Backend)**:

```bash
cd backend
npm run dev
```

**Development Mode (Frontend)**:

```bash
cd frontend
npm start
```

## 🏗️ Project Structure

```plaintext
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts
│   └── server.js        # Entry point
│
├── frontend/
│   ├── public/          # Static files
│   └── src/
│       ├── components/  # UI components
│       ├── context/     # React context
│       ├── config/      # Configuration
│       ├── hooks/       # Custom hooks
│       ├── pages/       # Page components
│       ├── services/    # API services
│       ├── utils/       # Utility functions
│       ├── App.js       # Root component
│       └── index.js     # Entry point
│
├── MONGODB_SETUP.md     # MongoDB setup guide
└── README.md            # Project documentation
```

## 🔄 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (Seller/Admin)
- `PUT /api/products/:id` - Update product (Seller/Admin)
- `DELETE /api/products/:id` - Delete product (Seller/Admin)

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Orders

- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order status (Admin/Seller)

### Users

- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Seller Requests

- `POST /api/seller-requests` - Submit seller request (Customer)
- `GET /api/seller-requests` - Get all seller requests (Admin)
- `GET /api/seller-requests/me` - Get user's seller request
- `PUT /api/seller-requests/:id/approve` - Approve seller request (Admin)
- `PUT /api/seller-requests/:id/reject` - Reject seller request (Admin)

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 🛠️ Utility Scripts

### Sync Seller Records

Ensures data consistency between Users and Sellers collections.

```bash
cd backend
node scripts/syncSellerRecords.js
```

### Check Seller Integrity

Verifies and reports any data inconsistencies.

```bash
cd backend
node scripts/checkSellerIntegrity.js
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [TailwindCSS](https://tailwindcss.com/)
- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Node.js](https://nodejs.org/)
