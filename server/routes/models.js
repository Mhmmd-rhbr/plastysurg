import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { generate3DModel } from '../services/meshyService.js';
import db from '../db/schema.js';

const router = express.Router();
router.use(authenticateToken);

/**
 * Generate 3D model from photos
 */
router.post('/generate', async (req, res, next) => {
  try {
    const { case_id } = req.body;

    if (!case_id) {
      return res.status(400).json({ error: 'شناسه پرونده الزامی است.' });
    }

    const photos = db.prepare('SELECT file_path FROM photos WHERE case_id = ?').all(case_id);
    if (!photos || photos.length === 0) {
      return res.status(400).json({ error: 'برای این پرونده هیچ تصویری یافت نشد.' });
    }

    const imagePaths = photos.map(p => p.file_path);
    const modelResult = await generate3DModel(imagePaths);

    res.json({
      message: 'مدل سه‌بعدی با موفقیت ساخته شد.',
      data: modelResult
    });
  } catch (error) {
    next(error);
  }
});

export default router;
