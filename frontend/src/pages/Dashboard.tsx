import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getCourses,
  deleteCourse,
  generateStudyPlan,
  checkStudyPlan,
} from "../services/api";

interface Course {
  id: number;
  name: string;
  exam_date: string;
  difficulty: "easy" | "medium" | "hard";
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [hasPlan, setHasPlan] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchPlanStatus();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await getCourses();
      setCourses(res.data.courses);
    } catch (err: any) {
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanStatus = async () => {
    try {
      const res = await checkStudyPlan();
      setHasPlan(res.data.exists);
    } catch {
      setHasPlan(false);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    try {
      await deleteCourse(id);
      setCourses(courses.filter((c) => c.id !== id));
    } catch (err: any) {
      setError("Failed to delete course");
    }
  };

  const handleGeneratePlan = async () => {
    if (courses.length === 0) {
      setError("Please add courses first");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      await generateStudyPlan(user!.name);
      navigate("/study-plan");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to generate plan");
    } finally {
      setGenerating(false);
    }
  };

  const difficultyColor = (d: string) => {
    if (d === "easy") return "bg-green-100 text-green-700";
    if (d === "medium") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const adjusted = new Date(
      date.getTime() + date.getTimezoneOffset() * 60000,
    );
    return adjusted.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const daysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const adjusted = new Date(
      date.getTime() + date.getTimezoneOffset() * 60000,
    );
    const diff = adjusted.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">StudyMind AI 🧠</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Hi, {user?.name} 👋</span>
          <button
            onClick={() => navigate("/onboarding")}
            className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-100 transition"
          >
            + Add Course
          </button>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Your Courses</h2>
          <p className="text-gray-500 mt-1">
            Manage your courses and generate your AI study plan
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Courses list */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No courses yet</p>
            <button
              onClick={() => navigate("/onboarding")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Add your first course
            </button>
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {courses.map((course) => {
              const days = daysUntil(course.exam_date);
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {course.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Exam: {formatDate(course.exam_date)} •{" "}
                      <span
                        className={
                          days <= 3
                            ? "text-red-500 font-medium"
                            : "text-gray-400"
                        }
                      >
                        {days > 0 ? `${days} days left` : "Exam passed"}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColor(course.difficulty)}`}
                    >
                      {course.difficulty}
                    </span>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-400 hover:text-red-600 text-lg font-bold"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Generate Plan Button */}
        {courses.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white text-center">
            <h3 className="text-xl font-bold mb-2">
              {hasPlan
                ? "Your study plan is ready! 📖"
                : "Ready to build your study plan?"}
            </h3>
            <p className="text-blue-100 mb-4 text-sm">
              {hasPlan
                ? "Continue where you left off or generate a new one"
                : `AI will create a personalized plan based on your ${courses.length} course${courses.length !== 1 ? "s" : ""}`}
            </p>
            <div className="flex gap-3 justify-center">
              {hasPlan && (
                <button
                  onClick={() => navigate("/study-plan")}
                  className="bg-white text-blue-600 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition"
                >
                  📖 View My Plan
                </button>
              )}
              <button
                onClick={handleGeneratePlan}
                disabled={generating}
                className={`font-bold px-8 py-3 rounded-xl transition disabled:opacity-50 ${
                  hasPlan
                    ? "bg-blue-500 text-white hover:bg-blue-400"
                    : "bg-white text-blue-600 hover:bg-blue-50"
                }`}
              >
                {generating
                  ? "⏳ Generating..."
                  : hasPlan
                    ? "🔄 Regenerate Plan"
                    : "✨ Generate My Study Plan"}
              </button>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default Dashboard;
