import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addCourse } from "../services/api";
import api from "../services/api";

interface Course {
  name: string;
  exam_date: string;
  difficulty: "easy" | "medium" | "hard";
}

const Onboarding = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({
    name: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddCourse = () => {
    if (!form.name || !selectedDate) {
      setError("Please fill in course name and exam date");
      return;
    }
    const exam_date = selectedDate.toISOString().split("T")[0];
    setCourses([...courses, { ...form, exam_date }]);
    setForm({ name: "", difficulty: "medium" });
    setSelectedDate(null);
    setError("");
  };

  const handleRemoveCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (courses.length === 0) {
      setError("Please add at least one course");
      return;
    }
    setLoading(true);
    setError("");
    try {
      for (const course of courses) {
        const formData = new FormData();
        formData.append("name", course.name);
        formData.append("exam_date", course.exam_date);
        formData.append("difficulty", course.difficulty);
        if (pdfFile) {
          formData.append("pdf", pdfFile);
        }
        await api.post("/courses", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save courses");
    } finally {
      setLoading(false);
    }
  };

  const difficultyColor = (d: string) => {
    if (d === "easy") return "bg-green-100 text-green-700";
    if (d === "medium") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Let's set up your courses 📚
          </h1>
          <p className="text-gray-500 mt-2">
            Add your courses and exam dates so AI can build your study plan
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Course input form */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
          <input
            name="name"
            type="text"
            placeholder="Course name (e.g. Data Structures)"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />

          {/* Calendar Date Picker */}
          <div className="w-full">
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => setSelectedDate(date)}
              minDate={new Date()}
              placeholderText="📅 Select exam date"
              dateFormat="MMMM d, yyyy"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              wrapperClassName="w-full"
            />
          </div>

          <select
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {/* PDF Upload */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              📄 Upload Syllabus/Notes (PDF, optional)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm text-gray-600"
            />
            {pdfFile && (
              <p className="text-xs text-green-600 mt-1">✓ {pdfFile.name}</p>
            )}
          </div>

          <button
            onClick={handleAddCourse}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg transition"
          >
            + Add Course
          </button>
        </div>

        {/* Added courses list */}
        {courses.length > 0 && (
          <div className="mb-6 space-y-2">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Added Courses ({courses.length})
            </h3>
            {courses.map((course, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="font-medium text-gray-800">{course.name}</p>
                  <p className="text-sm text-gray-500">
                    Exam: {course.exam_date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColor(course.difficulty)}`}
                  >
                    {course.difficulty}
                  </span>
                  <button
                    onClick={() => handleRemoveCourse(index)}
                    className="text-red-400 hover:text-red-600 text-lg font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || courses.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading
            ? "Saving courses..."
            : `Continue with ${courses.length} course${courses.length !== 1 ? "s" : ""} →`}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
