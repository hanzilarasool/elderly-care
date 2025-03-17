const express = require('express');
const cors = require('cors');
const app = express();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose=require("mongoose");
// Enable CORS for all origins
app.use(cors());
 
// Middleware
app.use(express.json());
// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/elderly-care-app').then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

app.use(express.urlencoded({ extended: true }));
app.use(helmet())
// Logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
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

// Your API routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);

// Server configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});