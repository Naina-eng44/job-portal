import Application from "../models/Application.js";
import Job from "../models/Job.js";

export const applyJob = async (req, res) => {
  try {
    if (!req.params.jobId) {
      return res.status(400).json({ error: "Job ID is required" });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (req.user.role === "employer") {
      return res.status(403).json({ error: "Employer accounts cannot apply for jobs" });
    }

    // Check if already applied
    const existingApp = await Application.findOne({
      userId: req.user.id,
      jobId: req.params.jobId
    });

    if (existingApp) {
      return res.status(400).json({ error: "You have already applied for this job" });
    }

    const app = await Application.create({
      userId: req.user.id,
      jobId: req.params.jobId,
      status: "pending"
    });

    const populatedApp = await app.populate("jobId");
    res.status(201).json(populatedApp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getApplications = async (req, res) => {
  try {
    let query = { userId: req.user.id };

    if (req.user.role === "employer") {
      const employerJobs = await Job.find({ createdBy: req.user.id }).select("_id");
      query = { jobId: { $in: employerJobs.map((job) => job._id) } };
    }

    const apps = await Application.find(query)
      .populate("jobId")
      .populate("userId", "name email age")
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid application status" });
    }

    const app = await Application.findById(req.params.id).populate("jobId");

    if (!app) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (req.user.role !== "employer" || app.jobId.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "You can only manage applications for your jobs" });
    }

    app.status = status;
    await app.save();

    const populatedApp = await app.populate("userId", "name email age");
    res.json(populatedApp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
