const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const {
  createProject,
  getMyProjects,
  getMyProjectsDetail,
  updateProject,
  addMember,
  removeMember,
  deleteProject,
} = require("../controllers/project.controller");

router.post("/", auth, role("admin"), createProject);
router.patch("/:projectId", auth, role("admin"), updateProject);
router.get("/", auth,  getMyProjects);
router.get("/:projectId", auth,  getMyProjectsDetail);

router.post("/:projectId/members/add", auth, addMember);
router.post("/:projectId/members/remove", auth, removeMember);
router.delete("/:projectId", auth, deleteProject);

module.exports = router;
