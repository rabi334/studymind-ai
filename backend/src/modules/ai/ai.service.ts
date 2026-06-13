import Groq from "groq-sdk";
import dotenv from "dotenv";
import fs from "fs";

import PDFParser from "pdf2json";
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface Course {
  name: string;
  exam_date: string;
  difficulty: "easy" | "medium" | "hard";
}

interface StudyTask {
  day_date: string;
  topic: string;
  course_name: string;
  duration_minutes: number;
}

export const generateStudyPlan = async (
  courses: Course[],
  studentName: string,
  completedTopics: string[] = [],
): Promise<StudyTask[]> => {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(now.getDate() + 1);
  const tomorrow = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, "0")}-${String(tomorrowDate.getDate()).padStart(2, "0")}`;

  const completedSection =
    completedTopics.length > 0
      ? `\nAlready completed topics (DO NOT repeat these):\n${completedTopics.map((t) => `- ${t}`).join("\n")}`
      : "";
  const prompt = `
You are an expert academic study planner.

Create a personalized day-by-day study plan for a student named ${studentName}.

CRITICAL DATE RULES:
- TODAY is exactly: ${today}
- Start ALL tasks from: ${tomorrow} (tomorrow) or later
- NEVER generate any task with a date before ${today}
- Double check every single date in your response is >= ${today}

Their courses and exam dates:
${courses.map((c) => `- ${c.name} | Exam: ${c.exam_date} | Difficulty: ${c.difficulty}`).join("\n")}
${completedSection ?? ""}

Rules:
- Distribute study sessions smartly based on exam dates and difficulty
- Harder courses get more time
- Don't schedule tasks after an exam date
- Don't schedule tasks before ${today}
- Each session should be 30-90 minutes
- Max 3 study sessions per day
- Be specific about topics (e.g. "Chapter 1: Intro to Algorithms" not just "Study Math")

Respond ONLY with a valid JSON array, no markdown, no explanation, just raw JSON like this:
[
  {
    "day_date": "${tomorrow}",
    "topic": "Chapter 1: Introduction to Data Structures",
    "course_name": "Data Structures",
    "duration_minutes": 60
  }
]
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const text = response.choices[0]?.message?.content || "";
  console.log("Raw response:", text);

  const cleaned = text.replace(/```json|```/g, "").trim();
  const tasks: StudyTask[] = JSON.parse(cleaned);

  return tasks;
};
export const generateStudyPlanWithContext = async (
  courses: Course[],
  studentName: string,
  completedTopics: string[] = [],
): Promise<StudyTask[]> => {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(now.getDate() + 1);
  const tomorrow = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, "0")}-${String(tomorrowDate.getDate()).padStart(2, "0")}`;

  const completedSection =
    completedTopics.length > 0
      ? `\nAlready completed topics (DO NOT repeat these):\n${completedTopics.map((t) => `- ${t}`).join("\n")}`
      : "";

  const prompt = `
You are an expert academic study planner.

Create a personalized day-by-day study plan for a student named ${studentName}.

CRITICAL DATE RULES:
- TODAY is exactly: ${today}
- Start ALL tasks from: ${tomorrow} (tomorrow) or later
- NEVER generate any task with a date before ${today}
- Double check every single date in your response is >= ${today}

Their courses and exam dates:
${courses.map((c) => `- ${c.name} | Exam: ${c.exam_date} | Difficulty: ${c.difficulty}`).join("\n")}
${completedSection}

Rules:
- Distribute study sessions smartly based on exam dates and difficulty
- Harder courses get more time
- Don't schedule tasks after an exam date
- Don't schedule tasks before ${today}
- Each session should be 30-90 minutes
- Max 3 study sessions per day
- Be specific about topics
- Focus on topics not yet covered
- If student is behind, prioritize upcoming exams

Respond ONLY with a valid JSON array, no markdown, no explanation, just raw JSON like this:
[
  {
    "day_date": "${tomorrow}",
    "topic": "Chapter 1: Introduction to Data Structures",
    "course_name": "Data Structures",
    "duration_minutes": 60
  }
]
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const text = response.choices[0]?.message?.content || "";
  const cleaned = text.replace(/```json|```/g, "").trim();
  const tasks: StudyTask[] = JSON.parse(cleaned);

  return tasks;
};

export const generateTopicNotes = async (
  topic: string,
  courseName: string,
): Promise<string> => {
  const prompt = `
You are an expert university tutor.

Generate clear, concise study notes for a student on this topic:
Topic: ${topic}
Course: ${courseName}

Include:
- Brief explanation of the topic (2-3 sentences)
- Key concepts (3-5 bullet points)
- A simple example if applicable
- One tip for remembering it

Format nicely but keep it concise. Use plain text, no markdown headers.
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "No notes generated";
};

//upload and parse PDF notes
export const extractPdfText = async (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);

    pdfParser.on("pdfParser_dataError", (err: any) => {
      reject(err.parserError);
    });

    pdfParser.on("pdfParser_dataReady", () => {
      const text = pdfParser.getRawTextContent();
      resolve(text.slice(0, 3000));
    });

    pdfParser.loadPDF(filePath);
  });
};

export const generateStudyPlanFromPDF = async (
  courses: Course[],
  studentName: string,
  pdfContent: string,
): Promise<StudyTask[]> => {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(now.getDate() + 1);
  const tomorrow = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, "0")}-${String(tomorrowDate.getDate()).padStart(2, "0")}`;

  const prompt = `
You are an expert academic study planner.

Create a personalized day-by-day study plan for a student named ${studentName}.

CRITICAL DATE RULES:
- TODAY is exactly: ${today}
- Start ALL tasks from: ${tomorrow} or later
- NEVER generate any task with a date before ${today}

Their courses and exam dates:
${courses.map((c) => `- ${c.name} | Exam: ${c.exam_date} | Difficulty: ${c.difficulty}`).join("\n")}

Course content from their uploaded syllabus/notes:
---
${pdfContent}
---

Rules:
- Use the actual topics from the course content above
- Distribute study sessions based on exam dates and difficulty
- Harder courses get more time
- Don't schedule tasks after an exam date
- Each session should be 30-90 minutes
- Max 3 study sessions per day
- Be very specific about topics based on the PDF content

Respond ONLY with a valid JSON array, no markdown, no explanation:
[
  {
    "day_date": "${tomorrow}",
    "topic": "specific topic from the PDF",
    "course_name": "Course Name",
    "duration_minutes": 60
  }
]
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const text = response.choices[0]?.message?.content || "";
  const cleaned = text.replace(/```json|```/g, "").trim();
  const tasks: StudyTask[] = JSON.parse(cleaned);
  return tasks;
};
