import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-default-secret-key-change-it";
const MONGODB_URI = process.env.MONGODB_URI;

app.use(express.json());
app.use(cors());

// --- Database Schemas ---
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String, required: true },
  role: { type: String, enum: ['student', 'coordinator', 'admin'], default: 'student' },
  studentId: String,
  coordinatorId: String,
  department: String,
  year: String,
  mentees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Number, default: Date.now }
});

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    ret.uid = ret._id;
    delete ret._id;
    delete ret.password; // Security: don't send password in JSON
  }
});

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['event', 'club', 'sport', 'competition', 'other'], required: true },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  date: { type: Number, required: true },
  location: String,
  coordinatorId: { type: String, required: true },
  coordinatorName: { type: String, required: true },
  maxParticipants: Number,
  currentParticipants: { type: Number, default: 0 },
  tags: [String],
  createdAt: { type: Number, default: Date.now }
});

activitySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const participationSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
  activityTitle: { type: String, required: true },
  activityDate: { type: Number, required: true },
  activityType: { type: String, required: true },
  status: { type: String, enum: ['registered', 'attended', 'absent', 'excused'], default: 'registered' },
  feedback: String,
  registeredAt: { type: Number, default: Date.now }
});

participationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const User = mongoose.model("User", userSchema);
const Activity = mongoose.model("Activity", activitySchema);
const Participation = mongoose.model("Participation", participationSchema);

// --- Middleware ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

const isCoordinator = (req: any, res: any, next: any) => {
  if (req.user.role !== 'coordinator' && req.user.role !== 'admin') {
    return res.status(403).json({ message: "Coordinator access required" });
  }
  next();
};

// --- API Routes ---

// Auth
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, displayName, role, ...rest } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, displayName, role, ...rest });
    await user.save();
    
    // Transform to profile for token
    const profile = { uid: user._id, email: user.email, role: user.role, displayName: user.displayName };
    const token = jwt.sign(profile, JWT_SECRET);
    res.status(201).json({ token, user: profile });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // Allow login by email or studentId/coordinatorId
    const user = await User.findOne({
      $or: [
        { email },
        { studentId: email },
        { coordinatorId: email }
      ]
    });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const profile = { uid: user._id, email: user.email, role: user.role, displayName: user.displayName };
    const token = jwt.sign(profile, JWT_SECRET);
    res.json({ token, user: profile });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Activities
