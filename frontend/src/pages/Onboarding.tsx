import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../services/api";

interface Course {
  name: string;
  exam_date: string;
  difficulty: "easy" | "medium" | "hard";
  files: File[];
}

const Onboarding = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({
    name: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    setCourses([...courses, { ...form, exam_date, files: pdfFiles }]);
    setForm({ name: "", difficulty: "medium" });
    setSelectedDate(null);
    setPdfFiles([]);
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
        course.files.forEach((file) => formData.append("pdfs", file));
        console.log("Sending files for", course.name, ":", course.files.length);
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

  const inputStyle = {
    width: "100%",
    background: "#0B132B",
    border: "0.5px solid #1E2A3A",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "14px",
    color: "#FFFFFF",
    outline: "none",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#121212",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#121212",
          border: "0.5px solid #1E2A3A",
          borderRadius: "16px",
          padding: "36px",
          width: "100%",
          maxWidth: "480px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 500, color: "#00F0FF" }}>
            Set up your courses
          </h1>
          <p style={{ fontSize: "13px", color: "#8D99AE", marginTop: "6px" }}>
            Add your courses and exam dates so AI can build your study plan
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

        {/* Form */}
        <div
          style={{
            background: "#0B132B",
            border: "0.5px solid #1E2A3A",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <input
            name="name"
            type="text"
            placeholder="Course name (e.g. Data Structures)"
            value={form.name}
            onChange={handleChange}
            style={inputStyle}
          />
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date)}
            minDate={new Date()}
            placeholderText="Select exam date"
            dateFormat="MMMM d, yyyy"
            className="datepicker-dark"
            wrapperClassName="w-full"
          />
          <select
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <div>
            <label
              style={{
                fontSize: "12px",
                color: "#8D99AE",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Upload Syllabus / Chapter PDFs (optional, multiple allowed)
            </label>
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={(e) => {
                const selected = Array.from(e.target.files || []);
                console.log("Selected files:", selected);
                setPdfFiles(selected);
              }}
              style={{ ...inputStyle, cursor: "pointer" }}
            />
            {pdfFiles.length > 0 && (
              <div
                style={{
                  marginTop: "6px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                }}
              >
                {pdfFiles.map((f, i) => (
                  <p key={i} style={{ fontSize: "12px", color: "#00F0FF" }}>
                    ✓ {f.name}
                  </p>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleAddCourse}
            style={{
              background: "#00F0FF",
              color: "#0B132B",
              border: "none",
              borderRadius: "8px",
              padding: "10px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            + Add Course
          </button>
        </div>

        {/* Added courses */}
        {courses.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <p
              style={{
                fontSize: "11px",
                color: "#8D99AE",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: "8px",
              }}
            >
              Added Courses ({courses.length})
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {courses.map((course, index) => (
                <div
                  key={index}
                  style={{
                    background: "#0B132B",
                    border: "0.5px solid #1E2A3A",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#FFFFFF",
                        fontWeight: 500,
                      }}
                    >
                      {course.name}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#8D99AE",
                        marginTop: "2px",
                      }}
                    >
                      Exam: {course.exam_date} ·{" "}
                      {course.files.length > 0
                        ? `${course.files.length} PDF${course.files.length > 1 ? "s" : ""}`
                        : "No PDF"}
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
                        ...difficultyColor(course.difficulty),
                      }}
                    >
                      {course.difficulty}
                    </span>
                    <button
                      onClick={() => handleRemoveCourse(index)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#8D99AE",
                        fontSize: "18px",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || courses.length === 0}
          style={{
            width: "100%",
            background: courses.length === 0 ? "#1E2A3A" : "#00F0FF",
            color: courses.length === 0 ? "#8D99AE" : "#0B132B",
            border: "none",
            borderRadius: "8px",
            padding: "12px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: courses.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          {loading
            ? "Saving..."
            : `Continue with ${courses.length} course${courses.length !== 1 ? "s" : ""} →`}
        </button>
      </div>

      <style>{`
        .datepicker-dark {
          width: 100%;
          background: #0B132B !important;
          border: 0.5px solid #1E2A3A !important;
          border-radius: 8px !important;
          padding: 10px 14px !important;
          font-size: 14px !important;
          color: #FFFFFF !important;
          outline: none !important;
        }
        .react-datepicker {
          background: #0B132B !important;
          border: 0.5px solid #1E2A3A !important;
          color: #FFFFFF !important;
        }
        .react-datepicker__header {
          background: #0B132B !important;
          border-bottom: 0.5px solid #1E2A3A !important;
        }
        .react-datepicker__current-month,
        .react-datepicker__day-name,
        .react-datepicker__day {
          color: #FFFFFF !important;
        }
        .react-datepicker__day:hover {
          background: #1E2A3A !important;
        }
        .react-datepicker__day--selected {
          background: #00F0FF !important;
          color: #0B132B !important;
        }
        .react-datepicker__day--disabled {
          color: #8D99AE !important;
        }
        .react-datepicker__navigation-icon::before {
          border-color: #8D99AE !important;
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
