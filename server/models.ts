import mongoose, { Schema, type Document } from 'mongoose';

/**
 * Mongoose models corresponding to the Drizzle ORM tables defined in
 * `@shared/schema`.  These models mirror the key fields used by the
 * application.  Some numeric primary keys from the PostgreSQL
 * implementation are represented as numbers here, but in MongoDB
 * collections they are just standard fields on the document rather
 * than the `_id` field.  Auto‑increment semantics are not provided
 * automatically; callers should set the `id` property manually when
 * creating new documents if deterministic numeric identifiers are
 * required.
 */

// Users
const userSchema = new Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  profileImageUrl: { type: String },
  role: { type: String, default: 'user' },
  specialty: { type: String },
  licenseNumber: { type: String },
  institution: { type: String },
  isActive: { type: Boolean, default: true },
  themePreference: { type: String, default: 'dark' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
export const UserModel = mongoose.model('User', userSchema);

// Patients
const patientSchema = new Schema({
  id: { type: Number, index: true },
  patientId: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  age: { type: Number },
  gender: { type: String },
  weight: { type: Number },
  height: { type: Number },
  bmi: { type: Number },
  allergies: { type: String },
  medicalHistory: { type: String },
  createdBy: { type: String, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
export const PatientModel = mongoose.model('Patient', patientSchema);

// Surgeons
const surgeonSchema = new Schema({
  id: { type: Number, index: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  specialty: { type: String },
  institution: { type: String },
  email: { type: String },
  phone: { type: String },
  createdBy: { type: String, index: true },
  createdAt: { type: Date, default: Date.now },
});
export const SurgeonModel = mongoose.model('Surgeon', surgeonSchema);

// Procedures
const procedureSchema = new Schema({
  id: { type: Number, index: true },
  name: { type: String, required: true },
  category: { type: String },
  description: { type: String },
  duration: { type: Number },
  complexity: { type: String },
  createdAt: { type: Date, default: Date.now },
});
export const ProcedureModel = mongoose.model('Procedure', procedureSchema);

// Cases
const caseSchema = new Schema({
  id: { type: Number, index: true },
  caseNumber: { type: String, required: true, unique: true },
  patientId: { type: String },
  patientName: { type: String },
  surgeonName: { type: String },
  procedureId: { type: Number },
  customProcedureName: { type: String },
  procedureCategory: { type: String },
  anesthesiologistId: { type: String, required: true },
  supervisorId: { type: String },
  anesthesiaType: { type: String, required: true },
  regionalBlockType: { type: String },
  customRegionalBlock: { type: String },
  asaScore: { type: String },
  emergencyCase: { type: Boolean, default: false },
  caseDate: { type: Date, required: true },
  caseDuration: { type: String },
  diagnosis: { type: String },
  complications: { type: String },
  medications: { type: Schema.Types.Mixed },
  inductionMedications: { type: String },
  maintenanceMedications: { type: String },
  postOpMedications: { type: String },
  techniques: { type: Schema.Types.Mixed },
  monitoring: { type: Schema.Types.Mixed },
  notes: { type: String },
  status: { type: String, default: 'completed' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
export const CaseModel = mongoose.model('Case', caseSchema);

// Case Templates
const caseTemplateSchema = new Schema({
  id: { type: Number, index: true },
  name: { type: String, required: true },
  category: { type: String },
  procedureType: { type: String },
  anesthesiaType: { type: String },
  defaultSettings: { type: Schema.Types.Mixed },
  createdBy: { type: String },
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
export const CaseTemplateModel = mongoose.model('CaseTemplate', caseTemplateSchema);

// Case Photos
const casePhotoSchema = new Schema({
  id: { type: Number, index: true },
  caseId: { type: Number, index: true },
  fileName: { type: String, required: true },
  originalName: { type: String },
  mimeType: { type: String },
  size: { type: Number },
  description: { type: String },
  uploadedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
});
export const CasePhotoModel = mongoose.model('CasePhoto', casePhotoSchema);

// User Preferences
const userPreferencesSchema = new Schema({
  id: { type: Number, index: true },
  userId: { type: String, required: true, unique: true },
  defaultAnesthesiaType: { type: String },
  defaultInstitution: { type: String },
  exportSettings: { type: Schema.Types.Mixed },
  dashboardSettings: { type: Schema.Types.Mixed },
  notificationSettings: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
export const UserPreferencesModel = mongoose.model('UserPreferences', userPreferencesSchema);