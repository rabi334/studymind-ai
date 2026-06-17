import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getStudyPlan,
  completeTask,
  regenerateStudyPlan,
  getTaskNotes,
} from "../services/api";

interface Task {
  id: number;
  day_date: string;
  topic: string;
  course_name: string;
  duration_minutes: number;
  is_completed: boolean;
  completed_at: string | null;
}

interface GroupedTasks {
  [date: string]: Task[];
}

const StudyPlan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [notes, setNotes] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      const res = await getStudyPlan();
      setTasks(res.data.tasks);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load study plan");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (taskId: number) => {
    try {
      await completeTask(taskId);
      setTasks(
        tasks.map((t) => (t.id === taskId ? { ...t, is_completed: true } : t)),
      );
      if (selectedTask?.id === taskId) {
        setSelectedTask({ ...selectedTask, is_completed: true });
      }
    } catch {
      setError("Failed to mark task complete");
    }
  };

  const handleRegenerate = async () => {
    if (
      !window.confirm(
        "Regenerate your study plan? Completed tasks will be remembered.",
      )
    )
      return;
    setRegenerating(true);
    try {
      await regenerateStudyPlan(user!.name);
      await fetchPlan();
    } catch {
      setError("Failed to regenerate plan");
    } finally {
      setRegenerating(false);
    }
  };

  const handleViewNotes = async (task: Task) => {
    setSelectedTask(task);
    setNotes("");
    setLoadingNotes(true);
    try {
      const res = await getTaskNotes(task.id);
      setNotes(res.data.notes);
    } catch {
      setNotes("Failed to load notes. Please try again.");
    } finally {
      setLoadingNotes(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const adjusted = new Date(
      date.getTime() + date.getTimezoneOffset() * 60000,
    );
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (adjusted.toDateString() === today.toDateString()) return "Today";
    if (adjusted.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return adjusted.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const groupedTasks: GroupedTasks = tasks.reduce((groups, task) => {
    const raw = new Date(task.day_date);
    const adjusted = new Date(raw.getTime() + raw.getTimezoneOffset() * 60000);
    const date = `${adjusted.getFullYear()}-${String(adjusted.getMonth() + 1).padStart(2, "0")}-${String(adjusted.getDate()).padStart(2, "0")}`;
    if (!groups[date]) groups[date] = [];
    groups[date].push(task);
    return groups;
  }, {} as GroupedTasks);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.is_completed).length;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#121212",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#8D99AE" }}>Loading your study plan...</p>
      </div>
    );

  if (error && tasks.length === 0)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#121212",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#F09595", marginBottom: "16px" }}>{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
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
            Back to Dashboard
          </button>
        </div>
      </div>
    );

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
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            style={{
              background: "#1E2A3A",
              color: "#8D99AE",
              border: "0.5px solid #1E2A3A",
              borderRadius: "8px",
              padding: "6px 14px",
              fontSize: "12px",
              cursor: regenerating ? "not-allowed" : "pointer",
              opacity: regenerating ? 0.6 : 1,
            }}
          >
            {regenerating ? "Regenerating..." : "Regenerate Plan"}
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "none",
              border: "none",
              color: "#8D99AE",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            ← Dashboard
          </button>
        </div>
      </nav>

      <div
        style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 16px" }}
      >
        {/* Progress */}
        <div
          style={{
            background: "#0B132B",
            border: "0.5px solid #1E2A3A",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <div>
              <h2
                style={{ fontSize: "18px", fontWeight: 500, color: "#FFFFFF" }}
              >
                Your Study Plan
              </h2>
              <p
                style={{ fontSize: "12px", color: "#8D99AE", marginTop: "3px" }}
              >
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>
            <span
              style={{ fontSize: "22px", fontWeight: 500, color: "#00F0FF" }}
            >
              {progressPercent}%
            </span>
          </div>
          <div
            style={{
              background: "#1E2A3A",
              borderRadius: "100px",
              height: "6px",
            }}
          >
            <div
              style={{
                background: "#00F0FF",
                borderRadius: "100px",
                height: "6px",
                width: `${progressPercent}%`,
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>

        {/* Tasks by day */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {Object.entries(groupedTasks).map(([date, dayTasks]) => {
            const allDone = dayTasks.every((t) => t.is_completed);
            return (
              <div key={date}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      color: "#8D99AE",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    {formatDate(date)}
                  </p>
                  {allDone && (
                    <span
                      style={{
                        fontSize: "11px",
                        background: "#0a1f0a",
                        color: "#4ade80",
                        border: "0.5px solid #4ade80",
                        padding: "2px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      Done
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      style={{
                        background: "#0B132B",
                        border: "0.5px solid #1E2A3A",
                        borderRadius: "12px",
                        padding: "14px 18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        opacity: task.is_completed ? 0.45 : 1,
                        transition: "opacity 0.3s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <button
                          onClick={() =>
                            !task.is_completed && handleComplete(task.id)
                          }
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            border: task.is_completed
                              ? "none"
                              : "1.5px solid #00F0FF",
                            background: task.is_completed
                              ? "#00F0FF"
                              : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: task.is_completed ? "default" : "pointer",
                            flexShrink: 0,
                          }}
                        >
                          {task.is_completed && (
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#0B132B"
                              strokeWidth="3"
                            >
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <div>
                          <p
                            style={{
                              fontSize: "14px",
                              color: task.is_completed ? "#8D99AE" : "#FFFFFF",
                              textDecoration: task.is_completed
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {task.topic}
                          </p>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#8D99AE",
                              marginTop: "2px",
                            }}
                          >
                            {task.course_name} · {task.duration_minutes} min
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewNotes(task)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#9D4EDD",
                          fontSize: "12px",
                          fontWeight: 500,
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        Notes
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* All done */}
        {progressPercent === 100 && (
          <div
            style={{
              marginTop: "32px",
              background: "#0a1f0a",
              border: "0.5px solid #4ade80",
              borderRadius: "16px",
              padding: "32px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "32px", marginBottom: "8px" }}>🎉</p>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 500,
                color: "#4ade80",
                marginBottom: "6px",
              }}
            >
              All tasks completed!
            </h3>
            <p style={{ fontSize: "13px", color: "#8D99AE" }}>
              You're fully prepared. Good luck on your exams!
            </p>
          </div>
        )}
      </div>

      {/* Notes Modal */}
      {selectedTask && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 50,
            padding: "16px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTask(null);
          }}
        >
          <div
            style={{
              background: "#0B132B",
              border: "0.5px solid #1E2A3A",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "0.5px solid #1E2A3A",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#FFFFFF",
                  }}
                >
                  {selectedTask.topic}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#8D99AE",
                    marginTop: "2px",
                  }}
                >
                  {selectedTask.course_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#8D99AE",
                  fontSize: "22px",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            {/* Content */}
            <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
              {loadingNotes ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <p style={{ color: "#00F0FF", fontSize: "13px" }}>
                    Generating study notes...
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    background: "#121212",
                    borderLeft: "2px solid #00F0FF",
                    borderRadius: "0 8px 8px 0",
                    padding: "14px 16px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#8D99AE",
                      lineHeight: 1.8,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {notes}
                  </p>
                </div>
              )}
            </div>
            {/* Footer */}
            <div
              style={{ padding: "16px 20px", borderTop: "0.5px solid #1E2A3A" }}
            >
              <button
                onClick={() =>
                  !selectedTask.is_completed && handleComplete(selectedTask.id)
                }
                disabled={selectedTask.is_completed}
                style={{
                  width: "100%",
                  background: selectedTask.is_completed ? "#1E2A3A" : "#00F0FF",
                  color: selectedTask.is_completed ? "#8D99AE" : "#0B132B",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: selectedTask.is_completed ? "default" : "pointer",
                }}
              >
                {selectedTask.is_completed
                  ? "Already completed"
                  : "Mark as Complete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlan;
