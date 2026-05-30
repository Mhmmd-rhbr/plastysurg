import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/schema.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

/**
 * Get all patients for the logged-in surgeon
 */
router.get('/', (req, res, next) => {
  try {
    const patients = db.prepare('SELECT * FROM patients WHERE surgeon_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(patients);
  } catch (error) {
    next(error);
  }
});

/**
 * Get a specific patient by ID
 */
router.get('/:id', (req, res, next) => {
  try {
    const patient = db.prepare('SELECT * FROM patients WHERE id = ? AND surgeon_id = ?').get(req.params.id, req.user.id);
    if (!patient) {
      return res.status(404).json({ error: 'بیمار مورد نظر یافت نشد.' });
    }
    
    // Get cases for this patient
    const cases = db.prepare('SELECT * FROM cases WHERE patient_id = ? ORDER BY created_at DESC').all(patient.id);
    res.json({ ...patient, cases });
  } catch (error) {
    next(error);
  }
});

/**
 * Create a new patient
 */
router.post('/', (req, res, next) => {
  try {
    const { first_name, last_name, national_id, phone } = req.body;
    
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'نام و نام خانوادگی الزامی است.' });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO patients (id, surgeon_id, first_name, last_name, national_id, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, first_name, last_name, national_id || null, phone || null);

    // Create a default open case
    const caseId = uuidv4();
    db.prepare(`
      INSERT INTO cases (id, patient_id, notes) VALUES (?, ?, ?)
    `).run(caseId, id, 'پرونده اولیه');

    res.status(201).json({ id, message: 'بیمار با موفقیت ثبت شد.' });
  } catch (error) {
    next(error);
  }
});

export default router;
