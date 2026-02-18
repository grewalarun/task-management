const Task = require("../models/Task");
const Project = require("../models/Project");
const Comment = require("../models/Comment");
const { default: mongoose } = require("mongoose");

const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignedTo, status, dueDate, priority } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Not a project member" });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo,
      dueDate,
      status,
      createdBy: req.user._id,
      priority
    });

    res.status(201).json(task);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Failed to create task", error: "err" });
  }
};


// Helper: Status transition validator

const allowedTransitions = {
  todo: ["in-progress"],
  "in-progress": ["todo", "done"],
  done: [],
};

const isValidTransition = (from, to) => {
  return allowedTransitions[from]?.includes(to);
};


// Get Task of a Project 
const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project || !project.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const tasks = await Task.find({ project: projectId })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};


// Get tasks of logged-in user

const getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    
    let filter = {};
    if (req.user.role !== "admin") {
      filter.assignedTo = req.user.id;
    }

    if (status) {
      filter.status = status;
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};


// GET SINGLE TASK
const getSingleTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const task = await Task.findOne({
      _id: taskId,
      project: projectId,
    })
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch task" });
  }
};

// Update Task (STRICT workflow)

const updateTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { status, title, description, assignedTo, dueDate, priority } = req.body;

    const task = await Task.findById(taskId);
    if (!task || task.project.toString() !== projectId) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(projectId);

    const isAllowed =
      task.createdBy.equals(req.user._id) ||
      task.assignedTo?.equals(req.user._id) ||
      project.admins.includes(req.user._id);

    if (!isAllowed) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // 🔐 strict status workflow
    if (status && status !== task.status) {
      if (!isValidTransition(task.status, status)) {
        return res.status(400).json({
          message: `Invalid status transition: ${task.status} → ${status}`,
        });
      }
      task.status = status;
    }

    if (title) task.title = title;
    if (description) task.description = description;
    if (assignedTo) task.assignedTo = assignedTo;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    task.updatedBy = req.user._id;
    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to update task" });
  }
};

// Update Status
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    // 1️⃣ Validate taskId
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid taskId" });
    }

    // 2️⃣ Validate status value
    if (!["todo", "in-progress", "done"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // 3️⃣ Get task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 4️⃣ Validate transition
    if (!allowedTransitions[task.status].includes(status)) {
      return res.status(400).json({
        message: `Cannot move task from ${task.status} to ${status}`,
      });
    }

    // 5️⃣ Update
    task.status = status;
    task.updatedBy = req.user._id;
    await task.save();

    res.json({
      message: "Task status updated",
      task,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Status update failed" });
  }
};

// Delete Task (Creator / Admin)

const deleteTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const task = await Task.findById(taskId);
    const project = await Project.findById(projectId);

    if (!task || !project) {
      return res.status(404).json({ message: "Not found" });
    }

    const isAllowed =
      task.createdBy.equals(req.user._id) ||
      project.admins.includes(req.user._id);

    if (!isAllowed) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await task.deleteOne();

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete task" });
  }
};

// Add Comment

const addComment = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const project = await Project.findById(projectId);

    if (
      !project ||
      !project.members.some((memberId) =>
        memberId.equals(req.user._id)
      )
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ Create comment with createdBy
    const comment = await Comment.create({
      task: taskId,
      text: text.trim(),
      createdBy: req.user._id,
    });

    // ✅ Populate AFTER creation
    await comment.populate("createdBy", "name email");

    res.status(201).json(comment);
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Failed to add comment" });
  }
};



//Get Comments

const getComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const comments = await Comment.find({ task: taskId })
      .populate("createdBy", "name email")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

module.exports = { 
    createTask,
    getProjectTasks,
    getUserTasks,
    getSingleTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    addComment,
    getComments
}