app.get("/api/activities", async (req: any, res: any) => {
  try {
    const activities = await Activity.find().sort({ date: 1 });
    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/activities", authenticateToken, isCoordinator, async (req: any, res: any) => {
  try {
    const activity = new Activity({
      ...req.body,
      coordinatorId: req.user.uid,
      coordinatorName: req.user.displayName
    });
    await activity.save();
    res.status(201).json(activity);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/activities/:id", authenticateToken, isCoordinator, async (req: any, res: any) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    await Participation.deleteMany({ activityId: req.params.id });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.patch("/api/activities/:id", authenticateToken, isCoordinator, async (req: any, res: any) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(activity);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Participations
app.get("/api/participations", authenticateToken, isCoordinator, async (req: any, res: any) => {
  try {
    let query = {};
    if (req.user.role === 'coordinator') {
      const coordinator = await User.findById(req.user.uid);
      if (coordinator && coordinator.mentees && coordinator.mentees.length > 0) {
        const menteeIds = coordinator.mentees.map(id => id.toString());
        query = { studentId: { $in: menteeIds } };
      } else {
        return res.json([]);
      }
    }
    const participations = await Participation.find(query).sort({ registeredAt: -1 });
    res.json(participations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/participations/my", authenticateToken, async (req: any, res: any) => {
  try {
    const participations = await Participation.find({ studentId: req.user.uid }).sort({ registeredAt: -1 });
    res.json(participations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/participations/register", authenticateToken, async (req: any, res: any) => {
  try {
    const { activityId } = req.body;
    const activity = await Activity.findById(activityId);
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    
    if (activity.maxParticipants && activity.currentParticipants >= activity.maxParticipants) {
      return res.status(400).json({ message: "Activity is full" });
    }

    const existing = await Participation.findOne({ studentId: req.user.uid, activityId });
    if (existing) return res.status(400).json({ message: "Already registered" });

    const participation = new Participation({
      studentId: req.user.uid,
      studentName: req.user.displayName,
      studentEmail: req.user.email,
      activityId: activity._id,
      activityTitle: activity.title,
      activityDate: activity.date,
      activityType: activity.type,
      status: 'registered'
    });

    await participation.save();
    
    activity.currentParticipants += 1;
    await activity.save();

    res.status(201).json(participation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.patch("/api/participations/:id/status", authenticateToken, isCoordinator, async (req: any, res: any) => {
  try {
    const { status } = req.body;
    const p = await Participation.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(p);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/participations/:id", authenticateToken, async (req: any, res: any) => {
  try {
    const p = await Participation.findById(req.params.id);
    if (!p) return res.status(404).send();
    
    // Only coordinator/admin or the student themselves can delete
    if (req.user.role !== 'coordinator' && req.user.role !== 'admin' && p.studentId !== req.user.uid) {
      return res.status(403).send();
    }

    await Participation.findByIdAndDelete(req.params.id);
    
    // Decrement participant count
    await Activity.findByIdAndUpdate(p.activityId, { $inc: { currentParticipants: -1 } });
    
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// --- Mentorship Routes ---

// Search students to add as mentees
app.get("/api/mentorship/students", authenticateToken, isCoordinator, async (req: any, res: any) => {
  try {
    const { query } = req.query;
    const students = await User.find({
      role: 'student',
      $or: [
        { displayName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { studentId: { $regex: query, $options: 'i' } }
      ]
    }).limit(10);
    res.json(students);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get current coordinator's mentees
app.get("/api/mentorship/mentees", authenticateToken, isCoordinator, async (req: any, res: any) => {
  try {
    const coordinator = await User.findById(req.user.uid).populate('mentees');
    if (!coordinator) return res.status(404).json({ message: "Coordinator not found" });
    res.json(coordinator.mentees || []);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Add mentee
app.post("/api/mentorship/mentees", authenticateToken, isCoordinator, async (req: any, res: any) => {
  try {
    const { studentId } = req.body;
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: "Student not found" });
    }

    await User.findByIdAndUpdate(req.user.uid, {
      $addToSet: { mentees: student._id }
    });

    res.json({ message: "Mentee added successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Remove mentee
app.delete("/api/mentorship/mentees/:id", authenticateToken, isCoordinator, async (req: any, res: any) => {
  try {
    await User.findByIdAndUpdate(req.user.uid, {
      $pull: { mentees: req.params.id }
    });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get mentee activities
app.get("/api/mentorship/mentees/:id/activities", authenticateToken, isCoordinator, async (req: any, res: any) => {
  try {
    // Verify this is a mentee of the requester
    const coordinator = await User.findById(req.user.uid);
    if (!coordinator?.mentees?.includes(req.params.id as any)) {
      return res.status(403).json({ message: "Access denied. Student is not your mentee." });
    }

    const participations = await Participation.find({ studentId: req.params.id }).sort({ registeredAt: -1 });
    res.json(participations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// --- Server Start ---
async function startServer() {
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log("Connected to MongoDB");
      
      // Seed initial data if missing
      const activitiesToSeed = [
        {
          title: "Campus Chess Open",
          description: "Annual chess tournament for all levels. Experience high-level strategy and compete for the title of campus champion.",
          type: "competition",
          status: "upcoming",
          date: Date.now() + 86400000 * 7,
          location: "Main Hall",
          coordinatorId: "system",
          coordinatorName: "Admin",
          maxParticipants: 32,
          tags: ["chess", "strategy"]
        },
        {
          title: "Tech Startup Workshop",
          description: "Learn how to build your own startup from scratch. Cover everything from ideation to pitching to investors.",
          type: "event",
          status: "upcoming",
          date: Date.now() + 86400000 * 14,
          location: "Innovation Hub",
          coordinatorId: "system",
          coordinatorName: "Admin",
          maxParticipants: 50,
          tags: ["tech", "entrepreneurship"]
        },
        {
          title: "Annual Sports Meet",
          description: "A day of athletic excellence and team spirit. Join various track and field events.",
          type: "sport",
          status: "upcoming",
          date: Date.now() + 86400000 * 21,
          location: "Main Stadium",
          coordinatorId: "system",
          coordinatorName: "Admin",
          maxParticipants: 200,
          tags: ["sports", "fitness"]
        },
        {
          title: "Photography Club Meeting",
          description: "Monthly gathering for photography enthusiasts. Share your work and learn new techniques.",
          type: "club",
          status: "upcoming",
          date: Date.now() + 86400000 * 3,
          location: "Art Studio B",
          coordinatorId: "system",
          coordinatorName: "Admin",
          maxParticipants: 20,
          tags: ["art", "photography"]
        },
        {
          title: "Coding Marathon",
          description: "24-hour hackathon to solve real-world problems. Great for team building and skill development.",
          type: "competition",
          status: "upcoming",
          date: Date.now() + 86400000 * 30,
          location: "Computer Lab 4",
          coordinatorId: "system",
          coordinatorName: "Admin",
          maxParticipants: 100,
          tags: ["coding", "hackathon"]
        },
        {
          title: "Wellness & Yoga Workshop",
          description: "Start your morning with a relaxing yoga session and mindfulness practices.",
          type: "event",
          status: "upcoming",
          date: Date.now() + 86400000 * 2,
          location: "Fitness Center",
          coordinatorId: "system",
          coordinatorName: "Admin",
          maxParticipants: 30,
          tags: ["health", "wellness"]
        },
        {
          title: "Robotics Club Expo",
          description: "Come see our latest robots in action and learn how to get involved in competitive robotics.",
          type: "club",
          status: "upcoming",
          date: Date.now() + 86400000 * 5,
          location: "Campus Plaza",
          coordinatorId: "system",
          coordinatorName: "Admin",
          maxParticipants: null,
          tags: ["tech", "robotics"]
        },
        {
          title: "Sustainability Seminar",
          description: "Expert talk on how to live more sustainably and reduce your carbon footprint on campus.",
          type: "event",
          status: "upcoming",
          date: Date.now() + 86400000 * 10,
          location: "Green Hall",
          coordinatorId: "system",
          coordinatorName: "Admin",
          maxParticipants: 100,
          tags: ["environment", "education"]
        }
      ];

      for (const activity of activitiesToSeed) {
        const exists = await Activity.findOne({ title: activity.title });
        if (!exists) {
          await Activity.create(activity);
        }
      }

      // Seed initial students if missing
      const studentsToSeed = [
        {
          email: "student1@example.com",
          password: "password123",
          displayName: "Alice Smith",
          role: "student",
          studentId: "STU001",
          department: "Computer Science",
          year: "3rd"
        },
        {
          email: "student2@example.com",
          password: "password123",
          displayName: "Bob Johnson",
          role: "student",
          studentId: "STU002",
          department: "Mechanical Engineering",
          year: "2nd"
        },
        {
          email: "student3@example.com",
          password: "password123",
          displayName: "Charlie Davis",
          role: "student",
          studentId: "STU003",
          department: "Business Administration",
          year: "1st"
        }
      ];

      for (const studentData of studentsToSeed) {
        const exists = await User.findOne({ email: studentData.email });
        if (!exists) {
          const hashedPassword = await bcrypt.hash(studentData.password, 10);
          const student = await User.create({ ...studentData, password: hashedPassword });
          console.log(`Created student: ${student.displayName}`);

          // Add some dummy participations for these students
          const activities = await Activity.find().limit(3);
          for (const activity of activities) {
            await Participation.create({
              studentId: student._id.toString(),
              studentName: student.displayName,
              studentEmail: student.email,
              activityId: activity._id,
              activityTitle: activity.title,
              activityDate: activity.date,
              activityType: activity.type,
              status: Math.random() > 0.5 ? 'attended' : 'registered'
            });
          }
        }
      }

      console.log("Database seeded successfully");
    } catch (err) {
      console.error("MongoDB connection error:", err);
    }
  } else {
    console.warn("MONGODB_URI not found. API routes will fail without a database connection.");
  }

  // Vite integration
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
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
