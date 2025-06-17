import dotenv from 'dotenv';
import connectDB from './db/index.js';

dotenv.config({
    path: './config.env',
});

connectDB()
    .then(() => {
        console.log("Database connected successfully");
    })
    .catch((err) => {
        console.error("Database connection failed:", err);
        process.exit(1);
    });




