import type { IStorage } from './storage';
import type {
  User,
  UpsertUser,
  InsertPatient,
  Patient,
  InsertSurgeon,
  Surgeon,
  InsertProcedure,
  Procedure,
  InsertCase,
  Case,
  InsertCaseTemplate,
  CaseTemplate,
  InsertCasePhoto,
  CasePhoto,
  InsertUserPreferences,
  UserPreferences,
} from "@shared/schema";

// Simple in-memory storage for development testing
class MockStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private patients: Map<number, Patient> = new Map();
  private surgeons: Map<number, Surgeon> = new Map();
  private procedures: Map<number, Procedure> = new Map();
  private cases: Map<number, Case> = new Map();
  private caseTemplates: Map<number, CaseTemplate> = new Map();
  private casePhotos: Map<number, CasePhoto> = new Map();
  private userPreferences: Map<string, UserPreferences> = new Map();

  private nextId = 1;

  constructor() {
    // Initialize with some default procedures
    this.initializeDefaultProcedures();
  }

  private initializeDefaultProcedures() {
    const DEFAULT_PROCEDURES = [
      // 1. General Surgery
      { name: "Laparoscopic Cholecystectomy", category: "General Surgery", description: "Minimally invasive gallbladder removal" },
      { name: "Appendectomy", category: "General Surgery", description: "Surgical removal of the appendix" },
      { name: "Inguinal Hernia Repair", category: "General Surgery", description: "Repair of inguinal hernia" },
      { name: "Umbilical Hernia Repair", category: "General Surgery", description: "Repair of umbilical hernia" },
      { name: "Mastectomy", category: "General Surgery", description: "Surgical removal of breast tissue" },
      { name: "Colectomy", category: "General Surgery", description: "Surgical removal of colon" },
      { name: "Exploratory Laparotomy", category: "General Surgery", description: "Exploratory abdominal surgery" },
      { name: "Hemorrhoidectomy", category: "General Surgery", description: "Surgical removal of hemorrhoids" },
      { name: "Gastrectomy", category: "General Surgery", description: "Surgical removal of stomach" },
      { name: "Thyroidectomy", category: "General Surgery", description: "Surgical removal of thyroid gland" },

      // 2. Orthopedic Surgery
      { name: "Open Reduction and Internal Fixation (ORIF)", category: "Orthopedic Surgery", description: "Surgical fracture repair with internal fixation" },
      { name: "Total Hip Replacement (THR)", category: "Orthopedic Surgery", description: "Complete hip joint replacement" },
      { name: "Total Knee Replacement (TKR)", category: "Orthopedic Surgery", description: "Complete knee joint replacement" },
      { name: "Arthroscopy (Knee/Shoulder)", category: "Orthopedic Surgery", description: "Minimally invasive joint surgery" },
      { name: "Spinal Fusion", category: "Orthopedic Surgery", description: "Surgical fusion of vertebrae" },

      // ENT Surgery
      { name: "Tonsillectomy / Adenoidectomy", category: "ENT Surgery", description: "Removal of tonsils and/or adenoids" },
      { name: "Functional Endoscopic Sinus Surgery (FESS)", category: "ENT Surgery", description: "Endoscopic sinus surgery" },
      { name: "Septoplasty", category: "ENT Surgery", description: "Nasal septum repair" },

      // Other/Custom option
      { name: "Other", category: "Other", description: "Other procedure not listed" },
    ];

    DEFAULT_PROCEDURES.forEach((proc, index) => {
      this.procedures.set(index + 1, {
        id: index + 1,
        ...proc,
        userId: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
    this.nextId = DEFAULT_PROCEDURES.length + 1;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const existingUser = this.users.get(user.id);
    if (existingUser) {
      const updatedUser = { ...existingUser, ...user, updatedAt: new Date() };
      this.users.set(user.id, updatedUser);
      return updatedUser;
    } else {
      const newUser: User = {
        ...user,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(user.id, newUser);
      return newUser;
    }
  }

  async updateUserTheme(userId: string, theme: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.theme = theme;
      user.updatedAt = new Date();
    }
  }

  async updateUser(userId: string, updates: Partial<UpsertUser>): Promise<User | null> {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = { ...user, ...updates, updatedAt: new Date() };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    return null;
  }

  // Patient operations
  async getPatients(userId: string, limit?: number): Promise<Patient[]> {
    const patients = Array.from(this.patients.values()).filter(p => p.userId === userId);
    return limit ? patients.slice(0, limit) : patients;
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatientByPatientId(patientId: string): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(p => p.patientId === patientId);
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const newPatient: Patient = {
      ...patient,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.patients.set(newPatient.id, newPatient);
    return newPatient;
  }

  async updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient> {
    const existing = this.patients.get(id);
    if (!existing) throw new Error('Patient not found');
    const updated = { ...existing, ...patient, updatedAt: new Date() };
    this.patients.set(id, updated);
    return updated;
  }

  async deletePatient(id: number): Promise<void> {
    this.patients.delete(id);
  }

  async searchPatients(userId: string, query: string): Promise<Patient[]> {
    return Array.from(this.patients.values()).filter(p => 
      p.userId === userId && 
      (p.name.toLowerCase().includes(query.toLowerCase()) || 
       p.patientId.toLowerCase().includes(query.toLowerCase()))
    );
  }

  // Surgeon operations
  async getSurgeons(userId: string, limit?: number): Promise<Surgeon[]> {
    const surgeons = Array.from(this.surgeons.values()).filter(s => s.userId === userId);
    return limit ? surgeons.slice(0, limit) : surgeons;
  }

  async getSurgeon(id: number): Promise<Surgeon | undefined> {
    return this.surgeons.get(id);
  }

  async createSurgeon(surgeon: InsertSurgeon): Promise<Surgeon> {
    const newSurgeon: Surgeon = {
      ...surgeon,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.surgeons.set(newSurgeon.id, newSurgeon);
    return newSurgeon;
  }

  async updateSurgeon(id: number, surgeon: Partial<InsertSurgeon>): Promise<Surgeon> {
    const existing = this.surgeons.get(id);
    if (!existing) throw new Error('Surgeon not found');
    const updated = { ...existing, ...surgeon, updatedAt: new Date() };
    this.surgeons.set(id, updated);
    return updated;
  }

  async deleteSurgeon(id: number): Promise<void> {
    this.surgeons.delete(id);
  }

  async searchSurgeons(userId: string, query: string): Promise<Surgeon[]> {
    return Array.from(this.surgeons.values()).filter(s => 
      s.userId === userId && 
      s.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Procedure operations
  async getProcedures(limit?: number): Promise<Procedure[]> {
    const procedures = Array.from(this.procedures.values());
    return limit ? procedures.slice(0, limit) : procedures;
  }

  async getProcedure(id: number): Promise<Procedure | undefined> {
    return this.procedures.get(id);
  }

  async createProcedure(procedure: InsertProcedure): Promise<Procedure> {
    const newProcedure: Procedure = {
      ...procedure,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.procedures.set(newProcedure.id, newProcedure);
    return newProcedure;
  }

  async updateProcedure(id: number, procedure: Partial<InsertProcedure>): Promise<Procedure> {
    const existing = this.procedures.get(id);
    if (!existing) throw new Error('Procedure not found');
    const updated = { ...existing, ...procedure, updatedAt: new Date() };
    this.procedures.set(id, updated);
    return updated;
  }

  async deleteProcedure(id: number): Promise<void> {
    this.procedures.delete(id);
  }

  async searchProcedures(query: string): Promise<Procedure[]> {
    return Array.from(this.procedures.values()).filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Case operations
  async getCases(userId: string, limit?: number): Promise<Case[]> {
    const cases = Array.from(this.cases.values()).filter(c => c.anesthesiologistId === userId);
    return limit ? cases.slice(0, limit) : cases;
  }

  async getCase(id: number): Promise<Case | undefined> {
    return this.cases.get(id);
  }

  async createCase(caseData: InsertCase): Promise<Case> {
    const newCase: Case = {
      ...caseData,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.cases.set(newCase.id, newCase);
    return newCase;
  }

  async updateCase(id: number, caseData: Partial<InsertCase>): Promise<Case> {
    const existing = this.cases.get(id);
    if (!existing) throw new Error('Case not found');
    const updated = { ...existing, ...caseData, updatedAt: new Date() };
    this.cases.set(id, updated);
    return updated;
  }

  async deleteCase(id: number): Promise<void> {
    this.cases.delete(id);
  }

  async getCasesByProcedure(procedureId: number): Promise<Case[]> {
    return Array.from(this.cases.values()).filter(c => c.procedureId === procedureId);
  }

  async getCasesByPatient(patientId: number): Promise<Case[]> {
    return Array.from(this.cases.values()).filter(c => c.patientId === patientId);
  }

  async getCasesBySurgeon(surgeonId: number): Promise<Case[]> {
    return Array.from(this.cases.values()).filter(c => c.surgeonId === surgeonId);
  }

  async searchCases(userId: string, query: string): Promise<Case[]> {
    return Array.from(this.cases.values()).filter(c => 
      c.anesthesiologistId === userId && 
      c.caseNumber.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Case template operations
  async getCaseTemplates(userId: string, limit?: number): Promise<CaseTemplate[]> {
    const templates = Array.from(this.caseTemplates.values()).filter(t => t.userId === userId);
    return limit ? templates.slice(0, limit) : templates;
  }

  async getCaseTemplate(id: number): Promise<CaseTemplate | undefined> {
    return this.caseTemplates.get(id);
  }

  async createCaseTemplate(template: InsertCaseTemplate): Promise<CaseTemplate> {
    const newTemplate: CaseTemplate = {
      ...template,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.caseTemplates.set(newTemplate.id, newTemplate);
    return newTemplate;
  }

  async updateCaseTemplate(id: number, template: Partial<InsertCaseTemplate>): Promise<CaseTemplate> {
    const existing = this.caseTemplates.get(id);
    if (!existing) throw new Error('Case template not found');
    const updated = { ...existing, ...template, updatedAt: new Date() };
    this.caseTemplates.set(id, updated);
    return updated;
  }

  async deleteCaseTemplate(id: number): Promise<void> {
    this.caseTemplates.delete(id);
  }

  // Case photo operations
  async getCasePhotos(caseId: number): Promise<CasePhoto[]> {
    return Array.from(this.casePhotos.values()).filter(p => p.caseId === caseId);
  }

  async getCasePhoto(id: number): Promise<CasePhoto | undefined> {
    return this.casePhotos.get(id);
  }

  async createCasePhoto(photo: InsertCasePhoto): Promise<CasePhoto> {
    const newPhoto: CasePhoto = {
      ...photo,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.casePhotos.set(newPhoto.id, newPhoto);
    return newPhoto;
  }

  async deleteCasePhoto(id: number): Promise<void> {
    this.casePhotos.delete(id);
  }

  // User preferences operations
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    return this.userPreferences.get(userId);
  }

  async createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const newPreferences: UserPreferences = {
      ...preferences,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userPreferences.set(preferences.userId, newPreferences);
    return newPreferences;
  }

  async updateUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const existing = this.userPreferences.get(userId);
    if (!existing) throw new Error('User preferences not found');
    const updated = { ...existing, ...preferences, updatedAt: new Date() };
    this.userPreferences.set(userId, updated);
    return updated;
  }

  async deleteUserPreferences(userId: string): Promise<void> {
    this.userPreferences.delete(userId);
  }

  // Dashboard analytics operations
  async getDashboardStats(userId: string): Promise<any> {
    const userCases = Array.from(this.cases.values()).filter(c => c.userId === userId);
    return {
      totalCases: userCases.length,
      casesThisMonth: userCases.filter(c => {
        const date = new Date(c.caseDate);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length,
      avgDuration: userCases.length > 0 ? 
        userCases.reduce((acc, c) => acc + (parseFloat(c.caseDuration || '0') || 0), 0) / userCases.length : 0,
      casesByType: {},
    };
  }

  async getRecentCases(userId: string, limit: number = 5): Promise<Case[]> {
    return Array.from(this.cases.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getUserStats(): Promise<any> {
    return {
      totalUsers: this.users.size,
      activeUsers: this.users.size,
      usersByRole: [
        { role: 'user', count: this.users.size },
        { role: 'admin', count: 0 }
      ]
    };
  }

  async getCaseStats(userId: string): Promise<any> {
    const userCases = Array.from(this.cases.values()).filter(c => c.anesthesiologistId === userId);
    return {
      totalCases: userCases.length,
      casesThisMonth: userCases.filter(c => {
        const date = new Date(c.caseDate);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length,
      avgDuration: userCases.length > 0 ? 
        userCases.reduce((acc, c) => acc + (parseFloat(c.caseDuration || '0') || 0), 0) / userCases.length : 0,
      casesByType: userCases.reduce((acc: any, c) => {
        const type = c.anesthesiaType || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  async getCasesByDateRange(userId: string, startDate: string, endDate: string): Promise<any[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Array.from(this.cases.values())
      .filter(c => c.anesthesiologistId === userId)
      .filter(c => {
        const caseDate = new Date(c.caseDate);
        return caseDate >= start && caseDate <= end;
      })
      .sort((a, b) => new Date(b.caseDate).getTime() - new Date(a.caseDate).getTime());
  }

  async clearAllProcedures(): Promise<void> {
    this.procedures.clear();
  }

  async getSystemStats(): Promise<any> {
    return {
      totalCases: this.cases.size,
      totalPatients: this.patients.size,
      totalSurgeons: this.surgeons.size,
    };
  }

  async upsertUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const existing = this.userPreferences.get(preferences.userId);
    const updatedPrefs = {
      ...existing,
      ...preferences,
      id: existing?.id || this.nextId++,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    } as UserPreferences;
    
    this.userPreferences.set(preferences.userId, updatedPrefs);
    return updatedPrefs;
  }

  async getAllUsers(limit?: number): Promise<User[]> {
    const users = Array.from(this.users.values());
    return limit ? users.slice(0, limit) : users;
  }

  async getAllCases(limit?: number, offset?: number): Promise<Case[]> {
    let cases = Array.from(this.cases.values()).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    
    if (offset) {
      cases = cases.slice(offset);
    }
    if (limit) {
      cases = cases.slice(0, limit);
    }
    
    return cases;
  }

  async getAllCasePhotos(caseId: number): Promise<CasePhoto[]> {
    return Array.from(this.casePhotos.values())
      .filter(photo => photo.caseId === caseId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });
  }
}

export const mockStorage = new MockStorage();