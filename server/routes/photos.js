import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../db/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const uploadDir = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('فقط فایل‌های تصویری مجاز هستند.'));
    }
  }
});

/**
 * Upload a demo photo for standalone simulation
 */
router.post('/upload-demo', upload.single('photo'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'لطفاً یک تصویر انتخاب کنید.' });
    }
    const id = uuidv4();
    const filePath = `/uploads/${req.file.filename}`;
    
    res.status(201).json({ id, filePath, message: 'تصویر با موفقیت آپلود شد.' });
  } catch (error) {
    next(error);
  }
});

// Require auth for real endpoints
router.use(authenticateToken);


/**
 * Upload a photo for a case
 */
router.post('/upload', upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'لطفاً یک تصویر انتخاب کنید.' });
    }

    const { case_id, view_type } = req.body;
    if (!case_id || !view_type) {
      // Remove uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'شناسه پرونده و نوع زاویه تصویر الزامی است.' });
    }

    // Verify case belongs to surgeon's patient
    const { data: caseRecord, error: caseError } = await supabase
      .from('cases')
      .select('id, patients!inner(surgeon_id)')
      .eq('id', case_id)
      .eq('patients.surgeon_id', req.user.id)
      .maybeSingle();

    if (caseError || !caseRecord) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'پرونده مورد نظر یافت نشد یا دسترسی ندارید.' });
    }

    const id = uuidv4();
    const filePath = `/uploads/${req.file.filename}`;

    const { error: insertError } = await supabase.from('photos').insert({
      id,
      case_id,
      file_path: filePath,
      view_type
    });

    if (insertError) throw insertError;

    res.status(201).json({ id, filePath, message: 'تصویر با موفقیت آپلود شد.' });
  } catch (error) {
    next(error);
  }
});

/**
 * Get photos for a case
 */
router.get('/case/:caseId', async (req, res, next) => {
  try {
    const { caseId } = req.params;
    
    // Authorization check
    const { data: authCheck, error: authError } = await supabase
      .from('cases')
      .select('id, patients!inner(surgeon_id)')
      .eq('id', caseId)
      .eq('patients.surgeon_id', req.user.id)
      .maybeSingle();

    if (authError || !authCheck) {
      return res.status(404).json({ error: 'پرونده یافت نشد.' });
    }

    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('*')
      .eq('case_id', caseId)
      .order('uploaded_at', { ascending: false });

    if (photosError) throw photosError;
    
    res.json(photos || []);
  } catch (error) {
    next(error);
  }
});

export default router;
