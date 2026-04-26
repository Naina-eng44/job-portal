import Job from "../models/Job.js";
import ensureSampleJobs from "../utils/ensureSampleJobs.js";

export const createJob = async (req, res) => {
  try {
    if (!req.body.title || !req.body.company) {
      return res.status(400).json({ error: "Title and company are required" });
    }
    const job = await Job.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getJobs = async (req, res) => {
  try {
    await ensureSampleJobs();
    const { search = "", location = "", jobType = "" } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (jobType) {
      query.jobType = jobType;
    }

    const jobs = await Job.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "You can only update jobs you created" });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json(updatedJob);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "You can only delete jobs you created" });
    }

    await job.deleteOne();
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
