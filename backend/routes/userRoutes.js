const express = require('express');
const router = express.Router();
const emailValidator = require('../middlewares/emailValidationMiddleware');

// Updated registration route
router.post('/register', emailValidator, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create new user
    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({
      message: "Registration successful! Please login",
      user: { id: user._id, email: user.email, role: user.role }
    });
    
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

module.exports = router;