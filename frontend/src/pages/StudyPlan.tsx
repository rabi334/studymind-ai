import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getStudyPlan,
  completeTask,
  regenerateStudyPlan,
  getTaskNotes,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const [regenerating, setRegenerating] = useState(false);
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
    } catch (err: any) {
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
    } catch (err: any) {
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
    // Fix timezone offset
    const adjusted = new Date(
      date.getTime() + date.getTimezoneOffset() * 60000,
    );

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (adjusted.toDateString() === today.toDateString()) return "📅 Today";
    if (adjusted.toDateString() === tomorrow.toDateString())
      return "📅 Tomorrow";

    return adjusted.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  // Group tasks by date
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-lg">Loading your study plan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">StudyMind AI 🧠</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-100 transition disabled:opacity-50"
          >
            {regenerating ? "⏳ Regenerating..." : "🔄 Regenerate Plan"}
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-1">Your Study Plan 📖</h2>
          <p className="text-blue-100 text-sm mb-4">
            {completedTasks} of {totalTasks} tasks completed
          </p>
          {/* Progress bar */}
          <div className="bg-blue-500 rounded-full h-3">
            <div
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-right text-sm mt-1 text-blue-100">
            {progressPercent}%
          </p>
        </div>

        {/* Tasks grouped by day */}
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([date, dayTasks]) => {
            const allDone = dayTasks.every((t) => t.is_completed);
            return (
              <div key={date}>
                {/* Day header */}
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-semibold text-gray-700">
                    {formatDate(date)}
                  </h3>
                  {allDone && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                      ✓ Done
                    </span>
                  )}
                </div>

                {/* Day tasks */}
                <div className="space-y-2">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`bg-white rounded-xl border px-5 py-4 flex items-center justify-between transition ${
                        task.is_completed
                          ? "border-green-100 opacity-60"
                          : "border-gray-100 shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() =>
                            !task.is_completed && handleComplete(task.id)
                          }
                          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                            task.is_completed
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-gray-300 hover:border-blue-500"
                          }`}
                        >
                          {task.is_completed && (
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                        <div>
                          <p
                            className={`font-medium ${task.is_completed ? "line-through text-gray-400" : "text-gray-800"}`}
                          >
                            {task.topic}
                          </p>
                          <p className="text-sm text-gray-400 mt-0.5">
                            {task.course_name} • {task.duration_minutes} min
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewNotes(task)}
                        className="text-sm text-blue-500 hover:text-blue-700 font-medium transition"
                      >
                        📝 Notes
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* All done message */}
        {progressPercent === 100 && (
          <div className="mt-8 text-center bg-green-50 rounded-2xl p-8">
            <p className="text-4xl mb-2">🎉</p>
            <h3 className="text-xl font-bold text-green-700">
              All tasks completed!
            </h3>
            <p className="text-green-600 mt-1">
              You're fully prepared for your exams. Good luck!
            </p>
          </div>
        )}
        {/* Notes Panel */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div>
                  <h3 className="font-bold text-gray-800">
                    {selectedTask.topic}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {selectedTask.course_name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              {/* Panel content */}
              <div className="px-6 py-4 overflow-y-auto flex-1">
                {loadingNotes ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-gray-400">
                      ✨ Generating study notes...
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {notes}
                  </p>
                )}
              </div>
              {/* Panel footer */}
              <div className="px-6 py-4 border-t">
                <button
                  onClick={() =>
                    !selectedTask.is_completed &&
                    handleComplete(selectedTask.id)
                  }
                  disabled={selectedTask.is_completed}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
                >
                  {selectedTask.is_completed
                    ? "✓ Already completed"
                    : "✅ Mark as Complete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPlan;
