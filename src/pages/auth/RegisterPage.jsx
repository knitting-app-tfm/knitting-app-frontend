import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../../components/auth/RegisterForm";
import { registerWithEmail } from "../../services/authService";

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
    <div>
      <h2 className="mb-4">Create account</h2>
      <RegisterForm onSubmit={handleSubmit} loading={loading} error={error} />
      <p className="mt-3 text-muted">
        Already have an account? <span className="text-muted">Sign in</span>
      </p>
    </div>
  );
}

export default RegisterPage;
