import { User, Evidence, InsertUser, InsertEvidence } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(address: string): Promise<void>;
  createEvidence(evidence: InsertEvidence): Promise<Evidence>;
  getEvidence(user: User): Promise<Evidence[]>;
  updateEvidence(id: number, updates: Partial<Evidence>): Promise<Evidence>;
  assignEvidence(id: number, assignedTo: string): Promise<Evidence>;
  getEvidenceWithAIAnalysis(id: number): Promise<Evidence>;
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
      checkPeriod: 86400000, // 1 day
    });
  }

  async getUser(address: string): Promise<User | undefined> {
    return this.users.get(address.toLowerCase());
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser = { 
      ...user, 
      id: this.currentId++,
      address: user.address.toLowerCase(),
      registrationDate: new Date(),
      lastLogin: new Date(),
    };
    this.users.set(newUser.address, newUser);
    return newUser;
  }

  async updateUserLastLogin(address: string): Promise<void> {
    const user = await this.getUser(address);
    if (user) {
      user.lastLogin = new Date();
      this.users.set(address.toLowerCase(), user);
    }
  }

  async createEvidence(evidence: InsertEvidence): Promise<Evidence> {
    const newEvidence = { 
      ...evidence, 
      id: this.currentId++,
      createdAt: new Date(),
      aiAnalysis: await this.generateAIAnalysis(evidence),
      submittedBy: evidence.submittedBy.toLowerCase(),
    };
    this.evidence.set(newEvidence.id, newEvidence);
    return newEvidence;
  }

  async getEvidence(user: User): Promise<Evidence[]> {
    return Array.from(this.evidence.values()).filter(e => {
      if (user.role === "admin") return true;
      if (user.role === "officer") return e.submittedBy === user.address;
      if (user.role === "public") {
        // Public users can only see approved evidence with limited data
        return e.status === "approved";
      }
      return false;
    });
  }

  async updateEvidence(id: number, updates: Partial<Evidence>): Promise<Evidence> {
    const evidence = this.evidence.get(id);
    if (!evidence) throw new Error("Evidence not found");

    const updatedEvidence = { ...evidence, ...updates };
    this.evidence.set(id, updatedEvidence);
    return updatedEvidence;
  }

  async assignEvidence(id: number, assignedTo: string): Promise<Evidence> {
    return this.updateEvidence(id, { assignedTo });
  }

  async getEvidenceWithAIAnalysis(id: number): Promise<Evidence> {
    const evidence = this.evidence.get(id);
    if (!evidence) throw new Error("Evidence not found");

    if (!evidence.aiAnalysis) {
      evidence.aiAnalysis = await this.generateAIAnalysis(evidence);
      this.evidence.set(id, evidence);
    }

    return evidence;
  }

  private async generateAIAnalysis(evidence: InsertEvidence) {
    // Mock AI analysis for demo
    return {
      summary: `Analysis of evidence for case ${evidence.caseId}`,
      riskLevel: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
      keywords: ["suspicious", "urgent", "follow-up"],
      recommendations: [
        "Conduct further investigation",
        "Cross-reference with related cases",
        "Priority review recommended"
      ],
      relatedCases: [`CASE-${Math.floor(Math.random() * 1000)}`],
      confidenceScore: Math.random()
    };
  }
}

export const storage = new MemStorage();