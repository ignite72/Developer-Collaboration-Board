import express from "express";
import {
  addTaskComment,
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  updateTaskStatus
} from "../controllers/taskController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getTasks);
router.post("/", protect, requireAdmin, createTask);
router.put("/:id", protect, requireAdmin, updateTask);
router.delete("/:id", protect, requireAdmin, deleteTask);
router.patch("/:id/status", protect, updateTaskStatus);
router.post("/:id/comments", protect, addTaskComment);

export default router;
