import { Router } from "express";
import { createCourse, getCourses, removeCourse } from "./courses.controller";
import authMiddleware from "../../middleware/auth";
import upload from "../../middleware/upload";

const router = Router();

// All routes protected
router.use(authMiddleware);

router.post("/", upload.array("pdfs", 10), createCourse);
router.get("/", getCourses);
router.delete("/:id", removeCourse);

export default router;
