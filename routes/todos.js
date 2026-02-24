const express = require("express");
const auth = require("../middleware/auth");
const Todo = require("../models/Todo");

const router = express.Router();

//get todos
router.get("/", auth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.userId });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

//create todo
router.post("/", auth, async (req, res) => {
  if (!req.body.text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    const todo = await Todo.create({
      text: req.body.text,
      user: req.userId,
    });

    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: "Failed to create todo" });
  }
});

module.exports = router;