import mongoose from 'mongoose';

if (!process.env.MONGODB_URI && !process.env.DATABASE_URL) {
  console.error("⚠️  MONGODB_URI environment variable is not set!");
  console.error("Please set MONGODB_URI in your .env file or environment variables.");
  console.error("Example: MONGODB_URI=mongodb://localhost:27017/discord-projects");
  process.exit(1);
}

export async function connectDB() {
  try {
    // Support both MONGODB_URI and DATABASE_URL for backward compatibility
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    await mongoose.connect(mongoUri!);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

export { mongoose };