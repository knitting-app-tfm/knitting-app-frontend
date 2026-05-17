import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

const API_URL = import.meta.env.VITE_API_URL;

const FIREBASE_ERROR_MESSAGES = {
  "auth/email-already-in-use": "This email address is already registered.",
  "auth/invalid-email": "Invalid email address.",
  "auth/weak-password": "Password is too weak. Choose a stronger one.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/network-request-failed": "Network error. Please check your connection.",
  "auth/operation-not-allowed": "Email/password sign-in is not enabled.",
};

function getFirebaseErrorMessage(error) {
  return (
    FIREBASE_ERROR_MESSAGES[error.code] ??
    "Registration failed. Please try again."
  );
}

export async function registerWithEmail(email, password, username) {
  let credential;
  try {
    credential = await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error), { cause: error });
  }
  const token = await credential.user.getIdToken();

  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firebase_token: token, username: username }),
  });

  if (!response.ok) {
    const error = await response.json();
    const detail = error.detail;
    throw new Error(
      typeof detail === "string" ? detail : "Registration failed",
    );
  }

  return response.json();
}
