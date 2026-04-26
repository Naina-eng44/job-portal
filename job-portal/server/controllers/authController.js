import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const toSafeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  age: user.age,
  phone: user.phone,
  location: user.location,
  bio: user.bio,
  skills: user.skills,
  role: user.role
});

export const register = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (!req.body.name) {
      return res.status(400).json({ error: "Name is required" });
    }

    if (!req.body.age) {
      return res.status(400).json({ error: "Age is required" });
    }

    if (req.body.role && !["user", "employer"].includes(req.body.role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      email: req.body.email,
      password: hashed,
      name: req.body.name,
      age: parseInt(req.body.age),
      role: req.body.role || "user"
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.status(201).json({ token, user: toSafeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ token, user: toSafeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(toSafeUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const allowedFields = ["name", "age", "phone", "location", "bio", "skills"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.age !== undefined) {
      updates.age = Number(updates.age);

      if (!Number.isInteger(updates.age) || updates.age < 18 || updates.age > 120) {
        return res.status(400).json({ error: "Please enter a valid age (18-120)" });
      }
    }

    if (typeof updates.skills === "string") {
      updates.skills = updates.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(toSafeUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
