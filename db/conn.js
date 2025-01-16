
const mongoose = require('mongoose');
require('dotenv').config(); 

 const password = process.env.PASSWORD;
 const Database = process.env.DATABASE_NAME;
 const user = process.env.USER_ID;
 const MONGODB_URI = `mongodb+srv://${user}:${password}@cluster0.cz7sk.mongodb.net/${Database}?retryWrites=true&w=majority&appName=Cluster0`


 const connectDB = async () => {
     try {
         await mongoose.connect(MONGODB_URI);
         console.log('MongoDB connected successfully');
     } catch (error) {
         console.error('Error connecting to MongoDB:', error.message);
         process.exit(1); 
     }
 };

 module.exports = connectDB;
