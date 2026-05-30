import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/schema.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

const uploadDir = path.join(process.cwd(), 'uploads');
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
 * Upload a photo for a case
 */
router.post('/upload', upload.single('photo'), (req, res, next) => {
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
    const caseRecord = db.prepare(`
      SELECT c.id FROM cases c
      JOIN patients p ON c.patient_id = p.id
      WHERE c.id = ? AND p.surgeon_id = ?
    `).get(case_id, req.user.id);

    if (!caseRecord) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'پرونده مورد نظر یافت نشد یا دسترسی ندارید.' });
    }

    const id = uuidv4();
    const filePath = `/uploads/${req.file.filename}`;

    db.prepare(`
      INSERT INTO photos (id, case_id, file_path, view_type)
      VALUES (?, ?, ?, ?)
    `).run(id, case_id, filePath, view_type);

    res.status(201).json({ id, filePath, message: 'تصویر با موفقیت آپلود شد.' });
  } catch (error) {
    next(error);
  }
});

/**
 * Get photos for a case
 */
router.get('/case/:caseId', (req, res, next) => {
  try {
    const { caseId } = req.params;
    
    // Authorization check
    const authCheck = db.prepare(`
      SELECT c.id FROM cases c
      JOIN patients p ON c.patient_id = p.id
      WHERE c.id = ? AND p.surgeon_id = ?
    `).get(caseId, req.user.id);

    if (!authCheck) {
      return res.status(404).json({ error: 'پرونده یافت نشد.' });
    }

    const photos = db.prepare('SELECT * FROM photos WHERE case_id = ? ORDER BY uploaded_at DESC').all(caseId);
    res.json(photos);
  } catch (error) {
    next(error);
  }
});

export default router;
