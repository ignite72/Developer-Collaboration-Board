import express from "express";
import { getAssignableUsers } from "../controllers/userController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, requireAdmin, getAssignableUsers);

export default router;
