import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import { loginWithEmail } from "../../services/authService";
import "./LoginPage.css";

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-card__title">Sign in</h1>
        <p className="login-card__subtitle">
          Welcome back to your knitting patterns.
        </p>

        <LoginForm onSubmit={handleSubmit} loading={loading} error={error} />

        <p className="login-card__footer">
          Don't have an account?{" "}
          <Link to="/register" className="login-card__link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
