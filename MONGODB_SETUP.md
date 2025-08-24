# MongoDB Setup for Ayurvedic Product Distribution System

This guide provides step-by-step instructions to set up MongoDB for the Ayurvedic Product Distribution System project.

## Prerequisites

- [MongoDB](https://www.mongodb.com/try/download/community) (version 4.4 or higher)
- [Node.js](https://nodejs.org/) (version 14 or higher)

## Setup Instructions

### 1. Install MongoDB

#### Windows
1. Download the MongoDB Community Server from the [official website](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the instructions
3. Choose "Complete" installation
4. Install MongoDB as a service (recommended)

#### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
```

#### Linux (Ubuntu)
```bash
# Import the public key
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list

# Update packages and install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
```

### 2. Verify MongoDB Installation

```bash
# Check if MongoDB is running
mongo --eval "db.version()"
```

You should see the MongoDB version printed to the console.

### 3. Create Database and Collections

1. Open a terminal or command prompt
2. Connect to MongoDB
   ```bash
   mongo
   ```

3. Create and use the Ayurvedic database
   ```javascript
   use ayurvedicdb
   ```

4. Create the initial collections
   ```javascript
   db.createCollection("users")
   db.createCollection("products")
   db.createCollection("categories")
   db.createCollection("orders")
   db.createCollection("sellers")
   ```

### 4. Configure Environment Variables

Create a `.env` file in the root directory of the project with the following content:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ayurvedicdb
JWT_SECRET=your_jwt_secret_key_here
```

Replace `your_jwt_secret_key_here` with a secure random string.

### 5. Import Sample Data (Optional)

If you want to populate the database with sample data:

```bash
# Navigate to your project directory
cd path/to/ayurvedic-product-distribution-system

# Import data using the provided script
npm run seed
```

## Database Schema

### Users Collection
- `_id`: ObjectId (Auto-generated)
- `name`: String (Required)
- `email`: String (Required, Unique)
- `password`: String (Required, Hashed)
- `phone`: String (Required)
- `address`: String (Required)
- `city`: String
- `state`: String
- `zipcode`: String
- `role`: String (Enum: 'customer', 'seller', 'admin')
- `isApproved`: Boolean
- `status`: String (Enum: 'pending', 'approved', 'rejected')
- `sellerRequest`: Object
  - `requested`: Boolean
  - `requestDate`: Date
  - `requestStatus`: String (Enum: 'pending', 'approved', 'rejected')
  - `reason`: String
- `createdAt`: Date
- `updatedAt`: Date

### Products Collection
- `_id`: ObjectId (Auto-generated)
- `name`: String (Required)
- `description`: String (Required)
- `price`: Number (Required)
- `category`: ObjectId (Reference to Categories)
- `sellerId`: ObjectId (Reference to Users)
- `stock`: Number
- `imageUrl`: String
- `ingredients`: Array of Strings
- `benefits`: Array of Strings
- `dosage`: String
- `rating`: Number
- `reviews`: Array of Objects
  - `userId`: ObjectId
  - `rating`: Number
  - `review`: String
  - `date`: Date
- `createdAt`: Date
- `updatedAt`: Date

### Categories Collection
- `_id`: ObjectId (Auto-generated)
- `name`: String (Required)
- `description`: String
- `imageUrl`: String
- `createdAt`: Date
- `updatedAt`: Date

### Orders Collection
- `_id`: ObjectId (Auto-generated)
- `user`: ObjectId (Reference to Users)
- `products`: Array of Objects
  - `product`: ObjectId (Reference to Products)
  - `quantity`: Number
  - `price`: Number
- `totalAmount`: Number
- `shippingAddress`: Object
  - `address`: String
  - `city`: String
  - `state`: String
  - `zipcode`: String
- `paymentMethod`: String
- `paymentStatus`: String (Enum: 'pending', 'completed', 'failed')
- `orderStatus`: String (Enum: 'placed', 'processing', 'shipped', 'delivered', 'cancelled')
- `trackingInfo`: String
- `createdAt`: Date
- `updatedAt`: Date

### Sellers Collection
- `_id`: ObjectId (Auto-generated)
- `userId`: ObjectId (Reference to Users)
- `name`: String
- `email`: String
- `phone`: String
- `address`: String
- `city`: String
- `state`: String
- `zipcode`: String
- `status`: String (Enum: 'pending', 'approved', 'rejected')
- `productCount`: Number
- `totalSales`: Number
- `createdAt`: Date
- `updatedAt`: Date

## Troubleshooting

### MongoDB Won't Start
1. Check if another instance is already running
   ```bash
   # Windows
   tasklist /fi "imagename eq mongod.exe"
   
   # macOS/Linux
   ps -ef | grep mongod
   ```

2. Check MongoDB logs
   - Windows: `C:\Program Files\MongoDB\Server\[version]\log\mongod.log`
   - macOS: `/usr/local/var/log/mongodb/mongo.log`
   - Linux: `/var/log/mongodb/mongod.log`

### Connection Issues
1. Verify MongoDB is running
2. Check your connection string in `.env` file
3. Ensure your network allows MongoDB connections (usually port 27017)

## Sync Scripts

This project includes scripts to maintain data integrity between Users and Sellers collections:

### syncSellerRecords.js
Ensures every user with the role 'seller' has a corresponding entry in the Sellers collection.

### checkSellerIntegrity.js
Verifies data consistency between Users and Sellers collections and reports any discrepancies.

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
