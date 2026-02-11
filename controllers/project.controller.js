const Project = require("../models/Project");

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id],
      admins: [req.user._id],
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: "Failed to create project" });
  }
};


// Get my Project 

const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user._id,
    }).populate("createdBy", "name email");

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};


// Get my Project detail

const getMyProjectsDetail = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};



//Add Member to Project

const addMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isAdmin =
      project.admins.includes(req.user._id) ||
      project.createdBy.equals(req.user._id);

    if (!isAdmin) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (project.members.includes(userId)) {
      return res.status(400).json({ message: "User already a member" });
    }

    project.members.push(userId);
    await project.save();

    res.json({ message: "Member added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to add member" });
  }
};


// Delete Project (Creator / Admin only)

const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isAllowed =
      project.createdBy.equals(req.user._id) ||
      project.admins.includes(req.user._id);

    if (!isAllowed) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await project.deleteOne();

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete project" });
  }
};

module.exports = {
  createProject,
  getMyProjects,
  getMyProjectsDetail,
  addMember,
  deleteProject
};