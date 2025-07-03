import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // GitHub OAuth Strategy - only setup if credentials are available
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `https://${process.env.REPLIT_DEV_DOMAIN || 'localhost:5000'}/api/auth/github/callback`,
      scope: ['user:email']
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // Get primary email
        const email = profile.emails?.find((e: any) => e.primary)?.value || profile.emails?.[0]?.value;
        
        const user = await storage.upsertUser({
          id: profile.id,
          email: email,
          firstName: profile.displayName?.split(' ')[0] || profile.username,
          lastName: profile.displayName?.split(' ').slice(1).join(' ') || null,
          profileImageUrl: profile.photos?.[0]?.value || null,
        });
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));

    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await storage.getUser(id);
        if (!user) {
          return done(null, false);
        }
        done(null, user);
      } catch (error) {
        console.error("Error deserializing user:", error);
        done(null, false);
      }
    });

    // Auth routes - only if GitHub is configured
    app.get("/api/login", passport.authenticate("github"));

    app.get("/api/auth/github/callback", 
      passport.authenticate("github", { failureRedirect: "/" }),
      (req, res) => {
        res.redirect("/");
      }
    );
  } else {
    // Fallback routes when GitHub OAuth is not configured
    app.get("/api/login", (req, res) => {
      res.status(503).json({ message: "GitHub OAuth not configured. Please add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables." });
    });

    app.get("/api/auth/github/callback", (req, res) => {
      res.redirect("/?error=oauth_not_configured");
    });
  }

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};