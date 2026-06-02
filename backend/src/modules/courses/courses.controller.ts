import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { addCourse, getUserCourses, deleteCourse } from './courses.service';

export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { name, exam_date, difficulty } = req.body;
    const userId = Number(req.user!.userId);

    if (!name || !exam_date) {
      return res.status(400).json({ error: 'name and exam_date are required' });
    }

    const course = await addCourse(userId, name, exam_date, difficulty || 'medium');
    res.status(201).json({ success: true, course });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCourses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user!.userId);
    const courses = await getUserCourses(userId);
    res.json({ success: true, courses });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const removeCourse = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user!.userId);
    const courseId = Number(req.params.id);

    const deleted = await deleteCourse(courseId, userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ success: true, message: 'Course deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};