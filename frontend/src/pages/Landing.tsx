import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: "📄",
      title: "Upload Your Syllabus",
      desc: "Upload your course PDF and AI reads the actual content to build a relevant study plan.",
    },
    {
      icon: "🗓️",
      title: "Personalized Daily Plan",
      desc: "Get a smart day-by-day schedule based on your exam dates and course difficulty.",
    },
    {
      icon: "📝",
      title: "AI Study Notes",
      desc: "Click any topic to instantly get AI-generated study notes and key concepts.",
    },
    {
      icon: "✅",
      title: "Track Your Progress",
      desc: "Mark tasks complete and watch your progress bar grow toward exam day.",
    },
    {
      icon: "🔄",
      title: "Adaptive Replanning",
      desc: "Missed a day? Regenerate your plan and AI adjusts while remembering what you covered.",
    },
    {
      icon: "🎯",
      title: "Multi-Course Support",
      desc: "Manage multiple courses with smart prioritization based on exam proximity.",
    },
  ];

  const steps = [
    { step: "1", title: "Create Account", desc: "Sign up for free in seconds" },
    {
      step: "2",
      title: "Add Courses",
      desc: "Enter your courses and exam dates",
    },
    {
      step: "3",
      title: "Upload Syllabus",
      desc: "Optionally upload your PDF notes",
    },
    {
      step: "4",
      title: "Get Your Plan",
      desc: "AI generates your study schedule",
    },
  ];

  const btnPrimary = {
    background: "#00F0FF",
    color: "#0B132B",
    border: "none",
    borderRadius: "8px",
    padding: "12px 28px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
  } as React.CSSProperties;

  const btnSecondary = {
    background: "transparent",
    color: "#00F0FF",
    border: "0.5px solid #00F0FF",
    borderRadius: "8px",
    padding: "12px 28px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
  } as React.CSSProperties;

  return (
    <div
      style={{ minHeight: "100vh", background: "#121212", color: "#FFFFFF" }}
    >
      {/* Navbar */}
      <nav
        style={{
          background: "#0B132B",
          borderBottom: "0.5px solid #1E2A3A",
          padding: "14px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#00F0FF", fontSize: "18px", fontWeight: 500 }}>
          StudyMind AI
        </span>
        <div style={{ display: "flex", gap: "10px" }}>
          {isAuthenticated ? (
            <button onClick={() => navigate("/dashboard")} style={btnPrimary}>
              Dashboard
            </button>
          ) : (
            <>
              <button onClick={() => navigate("/login")} style={btnSecondary}>
                Login
              </button>
              <button onClick={() => navigate("/register")} style={btnPrimary}>
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "80px 24px 60px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: "#0B132B",
            border: "0.5px solid #1E2A3A",
            borderRadius: "100px",
            padding: "6px 16px",
            fontSize: "12px",
            color: "#00F0FF",
            marginBottom: "24px",
            letterSpacing: "0.05em",
          }}
        >
          AI-Powered Study Planning
        </div>
        <h1
          style={{
            fontSize: "42px",
            fontWeight: 500,
            lineHeight: 1.2,
            marginBottom: "20px",
            color: "#FFFFFF",
          }}
        >
          Study Smarter, <span style={{ color: "#00F0FF" }}>Not Harder</span>
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "#8D99AE",
            lineHeight: 1.7,
            marginBottom: "36px",
            maxWidth: "560px",
            margin: "0 auto 36px",
          }}
        >
          Upload your syllabus, add your exam dates, and let AI build you a
          personalized day-by-day study plan — completely free.
        </p>
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => navigate("/register")}
            style={{ ...btnPrimary, padding: "14px 32px", fontSize: "15px" }}
          >
            Start for Free →
          </button>
          <button
            onClick={() => navigate("/login")}
            style={{ ...btnSecondary, padding: "14px 32px", fontSize: "15px" }}
          >
            Login
          </button>
        </div>
      </div>

      {/* Features */}
      <div
        style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 24px" }}
      >
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 500,
            textAlign: "center",
            color: "#FFFFFF",
            marginBottom: "40px",
          }}
        >
          Everything you need to ace your exams
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                background: "#0B132B",
                border: "0.5px solid #1E2A3A",
                borderRadius: "14px",
                padding: "24px",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "12px" }}>
                {f.icon}
              </div>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  marginBottom: "8px",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{ fontSize: "13px", color: "#8D99AE", lineHeight: 1.7 }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div
        style={{
          background: "#0B132B",
          borderTop: "0.5px solid #1E2A3A",
          borderBottom: "0.5px solid #1E2A3A",
          padding: "60px 24px",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 500,
              textAlign: "center",
              color: "#FFFFFF",
              marginBottom: "40px",
            }}
          >
            How it works
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "24px",
              textAlign: "center",
            }}
          >
            {steps.map((s, i) => (
              <div key={i}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    background: "#00F0FF",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px",
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#0B132B",
                  }}
                >
                  {s.step}
                </div>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#FFFFFF",
                    marginBottom: "6px",
                  }}
                >
                  {s.title}
                </h3>
                <p style={{ fontSize: "12px", color: "#8D99AE" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "28px",
            fontWeight: 500,
            color: "#FFFFFF",
            marginBottom: "12px",
          }}
        >
          Ready to study smarter?
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: "#8D99AE",
            marginBottom: "28px",
            lineHeight: 1.7,
          }}
        >
          Join students who are already using StudyMind AI to prepare for their
          exams.
        </p>
        <button
          onClick={() => navigate("/register")}
          style={{ ...btnPrimary, padding: "14px 36px", fontSize: "15px" }}
        >
          Get Started for Free →
        </button>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "0.5px solid #1E2A3A",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "12px", color: "#8D99AE" }}>
          © 2026 StudyMind AI — Built for students, by students 🎓
        </p>
      </div>
    </div>
  );
};

export default Landing;
