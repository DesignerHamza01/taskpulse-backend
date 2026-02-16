require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');


const dbURI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
app.set('socketio', io);

app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ DB Connected'))
  .catch(err => console.log(err));

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('User Connected:', socket.id);
});

// Routes (We will move these to a routes folder next!)
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001", // Allow your React app
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

httpServer.listen(3000, () => console.log('🚀 Server running'));