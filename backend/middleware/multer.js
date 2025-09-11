const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ==========================
// Create uploads folder if not exist
// ==========================
const uploadPath = 'uploads/';
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// ==========================
// File Filter for images only
// ==========================
const imageFileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif|webp/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        return cb(new Error('Only image files are allowed!'), false);
    }
};

// ==========================
// Storage Configuration
// ==========================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Make filename safe & unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const safeName = path.basename(file.originalname).replace(/\s+/g, '-');
        cb(null, uniqueSuffix + '-' + safeName);
    },
});

// ==========================
// Multer Upload Instance
// ==========================
const uploads = multer({ 
    storage: storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max
});

// ==========================
// Middleware for Single / Multiple
// ==========================
const singleImageUpload = uploads.single('image'); // req.file
const multipleImageUpload = uploads.array('images', 10); // req.files

// ==========================
// Export
// ==========================
module.exports = { uploads, singleImageUpload, multipleImageUpload };
