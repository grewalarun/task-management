const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/testTask.controller");

// CREATE TASK
router.post("/tasks", createTask);

// GET ALL TASKS
router.get("/tasks", getTasks);

// GET SINGLE TASK
router.get("/tasks/:id",  getTaskById);

// UPDATE TASK
router.put("/tasks/:id", updateTask);

// DELETE TASK
router.delete("/tasks/:id", deleteTask);

module.exports = router;