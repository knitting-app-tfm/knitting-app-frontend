import { getAuth } from "firebase/auth";

const BASE_URL = import.meta.env.VITE_API_URL;

async function getAuthHeader() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export async function apiFetch(path, options = {}) {
  const authHeader = await getAuthHeader();
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...authHeader,
      ...options.headers,
    },
  });
  return response;
}
