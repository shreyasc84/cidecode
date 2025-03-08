import { User, Evidence, InsertUser, InsertEvidence } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createEvidence(evidence: InsertEvidence): Promise<Evidence>;
  getEvidence(user: User): Promise<Evidence[]>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private evidence: Map<number, Evidence>;
  sessionStore: session.Store;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.evidence = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(address: string): Promise<User | undefined> {
    return this.users.get(address);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser = { ...user, id: this.currentId++ };
    this.users.set(user.address, newUser);
    return newUser;
  }

  async createEvidence(evidence: InsertEvidence): Promise<Evidence> {
    const newEvidence = { ...evidence, id: this.currentId++ };
    this.evidence.set(newEvidence.id, newEvidence);
    return newEvidence;
  }

  async getEvidence(user: User): Promise<Evidence[]> {
    return Array.from(this.evidence.values()).filter(e => {
      if (user.role === "admin" || user.role === "cbi") return true;
      return e.submittedBy === user.address;
    });
  }
}

export const storage = new MemStorage();
