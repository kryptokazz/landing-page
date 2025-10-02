
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables

import cors from 'cors';
import express from 'express';
import sqlite3 from 'sqlite3';
import { body, validationResult } from 'express-validator';
import path from 'path';

const app = express();

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Use CORS as the first middleware
app.use(cors(corsOptions));

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define the path for the SQLite database
const __dirname = path.resolve();
const DB_PATH = process.env.NODE_ENV === 'production' 
    ? '/tmp/inquiries.db' 
    : (process.env.DATABASE_PATH || path.join(__dirname, 'api', 'inquiries.db'));

// Initialize database on startup
const initDb = () => {
    const db = new sqlite3.verbose().Database(DB_PATH);
    const createTableSql = `
    CREATE TABLE IF NOT EXISTS inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        user_message TEXT,
        budget TEXT,
        employment TEXT
    );`;
    
    db.run(createTableSql, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Table "inquiries" created or already exists.');
        }
    });
    
    db.close();
};

// Initialize the database
initDb();

// Function to connect to the database
const connectDb = () => {
    return new sqlite3.verbose().Database(DB_PATH, (err) => {
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
        console.log('=== LOGIN ATTEMPT START ===');
        console.log('Login attempt received at:', new Date().toISOString());
        console.log('Request body:', JSON.stringify(req.body));
        
        // Log all environment variables (be careful not to expose sensitive data in production)
        console.log('Environment variables present:', Object.keys(process.env).filter(key => 
            key.includes('ADMIN') || key.includes('NODE') || key.includes('VERCEL')
        ));
        
        console.log('Environment check:', {
            hasUsername: !!process.env.ADMIN_USERNAME,
            hasPassword: !!process.env.ADMIN_PASSWORD,
            usernameLength: process.env.ADMIN_USERNAME?.length,
            passwordLength: process.env.ADMIN_PASSWORD?.length,
            nodeEnv: process.env.NODE_ENV,
            vercelEnv: process.env.VERCEL_ENV
        });
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Login validation failed:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;
        console.log('Login attempt for username:', username);
        console.log('Provided password length:', password?.length);

        // Check if environment variables are set
        if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
            console.error('Admin credentials not configured in environment');
            console.error('ADMIN_USERNAME:', process.env.ADMIN_USERNAME);
            console.error('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD);
            return res.status(500).json({ 
                message: 'Server configuration error: Admin credentials not set' 
            });
        }

        console.log('Expected username:', process.env.ADMIN_USERNAME);
        console.log('Expected password length:', process.env.ADMIN_PASSWORD?.length);
        
        // Compare credentials
        const isUsernameMatch = username === process.env.ADMIN_USERNAME;
        const isPasswordMatch = password === process.env.ADMIN_PASSWORD;
        
        console.log('Username match:', isUsernameMatch);
        console.log('Password match:', isPasswordMatch);

        if (isUsernameMatch && isPasswordMatch) {
            console.log('Login successful for user:', username);
            res.status(200).json({ 
                token: 'super-secret-admin-token',
                message: 'Login successful'
            });
        } else {
            console.log('Login failed: Invalid credentials');
            console.log('Username comparison:', { 
                expected: process.env.ADMIN_USERNAME, 
                received: username,
                match: isUsernameMatch
            });
            console.log('Password comparison:', {
                expectedLength: process.env.ADMIN_PASSWORD?.length,
                receivedLength: password?.length,
                match: isPasswordMatch
            });
            res.status(401).json({ message: 'Invalid credentials' });
        }
        console.log('=== LOGIN ATTEMPT END ===');
    }
);

// Form submission endpoint
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

// Inquiry retrieval endpoint
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

export default app;
