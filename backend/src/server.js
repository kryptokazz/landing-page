// backend/src/server.js
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Use the cors middleware
app.use(cors()); 

app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self';"
    );
    next();
});

// Serve static files from the frontend/src directory
app.use(express.static(path.join(__dirname, '../../frontend')));

// Define the API endpoint to handle form submissions
app.post('/api/submit-form', (req, res) => {
    const formData = req.body;
    console.log('Received form data:', formData);


  // Write the form data to a JSON file
  const filePath = path.join(__dirname, 'formData.json'); // Define the path for the JSON file
  fs.writeFile(filePath, JSON.stringify(formData, null, 2), (err) => {
    if (err) {
      console.error('Error writing to file', err);
      return res.status(500).json({ message: 'Error saving data' });
    }

    // Send a response back to the frontend
    res.status(200).json({
      message: 'Form submitted successfully!',
      data: formData
    });
  });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
