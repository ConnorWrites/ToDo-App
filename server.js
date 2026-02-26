require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth'); // Correct path
const Todo = require('./models/Todo');

const app = express();
const PORT = 3000;

if(!process.env.JWT_SECRET) {
throw new Error("JWT_SECRET is not defined");
}

//middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON
app.use('/auth', authRoutes); // Auth routes

//connect to mongodb
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Get todos for logged-in user
app.get('/todos', authMiddleware, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.userId });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Create a todo
app.post('/todos', authMiddleware, async (req, res) => {
  if (!req.body.text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const todo = await Todo.create({
      text: req.body.text,
      user: req.userId
    });
    res.status(201).json(todo);
  } catch (err) {
    console.error("CREATE TODO ERROR:", err);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// Delete a todo
app.delete('/todos/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!deleted) return res.status(404).json({ error: 'Todo not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Toggle completed
app.put('/todos/:id', authMiddleware, async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    todo.completed = !todo.completed;
    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

//serve frontend
app.use(express.static(path.join(__dirname, 'frontend')));

//start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
