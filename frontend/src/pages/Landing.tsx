import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-5 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-blue-600">StudyMind AI 🧠</h1>
        <div className="flex gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 border border-blue-600 px-5 py-2 rounded-lg hover:bg-blue-50 transition font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          ✨ AI-Powered Study Planning
        </div>
        <h1 className="text-5xl font-extrabold text-gray-800 leading-tight mb-6">
          Study Smarter,
          <br />
          <span className="text-blue-600">Not Harder</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Upload your syllabus, add your exam dates, and let AI build you a
          personalized day-by-day study plan — completely free.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate("/register")}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition shadow-lg"
          >
            Start for Free →
          </button>
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-50 transition shadow border border-blue-100"
          >
            Login
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Everything you need to ace your exams
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
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
              desc: "Manage multiple courses at once with smart prioritization based on exam proximity.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            {[
              {
                step: "1",
                title: "Create Account",
                desc: "Sign up for free in seconds",
              },
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
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-4">
          Ready to study smarter?
        </h2>
        <p className="text-gray-500 mb-8 text-lg">
          Join students who are already using StudyMind AI to prepare for their
          exams.
        </p>
        <button
          onClick={() => navigate("/register")}
          className="bg-blue-600 text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition shadow-lg"
        >
          Get Started for Free →
        </button>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 text-sm border-t">
        © 2026 StudyMind AI — Built for students, by students 🎓
      </footer>
    </div>
  );
};

export default Landing;
