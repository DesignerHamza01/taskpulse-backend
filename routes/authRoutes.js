const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Import the model we moved
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // ✅ Access Socket.io via req.app.get
    const io = req.app.get('socketio');
    if (io) {
      io.emit('new_user_joined', { message: `Alert: ${name} just joined!` });
    }
    
    res.status(201).json({ message: "User registered securely!", userId: newUser._id });
  } catch (error) {
    res.status(400).json({ message: "Email already exists or data missing" });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // --- CREATE THE TOKEN ---
    // Use process.env.JWT_SECRET to pull from your .env file
    const token = jwt.sign(
        { userId: user._id }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' } 
    );

    res.json({ 
      message: "Login successful!", 
      token: token 
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;