import express from "express";
import { createJob, getJobs, updateJob, deleteJob } from "../controllers/jobController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getJobs);
router.post("/", protect, authorize("employer"), createJob);
router.put("/:id", protect, authorize("employer"), updateJob);
router.delete("/:id", protect, authorize("employer"), deleteJob);

export default router;
