const Project = require("../models/Project");
const Task = require("../models/Task");

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
    console.log(err)
    res.status(500).json({ message: "Failed to create project" });
  }
};

 // Edit project

const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body;

    // Find project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is admin
    if (!project.admins.includes(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to update this project" });
    }

    // Update fields (only if provided)
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;

    await project.save();

    res.json(project);
  } catch (err) {
    console.error("Failed to update project:", err);
    res.status(500).json({ message: "Failed to update project" });
  }
};


// Get my Project 
const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.aggregate([
      // 1️⃣ Only projects where user is a member
      {
        $match: { members: req.user._id },
      },

      // 2️⃣ Populate members
      {
        $lookup: {
          from: "users",
          let: { memberIds: "$members" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$memberIds"] } } },
            { $project: { name: 1, email: 1 } },
          ],
          as: "members",
        },
      },

      // 3️⃣ Group tasks by status
      {
        $lookup: {
          from: "tasks",
          let: { projectId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$project", "$$projectId"] } } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ],
          as: "taskStatsRaw",
        },
      },

      // 4️⃣ Convert to object + add defaults
      {
        $addFields: {
          taskStat: {
            $mergeObjects: [
              { todo: 0, done: 0, "in-progress": 0 },
              {
                $arrayToObject: {
                  $map: {
                    input: "$taskStatsRaw",
                    as: "stat",
                    in: ["$$stat._id", "$$stat.count"],
                  },
                },
              },
            ],
          },
        },
      },

      // 5️⃣ Add total
      {
        $addFields: {
          "taskStat.total": {
            $add: [
              "$taskStat.todo",
              "$taskStat.done",
              "$taskStat.in-progress",
            ],
          },
        },
      },

      // 6️⃣ Remove temp field
      { $project: { taskStatsRaw: 0 } },
    ])

    res.json(projects)
  } catch (error) {
    console.error("Failed to fetch projects:", error)
    res.status(500).json({ message: "Server error" })
  }
}



// Get my Project detail

const getMyProjectsDetail = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate("members", "name email role") ;
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

// Remove Member from Project

const removeMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check permission (admin or creator)
    const isAdmin =
      project.admins.includes(req.user._id) ||
      project.createdBy.equals(req.user._id);

    if (!isAdmin) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // Prevent removing project creator
    if (project.createdBy.equals(userId)) {
      return res.status(400).json({
        message: "Cannot remove project creator",
      });
    }

    // Check if user is actually a member
    if (!project.members.includes(userId)) {
      return res.status(400).json({
        message: "User is not a member",
      });
    }

    // Atomic remove
    await Project.findByIdAndUpdate(
      projectId,
      { $pull: { members: userId } },
      { new: true }
    );

    res.json({ message: "Member removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove member" });
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

    // Permission check (creator OR admin)
    const isAllowed =
      project.createdBy.equals(req.user._id) ||
      project.admins.some((adminId) => adminId.equals(req.user._id));

    if (!isAllowed) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // 🚨 Check if tasks exist
    const taskCount = await Task.countDocuments({ project: projectId });

    if (taskCount > 0) {
      return res.status(400).json({
        message: `Please delete all (${taskCount}) tasks before deleting this project.`,
      });
    }

    await project.deleteOne();

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Failed to delete project:", err);
    res.status(500).json({ message: "Failed to delete project" });
  }
};


module.exports = {
  createProject,
  getMyProjects,
  updateProject,
  getMyProjectsDetail,
  addMember,
  removeMember,
  deleteProject
};