
import { Link, useLocation } from "react-router-dom";

export default function Login() {
  const location = useLocation();
  const message = location.state?.message;
  const email = location.state?.email;

  return (
    <main className="register-page">
      <section className="register-card">
        <h1>Login</h1>

        {message && (
          <div className="registration-success" role="status">
            {message}
          </div>
        )}

        {email && (
          <p>Your registered email: <strong>{email}</strong></p>
        )}

        <p>Login functionality will be implemented in the next task.</p>
        <Link to="/">Back to home</Link>
      </section>
    </main>
  );
}
