import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import RavelryLoginButton from "../../components/auth/RavelryLoginButton";
import { loginWithEmail } from "../../services/authService";
import "./LoginPage.css";

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ravelryFailed = searchParams.get("error") === "ravelry_failed";

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

        {ravelryFailed && (
          <div className="alert alert-danger" role="alert">
            Could not connect to Ravelry. Please try again.
          </div>
        )}

        <LoginForm onSubmit={handleSubmit} loading={loading} error={error} />

        <div className="login-card__divider">
          <span>or</span>
        </div>

        <RavelryLoginButton />

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
