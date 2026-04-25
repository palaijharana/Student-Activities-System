import mongoose, { Schema, Document } from 'mongoose';

// User Schema
const UserSchema: Schema = new Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  displayName: { type: String, required: true },
  role: { type: String, enum: ['student', 'coordinator', 'admin'], default: 'student' },
  studentId: { type: String },
  coordinatorId: { type: String },
  password: { type: String, required: true },
  department: { type: String },
  year: { type: String },
  createdAt: { type: Number, default: Date.now },
});

// Activity Schema
const ActivitySchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['event', 'club', 'sport', 'competition', 'other'], required: true },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  date: { type: Number, required: true },
  location: { type: String, required: true },
  coordinatorId: { type: String, required: true },
  coordinatorName: { type: String, required: true },
  maxParticipants: { type: Number },
  currentParticipants: { type: Number, default: 0 },
  tags: [{ type: String }],
  createdAt: { type: Number, default: Date.now },
});

// Participation Schema
const ParticipationSchema: Schema = new Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  activityId: { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
  activityTitle: { type: String, required: true },
  activityDate: { type: Number, required: true },
  activityType: { type: String, required: true },
  status: { type: String, enum: ['registered', 'attended', 'absent', 'excused'], default: 'registered' },
  feedback: { type: String },
  registeredAt: { type: Number, default: Date.now },
});

export const User = mongoose.model('User', UserSchema);
export const Activity = mongoose.model('Activity', ActivitySchema);
export const Participation = mongoose.model('Participation', ParticipationSchema);

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI is not set. Database operations will fail.');
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}
