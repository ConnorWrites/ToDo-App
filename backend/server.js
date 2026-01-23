const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const Todo = require('./models/Todo');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(
  'mongodb+srv://connorwritesalot_db_user:CONRADPASSWORD@firstcluster.5h1hpm2.mongodb.net/todo_app');

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

app.post('/todos', async (req, res) => {
  try {
    const todo = new Todo({ text: req.body.text });
    const savedTodo = await todo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.delete('/todos/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

app.put('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    todo.completed = !todo.completed;
    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.use(express.static(path.join(__dirname, 'frontend')));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
