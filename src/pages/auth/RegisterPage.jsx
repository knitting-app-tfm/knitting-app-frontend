import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import RegisterForm from "../../components/auth/RegisterForm";
import { registerWithEmail } from "../../services/authService";
import "./RegisterPage.css";

function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async ({ email, password, username }) => {
    setLoading(true);
    setError(null);
    try {
      await registerWithEmail(email, password, username);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1 className="register-card__title">Create account</h1>
        <p className="register-card__subtitle">
          Start organizing your knitting patterns.
        </p>

        <RegisterForm onSubmit={handleSubmit} loading={loading} error={error} />

        <p className="register-card__footer">
          Already have an account?{" "}
          <Link to="/" className="register-card__link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
