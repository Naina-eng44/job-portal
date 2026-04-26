import mongoose from "mongoose";

const CONNECTION_TIMEOUT_MS = 5000;

mongoose.set("bufferCommands", false);

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from the environment");
  }

  const connection = mongoose.connect(process.env.MONGO_URI, {
    connectTimeoutMS: CONNECTION_TIMEOUT_MS,
    serverSelectionTimeoutMS: CONNECTION_TIMEOUT_MS
  });

  await Promise.race([
    connection,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("MongoDB connection timed out"));
      }, CONNECTION_TIMEOUT_MS);
    })
  ]);

  console.log("MongoDB Connected");
};

export default connectDB;
