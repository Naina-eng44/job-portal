import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    company: {
      type: String,
      required: true
    },
    location: {
      type: String,
      default: "Remote"
    },
    salary: {
      type: String,
      default: null
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract"],
      default: "Full-time"
    },
    description: {
      type: String,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);