import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { createStudyPlan, getStudyPlan, completeTask } from './studyPlan.service';
import { regenerateStudyPlan } from './studyPlan.service';
import { checkPlanExists,getTaskNotes } from './studyPlan.service';

export const generatePlan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user!.userId);
    const { studentName } = req.body;

    if (!studentName) {
      return res.status(400).json({ error: 'studentName is required' });
    }

    const result = await createStudyPlan(userId, studentName);
    res.status(201).json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const planExists = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user!.userId);
    const exists = await checkPlanExists(userId);
    res.json({ success: true, exists });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPlan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user!.userId);
    const result = await getStudyPlan(userId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const markTaskComplete = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user!.userId);
    const taskId = Number(req.params.id);

    const task = await completeTask(taskId, userId);
    res.json({ success: true, task });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
export const regeneratePlan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user!.userId);
    const { studentName } = req.body;

    if (!studentName) {
      return res.status(400).json({ error: 'studentName is required' });
    }

    const result = await regenerateStudyPlan(userId, studentName);
    res.status(201).json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
export const getTaskNotesHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user!.userId);
    const taskId = Number(req.params.id);

    const notes = await getTaskNotes(taskId, userId);
    res.json({ success: true, notes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};