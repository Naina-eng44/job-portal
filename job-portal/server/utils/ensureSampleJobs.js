import bcrypt from "bcryptjs";
import sampleJobs from "../data/sampleJobs.js";
import Job from "../models/Job.js";
import User from "../models/User.js";

const ensureSampleJobs = async () => {
  const employer = await User.findOneAndUpdate(
    { email: "employer@jobportal.com" },
    {
      name: "Demo Employer",
      email: "employer@jobportal.com",
      password: await bcrypt.hash("password123", 10),
      age: 30,
      role: "employer"
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  const existingJobs = await Job.find({
    $or: sampleJobs.map((job) => ({
      title: job.title,
      company: job.company
    }))
  }).select("title company");

  const existingKeys = new Set(existingJobs.map((job) => `${job.title}::${job.company}`));
  const missingJobs = sampleJobs.filter((job) => !existingKeys.has(`${job.title}::${job.company}`));

  if (missingJobs.length > 0) {
    await Job.insertMany(
      missingJobs.map((job) => ({
        ...job,
        createdBy: employer._id
      }))
    );
  }

  return Job.countDocuments();
};

export default ensureSampleJobs;
