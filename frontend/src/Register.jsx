
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./services/api";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization_name: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/auth/roles")
      .then((response) => {
        setRoles(response.data);
        if (response.data.length > 0) {
          setForm((current) => ({
            ...current,
            role: current.role || response.data[0].name,
          }));
        }
      })
      .catch(() => {
        setError("Unable to load roles. Please refresh the page.");
      });
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
    setError("");
  }

  function getPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return "Weak";
    if (score <= 4) return "Medium";
    return "Strong";
  }

  function validateForm() {
    const errors = {};

    if (!form.name.trim()) errors.name = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Enter a valid email address";
    }
    if (!form.phone.trim()) errors.phone = "Phone number is required";
    if (!form.organization_name.trim()) {
      errors.organization_name = "Organization name is required";
    }
    if (!form.role) errors.role = "Please select a role";

    const strongPassword =
      form.password.length >= 8 &&
      /[A-Z]/.test(form.password) &&
      /[a-z]/.test(form.password) &&
      /\d/.test(form.password) &&
      /[^A-Za-z0-9]/.test(form.password);

    if (!strongPassword) {
      errors.password =
        "Use 8+ characters with uppercase, lowercase, a number and a special character";
    }

    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { confirmPassword, ...payload } = form;
      const response = await api.post("/auth/register", payload);

      navigate("/login", {
        state: {
          message: response.data.message + ". Please log in.",
          email: form.email,
        },
      });
    } catch (err) {
      const detail = err.response?.data?.detail;

      if (typeof detail === "string") {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((item) => item.msg).join(". "));
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const strength = getPasswordStrength(form.password);

  return (
    <main className="register-page">
      <form className="register-card" onSubmit={handleSubmit}>
        <h1>Create your account</h1>
        <p className="register-subtitle">
          Join the multilingual public awareness platform.
        </p>

        {error && <div className="form-error" role="alert">{error}</div>}

        <label htmlFor="name">Full name</label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          autoComplete="name"
          required
        />
        {fieldErrors.name && <small>{fieldErrors.name}</small>}

        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        {fieldErrors.email && <small>{fieldErrors.email}</small>}

        <label htmlFor="phone">Phone number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
          autoComplete="tel"
          required
        />
        {fieldErrors.phone && <small>{fieldErrors.phone}</small>}

        <label htmlFor="organization_name">Organization name</label>
        <input
          id="organization_name"
          name="organization_name"
          value={form.organization_name}
          onChange={handleChange}
          placeholder="Enter your organization"
          required
        />
        {fieldErrors.organization_name && (
          <small>{fieldErrors.organization_name}</small>
        )}

        <label htmlFor="role">Role</label>
        <select
          id="role"
          name="role"
          value={form.role}
          onChange={handleChange}
          required
        >
          <option value="">Select a role</option>
          {roles.map((role) => (
            <option key={role.name} value={role.name}>
              {role.name}
            </option>
          ))}
        </select>
        {fieldErrors.role && <small>{fieldErrors.role}</small>}

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Create a strong password"
          autoComplete="new-password"
          required
        />
        {form.password && (
          <div className={`password-strength ${strength.toLowerCase()}`}>
            Password strength: {strength}
          </div>
        )}
        {fieldErrors.password && <small>{fieldErrors.password}</small>}

        <label htmlFor="confirmPassword">Confirm password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          required
        />
        {fieldErrors.confirmPassword && (
          <small>{fieldErrors.confirmPassword}</small>
        )}

        <button type="submit" disabled={loading || roles.length === 0}>
          {loading ? (
            <span className="register-loading">
              <span className="spinner" /> Registering...
            </span>
          ) : (
            "Create account"
          )}
        </button>

        <p className="register-login-link">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
}
