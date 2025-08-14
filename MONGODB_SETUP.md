# MongoDB Atlas Connection Guide

This guide explains how to connect to our MongoDB Atlas database for the Ayurvedic Product Distribution System.

## For Team Members

### 1. Get the Repository

```bash
git pull origin main
```

### 2. Create Your .env File

Create a file named `.env` in the backend directory with the following content:

```env
PORT=5000
MONGODB_URI=mongodb+srv://havindunimadith88:e8lUsxfwF6FZ8LeF@online-ayurvedic-produc.iuvolui.mongodb.net/?retryWrites=true&w=majority&appName=Online-Ayurvedic-Product-Distribution-System
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
```

> **Note:** For security, each team member should generate their own JWT_SECRET using:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Start the Server

```bash
npm run dev
```

### 5. Verify Connection

If you see this message in the terminal, you're successfully connected:

```bash
Server is running on port 5000
✅ MongoDB Atlas connected successfully
```

You can also test the connection by opening this URL in your browser:
`http://localhost:5000/api/health`

## Troubleshooting

If you encounter the error: `Error: listen EADDRINUSE: address already in use :::5000`

Run the restart script to kill all Node processes and restart the server:

```bash
restart.bat
```

## MongoDB Atlas Dashboard Access

If you need access to the MongoDB Atlas dashboard, please contact the project administrator which is mn pko.

## Security Note

Keep your .env file secure and never commit it to the repository.
