import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../db/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

/**
 * Get all patients for the logged-in surgeon
 */
router.get('/', async (req, res, next) => {
  try {
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .eq('surgeon_id', req.user.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    res.json(patients || []);
  } catch (error) {
    next(error);
  }
});

/**
 * Get a specific patient by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', req.params.id)
      .eq('surgeon_id', req.user.id)
      .maybeSingle();

    if (patientError) throw patientError;
    if (!patient) {
      return res.status(404).json({ error: 'بیمار مورد نظر یافت نشد.' });
    }
    
    // Get cases for this patient
    const { data: cases, error: casesError } = await supabase
      .from('cases')
      .select('*')
      .eq('patient_id', patient.id)
      .order('created_at', { ascending: false });
      
    if (casesError) throw casesError;
    
    res.json({ ...patient, cases: cases || [] });
  } catch (error) {
    next(error);
  }
});

/**
 * Create a new patient
 */
router.post('/', async (req, res, next) => {
  try {
    const { first_name, last_name, national_id, phone } = req.body;
    
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'نام و نام خانوادگی الزامی است.' });
    }

    const id = uuidv4();
    const { error: patientError } = await supabase.from('patients').insert({
      id,
      surgeon_id: req.user.id,
      first_name,
      last_name,
      national_id: national_id || null,
      phone: phone || null
    });
    
    if (patientError) throw patientError;

    // Create a default open case
    const caseId = uuidv4();
    const { error: caseError } = await supabase.from('cases').insert({
      id: caseId,
      patient_id: id,
      notes: 'پرونده اولیه'
    });
    
    if (caseError) throw caseError;

    res.status(201).json({ id, message: 'بیمار با موفقیت ثبت شد.' });
  } catch (error) {
    next(error);
  }
});

export default router;
