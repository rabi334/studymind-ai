import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await loginUser(form);
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
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
          maxWidth: "400px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 500, color: "#00F0FF" }}>
            StudyMind AI
          </h1>
          <p style={{ fontSize: "13px", color: "#8D99AE", marginTop: "6px" }}>
            Welcome back
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

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <div>
            <label
              style={{
                fontSize: "12px",
                color: "#8D99AE",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                background: "#0B132B",
                border: "0.5px solid #1E2A3A",
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: "14px",
                color: "#FFFFFF",
                outline: "none",
              }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: "12px",
                color: "#8D99AE",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                background: "#0B132B",
                border: "0.5px solid #1E2A3A",
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: "14px",
                color: "#FFFFFF",
                outline: "none",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#00F0FF",
              color: "#0B132B",
              border: "none",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              marginTop: "8px",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#8D99AE",
            marginTop: "20px",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{ color: "#00F0FF", textDecoration: "none" }}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
