import axios from "axios";

const api = axios.create({
  baseURL: "https://studymindaibackend-pea749hb.b4a.run/api",
});

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const registerUser = (data: {
  name: string;
  email: string;
  password: string;
  university: string;
}) => api.post("/auth/register", data);

export const loginUser = (data: { email: string; password: string }) =>
  api.post("/auth/login", data);

// Courses
export const getCourses = () => api.get("/courses");
export const addCourse = (data: {
  name: string;
  exam_date: string;
  difficulty: string;
}) => api.post("/courses", data);
export const deleteCourse = (id: number) => api.delete(`/courses/${id}`);

// Study Plan
export const generateStudyPlan = (studentName: string) =>
  api.post("/study-plans/generate", { studentName });
export const getStudyPlan = () => api.get("/study-plans");
export const completeTask = (taskId: number) =>
  api.patch(`/study-plans/tasks/${taskId}/complete`);
export const regenerateStudyPlan = (studentName: string) =>
  api.post("/study-plans/regenerate", { studentName });
export const checkStudyPlan = () => api.get("/study-plans/exists");
export const getTaskNotes = (taskId: number) =>
  api.get(`/study-plans/tasks/${taskId}/notes`);
export default api;
