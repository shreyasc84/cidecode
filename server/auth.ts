import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { UserRole } from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      id: number;
      address: string;
      role: string;
      name: string;
      department: string;
      badgeNumber: string;
      isRegistered: boolean;
      email?: string;
      registrationDate?: Date;
      lastLogin?: Date;
    }
  }
}

// Predefined admin addresses for demo
const ADMIN_ADDRESSES = [
  "0x1234567890123456789012345678901234567890",
  // Add more admin addresses as needed
].map(addr => addr.toLowerCase());

// Officer addresses can be pre-approved
const OFFICER_ADDRESSES = [
  "0x9876543210987654321098765432109876543210",
  // Add more officer addresses as needed
].map(addr => addr.toLowerCase());

export function setupAuth(app: Express) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "dev_secret",
      resave: false,
      saveUninitialized: false,
      store: storage.sessionStore,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: process.env.NODE_ENV === "production",
      }
    })
  );

  app.post("/api/auth/connect", async (req, res) => {
    const { address, provider, registration } = req.body;

    if (!address) {
      return res.status(400).json({ message: "Address required" });
    }

    // Only admins can use WalletConnect
    if (provider === "walletconnect" && !ADMIN_ADDRESSES.includes(address.toLowerCase())) {
      return res.status(403).json({ message: "Only admins can use WalletConnect" });
    }

    let user = await storage.getUser(address);
    const normalizedAddress = address.toLowerCase();

    if (!user) {
      if (registration) {
        // Handle new user registration
        const role = ADMIN_ADDRESSES.includes(normalizedAddress)
          ? UserRole.ADMIN
          : OFFICER_ADDRESSES.includes(normalizedAddress)
          ? UserRole.OFFICER
          : UserRole.PUBLIC;

        user = await storage.createUser({
          address,
          role,
          name: registration.name || `${role.charAt(0).toUpperCase() + role.slice(1)} ${address.slice(0, 6)}`,
          department: registration.department || (role === UserRole.ADMIN ? "Central Bureau" : "Police Department"),
          badgeNumber: registration.badgeNumber || `${role === UserRole.ADMIN ? "CBI" : "PD"}${Math.floor(Math.random() * 10000)}`,
          email: registration.email,
          isRegistered: true,
          registrationDate: new Date(),
          lastLogin: new Date(),
        });
      } else {
        // Handle unregistered user
        return res.status(401).json({ 
          message: "Please complete registration",
          needsRegistration: true 
        });
      }
    } else {
      // Update last login for existing user
      await storage.updateUserLastLogin(address);
    }

    req.session.user = user;
    res.json(user);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.session.user);
  });

  // Middleware to check role-based access
  app.use((req, _res, next) => {
    req.user = req.session.user;
    next();
  });
}

export function requireRole(roles: UserRole[]) {
  return (req: Express.Request, res: Express.Response, next: Function) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}