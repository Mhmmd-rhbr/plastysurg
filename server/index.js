import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';

// Import Routes
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import photoRoutes from './routes/photos.js';
import simulationRoutes from './routes/simulation.js';
import modelRoutes from './routes/models.js';

dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });
// Fallback: also try current directory
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadDir));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: { error: 'درخواست‌های شما بیش از حد مجاز است. لطفاً بعداً تلاش کنید.' }
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/models', modelRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'به سرور FaceVision Medical خوش آمدید.' });
});

// Global Error Handler
app.use(errorHandler);

// Export the app for Vercel Serverless
export default app;

// Start server locally if not on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Demo Mode: ${process.env.DEMO_MODE === 'true' ? 'Enabled' : 'Disabled'}`);
  });
}
