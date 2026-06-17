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
  const [hasPlan, setHasPlan] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
    fetchPlanStatus();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await getCourses();
      setCourses(res.data.courses);
    } catch {
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
    } catch {
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

  const difficultyStyle = (d: string) => {
    if (d === "easy")
      return {
        background: "#0a1f0a",
        color: "#4ade80",
        border: "0.5px solid #4ade80",
      };
    if (d === "medium")
      return {
        background: "#1f1a0a",
        color: "#facc15",
        border: "0.5px solid #facc15",
      };
    return {
      background: "#1a0a1f",
      color: "#9D4EDD",
      border: "0.5px solid #9D4EDD",
    };
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
    return Math.ceil(
      (adjusted.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#121212" }}>
      {/* Navbar */}
      <nav
        style={{
          background: "#0B132B",
          borderBottom: "0.5px solid #1E2A3A",
          padding: "14px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#00F0FF", fontSize: "18px", fontWeight: 500 }}>
          StudyMind AI
        </span>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ color: "#8D99AE", fontSize: "13px" }}>
            Hi, {user?.name}
          </span>
          <button
            onClick={() => navigate("/onboarding")}
            style={{
              background: "#00F0FF",
              color: "#0B132B",
              border: "none",
              borderRadius: "8px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            + Add Course
          </button>
          <button
            onClick={logout}
            style={{
              background: "none",
              border: "none",
              color: "#8D99AE",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div
        style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 16px" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 500, color: "#FFFFFF" }}>
            Your Courses
          </h2>
          <p style={{ fontSize: "13px", color: "#8D99AE", marginTop: "4px" }}>
            Manage your courses and generate your AI study plan
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#1a0a0a",
              border: "0.5px solid #A32D2D",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "16px",
              fontSize: "13px",
              color: "#F09595",
            }}
          >
            {error}
          </div>
        )}

        {/* Courses */}
        {loading ? (
          <p
            style={{ color: "#8D99AE", textAlign: "center", padding: "40px 0" }}
          >
            Loading courses...
          </p>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <p style={{ color: "#8D99AE", marginBottom: "16px" }}>
              No courses yet
            </p>
            <button
              onClick={() => navigate("/onboarding")}
              style={{
                background: "#00F0FF",
                color: "#0B132B",
                border: "none",
                borderRadius: "8px",
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Add your first course
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginBottom: "24px",
            }}
          >
            {courses.map((course) => {
              const days = daysUntil(course.exam_date);
              return (
                <div
                  key={course.id}
                  style={{
                    background: "#0B132B",
                    border: "0.5px solid #1E2A3A",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: 500,
                        color: "#FFFFFF",
                      }}
                    >
                      {course.name}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#8D99AE",
                        marginTop: "3px",
                      }}
                    >
                      Exam: {formatDate(course.exam_date)} ·{" "}
                      <span
                        style={{ color: days <= 3 ? "#F09595" : "#00F0FF" }}
                      >
                        {days > 0 ? `${days} days left` : "Exam passed"}
                      </span>
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "3px 10px",
                        borderRadius: "6px",
                        ...difficultyStyle(course.difficulty),
                      }}
                    >
                      {course.difficulty}
                    </span>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#8D99AE",
                        fontSize: "20px",
                        cursor: "pointer",
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Generate Plan */}
        {courses.length > 0 && (
          <div
            style={{
              background: "#0B132B",
              border: "0.5px solid #1E2A3A",
              borderRadius: "16px",
              padding: "28px",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 500,
                color: "#FFFFFF",
                marginBottom: "6px",
              }}
            >
              {hasPlan
                ? "Your study plan is ready"
                : "Ready to build your study plan?"}
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#8D99AE",
                marginBottom: "20px",
              }}
            >
              {hasPlan
                ? "Continue where you left off or generate a fresh one"
                : `AI will create a personalized plan based on your ${courses.length} course${courses.length !== 1 ? "s" : ""}`}
            </p>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {hasPlan && (
                <button
                  onClick={() => navigate("/study-plan")}
                  style={{
                    background: "#00F0FF",
                    color: "#0B132B",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 24px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  View My Plan
                </button>
              )}
              <button
                onClick={handleGeneratePlan}
                disabled={generating}
                style={{
                  background: hasPlan ? "#1E2A3A" : "#00F0FF",
                  color: hasPlan ? "#8D99AE" : "#0B132B",
                  border: hasPlan ? "0.5px solid #1E2A3A" : "none",
                  borderRadius: "8px",
                  padding: "10px 24px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: generating ? "not-allowed" : "pointer",
                  opacity: generating ? 0.7 : 1,
                }}
              >
                {generating
                  ? "Generating..."
                  : hasPlan
                    ? "Regenerate Plan"
                    : "Generate My Study Plan"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
