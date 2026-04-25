import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB, Activity, Participation, User } from "./src/lib/db.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Connect to MongoDB
  await connectDB();

  app.use(express.json());

  // Auth Routes
  app.post("/api/auth/login", async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Database not connected. Please set MONGODB_URI in settings." });
    }
    const { id, password, role } = req.body;
    try {
      const query = role === 'student' ? { studentId: id } : { coordinatorId: id };
      const user = await User.findOne({ ...query, role });
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Database not connected. Please set MONGODB_URI in settings and restart." });
    }
    try {
      const { email, password, displayName, role, id, department } = req.body;
      
      console.log('Attempting registration for:', { email, role, id });

      // Basic validation
      if (!id || !password || !email || !displayName) {
        return res.status(400).json({ error: "Missing required fields: ID, Password, Email, and Name are all required." });
      }

      const existingUser = await User.findOne({ 
        $or: [{ email }, { studentId: id }, { coordinatorId: id }] 
      });

      if (existingUser) {
        const conflictField = existingUser.email === email ? 'email' : 'ID';
        return res.status(400).json({ error: `A user with this ${conflictField} already exists.` });
      }

      const newUser = new User({
        uid: Math.random().toString(36).substring(2, 10), // cleaner UID
        email,
        password,
        displayName,
        role,
        studentId: role === 'student' ? id : undefined,
        coordinatorId: role === 'coordinator' ? id : undefined,
        department,
        year: '2024',
        createdAt: Date.now()
      });

      await newUser.save();
      console.log('Registration successful:', newUser.uid);
      res.status(201).json(newUser);
    } catch (error: any) {
      console.error('Registration server error:', error);
      res.status(500).json({ error: "Server registration failed: " + (error.message || "Unknown error") });
    }
  });

  // API Routes
  app.get("/api/activities", async (req, res) => {
    try {
      const activities = await Activity.find().sort({ date: 1 });
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const activity = new Activity(req.body);
      await activity.save();
      res.status(201).json(activity);
    } catch (error) {
      res.status(400).json({ error: "Failed to create activity" });
    }
  });

  app.get("/api/participations/:studentId", async (req, res) => {
    try {
      const participations = await Participation.find({ studentId: req.params.studentId });
      res.json(participations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch participations" });
    }
  });

  app.post("/api/participations", async (req, res) => {
    try {
      const participation = new Participation(req.body);
      await participation.save();
      
      // Increment participant count in Activity
      await Activity.findByIdAndUpdate(req.body.activityId, { 
        $inc: { currentParticipants: 1 } 
      });
      
      res.status(201).json(participation);
    } catch (error) {
      res.status(400).json({ error: "Failed to register participation" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
