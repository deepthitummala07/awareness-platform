
import { useOutletContext } from "react-router-dom";

export default function DashboardHome() {
  const { user } = useOutletContext();

  return (
    <section>
      <h1>Welcome, {user.name}!</h1>
      <p>You are logged in to the public awareness platform.</p>

      <div className="dashboard-welcome-card">
        <h2>Your account</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Organization:</strong> {user.organization_name}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Status:</strong> {user.is_active ? "Active" : "Inactive"}</p>
      </div>
    </section>
  );
}
