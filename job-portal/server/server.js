import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import ensureSampleJobs from "./utils/ensureSampleJobs.js";

import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Job Portal API is running", version: "1.0.0" });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
});

const startServer = () => {
  if (!process.env.JWT_SECRET) {
    console.error("Server failed to start: JWT_SECRET is missing from the environment");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    connectDB()
      .then(async () => {
        const jobCount = await ensureSampleJobs();
        console.log(`Jobs ready: ${jobCount}`);
      })
      .catch((err) => {
        console.error(`MongoDB connection failed: ${err.message}`);
      });
  });
};

startServer();
