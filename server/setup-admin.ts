import { connectMongo } from './mongo';
import { UserModel, ProcedureModel } from './models';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MAIN_USER_EMAIL = 'mrserver.ksa@gmail.com';

const DEFAULT_PROCEDURES = [
  { name: 'General Anesthesia', category: 'General', description: 'General anesthesia procedure' },
  { name: 'Spinal Anesthesia', category: 'Regional', description: 'Spinal anesthesia procedure' },
  { name: 'Epidural Anesthesia', category: 'Regional', description: 'Epidural anesthesia procedure' },
  { name: 'Local Anesthesia', category: 'Local', description: 'Local anesthesia procedure' },
  { name: 'Combined Spinal-Epidural', category: 'Regional', description: 'Combined spinal-epidural anesthesia' },
  { name: 'Nerve Block', category: 'Regional', description: 'Peripheral nerve block' },
  { name: 'Sedation', category: 'Sedation', description: 'Procedural sedation' },
  { name: 'MAC (Monitored Anesthesia Care)', category: 'Sedation', description: 'Monitored anesthesia care' },
  { name: 'Appendectomy', category: 'General Surgery', description: 'Surgical removal of appendix' },
  { name: 'Cholecystectomy', category: 'General Surgery', description: 'Surgical removal of gallbladder' },
  { name: 'Hernia Repair', category: 'General Surgery', description: 'Surgical repair of hernia' },
  { name: 'Colonoscopy', category: 'Endoscopy', description: 'Colonoscopic examination' },
  { name: 'Upper Endoscopy', category: 'Endoscopy', description: 'Upper endoscopic examination' },
  { name: 'Bronchoscopy', category: 'Endoscopy', description: 'Bronchoscopic examination' },
  { name: 'Arthroscopy', category: 'Orthopedic', description: 'Arthroscopic procedure' },
  { name: 'Total Knee Replacement', category: 'Orthopedic', description: 'Total knee replacement surgery' },
  { name: 'Hip Replacement', category: 'Orthopedic', description: 'Hip replacement surgery' },
  { name: 'Cesarean Section', category: 'Obstetric', description: 'Cesarean delivery' },
  { name: 'Vaginal Delivery', category: 'Obstetric', description: 'Vaginal delivery' },
  { name: 'Cataract Surgery', category: 'Ophthalmology', description: 'Cataract extraction surgery' },
  { name: 'Other', category: 'Other', description: 'Other procedure not listed' },
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
    for (const [index, procedure] of DEFAULT_PROCEDURES.entries()) {
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