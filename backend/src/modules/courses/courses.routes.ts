import { Router } from 'express';
import { createCourse, getCourses, removeCourse } from './courses.controller';
import authMiddleware from '../../middleware/auth';

const router = Router();

// All routes protected
router.use(authMiddleware);

router.post('/', createCourse);
router.get('/', getCourses);
router.delete('/:id', removeCourse);

export default router;