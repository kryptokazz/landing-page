
// backend/src/init-db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'inquiries.db');

// Connect to the database (or create it if it doesn't exist)
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// SQL statement to create the 'inquiries' table
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
);
`;

// Execute the SQL statement
db.run(createTableSql, (err) => {
    if (err) {
        console.error('Error creating table:', err.message);
    } else {
        console.log('Table "inquiries" created or already exists.');
    }
});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error('Error closing the database:', err.message);
    } else {
        console.log('Database connection closed.');
    }
});
