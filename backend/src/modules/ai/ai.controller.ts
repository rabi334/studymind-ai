import { Request, Response } from 'express';
import { generateStudyPlan } from './ai.service';

export const generatePlan = async (req: Request, res: Response) => {
  try {
    const { courses, studentName } = req.body;

    if (!courses || !studentName) {
      return res.status(400).json({ error: 'courses and studentName are required' });
    }

    const plan = await generateStudyPlan(courses, studentName);

    res.json({ success: true, plan });
  } catch (error: any) {
    console.error('AI generation error FULL:', error?.message || error);
    res.status(500).json({ 
      error: 'Failed to generate study plan',
      details: error?.message || 'Unknown error'
    });
  }
};