
import { useEffect, useState } from "react";
import api from "./services/api";
import { useOutletContext } from "react-router-dom";
const availableRoles = [
  "Admin",
  "Campaign Manager",
  "Communication Team",
];

export default function UserManagement() {
    const { user } = useOutletContext();
    if (user.role !== "Admin") {
        return <h2>Access denied. Admins only.</h2>;
    }
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/users");
      setUsers(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function updateRole(userId, role) {
    setError("");
    setMessage("");

    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      setMessage("User role updated successfully.");
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to update role.");
    }
  }

  async function toggleStatus(user) {
    setError("");
    setMessage("");

    try {
      await api.patch(`/admin/users/${user.id}/status`, {
        is_active: !user.is_active,
      });

      setMessage(
        `User ${user.is_active ? "deactivated" : "activated"} successfully.`
      );

      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to update status.");
    }
  }

  return (
    <section>
      <h1>User Management</h1>
      <p>Manage registered users, roles, and account status.</p>

      {error && <div className="form-error" role="alert">{error}</div>}
      {message && (
        <div className="registration-success" role="status">
          {message}
        </div>
      )}

      {loading ? (
        <p>Loading users...</p>
      ) : !error || users.length > 0 ? (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(event) =>
                        updateRole(user.id, event.target.value)
                      }
                      aria-label={`Role for ${user.name}`}
                    >
                      {availableRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{user.is_active ? "Active" : "Inactive"}</td>
                  <td>
                    <button
                      className="status-button"
                      onClick={() => toggleStatus(user)}
                    >
                      {user.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && <p>No registered users yet.</p>}
        </div>
      ) : (
        <button onClick={loadUsers}>Try again</button>
      )}
    </section>
  );
}
