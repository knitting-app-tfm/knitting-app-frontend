import { useEffect, useState } from "react";
import { apiFetch } from "../../services/apiClient";
import "./ProfileCard.css";

function ProfileCard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/auth/me")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load profile.");
        return res.json();
      })
      .then(setProfile)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="profile-card">
      <h1 className="profile-card__title">My profile</h1>

      {loading && (
        <div className="d-flex justify-content-center py-4">
          <div
            className="spinner-border"
            role="status"
            style={{ color: "var(--kn-primary)" }}
          >
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {profile && (
        <div className="profile-card__fields">
          <div className="profile-field">
            <span className="profile-field__label">Username</span>
            <span className="profile-field__value">{profile.username}</span>
          </div>
          <div className="profile-field">
            <span className="profile-field__label">Email</span>
            <span className="profile-field__value">{profile.email}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileCard;
