# Ayurvedic Product Distribution System

A comprehensive e-commerce platform for Ayurvedic products, connecting sellers with customers in a secure and user-friendly environment.

## 🌿 Overview

This web application is designed to facilitate the distribution and sale of Ayurvedic products. It features a multi-role authentication system, product management, order processing, and analytics for different user types.

## ✨ Features

- **Multi-role Authentication**
  - Customer, Seller, and Admin roles
  - Secure JWT-based authentication
  - Password encryption

- **Product Management**
  - Add, edit, and delete products (Sellers)
  - Image upload functionality
  - Product categorization
  - Stock management

- **Shopping Experience**
  - Product browsing and filtering
  - Cart functionality
  - Secure checkout process
  - Order tracking

- **User Dashboards**
  - Customer profile and order history
  - Seller product management and sales analytics
  - Admin user management and system statistics

- **Responsive Design**
  - Mobile-friendly interface
  - Modern UI with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling
- Axios for API communication

### Backend
- Node.js
- Express.js
- MongoDB for database
- JWT for authentication
- Multer for file uploads

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or later)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```
   git clone https://github.com/ChiranLK/Online-Ayurvedic-Product-Distribution-System.git
   cd Online-Ayurvedic-Product-Distribution-System
   ```

2. **Set up the backend**
   ```
   cd backend
   npm install
   ```
   
   Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

3. **Set up the frontend**
   ```
   cd ../frontend
   npm install
   ```
   
   Create a `.env` file in the frontend directory:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Start the application**
   
   Start the backend:
   ```
   cd ../backend
   npm start
   ```
   
   Start the frontend (in a separate terminal):
   ```
   cd ../frontend
   npm start
   ```

5. **Access the application**
   
   Open your browser and navigate to `http://localhost:3000`

## 👥 User Roles

1. **Customers**
   - Browse and purchase products
   - Track orders
   - Manage profile

2. **Sellers**
   - Manage product listings
   - Process orders
   - View sales analytics

3. **Administrators**
   - Manage users and sellers
   - Monitor system activity
   - Generate reports

## 📁 Project Structure

```
/
├── backend/               # Backend server code
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── uploads/           # Uploaded files
│   └── server.js          # Server entry point
│
└── frontend/              # Frontend React code
    ├── public/            # Static files
    └── src/               # React source code
        ├── components/    # React components
        ├── context/       # React contexts
        ├── config/        # Configuration files
        └── utils/         # Utility functions
```

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Protected API endpoints
- Role-based authorization
- Form validation
- Error handling

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new customer
- `POST /api/auth/register-seller` - Register a new seller
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/seller-products/add` - Add a product (seller only)
- `PUT /api/seller-products/edit/:id` - Update a product (seller only)
- `DELETE /api/seller-products/delete/:id` - Delete a product (seller only)

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create a new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (seller/admin only)

### Users
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `PUT /api/profile/password` - Update user password

## 🧪 Testing

Instructions for testing the application:

```
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 📱 Screenshots



## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)

---

*Developed by NIMADITH-LMH *
