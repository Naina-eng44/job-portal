import "dotenv/config";
import mongoose from "mongoose";
import Job from "../models/Job.js";
import sampleJobs from "../data/sampleJobs.js";
import ensureSampleJobs from "../utils/ensureSampleJobs.js";

const seedJobs = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from the environment");
  }

  await mongoose.connect(process.env.MONGO_URI);

  await Job.deleteMany({});
  await ensureSampleJobs();

  console.log(`Seeded ${sampleJobs.length} jobs`);
  console.log("Employer login: employer@jobportal.com / password123");

  await mongoose.disconnect();
};

seedJobs().catch(async (err) => {
  console.error(`Seed failed: ${err.message}`);
  await mongoose.disconnect();
  process.exit(1);
});
