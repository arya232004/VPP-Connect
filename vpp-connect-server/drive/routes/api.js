const express = require('express');
const router = express.Router();
const { db, admin } = require('../../firebase/config');
const multer = require('multer');
const { uploadFile } = require('../controllers/apicontroller'); // Only using uploadFile now

// Set up multer to store files in memory instead of disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST endpoint for file upload
router.post('/upload', upload.single('file'), async(req, res) => {
    try {
        const file = req.file; // File from multer (in memory)
        const mainFolder = req.body.mainFolder || 'MainFolder'; // Main folder name from the request
        const fileName = req.body.fileName || file.originalname; // File name from the request
        console.log(fileName)
        // Call uploadFile with only mainFolder, file name, and file buffer
        await uploadFile(mainFolder, fileName, file.buffer);

        // Send success response
        res.send('File uploaded successfully!');
    } catch (error) {
        // Handle errors and send error response
        res.status(500).send('Error uploading file: ' + error.message);
    }
});

module.exports = router;