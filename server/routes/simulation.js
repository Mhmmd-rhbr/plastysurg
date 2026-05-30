import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/schema.js';
import { authenticateToken } from '../middleware/auth.js';
import { analyzeFaceGemini } from '../services/geminiService.js';
import { buildFaceAnalysisPrompt } from '../services/promptEngineeringService.js';
import { generateAzureImage } from '../services/azureOpenAiService.js';

const router = express.Router();
router.use(authenticateToken);

/**
 * Start a new simulation
 */
router.post('/start', async (req, res, next) => {
  try {
    const { case_id, photo_id, parameters, preferences, isDemo } = req.body;

    if (isDemo) {
      const parametersString = JSON.stringify(parameters || {});
      const imagePrompt = `A highly realistic, professional medical post-operative simulation of a patient's face. Incorporate the following surgical parameter goals: ${parametersString}. Produce an anatomically correct human face showing aesthetic enhancements matching these parameters.`;
      const imageResult = await generateAzureImage(imagePrompt);
      return res.status(200).json({ 
        id: 'demo-sim-1', 
        message: 'شبیه‌سازی دمو با موفقیت انجام شد.',
        result_photo_path: imageResult.imageUrl 
      });
    }

    if (!case_id || !photo_id) {
      return res.status(400).json({ error: 'شناسه پرونده و تصویر الزامی است.' });
    }

    const photo = db.prepare('SELECT * FROM photos WHERE id = ? AND case_id = ?').get(photo_id, case_id);
    if (!photo) {
      return res.status(404).json({ error: 'تصویر مورد نظر یافت نشد.' });
    }

    const simId = uuidv4();
    db.prepare(`
      INSERT INTO simulations (id, case_id, original_photo_id, parameters, status)
      VALUES (?, ?, ?, ?, 'processing')
    `).run(simId, case_id, photo_id, JSON.stringify(parameters || {}));

    // Perform AI analysis
    const prompt = buildFaceAnalysisPrompt(preferences, photo.view_type);
    const analysisResult = await analyzeFaceGemini(photo.file_path, prompt);

    // Generate Post-op Simulation using Azure DALL-E
    const parametersString = JSON.stringify(parameters || {});
    const imagePrompt = `A highly realistic, professional medical post-operative simulation of a patient's face. Incorporate the following surgical parameter goals: ${parametersString}. Produce an anatomically correct human face showing aesthetic enhancements matching these parameters.`;
    const imageResult = await generateAzureImage(imagePrompt);

    // Update simulation status
    db.prepare(`
      UPDATE simulations SET status = 'completed', result_photo_path = ? WHERE id = ?
    `).run(imageResult.imageUrl, simId);

    res.status(201).json({ 
      id: simId, 
      message: 'شبیه‌سازی با موفقیت انجام شد.',
      analysis: analysisResult 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get simulations for a case
 */
router.get('/case/:caseId', (req, res, next) => {
  try {
    const simulations = db.prepare(`
      SELECT * FROM simulations WHERE case_id = ? ORDER BY created_at DESC
    `).all(req.params.caseId);
    
    // Parse JSON parameters safely
    const parsedSimulations = simulations.map(sim => ({
      ...sim,
      parameters: sim.parameters ? JSON.parse(sim.parameters) : {}
    }));

    res.json(parsedSimulations);
  } catch (error) {
    next(error);
  }
});

export default router;
