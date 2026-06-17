import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
  addCourse,
  addCourseWithPDF,
  getUserCourses,
  deleteCourse,
} from "./courses.service";
import { extractMultiplePdfTexts } from "../ai/ai.service";
import fs from "fs";

export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
    console.log("📁 Files:", req.files);
    console.log("📁 File:", req.file);
    console.log("📦 Body:", req.body);

    const { name, exam_date, difficulty } = req.body;
    const userId = Number(req.user!.userId);

    if (!name || !exam_date) {
      return res.status(400).json({ error: "name and exam_date are required" });
    }

    let pdfContent: string | undefined;

    // Handle multiple files
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      try {
        const filePaths = files.map((f) => f.path);
        pdfContent = await extractMultiplePdfTexts(filePaths);
        // Delete all files after extraction
        filePaths.forEach((p) => {
          try {
            fs.unlinkSync(p);
          } catch {}
        });
      } catch (err) {
        console.error("PDF parse error:", err);
      }
    }

    const course = await addCourseWithPDF(
      userId,
      name,
      exam_date,
      difficulty || "medium",
      pdfContent,
    );

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
      return res.status(404).json({ error: "Course not found" });
    }
    res.json({ success: true, message: "Course deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
