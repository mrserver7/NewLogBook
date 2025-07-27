import {
  type User,
  type UpsertUser,
  type InsertPatient,
  type Patient,
  type InsertSurgeon,
  type Surgeon,
  type InsertProcedure,
  type Procedure,
  type InsertCase,
  type Case,
  type InsertCaseTemplate,
  type CaseTemplate,
  type InsertCasePhoto,
  type CasePhoto,
  type InsertUserPreferences,
  type UserPreferences,
} from "@shared/schema";
// All storage operations are handled by MongoDB via Mongoose models.
import { connectMongo } from './mongo';
import {
  UserModel,
  PatientModel,
  SurgeonModel,
  ProcedureModel,
  CaseModel,
  CaseTemplateModel,
  CasePhotoModel,
  UserPreferencesModel,
} from './models';
// Remove Drizzle ORM operators; queries are handled by MongoStorage
// import { eq, desc, like, and, or, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserTheme(userId: string, theme: string): Promise<void>;
  updateUser(userId: string, updates: Partial<UpsertUser>): Promise<User | null>;
  
  // Patient operations
  getPatients(userId: string, limit?: number): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientByPatientId(patientId: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient>;
  deletePatient(id: number): Promise<void>;
  searchPatients(userId: string, query: string): Promise<Patient[]>;
  
  // Surgeon operations
  getSurgeons(userId: string, limit?: number): Promise<Surgeon[]>;
  getSurgeon(id: number): Promise<Surgeon | undefined>;
  createSurgeon(surgeon: InsertSurgeon): Promise<Surgeon>;
  updateSurgeon(id: number, surgeon: Partial<InsertSurgeon>): Promise<Surgeon>;
  deleteSurgeon(id: number): Promise<void>;
  
  // Procedure operations
  getProcedures(limit?: number): Promise<Procedure[]>;
  getProcedure(id: number): Promise<Procedure | undefined>;
  createProcedure(procedure: InsertProcedure): Promise<Procedure>;
  
  // Case operations
  getCases(userId: string, limit?: number, offset?: number): Promise<any[]>;
  getCase(id: number): Promise<any | undefined>;
  createCase(caseData: InsertCase): Promise<Case>;
  updateCase(id: number, caseData: Partial<InsertCase>): Promise<Case>;
  deleteCase(id: number): Promise<void>;
  searchCases(userId: string, query: string): Promise<any[]>;
  getCaseStats(userId: string): Promise<any>;
  getCasesByDateRange(userId: string, startDate: string, endDate: string): Promise<any[]>;
  
  // Case template operations
  getCaseTemplates(userId: string): Promise<CaseTemplate[]>;
  createCaseTemplate(template: InsertCaseTemplate): Promise<CaseTemplate>;
  
  // Case photo operations
  getCasePhotos(caseId: number): Promise<CasePhoto[]>;
  createCasePhoto(photoData: InsertCasePhoto): Promise<CasePhoto>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  getUserStats(): Promise<any>;
  getSystemStats(): Promise<any>;
  
  // User preferences
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  upsertUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
}

/*
 * NOTE: The DatabaseStorage class has been removed along with its
 * dependency on PostgreSQL.  If you need to reference the old
 * implementation for comparison, please consult previous revisions.
 */

/**
 * MongoDB implementation of the storage layer.
 *
 * This class mirrors the methods of the DatabaseStorage class but
 * operates on MongoDB collections via Mongoose models.  It is
 * instantiated automatically when a `MONGODB_URI` environment
 * variable is present.  Most methods follow a straightforward
 * translation of the SQL‑like operations in DatabaseStorage to
 * Mongoose queries.  Numeric identifiers from the original schema
 * are maintained as plain fields on the documents rather than
 * replacing the `_id` field.  Auto‑increment semantics are
 * approximated by computing the current document count and adding
 * one when creating new records.  This approach is not safe for
 * concurrent writes but suffices for demonstration and small
 * deployments.  In production, a more robust strategy (e.g.
 * MongoDB counters) should be used.
 */
