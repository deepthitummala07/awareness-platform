
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import api from "./services/api";
import "./Dashboard.css";

export default function DashboardLayout() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/auth/me")
      .then((response) => setUser(response.data))
      .catch((err) => {
        setError(
          err.response?.data?.detail ||
          "Unable to load your profile."
        );
      });
  }, []);

  function logout() {
    sessionStorage.removeItem("access_token");
    navigate("/login", { replace: true });
  }

  const navClass = ({ isActive }) =>
    `sidebar-link${isActive ? " active" : ""}`;

  if (error) {
    return (
      <main className="dashboard-loading">
        <p role="alert">{error}</p>
        <button onClick={logout}>Return to Login</button>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="dashboard-loading">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-brand" to="/dashboard">
          <span className="brand-mark">A</span>
          <span>AwarenessAI</span>
        </Link>

        <div className="sidebar-navigation">
          <p className="sidebar-label">WORKSPACE</p>

          <NavLink
            to="/dashboard"
            end
            className={navClass}
          >
            <span className="nav-indicator">01</span>
            Dashboard
          </NavLink>

          {user.role === "Admin" && (
            <NavLink
              to="/dashboard/users"
              className={navClass}
            >
              <span className="nav-indicator">02</span>
              User Management
            </NavLink>
          )}

          <NavLink
            to="/dashboard/audience"
            className={navClass}
          >
            <span className="nav-indicator">03</span>
            Audience
          </NavLink>

          <NavLink
            to="/dashboard/segments"
            className={navClass}
          >
            <span className="nav-indicator">04</span>
            Segments
          </NavLink>

          <NavLink
            to="/dashboard/campaigns"
            className={navClass}
          >
            <span className="nav-indicator">05</span>
            Campaigns
          </NavLink>

          <NavLink
            to="/dashboard/templates"
            className={navClass}
          >
            <span className="nav-indicator">06</span>
            Templates
          </NavLink>
        </div>

        <div className="sidebar-bottom">
          <div className="user-avatar" aria-hidden="true">
            {user.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user.name}</span>
            <small className="sidebar-user-role">{user.role}</small>
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            Log out
          </button>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-heading">
            <span className="topbar-eyebrow">YOUR WORKSPACE</span>
            <span className="topbar-title">
              Public Awareness Platform
            </span>
          </div>

          <div className="topbar-user">
            <span className="topbar-user-dot" />
            <div>
              <span className="topbar-email">{user.email}</span>
              <small>Signed in</small>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet context={{ user }} />
        </main>
      </section>
    </div>
  );
}
