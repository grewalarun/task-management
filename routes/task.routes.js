const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
    createTask,
    getProjectTasks,
    getUserTasks,
    getSingleTask,
    updateTask,
    updateTaskStatus, 
    deleteTask,
    addComment,
    getComments,
} = require("../controllers/task.controller");

// tasks
router.post("/projects/:projectId/tasks", auth, createTask);
router.get("/projects/:projectId/tasks", auth, getProjectTasks);
router.get("/tasks/me", auth, getUserTasks);
router.get("/projects/:projectId/tasks/:taskId", auth, getSingleTask);
router.patch("/projects/:projectId/tasks/:taskId", auth, updateTask);
router.delete("/projects/:projectId/tasks/:taskId", auth, deleteTask);

// Update status
router.patch("/:taskId/status", auth, updateTaskStatus);

// comments
router.post("/projects/:projectId/tasks/:taskId/comments", auth, addComment);
router.get("/projects/:projectId/tasks/:taskId/comments", auth, getComments);

module.exports = router;
