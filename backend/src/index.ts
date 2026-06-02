import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import aiRoutes from './modules/ai/ai.routes';
import authRoutes from './modules/auth/auth.routes';
import coursesRoutes from './modules/courses/courses.routes';
import studyPlanRoutes from './modules/studyPlan/studyPlan.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/study-plans', studyPlanRoutes);

//console.log('✅ Study plan routes registered');

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'StudyMind AI API is running 🚀' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;