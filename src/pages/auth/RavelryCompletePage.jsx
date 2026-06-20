import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "../../services/firebase";

function RavelryCompletePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      navigate("/login?error=ravelry_failed", { replace: true });
      return;
    }

    signInWithCustomToken(auth, token)
      .then(() => navigate("/", { replace: true }))
      .catch(() => navigate("/login?error=ravelry_failed", { replace: true }));
  }, [searchParams, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div
        className="spinner-border text-secondary-kn"
        role="status"
        aria-label="Loading"
      >
        <span className="visually-hidden">Loading…</span>
      </div>
    </div>
  );
}

export default RavelryCompletePage;
