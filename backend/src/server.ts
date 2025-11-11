import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import portfolioRoutes from './routes/portfolio.routes';
import projectRoutes from './routes/project.routes';
import certificationRoutes from './routes/certification.routes';
import workHistoryRoutes from './routes/workHistory.routes';
import achievementRoutes from './routes/achievement.routes';
import skillRoutes from './routes/skill.routes';
import publicRoutes from './routes/public.routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/work-history', workHistoryRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/public', publicRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Career Portfolio Manager API is running' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
