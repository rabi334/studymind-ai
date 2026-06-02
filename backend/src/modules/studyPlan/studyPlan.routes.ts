import { Router } from 'express';
import { generatePlan, getPlan, markTaskComplete,regeneratePlan,planExists,getTaskNotesHandler } from './studyPlan.controller';
import authMiddleware from '../../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/generate', generatePlan);
router.get('/', getPlan);
router.patch('/tasks/:id/complete', markTaskComplete);
router.post('/regenerate', regeneratePlan);
router.get('/exists', planExists);
router.get('/tasks/:id/notes', getTaskNotesHandler);
export default router;