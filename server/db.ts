import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  console.error("⚠️  MONGODB_URI environment variable is not set!");
  console.error("Please set MONGODB_URI in your .env file or environment variables.");
  console.error("Example: MONGODB_URI=mongodb://localhost:27017/discord-projects");
  process.exit(1);
}

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

export { mongoose };