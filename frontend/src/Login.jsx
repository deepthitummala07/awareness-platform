
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "./services/api";
import "./Register.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      sessionStorage.setItem(
        "access_token",
        response.data.access_token
      );

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      <form className="register-card" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p className="register-subtitle">
          Log in to your awareness platform account.
        </p>

        {location.state?.message && (
          <div className="registration-success" role="status">
            {location.state.message}
          </div>
        )}

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <label htmlFor="login-email">Email address</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        <label className="show-password-label">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(event) => setShowPassword(event.target.checked)}
          />
          Show password
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="register-login-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </main>
  );
}
