import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// Use a local authentication module instead of the Replit‑specific one
import { setupAuth, isAuthenticated } from "./auth";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { 
  insertPatientSchema,
  insertSurgeonSchema,
  insertProcedureSchema,
  insertCaseSchema,
  insertCaseTemplateSchema,
  insertUserPreferencesSchema,
  insertUserSchema
} from "@shared/schema";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `case-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      // @ts-ignore - multer types are incorrect for this callback
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  /**
   * Support legacy or misconfigured callback paths.
   *
   * Some deployments may incorrectly configure the Auth0 callback URL with an
   * extra `/cases` prefix (e.g. `https://example.com/cases/api/auth/callback`).
   * There is no route at `/cases/api/auth/callback` in this application, so such
   * requests result in a 404.  To gracefully handle this scenario, redirect any
   * request to `/cases/api/auth/callback` to the correct callback route
   * (`/api/auth/callback`) while preserving the query string.  This ensures
   * authentication flows complete successfully even if the callback URL was set
   * with the wrong base path.
   */
  app.get('/cases/api/auth/callback', (req, res) => {
    const qsIndex = req.originalUrl.indexOf('?');
    const qs = qsIndex >= 0 ? req.originalUrl.slice(qsIndex) : '';
    res.redirect(302, `/api/auth/callback${qs}`);
  });

  // Serve uploaded files statically
  app.use('/api/uploads', express.static(uploadsDir));

  // Test photo upload endpoint
  app.post('/api/test-upload', isAuthenticated, upload.single('testPhoto'), async (req: any, res) => {
    console.log("Test upload endpoint hit");
    console.log("File received:", req.file);
    console.log("Body:", req.body);
    
    if (req.file) {
      res.json({ 
        success: true, 
        message: "File uploaded successfully",
        file: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    } else {
      res.json({ 
        success: false, 
        message: "No file received" 
      });
    }
  });

  // Initialize comprehensive procedures
  app.post('/api/init-procedures', isAuthenticated, async (req: any, res) => {
    try {
      const comprehensiveProcedures = [
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
        { name: "Laminectomy", category: "Orthopedic Surgery", description: "Removal of vertebral lamina" },
        { name: "Tendon Repair", category: "Orthopedic Surgery", description: "Surgical repair of tendon" },
        { name: "Amputation", category: "Orthopedic Surgery", description: "Surgical removal of limb" },
        { name: "Intramedullary Nailing", category: "Orthopedic Surgery", description: "Internal fixation with intramedullary nail" },
        { name: "Joint Dislocation Reduction", category: "Orthopedic Surgery", description: "Reduction of dislocated joint" },

        // 3. Thoracic Surgery
        { name: "Video-Assisted Thoracoscopic Surgery (VATS)", category: "Thoracic Surgery", description: "Minimally invasive chest surgery" },
        { name: "Lobectomy", category: "Thoracic Surgery", description: "Surgical removal of lung lobe" },
        { name: "Wedge Resection", category: "Thoracic Surgery", description: "Removal of wedge-shaped lung tissue" },
        { name: "Pneumonectomy", category: "Thoracic Surgery", description: "Complete lung removal" },
        { name: "Mediastinoscopy", category: "Thoracic Surgery", description: "Examination of mediastinum" },
        { name: "Thoracotomy", category: "Thoracic Surgery", description: "Surgical opening of chest" },
        { name: "Pleurodesis", category: "Thoracic Surgery", description: "Procedure to eliminate pleural space" },

        // 4. Cardiac Surgery
        { name: "Coronary Artery Bypass Grafting (CABG)", category: "Cardiac Surgery", description: "Coronary artery bypass surgery" },
        { name: "Valve Replacement/Repair (Mitral, Aortic)", category: "Cardiac Surgery", description: "Heart valve surgery" },
        { name: "Aortic Aneurysm Repair", category: "Cardiac Surgery", description: "Repair of aortic aneurysm" },
        { name: "Atrial Septal Defect (ASD) / Ventricular Septal Defect (VSD) Closure", category: "Cardiac Surgery", description: "Congenital heart defect repair" },
        { name: "Heart Transplant", category: "Cardiac Surgery", description: "Heart transplantation surgery" },
        { name: "Left Ventricular Assist Device (LVAD) Implant", category: "Cardiac Surgery", description: "LVAD implantation" },

        // 5. Pediatric Surgery
        { name: "Pyloromyotomy", category: "Pediatric Surgery", description: "Treatment for pyloric stenosis" },
        { name: "Inguinal Hernia Repair", category: "Pediatric Surgery", description: "Pediatric inguinal hernia repair" },
        { name: "Cleft Lip Repair", category: "Pediatric Surgery", description: "Surgical repair of cleft lip" },
        { name: "Laparotomy for Intestinal Obstruction", category: "Pediatric Surgery", description: "Surgery for bowel obstruction" },
        { name: "Orchiopexy", category: "Pediatric Surgery", description: "Surgical fixation of undescended testicle" },
        { name: "Circumcision", category: "Pediatric Surgery", description: "Surgical removal of foreskin" },
        { name: "Anorectal Malformation Repair", category: "Pediatric Surgery", description: "Repair of anorectal anomalies" },
        { name: "Esophageal Atresia Repair", category: "Pediatric Surgery", description: "Repair of esophageal atresia" },

        // 6. Neurosurgery
        { name: "Craniotomy for Tumor", category: "Neurosurgery", description: "Brain tumor removal surgery" },
        { name: "Craniotomy for Trauma (EDH/SDH)", category: "Neurosurgery", description: "Trauma craniotomy for hematoma" },
        { name: "Spinal Decompression", category: "Neurosurgery", description: "Spinal cord decompression" },
        { name: "Ventriculoperitoneal (VP) Shunt Insertion", category: "Neurosurgery", description: "VP shunt placement" },
        { name: "Aneurysm Clipping", category: "Neurosurgery", description: "Surgical clipping of brain aneurysm" },
        { name: "Spinal Cord Tumor Resection", category: "Neurosurgery", description: "Removal of spinal cord tumor" },
        { name: "Deep Brain Stimulation", category: "Neurosurgery", description: "DBS electrode implantation" },

        // 7. Obstetrics & Gynecology
        { name: "Cesarean Section (Elective/Emergency)", category: "Obstetrics & Gynecology", description: "Cesarean delivery" },
        { name: "Hysterectomy (Abdominal/Vaginal)", category: "Obstetrics & Gynecology", description: "Surgical removal of uterus" },
        { name: "Dilation and Curettage (D&C)", category: "Obstetrics & Gynecology", description: "D&C procedure" },
        { name: "Laparoscopy for Ovarian Cyst / Ectopic Pregnancy", category: "Obstetrics & Gynecology", description: "Laparoscopic gynecological surgery" },
        { name: "Normal Vaginal Delivery", category: "Obstetrics & Gynecology", description: "Vaginal childbirth" },
        { name: "Tubal Ligation", category: "Obstetrics & Gynecology", description: "Female sterilization" },
        { name: "Myomectomy", category: "Obstetrics & Gynecology", description: "Removal of uterine fibroids" },
        { name: "Oophorectomy", category: "Obstetrics & Gynecology", description: "Surgical removal of ovaries" },

        // 8. ENT Surgery
        { name: "Tonsillectomy / Adenoidectomy", category: "ENT Surgery", description: "Removal of tonsils and/or adenoids" },
        { name: "Functional Endoscopic Sinus Surgery (FESS)", category: "ENT Surgery", description: "Endoscopic sinus surgery" },
        { name: "Septoplasty", category: "ENT Surgery", description: "Nasal septum repair" },
        { name: "Tracheostomy", category: "ENT Surgery", description: "Creation of tracheal opening" },
        { name: "Neck Dissection", category: "ENT Surgery", description: "Surgical removal of neck lymph nodes" },
        { name: "Microlaryngoscopy", category: "ENT Surgery", description: "Microsurgical examination of larynx" },
        { name: "Myringotomy with Tube Insertion", category: "ENT Surgery", description: "Ear tube placement" },

        // 9. Ophthalmic Surgery
        { name: "Cataract Extraction (Phacoemulsification)", category: "Ophthalmic Surgery", description: "Cataract removal surgery" },
        { name: "Vitrectomy", category: "Ophthalmic Surgery", description: "Removal of vitreous gel" },
        { name: "Glaucoma Surgery", category: "Ophthalmic Surgery", description: "Surgery for glaucoma" },
        { name: "Strabismus Surgery", category: "Ophthalmic Surgery", description: "Eye muscle surgery" },
        { name: "Retinal Detachment Repair", category: "Ophthalmic Surgery", description: "Repair of detached retina" },
        { name: "Enucleation", category: "Ophthalmic Surgery", description: "Removal of eyeball" },

        // 10. Dental / Maxillofacial Surgery
        { name: "Tooth Extraction (GA)", category: "Dental / Maxillofacial Surgery", description: "Tooth extraction under general anesthesia" },
        { name: "Mandibular Fracture Fixation", category: "Dental / Maxillofacial Surgery", description: "Repair of mandibular fracture" },
        { name: "Maxillary Fracture Fixation", category: "Dental / Maxillofacial Surgery", description: "Repair of maxillary fracture" },
        { name: "Orthognathic Surgery", category: "Dental / Maxillofacial Surgery", description: "Corrective jaw surgery" },
        { name: "Cyst Removal", category: "Dental / Maxillofacial Surgery", description: "Oral and maxillofacial cyst removal" },

        // 11. Urology
        { name: "Transurethral Resection of Prostate (TURP)", category: "Urology", description: "Prostate resection via urethra" },
        { name: "Cystoscopy", category: "Urology", description: "Bladder examination" },
        { name: "Ureteroscopy with Lithotripsy", category: "Urology", description: "Stone removal via ureteroscopy" },
        { name: "Nephrectomy", category: "Urology", description: "Kidney removal" },
        { name: "Percutaneous Nephrolithotomy (PCNL)", category: "Urology", description: "Kidney stone removal" },
        { name: "Pyeloplasty", category: "Urology", description: "Repair of ureteropelvic junction" },
        { name: "Prostatectomy", category: "Urology", description: "Prostate removal" },
        { name: "Bladder Tumor Resection", category: "Urology", description: "Removal of bladder tumor" },

        // 12. Diagnostic & Minor Procedures
        { name: "Endoscopy", category: "Diagnostic & Minor Procedures", description: "Upper endoscopic examination" },
        { name: "Colonoscopy", category: "Diagnostic & Minor Procedures", description: "Colonoscopic examination" },
        { name: "Bronchoscopy", category: "Diagnostic & Minor Procedures", description: "Bronchoscopic examination" },
        { name: "MRI under Sedation", category: "Diagnostic & Minor Procedures", description: "MRI with sedation" },
        { name: "CT under Sedation", category: "Diagnostic & Minor Procedures", description: "CT scan with sedation" },
        { name: "Liver Biopsy", category: "Diagnostic & Minor Procedures", description: "Percutaneous liver biopsy" },
        { name: "Central Line Insertion", category: "Diagnostic & Minor Procedures", description: "Central venous catheter placement" },
        { name: "Arterial Line Insertion", category: "Diagnostic & Minor Procedures", description: "Arterial catheter placement" },

        // Other/Custom option
        { name: "Other", category: "Other", description: "Other procedure not listed" },
      ];

      // Clear existing procedures first to avoid duplicates
      try {
        await storage.clearAllProcedures();
        console.log("Cleared existing procedures");
      } catch (error) {
        console.log("Note: Could not clear existing procedures, continuing with initialization");
      }

      let createdCount = 0;
      for (const procedure of comprehensiveProcedures) {
        try {
          await storage.createProcedure(procedure);
          createdCount++;
          console.log(`✓ Created: ${procedure.name} (${procedure.category})`);
        } catch (error) {
          console.log(`✗ Failed to create ${procedure.name}:`, error);
        }
      }

      res.json({ 
        message: "Comprehensive procedures initialized", 
        total: comprehensiveProcedures.length,
        created: createdCount,
        categories: [
          "General Surgery", "Orthopedic Surgery", "Thoracic Surgery", "Cardiac Surgery",
          "Pediatric Surgery", "Neurosurgery", "Obstetrics & Gynecology", "ENT Surgery",
          "Ophthalmic Surgery", "Dental / Maxillofacial Surgery", "Urology", 
          "Diagnostic & Minor Procedures", "Other"
        ]
      });
    } catch (error) {
      console.error("Error initializing procedures:", error);
      res.status(500).json({ message: "Failed to initialize procedures" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Attempt to load the user from the database.  If the user does not
      // yet exist (for example, the dummy user provided by the local auth
      // middleware), create a basic user record on the fly.  This avoids
      // returning `null` on first login and allows the client to treat the
      // request as authenticated.
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.upsertUser({
          id: userId,
          email: req.user.claims.email,
          firstName: req.user.claims.first_name,
          lastName: req.user.claims.last_name,
        });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Theme preference route
  app.patch('/api/auth/theme', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { theme } = req.body;
      
      if (!['light', 'dark'].includes(theme)) {
        return res.status(400).json({ message: "Invalid theme" });
      }
      
      await storage.updateUserTheme(userId, theme);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating theme:", error);
      res.status(500).json({ message: "Failed to update theme" });
    }
  });

  // Patient routes
  app.get('/api/patients', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { limit, search } = req.query;
      
      let patients;
      if (search) {
        patients = await storage.searchPatients(userId, search as string);
      } else {
        patients = await storage.getPatients(userId, limit ? parseInt(limit as string) : undefined);
      }
      
      res.json(patients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get('/api/patients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = req.params.id;
      console.log("Looking up patient with ID:", id);
      
      // Always try patientId (string) lookup first since that's what cases store
      let patient = await storage.getPatientByPatientId(id);
      
      // If not found and the ID looks like a database ID (small number), try database ID lookup
      if (!patient && !isNaN(parseInt(id)) && parseInt(id) < 1000) {
        console.log("Trying database ID lookup as fallback");
        patient = await storage.getPatient(parseInt(id));
      }
      
      if (!patient) {
        console.log("Patient not found with ID:", id);
        return res.status(404).json({ message: "Patient not found" });
      }
      
      console.log("Found patient:", patient);
      res.json(patient);
    } catch (error) {
      console.error("Error fetching patient:", error);
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.post('/api/patients', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const patientData = insertPatientSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const patient = await storage.createPatient(patientData);
      res.status(201).json(patient);
    } catch (error) {
      console.error("Error creating patient:", error);
      res.status(500).json({ message: "Failed to create patient" });
    }
  });

  app.patch('/api/patients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertPatientSchema.partial().parse(req.body);
      
      const patient = await storage.updatePatient(id, updates);
      res.json(patient);
    } catch (error) {
      console.error("Error updating patient:", error);
      res.status(500).json({ message: "Failed to update patient" });
    }
  });

  app.delete('/api/patients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePatient(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting patient:", error);
      res.status(500).json({ message: "Failed to delete patient" });
    }
  });

  // Surgeon routes
  app.get('/api/surgeons', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { limit } = req.query;
      
      const surgeons = await storage.getSurgeons(userId, limit ? parseInt(limit as string) : undefined);
      res.json(surgeons);
    } catch (error) {
      console.error("Error fetching surgeons:", error);
      res.status(500).json({ message: "Failed to fetch surgeons" });
    }
  });

  app.post('/api/surgeons', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const surgeonData = insertSurgeonSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const surgeon = await storage.createSurgeon(surgeonData);
      res.status(201).json(surgeon);
    } catch (error) {
      console.error("Error creating surgeon:", error);
      res.status(500).json({ message: "Failed to create surgeon" });
    }
  });

  // Procedure routes
  app.get('/api/procedures', isAuthenticated, async (req, res) => {
    try {
      const { limit } = req.query;
      const procedures = await storage.getProcedures(limit ? parseInt(limit as string) : undefined);
      res.json(procedures);
    } catch (error) {
      console.error("Error fetching procedures:", error);
      res.status(500).json({ message: "Failed to fetch procedures" });
    }
  });

  app.post('/api/procedures', isAuthenticated, async (req, res) => {
    try {
      const procedureData = insertProcedureSchema.parse(req.body);
      const procedure = await storage.createProcedure(procedureData);
      res.status(201).json(procedure);
    } catch (error) {
      console.error("Error creating procedure:", error);
      res.status(500).json({ message: "Failed to create procedure" });
    }
  });

  // Case routes
  app.get('/api/cases', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { limit, offset, search, startDate, endDate } = req.query;
      
      let cases;
      if (search) {
        cases = await storage.searchCases(userId, search as string);
      } else if (startDate && endDate) {
        cases = await storage.getCasesByDateRange(userId, startDate as string, endDate as string);
      } else {
        cases = await storage.getCases(
          userId,
          limit ? parseInt(limit as string) : undefined,
          offset ? parseInt(offset as string) : undefined
        );
      }
      
      res.json(cases);
    } catch (error) {
      console.error("Error fetching cases:", error);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  app.get('/api/cases/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getCaseStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching case stats:", error);
      res.status(500).json({ message: "Failed to fetch case stats" });
    }
  });

  app.get('/api/cases/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const caseData = await storage.getCase(id);
      
      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      res.json(caseData);
    } catch (error) {
      console.error("Error fetching case:", error);
      res.status(500).json({ message: "Failed to fetch case" });
    }
  });

  app.get('/api/cases/:id/photos', isAuthenticated, async (req: any, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const photos = await storage.getCasePhotos(caseId);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching case photos:", error);
      res.status(500).json({ message: "Failed to fetch case photos" });
    }
  });

  app.post('/api/cases/:id/photos', isAuthenticated, upload.single('casePhoto'), async (req: any, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      if (!req.file) {
        return res.status(400).json({ message: "No photo file provided" });
      }
      
      // Validate file size - reject very small files that are likely corrupted/empty
      if (req.file.size < 100) {
        // Remove the uploaded file if it's too small
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error("Error removing invalid file:", err);
        }
        return res.status(400).json({ message: "File is too small or corrupted" });
      }
      
      // Verify the file exists and is readable
      try {
        const stats = fs.statSync(req.file.path);
        if (!stats.isFile() || stats.size !== req.file.size) {
          throw new Error("File verification failed");
        }
      } catch (fileError) {
        console.error("File verification failed:", fileError);
        return res.status(400).json({ message: "Uploaded file is corrupted or inaccessible" });
      }
      
      // Check for duplicate files by comparing size and name to prevent multiple uploads
      const existingPhotos = await storage.getCasePhotos(caseId);
      const isDuplicate = existingPhotos.some(photo => 
        photo.size === req.file.size && 
        photo.originalName === req.file.originalname
      );
      
      if (isDuplicate) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error("Error removing duplicate file:", err);
        }
        return res.status(400).json({ message: "This file has already been uploaded for this case" });
      }
      
      const photoData = {
        caseId: caseId,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedBy: userId,
      };
      
      const newPhoto = await storage.createCasePhoto(photoData);
      
      // Return the photo data with full URL for immediate access
      const photoWithUrl = {
        ...newPhoto,
        url: `/api/uploads/${newPhoto.fileName}`
      };
      
      res.status(201).json(photoWithUrl);
    } catch (error) {
      console.error("Error uploading photo:", error);
      // Clean up file if database save failed
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error("Error cleaning up failed upload:", cleanupError);
        }
      }
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  app.post('/api/cases', isAuthenticated, upload.single('casePhoto'), async (req: any, res) => {
    try {
      console.log("Case creation request received");
      console.log("Request file:", req.file);
      console.log("Request body keys:", Object.keys(req.body));
      const userId = req.user.claims.sub;
      
      // Helper function to safely parse integers from FormData
      const parseIntOrNull = (value: any) => {
        if (!value || value === "" || value === "null" || value === "undefined") {
          return null;
        }
        const parsed = parseInt(value);
        return isNaN(parsed) ? null : parsed;
      };

      // Transform the request data to proper types
      const transformedData = {
        ...req.body,
        anesthesiologistId: userId,
        // Keep patientId as string
        patientId: req.body.patientId && req.body.patientId !== "" ? req.body.patientId.trim() : null,
        procedureId: parseIntOrNull(req.body.procedureId),
        customProcedureName: req.body.customProcedureName && req.body.customProcedureName !== "null" ? req.body.customProcedureName : null,
        regionalBlockType: req.body.regionalBlockType || null,
        customRegionalBlock: req.body.customRegionalBlock || null,
        // Convert number strings to proper types (only if valid)
        weight: req.body.weight && req.body.weight !== "" && !isNaN(parseFloat(req.body.weight)) ? parseFloat(req.body.weight) : null,
        height: req.body.height && req.body.height !== "" && !isNaN(parseFloat(req.body.height)) ? parseFloat(req.body.height) : null,
        age: req.body.age && req.body.age !== "" && !isNaN(parseInt(req.body.age)) ? parseInt(req.body.age) : null,
        // Convert boolean strings to proper booleans (FormData sends booleans as strings)
        emergencyCase: req.body.emergencyCase === 'true' || req.body.emergencyCase === true,
      };
      
      // Remove undefined fields to avoid schema issues
      Object.keys(transformedData).forEach(key => {
        if (transformedData[key] === undefined) {
          delete transformedData[key];
        }
      });
      
      // Debug logging
      console.log("Raw request body:", req.body);
      console.log("Transformed data:", transformedData);
      
      // Generate case number if not provided or empty
      if (!transformedData.caseNumber || transformedData.caseNumber.trim() === "") {
        const timestamp = Date.now();
        transformedData.caseNumber = `CC-${timestamp}`;
      }
      
      // Handle patient creation/update if patient data is provided
      if (transformedData.patientId && transformedData.patientName) {
        const patientData: any = {
          patientId: transformedData.patientId,
          firstName: transformedData.patientName.split(' ')[0] || transformedData.patientName,
          lastName: transformedData.patientName.split(' ').slice(1).join(' ') || '',
          createdBy: userId,
        };
        
        // Only add optional fields if they have values
        if (transformedData.weight) {
          patientData.weight = transformedData.weight;
        }
        if (transformedData.height) {
          patientData.height = transformedData.height;
        }
        if (transformedData.age) {
          patientData.age = transformedData.age;
        }

        console.log("Patient data to create/update:", patientData);

        try {
          // Validate patient data using schema
          const validatedPatientData = insertPatientSchema.parse(patientData);
          console.log("Validated patient data:", validatedPatientData);
          
          // Try to find existing patient by patientId
          const existingPatient = await storage.getPatientByPatientId(transformedData.patientId);
          
          if (existingPatient) {
            console.log("Updating existing patient:", existingPatient.id);
            // Update existing patient with new data
            await storage.updatePatient(existingPatient.id, validatedPatientData);
          } else {
            console.log("Creating new patient");
            // Create new patient
            const newPatient = await storage.createPatient(validatedPatientData);
            console.log("Created patient:", newPatient);
          }
        } catch (patientError) {
          console.error("Error handling patient data:", patientError);
          if (patientError instanceof Error && patientError.name === "ZodError") {
            console.error("Patient validation errors:", (patientError as any).issues);
          }
          // Continue with case creation even if patient creation fails
        }
      }

      // Remove patient-specific fields from case data as they don't belong in the cases table
      const { weight, height, age, ...caseOnlyData } = transformedData;
      const caseData = insertCaseSchema.parse(caseOnlyData);
      
      const newCase = await storage.createCase(caseData);
      
      // Handle photo upload if a file was uploaded
      if (req.file) {
        console.log("Saving uploaded photo:", req.file);
        
        // Validate file before saving to database
        if (req.file.size >= 100) {
          try {
            // Verify the file exists and is readable
            const stats = fs.statSync(req.file.path);
            if (stats.isFile() && stats.size === req.file.size) {
              // Check for potential duplicate by size and mimetype to avoid saving corrupted files
              if (req.file.mimetype && req.file.mimetype.startsWith('image/')) {
                const photoData = {
                  caseId: newCase.id,
                  fileName: req.file.filename,
                  originalName: req.file.originalname,
                  mimeType: req.file.mimetype,
                  size: req.file.size,
                  uploadedBy: userId,
                };
                
                await storage.createCasePhoto(photoData);
                console.log("Photo saved successfully");
              } else {
                console.error("Photo file is not a valid image type:", req.file.mimetype);
                try {
                  fs.unlinkSync(req.file.path);
                } catch (cleanupError) {
                  console.error("Error removing invalid image file:", cleanupError);
                }
              }
            } else {
              console.error("Photo file verification failed - size mismatch");
              try {
                fs.unlinkSync(req.file.path);
              } catch (cleanupError) {
                console.error("Error removing corrupted file:", cleanupError);
              }
            }
          } catch (photoError) {
            console.error("Error saving photo:", photoError);
            // Clean up the file if database save failed
            try {
              fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
              console.error("Error cleaning up failed photo:", cleanupError);
            }
          }
        } else {
          console.error("Photo file too small, removing:", req.file.size);
          try {
            fs.unlinkSync(req.file.path);
          } catch (cleanupError) {
            console.error("Error removing small photo file:", cleanupError);
          }
        }
      }
      
      res.status(201).json(newCase);
    } catch (error) {
      console.error("Error creating case:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
        // Check if it's a Zod validation error
        if (error.name === "ZodError" && (error as any).issues) {
          console.error("Error details:", (error as any).issues);
          return res.status(400).json({ 
            message: "Validation error", 
            details: (error as any).issues 
          });
        }
      }
      res.status(500).json({ message: "Failed to create case" });
    }
  });

  app.patch('/api/cases/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertCaseSchema.partial().parse(req.body);
      
      const updatedCase = await storage.updateCase(id, updates);
      res.json(updatedCase);
    } catch (error) {
      console.error("Error updating case:", error);
      res.status(500).json({ message: "Failed to update case" });
    }
  });

  app.patch('/api/cases/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const endTime = new Date();
      
      const updates = {
        status: "completed",
        endTime: endTime,
        updatedAt: endTime,
      };
      
      const updatedCase = await storage.updateCase(id, updates);
      res.json(updatedCase);
    } catch (error) {
      console.error("Error completing case:", error);
      res.status(500).json({ message: "Failed to complete case" });
    }
  });

  app.delete('/api/cases/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCase(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting case:", error);
      res.status(500).json({ message: "Failed to delete case" });
    }
  });

  // Case template routes
  app.get('/api/case-templates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const templates = await storage.getCaseTemplates(userId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching case templates:", error);
      res.status(500).json({ message: "Failed to fetch case templates" });
    }
  });

  app.post('/api/case-templates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const templateData = insertCaseTemplateSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const template = await storage.createCaseTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating case template:", error);
      res.status(500).json({ message: "Failed to create case template" });
    }
  });

  // User preferences routes
  app.get('/api/user-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  app.put('/api/user-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferencesData = insertUserPreferencesSchema.parse({
        ...req.body,
        userId,
      });
      
      const preferences = await storage.upsertUserPreferences(preferencesData);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });

  // Admin routes - only accessible by admin users
  const requireAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: "Authorization check failed" });
    }
  };

  app.get('/api/admin/users', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/users/:userId', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/admin/user-cases/:userId', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const userId = req.params.userId;
      const cases = await storage.getCases(userId);
      res.json(cases);
    } catch (error) {
      console.error("Error fetching user cases:", error);
      res.status(500).json({ message: "Failed to fetch user cases" });
    }
  });

  app.get('/api/admin/stats/users', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get('/api/admin/stats/system', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching system stats:", error);
      res.status(500).json({ message: "Failed to fetch system stats" });
    }
  });

  // Update user by admin
  app.patch('/api/admin/users/:userId', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const userId = req.params.userId;
      const updateData = req.body;
      
      // Validate the update data
      const validatedData = insertUserSchema.partial().parse(updateData);
      
      // Update user
      const updatedUser = await storage.updateUser(userId, validatedData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Admin access to all cases - for evaluation purposes
  app.get('/api/admin/cases', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { limit, offset } = req.query;
      const cases = await storage.getAllCases(
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
      );
      res.json(cases);
    } catch (error) {
      console.error("Error fetching all cases:", error);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  // Admin access to any specific case
  app.get('/api/admin/cases/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const caseData = await storage.getCase(id);
      
      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      res.json(caseData);
    } catch (error) {
      console.error("Error fetching case:", error);
      res.status(500).json({ message: "Failed to fetch case" });
    }
  });

  // Admin access to photos for any case
  app.get('/api/admin/cases/:id/photos', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const caseId = parseInt(req.params.id);
      const photos = await storage.getAllCasePhotos(caseId);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching case photos:", error);
      res.status(500).json({ message: "Failed to fetch case photos" });
    }
  });

  // Admin endpoint to clean up corrupted photos
  app.post('/api/admin/cleanup-photos', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const photos = await storage.getAllPhotos();
      let cleanedCount = 0;
      
      for (const photo of photos) {
        const filePath = path.join(uploadsDir, photo.fileName);
        try {
          if (!fs.existsSync(filePath) || fs.statSync(filePath).size < 100) {
            // Remove database entry for missing or corrupted files
            await storage.deleteCasePhoto(photo.id);
            cleanedCount++;
            console.log(`Cleaned up corrupted photo: ${photo.fileName}`);
          }
        } catch (error) {
          console.error(`Error checking photo ${photo.fileName}:`, error);
        }
      }
      
      res.json({ message: `Cleaned up ${cleanedCount} corrupted photos` });
    } catch (error) {
      console.error("Error cleaning up photos:", error);
      res.status(500).json({ message: "Failed to clean up photos" });
    }
  });

  // Setup admin and procedures endpoint (only for first-time setup)
  app.post('/api/setup', async (req, res) => {
    try {
      const { email, secret } = req.body;
      
      // Basic security check
      if (secret !== 'setup-admin-2024') {
        return res.status(403).json({ message: "Invalid setup secret" });
      }

      // Set user as admin by email
      if (email) {
        // Find user by email first
        const users = await storage.getAllUsers();
        const user = users.find(u => u.email === email);
        if (user) {
          const updatedUser = await storage.updateUser(user.id, { role: 'admin', isActive: true });
          if (updatedUser) {
            console.log(`Set ${email} as admin`);
          }
        }
      }

      // Add default procedures if they don't exist
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
        { name: "Laminectomy", category: "Orthopedic Surgery", description: "Removal of vertebral lamina" },
        { name: "Tendon Repair", category: "Orthopedic Surgery", description: "Surgical repair of tendon" },
        { name: "Amputation", category: "Orthopedic Surgery", description: "Surgical removal of limb" },
        { name: "Intramedullary Nailing", category: "Orthopedic Surgery", description: "Internal fixation with intramedullary nail" },
        { name: "Joint Dislocation Reduction", category: "Orthopedic Surgery", description: "Reduction of dislocated joint" },

        // 3. Thoracic Surgery
        { name: "Video-Assisted Thoracoscopic Surgery (VATS)", category: "Thoracic Surgery", description: "Minimally invasive chest surgery" },
        { name: "Lobectomy", category: "Thoracic Surgery", description: "Surgical removal of lung lobe" },
        { name: "Wedge Resection", category: "Thoracic Surgery", description: "Removal of wedge-shaped lung tissue" },
        { name: "Pneumonectomy", category: "Thoracic Surgery", description: "Complete lung removal" },
        { name: "Mediastinoscopy", category: "Thoracic Surgery", description: "Examination of mediastinum" },
        { name: "Thoracotomy", category: "Thoracic Surgery", description: "Surgical opening of chest" },
        { name: "Pleurodesis", category: "Thoracic Surgery", description: "Procedure to eliminate pleural space" },

        // 4. Cardiac Surgery
        { name: "Coronary Artery Bypass Grafting (CABG)", category: "Cardiac Surgery", description: "Coronary artery bypass surgery" },
        { name: "Valve Replacement/Repair (Mitral, Aortic)", category: "Cardiac Surgery", description: "Heart valve surgery" },
        { name: "Aortic Aneurysm Repair", category: "Cardiac Surgery", description: "Repair of aortic aneurysm" },
        { name: "Atrial Septal Defect (ASD) / Ventricular Septal Defect (VSD) Closure", category: "Cardiac Surgery", description: "Congenital heart defect repair" },
        { name: "Heart Transplant", category: "Cardiac Surgery", description: "Heart transplantation surgery" },
        { name: "Left Ventricular Assist Device (LVAD) Implant", category: "Cardiac Surgery", description: "LVAD implantation" },

        // 5. Pediatric Surgery
        { name: "Pyloromyotomy", category: "Pediatric Surgery", description: "Treatment for pyloric stenosis" },
        { name: "Inguinal Hernia Repair (Pediatric)", category: "Pediatric Surgery", description: "Pediatric inguinal hernia repair" },
        { name: "Cleft Lip Repair", category: "Pediatric Surgery", description: "Surgical repair of cleft lip" },
        { name: "Laparotomy for Intestinal Obstruction", category: "Pediatric Surgery", description: "Surgery for bowel obstruction" },
        { name: "Orchiopexy", category: "Pediatric Surgery", description: "Surgical fixation of undescended testicle" },
        { name: "Circumcision", category: "Pediatric Surgery", description: "Surgical removal of foreskin" },
        { name: "Anorectal Malformation Repair", category: "Pediatric Surgery", description: "Repair of anorectal anomalies" },
        { name: "Esophageal Atresia Repair", category: "Pediatric Surgery", description: "Repair of esophageal atresia" },

        // 6. Neurosurgery
        { name: "Craniotomy for Tumor", category: "Neurosurgery", description: "Brain tumor removal surgery" },
        { name: "Craniotomy for Trauma (EDH/SDH)", category: "Neurosurgery", description: "Trauma craniotomy for hematoma" },
        { name: "Spinal Decompression", category: "Neurosurgery", description: "Spinal cord decompression" },
        { name: "Ventriculoperitoneal (VP) Shunt Insertion", category: "Neurosurgery", description: "VP shunt placement" },
        { name: "Aneurysm Clipping", category: "Neurosurgery", description: "Surgical clipping of brain aneurysm" },
        { name: "Spinal Cord Tumor Resection", category: "Neurosurgery", description: "Removal of spinal cord tumor" },
        { name: "Deep Brain Stimulation", category: "Neurosurgery", description: "DBS electrode implantation" },

        // 7. Obstetrics & Gynecology
        { name: "Cesarean Section (Elective/Emergency)", category: "Obstetrics & Gynecology", description: "Cesarean delivery" },
        { name: "Hysterectomy (Abdominal/Vaginal)", category: "Obstetrics & Gynecology", description: "Surgical removal of uterus" },
        { name: "Dilation and Curettage (D&C)", category: "Obstetrics & Gynecology", description: "D&C procedure" },
        { name: "Laparoscopy for Ovarian Cyst / Ectopic Pregnancy", category: "Obstetrics & Gynecology", description: "Laparoscopic gynecological surgery" },
        { name: "Normal Vaginal Delivery", category: "Obstetrics & Gynecology", description: "Vaginal childbirth" },
        { name: "Tubal Ligation", category: "Obstetrics & Gynecology", description: "Female sterilization" },
        { name: "Myomectomy", category: "Obstetrics & Gynecology", description: "Removal of uterine fibroids" },
        { name: "Oophorectomy", category: "Obstetrics & Gynecology", description: "Surgical removal of ovaries" },

        // 8. ENT Surgery
        { name: "Tonsillectomy / Adenoidectomy", category: "ENT Surgery", description: "Removal of tonsils and/or adenoids" },
        { name: "Functional Endoscopic Sinus Surgery (FESS)", category: "ENT Surgery", description: "Endoscopic sinus surgery" },
        { name: "Septoplasty", category: "ENT Surgery", description: "Nasal septum repair" },
        { name: "Tracheostomy", category: "ENT Surgery", description: "Creation of tracheal opening" },
        { name: "Neck Dissection", category: "ENT Surgery", description: "Surgical removal of neck lymph nodes" },
        { name: "Microlaryngoscopy", category: "ENT Surgery", description: "Microsurgical examination of larynx" },
        { name: "Myringotomy with Tube Insertion", category: "ENT Surgery", description: "Ear tube placement" },

        // 9. Ophthalmic Surgery
        { name: "Cataract Extraction (Phacoemulsification)", category: "Ophthalmic Surgery", description: "Cataract removal surgery" },
        { name: "Vitrectomy", category: "Ophthalmic Surgery", description: "Removal of vitreous gel" },
        { name: "Glaucoma Surgery", category: "Ophthalmic Surgery", description: "Surgery for glaucoma" },
        { name: "Strabismus Surgery", category: "Ophthalmic Surgery", description: "Eye muscle surgery" },
        { name: "Retinal Detachment Repair", category: "Ophthalmic Surgery", description: "Repair of detached retina" },
        { name: "Enucleation", category: "Ophthalmic Surgery", description: "Removal of eyeball" },

        // 10. Dental / Maxillofacial Surgery
        { name: "Tooth Extraction (GA)", category: "Dental / Maxillofacial Surgery", description: "Tooth extraction under general anesthesia" },
        { name: "Mandibular Fracture Fixation", category: "Dental / Maxillofacial Surgery", description: "Repair of mandibular fracture" },
        { name: "Maxillary Fracture Fixation", category: "Dental / Maxillofacial Surgery", description: "Repair of maxillary fracture" },
        { name: "Orthognathic Surgery", category: "Dental / Maxillofacial Surgery", description: "Corrective jaw surgery" },
        { name: "Cyst Removal", category: "Dental / Maxillofacial Surgery", description: "Oral and maxillofacial cyst removal" },

        // 11. Urology
        { name: "Transurethral Resection of Prostate (TURP)", category: "Urology", description: "Prostate resection via urethra" },
        { name: "Cystoscopy", category: "Urology", description: "Bladder examination" },
        { name: "Ureteroscopy with Lithotripsy", category: "Urology", description: "Stone removal via ureteroscopy" },
        { name: "Nephrectomy", category: "Urology", description: "Kidney removal" },
        { name: "Percutaneous Nephrolithotomy (PCNL)", category: "Urology", description: "Kidney stone removal" },
        { name: "Pyeloplasty", category: "Urology", description: "Repair of ureteropelvic junction" },
        { name: "Prostatectomy", category: "Urology", description: "Prostate removal" },
        { name: "Bladder Tumor Resection", category: "Urology", description: "Removal of bladder tumor" },

        // 12. Diagnostic & Minor Procedures
        { name: "Endoscopy", category: "Diagnostic & Minor Procedures", description: "Upper endoscopic examination" },
        { name: "Colonoscopy", category: "Diagnostic & Minor Procedures", description: "Colonoscopic examination" },
        { name: "Bronchoscopy", category: "Diagnostic & Minor Procedures", description: "Bronchoscopic examination" },
        { name: "MRI under Sedation", category: "Diagnostic & Minor Procedures", description: "MRI with sedation" },
        { name: "CT under Sedation", category: "Diagnostic & Minor Procedures", description: "CT scan with sedation" },
        { name: "Liver Biopsy", category: "Diagnostic & Minor Procedures", description: "Percutaneous liver biopsy" },
        { name: "Central Line Insertion", category: "Diagnostic & Minor Procedures", description: "Central venous catheter placement" },
        { name: "Arterial Line Insertion", category: "Diagnostic & Minor Procedures", description: "Arterial catheter placement" },

        // Other/Custom option
        { name: "Other", category: "Other", description: "Other procedure not listed" },
      ];

      let proceduresAdded = 0;
      for (const procedure of DEFAULT_PROCEDURES) {
        try {
          await storage.createProcedure(procedure);
          proceduresAdded++;
        } catch (error) {
          // Procedure might already exist
        }
      }

      res.json({ 
        message: "Setup completed successfully",
        proceduresAdded,
        adminSet: !!email
      });
    } catch (error) {
      console.error("Setup failed:", error);
      res.status(500).json({ message: "Setup failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
