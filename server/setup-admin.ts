import { connectMongo } from './mongo';
import { UserModel, ProcedureModel } from './models';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MAIN_USER_EMAIL = 'mrserver.ksa@gmail.com';

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

async function setupAdminAndProcedures() {
  try {
    // Connect to MongoDB
    await connectMongo(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Set main user as admin
    const mainUser = await UserModel.findOne({ email: MAIN_USER_EMAIL });
    if (mainUser) {
      await UserModel.updateOne(
        { email: MAIN_USER_EMAIL },
        { $set: { role: 'admin', isActive: true } }
      );
      console.log(`Set ${MAIN_USER_EMAIL} as admin`);
    } else {
      console.log(`User ${MAIN_USER_EMAIL} not found in database`);
    }

    // Add default procedures if they don't exist
    for (let index = 0; index < DEFAULT_PROCEDURES.length; index++) {
      const procedure = DEFAULT_PROCEDURES[index];
      const existing = await ProcedureModel.findOne({ name: procedure.name });
      if (!existing) {
        await ProcedureModel.create({
          ...procedure,
          id: index + 1,
          createdAt: new Date(),
        });
        console.log(`Added procedure: ${procedure.name}`);
      }
    }

    console.log('Setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setupAdminAndProcedures();