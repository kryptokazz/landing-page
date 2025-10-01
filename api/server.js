
require('dotenv').config(); // Load environment variables
const cors = require('cors');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { body, validationResult } = require('express-validator');
const path = require('path');
const app = express();

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : '*',
};

app.use(cors(corsOptions));

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// This will be handled by vercel.json, so we can remove it.
// app.use(express.static(path.join(__dirname, '../dist')));

// Define the path for the SQLite database
// For Vercel, we need to store the database in /tmp
const DB_PATH = process.env.NODE_ENV === 'production' 
    ? '/tmp/inquiries.db' 
    : (process.env.DATABASE_PATH || path.join(__dirname, 'inquiries.db'));

// Function to connect to the database
const connectDb = () => {
    return new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('Error connecting to the database:', err.message);
        }
    });
};

// The rest of your API routes will go here
// ...

// We need to export the app for Vercel
module.exports = app;