export class MongoStorage implements IStorage {
  constructor() {
    // Initiate the connection to MongoDB.  Any error is logged but
    // not thrown to avoid unhandled promise rejections during
    // application startup.
    connectMongo(process.env.MONGODB_URI).catch((err) => {
      console.error('Failed to connect to MongoDB', err);
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const doc = await UserModel.findOne({ id }).lean().exec();
    return doc as any;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const update = { ...userData, updatedAt: new Date() } as any;
    const doc = await UserModel.findOneAndUpdate(
      { id: userData.id },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean().exec();
    return doc as any;
  }

  async updateUserTheme(userId: string, theme: string): Promise<void> {
    await UserModel.updateOne({ id: userId }, { $set: { themePreference: theme, updatedAt: new Date() } }).exec();
  }

  async updateUser(userId: string, updates: Partial<UpsertUser>): Promise<User | null> {
    const doc = await UserModel.findOneAndUpdate(
      { id: userId },
      { $set: { ...updates, updatedAt: new Date() } },
      { new: true }
    ).lean().exec();
    return doc as any;
  }

  // Patient operations
  async getPatients(userId: string, limit = 50): Promise<Patient[]> {
    const docs = await PatientModel.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
    return docs as any;
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const doc = await PatientModel.findOne({ id }).lean().exec();
    return doc as any;
  }

  async getPatientByPatientId(patientId: string): Promise<Patient | undefined> {
    const doc = await PatientModel.findOne({ patientId }).lean().exec();
    return doc as any;
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    // Assign a numeric id if not provided.  This is a simple
    // approximation of auto‑increment.
    const nextId = (await PatientModel.countDocuments().exec()) + 1;
    const doc = await PatientModel.create({
      ...patient,
      id: nextId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    return doc.toObject() as any;
  }

  async updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient> {
    const doc = await PatientModel.findOneAndUpdate(
      { id },
      { $set: { ...patient, updatedAt: new Date() } },
      { new: true }
    ).lean().exec();
    return doc as any;
  }

  async deletePatient(id: number): Promise<void> {
    await PatientModel.deleteOne({ id }).exec();
  }

  async searchPatients(userId: string, query: string): Promise<Patient[]> {
    const regex = new RegExp(query, 'i');
    const docs = await PatientModel.find({
      createdBy: userId,
      $or: [
        { firstName: regex },
        { lastName: regex },
        { patientId: regex },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
      .exec();
    return docs as any;
  }

  // Surgeon operations
  async getSurgeons(userId: string, limit = 50): Promise<Surgeon[]> {
    const docs = await SurgeonModel.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
    return docs as any;
  }

  async getSurgeon(id: number): Promise<Surgeon | undefined> {
    const doc = await SurgeonModel.findOne({ id }).lean().exec();
    return doc as any;
  }

  async createSurgeon(surgeon: InsertSurgeon): Promise<Surgeon> {
    const nextId = (await SurgeonModel.countDocuments().exec()) + 1;
    const doc = await SurgeonModel.create({
      ...surgeon,
      id: nextId,
      createdAt: new Date(),
    } as any);
    return doc.toObject() as any;
  }

  async updateSurgeon(id: number, surgeon: Partial<InsertSurgeon>): Promise<Surgeon> {
    const doc = await SurgeonModel.findOneAndUpdate(
      { id },
      { $set: surgeon },
      { new: true }
    ).lean().exec();
    return doc as any;
  }

  async deleteSurgeon(id: number): Promise<void> {
    await SurgeonModel.deleteOne({ id }).exec();
  }

  // Procedure operations
  async getProcedures(limit = 100): Promise<Procedure[]> {
    const docs = await ProcedureModel.find({})
      .sort({ name: 1 })
      .limit(limit)
      .lean()
      .exec();
    return docs as any;
  }

  async getProcedure(id: number): Promise<Procedure | undefined> {
    const doc = await ProcedureModel.findOne({ id }).lean().exec();
    return doc as any;
  }

  async createProcedure(procedure: InsertProcedure): Promise<Procedure> {
    const nextId = (await ProcedureModel.countDocuments().exec()) + 1;
    const doc = await ProcedureModel.create({ ...procedure, id: nextId, createdAt: new Date() } as any);
    return doc.toObject() as any;
  }

  // Case operations
  async getCases(userId: string, limit = 50, offset = 0): Promise<any[]> {
    const docs = await CaseModel.find({ anesthesiologistId: userId })
      .sort({ caseDate: -1, createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();
    // Populate procedure details for each case
    const result: any[] = [];
    for (const c of docs) {
      let procedure: any = null;
      if (c.procedureId != null) {
        procedure = await ProcedureModel.findOne({ id: c.procedureId }).lean().exec();
      }
      result.push({
        ...c,
        procedure: procedure
          ? {
              id: procedure.id,
              name: procedure.name,
              category: procedure.category,
            }
          : null,
      });
    }
    return result;
  }

  async getCase(id: number): Promise<any | undefined> {
    const c = await CaseModel.findOne({ id }).lean().exec();
    if (!c) return undefined;
    let procedure: any = null;
    if (c.procedureId != null) {
      procedure = await ProcedureModel.findOne({ id: c.procedureId }).lean().exec();
    }
    return {
      ...c,
      procedure: procedure || null,
    };
  }

  async createCase(caseData: InsertCase): Promise<Case> {
    const nextId = (await CaseModel.countDocuments().exec()) + 1;
    const caseNumber =
      caseData.caseNumber || `CASE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const doc = await CaseModel.create({
      ...caseData,
      id: nextId,
      caseNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    return doc.toObject() as any;
  }

  async updateCase(id: number, caseData: Partial<InsertCase>): Promise<Case> {
    const doc = await CaseModel.findOneAndUpdate(
      { id },
      { $set: { ...caseData, updatedAt: new Date() } },
      { new: true }
    ).lean().exec();
    return doc as any;
  }

  async deleteCase(id: number): Promise<void> {
    await CaseModel.deleteOne({ id }).exec();
  }

  async searchCases(userId: string, query: string): Promise<any[]> {
    const regex = new RegExp(query, 'i');
    const docs = await CaseModel.find({
      anesthesiologistId: userId,
      $or: [
        { caseNumber: regex },
        { patientName: regex },
        { patientId: regex },
        { surgeonName: regex },
      ],
    })
      .sort({ caseDate: -1 })
      .limit(20)
      .lean()
      .exec();
    const result: any[] = [];
    for (const c of docs) {
      let procedure: any = null;
      if (c.procedureId != null) {
        const proc = await ProcedureModel.findOne({ id: c.procedureId }).lean().exec();
        if (proc) procedure = { id: proc.id, name: proc.name };
      }
      result.push({ ...c, procedure });
    }
    return result;
  }

  async getCaseStats(userId: string): Promise<any> {
    const totalCases = await CaseModel.countDocuments({ anesthesiologistId: userId }).exec();
    // Cases this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const casesThisMonth = await CaseModel.countDocuments({
      anesthesiologistId: userId,
      caseDate: { $gte: startOfMonth, $lt: endOfMonth },
    }).exec();
    // Cases by anesthesiaType
    const casesByTypeAgg = await CaseModel.aggregate([
      { $match: { anesthesiologistId: userId } },
      { $group: { _id: '$anesthesiaType', count: { $sum: 1 } } },
    ]).exec();
    const casesByType = casesByTypeAgg.map((doc) => ({ anesthesiaType: doc._id, count: doc.count }));
    // Average duration (assumes caseDuration formatted like "2 hours 30 minutes" or numeric hours)
    // We approximate by ignoring complex parsing and returning 0.
    const avgDuration = 0;
    return {
      totalCases,
      casesThisMonth,
      casesByType,
      avgDuration,
    };
  }

  async getCasesByDateRange(userId: string, startDate: string, endDate: string): Promise<any[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const docs = await CaseModel.find({
      anesthesiologistId: userId,
      caseDate: { $gte: start, $lte: end },
    })
      .sort({ caseDate: -1 })
      .lean()
      .exec();
    return docs as any;
  }

  // Case template operations
  async getCaseTemplates(userId: string): Promise<CaseTemplate[]> {
    const docs = await CaseTemplateModel.find({
      $or: [ { createdBy: userId }, { isPublic: true } ],
    })
      .sort({ name: 1 })
      .lean()
      .exec();
    return docs as any;
  }

  async createCaseTemplate(template: InsertCaseTemplate): Promise<CaseTemplate> {
    const nextId = (await CaseTemplateModel.countDocuments().exec()) + 1;
    const doc = await CaseTemplateModel.create({
      ...template,
      id: nextId,
      createdAt: new Date(),
    } as any);
    return doc.toObject() as any;
  }

  // Case photo operations
  async getCasePhotos(caseId: number): Promise<CasePhoto[]> {
    const docs = await CasePhotoModel.find({ caseId }).sort({ createdAt: 1 }).lean().exec();
    return docs as any;
  }

  async createCasePhoto(photoData: InsertCasePhoto): Promise<CasePhoto> {
    const nextId = (await CasePhotoModel.countDocuments().exec()) + 1;
    const doc = await CasePhotoModel.create({
      ...photoData,
      id: nextId,
      createdAt: new Date(),
    } as any);
    return doc.toObject() as any;
  }

  // Admin operations
  async getAllUsers(): Promise<any[]> {
    const usersList = await UserModel.find({}).lean().exec();
    const result: any[] = [];
    for (const u of usersList) {
      const casesCount = await CaseModel.countDocuments({ anesthesiologistId: u.id }).exec();
      result.push({
        ...u,
        casesCount,
        lastLogin: null,
      });
    }
    // Sort by createdAt descending
    result.sort((a, b) => (b.createdAt as any) - (a.createdAt as any));
    return result;
  }

  async getUserStats(): Promise<any> {
    const totalUsers = await UserModel.countDocuments({}).exec();
    const activeUsers = await UserModel.countDocuments({ isActive: true }).exec();
    const usersByRoleAgg = await UserModel.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]).exec();
    const usersByRole = usersByRoleAgg.map((doc) => ({ role: doc._id, count: doc.count }));
    return {
      totalUsers,
      activeUsers,
      usersByRole,
    };
  }

  async getSystemStats(): Promise<any> {
    const totalCases = await CaseModel.countDocuments({}).exec();
    const totalPatients = await PatientModel.countDocuments({}).exec();
    const totalSurgeons = await SurgeonModel.countDocuments({}).exec();
    return {
      totalCases,
      totalPatients,
      totalSurgeons,
    };
  }

  // User preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const doc = await UserPreferencesModel.findOne({ userId }).lean().exec();
    return doc as any;
  }

  async upsertUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const update: any = { ...preferences, updatedAt: new Date() };
    const doc = await UserPreferencesModel.findOneAndUpdate(
      { userId: preferences.userId },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean().exec();
    return doc as any;
  }
}

// Choose the appropriate storage implementation based on the
// environment.  When MONGODB_URI is defined, the MongoDB backend
// will be used; otherwise the application will fall back to the
// original PostgreSQL/Drizzle implementation.  This allows for a
// gradual migration to MongoDB.
// Always use MongoStorage as the sole storage backend.  PostgreSQL support
// has been removed.
export const storage: IStorage = new MongoStorage();
