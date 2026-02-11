const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const {
  createProject,
  getMyProjects,
  getMyProjectsDetail,
  addMember,
  deleteProject,
} = require("../controllers/project.controller");

router.post("/", auth, role("admin"), createProject);
router.get("/", auth,  getMyProjects);
router.get("/:projectId", auth,  getMyProjectsDetail);

router.post("/:projectId/members", auth, addMember);
router.delete("/:projectId", auth, deleteProject);

module.exports = router;
