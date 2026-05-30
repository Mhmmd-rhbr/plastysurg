import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/schema.js';
import { authenticateToken } from '../middleware/auth.js';
import { analyzeFaceCityGPT } from '../services/citygptService.js';
import { buildFaceAnalysisPrompt } from '../services/promptEngineeringService.js';
import { generateAzureImage } from '../services/azureOpenAiService.js';
import { generateCityGPTImage, uploadImageToCityGPT } from '../services/citygptService.js';

const router = express.Router();

/**
 * Start a new simulation (DEMO MODE)
 */
router.post('/start-demo', async (req, res, next) => {
  try {
    const { parameters, file_path, analysis, gender, age } = req.body;
    
    const genderLabel = gender === 'female' ? 'female/woman' : 'male/man';
    const genderLabelFa = gender === 'female' ? 'زن' : 'مرد';
    const ageStr = age ? `${age} years old` : 'adult';

    // Build a human-readable description of what surgery to apply
    const surgeryDescriptions = [];
    if (parameters?.hump_reduction > 0) surgeryDescriptions.push(`Reduce the nasal hump/bump by ${parameters.hump_reduction}%`);
    if (parameters?.tip_rotation !== 0) surgeryDescriptions.push(`Rotate the nasal tip ${parameters.tip_rotation > 0 ? 'upward' : 'downward'} by ${Math.abs(parameters.tip_rotation)} degrees`);
    if (parameters?.tip_projection !== 0) surgeryDescriptions.push(`${parameters.tip_projection > 0 ? 'Increase' : 'Decrease'} nasal tip projection by ${Math.abs(parameters.tip_projection)}%`);
    if (parameters?.alar_width !== 0) surgeryDescriptions.push(`${parameters.alar_width < 0 ? 'Narrow' : 'Widen'} the nostril width by ${Math.abs(parameters.alar_width)}%`);
    if (parameters?.bridge_refinement > 0) surgeryDescriptions.push(`Refine the nasal bridge by ${parameters.bridge_refinement}%`);

    const surgeryList = surgeryDescriptions.length > 0 
      ? surgeryDescriptions.map((d, i) => `${i + 1}. ${d}`).join('\n') 
      : 'Minor cosmetic refinement of the nose';

    const imagePrompt = `IMPORTANT: This is a digital portrait of a virtual character (${genderLabel}, ${ageStr}). 
Please apply the following artistic cosmetic modifications to the character's nose:

CRITICAL RULES:
- You MUST keep the exact same face, identity, background, lighting, and glasses. Do NOT change anything except the nose.
- The edit should be seamless and realistic.

MODIFICATIONS TO APPLY:
${surgeryList}

Output the edited photo maintaining photographic quality and realism. You MUST return the edited image as a URL or base64 data.`;

    // Upload local file to CityGPT so the model can actually see it via public URL
    const publicUrl = await uploadImageToCityGPT(file_path);
    const imageResult = await generateCityGPTImage(imagePrompt, publicUrl || file_path);
    return res.status(200).json({ 
      id: 'demo-sim-1', 
      message: 'شبیه‌سازی دمو با موفقیت انجام شد.',
      result_photo_path: imageResult.imageUrl 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Analyze a demo photo using Gemini
 */
router.post('/analyze-demo', async (req, res, next) => {
  try {
    const { file_path } = req.body;
    if (!file_path) return res.status(400).json({ error: 'مسیر فایل مشخص نشده است.' });

    // Pass the file_path to citygpt for real analysis
    const prompt = 'Please perform a detailed pre-operative aesthetic facial assessment based on the requested JSON schema.';
    const analysisResult = await analyzeFaceCityGPT(file_path, prompt);

    res.status(200).json(analysisResult);
  } catch (error) {
    next(error);
  }
});

// Require auth for real endpoints
router.use(authenticateToken);

/**
 * Start a new simulation
 */
router.post('/start', async (req, res, next) => {
  try {
    const { case_id, photo_id, parameters, preferences } = req.body;

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

    // Generate Post-op Simulation using CityGPT DALL-E
    const parametersString = JSON.stringify(parameters || {});
    const imagePrompt = `A highly realistic, professional medical post-operative simulation of a patient's face. Incorporate the following surgical parameter goals: ${parametersString}. Produce an anatomically correct human face showing aesthetic enhancements matching these parameters.`;
    const imageResult = await generateCityGPTImage(imagePrompt, photo.file_path);

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
