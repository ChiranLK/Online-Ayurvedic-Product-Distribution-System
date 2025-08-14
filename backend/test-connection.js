require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB Atlas Connection...');
console.log('Using connection string:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ MongoDB Atlas connected successfully!');
    console.log('Connection state:', mongoose.connection.readyState);
    console.log('Database name:', mongoose.connection.name);
    process.exit(0);
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});
