
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


// Define the API endpoint to handle form submissions with validation
app.post(
    '/api/login',
    [
        body('username').notEmpty(),
        body('password').notEmpty(),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            // In a real application, you would generate a proper JWT here
            res.status(200).json({ token: 'super-secret-admin-token' });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    }
);

app.post(
    '/api/submit-form',

// We need to export the app for Vercel
module.exports = app;
