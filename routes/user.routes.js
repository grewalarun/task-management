const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");
const User = require("../models/User");
const { getUsers } = require("../controllers/user.controller");

router.patch(
  "/:id/role",
  auth,
  role("admin"),
  async (req, res) => {
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
);

router.get("/", auth, getUsers);

module.exports = router;
