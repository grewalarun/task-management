const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
    createTask,
    getProjectTasks,
    updateTask,
    updateTaskStatus, 
    deleteTask,
    addComment,
    getComments,
} = require("../controllers/task.controller");

// tasks
router.post("/projects/:projectId/tasks", auth, createTask);
router.get("/projects/:projectId/tasks", auth, getProjectTasks);
router.patch("/projects/:projectId/tasks/:taskId", auth, updateTask);
router.delete("/projects/:projectId/tasks/:taskId", auth, deleteTask);

// Update status
router.patch("/:taskId/status", auth, updateTaskStatus);

// comments
router.post("/projects/:projectId/tasks/:taskId/comments", auth, addComment);
router.get("/projects/:projectId/tasks/:taskId/comments", auth, getComments);

module.exports = router;
