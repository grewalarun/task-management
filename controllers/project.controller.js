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
    // const userId = new mongoose.Types.ObjectId(req.user.id);

    const projects = await Project.aggregate([
      // 1️⃣ Only projects where user is a member
      {
        $match: {
          members: req.user._id,
        },
      },
      //added member name and email
      {
        $lookup: {
          from: "users",
          let: { memberIds: "$members" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$memberIds"] },
              },
            },
            {
              $project: {
                name: 1,
                email: 1,
              },
            },
          ],
          as: "members",
        },
      },
      // 2️⃣ Count tasks efficiently (no full array load)
      {
        $lookup: {
          from: "tasks",
          let: { projectId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$project", "$$projectId"] },
              },
            },
            { $count: "count" },
          ],
          as: "taskData",
        },
      },

      // 3️⃣ Extract count safely
      {
        $addFields: {
          taskCount: {
            $ifNull: [{ $arrayElemAt: ["$taskData.count", 0] }, 0],
          },
        },
      },

      // 4️⃣ Remove temp array
      {
        $project: {
          taskData: 0,
        },
      },
    ]);

    res.json(projects);
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    res.status(500).json({ message: "Server error" });
  }
};


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
  removeMember,
  deleteProject
};