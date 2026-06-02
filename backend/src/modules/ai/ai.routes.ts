import { Router } from 'express';
import { generatePlan } from './ai.controller';

const router = Router();

router.post('/generate-plan', generatePlan);

export default router;