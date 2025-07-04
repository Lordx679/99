import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { connectDB } from './db.js';
import { setupRoutes } from './routes.js';
import { setupVite } from './vite.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
await connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Setup routes
setupRoutes(app);

// Setup Vite in development
if (process.env.NODE_ENV === 'development') {
  await setupVite(app);
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});