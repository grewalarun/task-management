const User = require("../models/User");
const Project = require("../models/Project");

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("_id name email role")
      .lean(); // 👈 improves performance

    const userIds = users.map((u) => u._id);

    const projects = await Project.find({
      members: { $in: userIds },
    })
      .select("_id name members")
      .lean();

    // Attach projects to each user
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

module.exports = {
  getUsers,
};
