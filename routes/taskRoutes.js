const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const verifyToken = require('../middleware/auth'); // Our security guard

// 1. CREATE a Task
router.post('/', verifyToken, async (req, res) => {
  try {
    const newTask = new Task({
      ...req.body,
      userId: req.user.userId // Get user ID from the JWT token
    });
    const savedTask = await newTask.save();
    
    // 🔥 REAL-TIME: Tell everyone a task was added
    // We will pass 'io' from index.js later
    req.app.get('socketio').emit('task_added', savedTask);
    
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 2. GET all tasks for the logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Task Route
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne();
    res.json({ message: "Task removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;