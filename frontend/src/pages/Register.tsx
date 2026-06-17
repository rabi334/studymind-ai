import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    university: "",
  });
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
      const res = await registerUser(form);
      login(res.data.user, res.data.token);
      navigate("/onboarding");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
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
            Create your account
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
          {[
            {
              name: "name",
              label: "Full Name",
              type: "text",
              placeholder: "Bos",
            },
            {
              name: "email",
              label: "Email",
              type: "email",
              placeholder: "you@example.com",
            },
            {
              name: "password",
              label: "Password",
              type: "password",
              placeholder: "••••••••",
            },
            {
              name: "university",
              label: "University",
              type: "text",
              placeholder: "ASTU",
            },
          ].map((field) => (
            <div key={field.name}>
              <label
                style={{
                  fontSize: "12px",
                  color: "#8D99AE",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                {field.label}
              </label>
              <input
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                required={field.name !== "university"}
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
          ))}
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
            {loading ? "Creating account..." : "Create Account"}
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
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "#00F0FF", textDecoration: "none" }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
