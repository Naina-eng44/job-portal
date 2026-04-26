import express from "express";
import {
  applyJob,
  getApplications,
  updateApplicationStatus
} from "../controllers/applicationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:jobId", protect, applyJob);
router.get("/", protect, getApplications);
router.patch("/:id/status", protect, updateApplicationStatus);

export default router; 
