
require('dotenv').config(); // Load environment variables
const cors = require('cors');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { body, validationResult } = require('express-validator');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self';"
    );
    next();
});

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Define the path for the SQLite database
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'inquiries.db');

// Function to connect to the database
const connectDb = () => {
    return new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('Error connecting to the database:', err.message);
        }
    });
};

// Login endpoint
app.post(
    '/api/login',
    [
        body('username').notEmpty().withMessage('Username is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    (req, res) => {
        console.log('Login attempt received');
        console.log('Environment check:', {
            hasUsername: !!process.env.ADMIN_USERNAME,
            hasPassword: !!process.env.ADMIN_PASSWORD,
            usernameLength: process.env.ADMIN_USERNAME?.length,
            passwordLength: process.env.ADMIN_PASSWORD?.length
        });
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Login validation failed:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;
        console.log('Login attempt for username:', username);

        // Check if environment variables are set
        if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
            console.error('Admin credentials not configured in environment');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            console.log('Login successful for user:', username);
            res.status(200).json({ 
                token: 'super-secret-admin-token',
                message: 'Login successful'
            });
        } else {
            console.log('Login failed: Invalid credentials for user:', username);
            res.status(401).json({ message: 'Invalid credentials' });
        }
    }
);

// Define the API endpoint to handle form submissions with validation
app.post(
    '/api/submit-form',
    // Validation middleware
    [
        body('name').trim().notEmpty().withMessage('Name is required.'),
        body('email').isEmail().withMessage('A valid email is required.'),
        body('phone').optional().trim().escape(),
        body('user_message').optional().trim().escape(),
        body('budget').optional().trim().escape(),
        body('employment').optional().trim().escape(),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, phone, user_message, budget, employment } = req.body;
        const createdAt = new Date().toISOString();

        const db = connectDb();
        const sql = `INSERT INTO inquiries (created_at, name, email, phone, user_message, budget, employment)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;

        db.run(sql, [createdAt, name, email, phone, user_message, budget, employment], function (err) {
            if (err) {
                console.error('Error inserting data:', err.message);
                return res.status(500).json({ message: 'Error saving data' });
            }

            console.log(`New inquiry saved with ID: ${this.lastID}`);
            res.status(200).json({
                message: 'Form submitted successfully!',
                data: { id: this.lastID, created_at: createdAt, ...req.body },
            });
        });

        db.close();
    }
);

// API endpoint to retrieve all inquiries for the Admin Dashboard (GET request)
app.get('/api/inquiries', (req, res) => {
    const db = connectDb();
    const sql = `SELECT * FROM inquiries ORDER BY created_at DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error retrieving data:', err.message);
            return res.status(500).json({ message: 'Error retrieving data' });
        }

        res.status(200).json(rows);
    });

    db.close();
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

