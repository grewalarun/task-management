const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");
const User = require("../models/User");
const { getUsers, changePassword, changeRole, getUserProfile, updateProfile } = require("../controllers/user.controller");




router.get("/", auth, getUsers);
router.patch("/password", auth, changePassword);
router.patch("/profile", auth, updateProfile);
router.get("/:id/", auth, getUserProfile);
router.patch("/:id/role", auth, role("admin"), changeRole);

module.exports = router;
