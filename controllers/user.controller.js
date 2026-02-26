const User = require("../models/User");
const Task = require("../models/Task");
const Project = require("../models/Project");
const bcrypt = require("bcryptjs");


// Get Users

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("_id name email role")
      .lean();

    const userIds = users.map((u) => u._id);

    const projects = await Project.find({
      members: { $in: userIds },
    })
      .select("_id name members")
      .lean();

    const usersWithProjects = users.map((user) => {
      const userProjects = projects
        .filter((project) =>
          project.members.some(
            (memberId) => memberId.toString() === user._id.toString()
          )
        )
        .map((project) => ({
          _id: project._id,
          name: project.name,
        }));

      return {
        ...user,
        projects: userProjects,
      };
    });

    res.json(usersWithProjects);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};


// User profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tasks = await Task.find({ assignedTo: req.params.id })
      .select("title status createdAt project");

    res.json({
      avatar: user.avatar,
      name: user.name,
      email: user.email,
      memberSince: user.createdAt,
      allocatedTasks: tasks
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error" });
  }
};
// Update profile

const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user._id; // assumes auth middleware attaches req.user

    if (!name && !email) {
      return res.status(400).json({ message: "Provide at least one field to update." });
    }

    const updates = {};
    if (name) updates.name = name.trim();

    //  if (email) updates.email = email.trim().toLowerCase();

    // Check email uniqueness if updating email

    // if (updates.email) {
    //   const existing = await User.findOne({ email: updates.email, _id: { $ne: userId } });
    //   if (existing) {
    //     return res.status(409).json({ message: "Email is already in use." });
    //   }
    // }

    const updated = await User.findByIdAndUpdate(userId, updates, { new: true })
      .select("_id name email role");

    if (!updated) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile." });
  }
};

// Change password

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id; // assumes auth middleware attaches req.user

    // --- Validation ---
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new passwords are required." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters." });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password must differ from the current password." });
    }

    // --- Fetch user with password hash ---
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // --- Verify current password ---
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    // --- Hash and save new password ---
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to change password." });
  }
};


// Update role

const changeRole = async (req, res) => {
    const { role } = req.body;

    if (!["admin", "manager" , "member"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    res.json({ message: "Role updated", user });
  }


module.exports = {
  getUsers,
  updateProfile,
  changePassword,
  getUserProfile,
  changeRole
};