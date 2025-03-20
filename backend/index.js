// backend/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Add this for file system operations
const chatRouter=require("./routes/chat-routes");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Enable CORS for all origins
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/elderly-care-app').then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// Logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // The directory is now guaranteed to exist
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/chat",chatRouter);
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// API routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);

// Server configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});