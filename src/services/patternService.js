import { apiFetch } from "./apiClient";

export async function getPatterns() {
  const response = await apiFetch("/patterns");

  if (!response.ok) {
    const error = await response.json();
    const detail = error.detail;
    throw new Error(
      typeof detail === "string" ? detail : "Failed to load patterns",
    );
  }

  return response.json();
}

export async function getPattern(patternId) {
  const response = await apiFetch(`/patterns/${patternId}`);

  if (!response.ok) {
    const error = await response.json();
    const detail = error.detail;
    throw new Error(
      typeof detail === "string" ? detail : "Error al obtener el patrón",
    );
  }

  return response.json();
}

export async function confirmPattern(patternId, formData) {
  const response = await apiFetch(`/patterns/${patternId}/confirm`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    const detail = error.detail;
    throw new Error(
      typeof detail === "string" ? detail : "Error al confirmar el patrón",
    );
  }

  return response.json();
}

export async function importPatternFromPdf(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch(`/patterns/import/pdf`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    const detail = error.detail;
    throw new Error(
      typeof detail === "string" ? detail : "Error al importar el patrón",
    );
  }

  return response.json();
}

export async function translatePattern(patternId) {
  const response = await apiFetch(`/patterns/${patternId}/translate`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json();
    const detail = error.detail;
    throw new Error(
      typeof detail === "string" ? detail : "Error al traducir el patrón",
    );
  }
  return response.json();
}

export async function getScaling(patternId) {
  const response = await apiFetch(`/patterns/${patternId}/scaling`);

  if (response.status === 404) return null;

  if (!response.ok) {
    const error = await response.json();
    const detail = error.detail;
    throw new Error(
      typeof detail === "string" ? detail : "Failed to load scaling",
    );
  }

  return response.json();
}

export async function putScaling(patternId, scalingData) {
  const response = await apiFetch(`/patterns/${patternId}/scaling`, {
    method: "PUT",
    body: JSON.stringify(scalingData),
  });

  if (!response.ok) {
    const error = await response.json();
    const detail = error.detail;
    throw new Error(
      typeof detail === "string" ? detail : "Failed to save scaling",
    );
  }

  return response.json();
}

export async function getScaledPattern(patternId) {
  const response = await apiFetch(`/patterns/${patternId}/scaled`);

  if (!response.ok) {
    const error = await response.json();
    const detail = error.detail;
    throw new Error(
      typeof detail === "string" ? detail : "Failed to load scaled pattern",
    );
  }

  return response.json();
}

export async function getUserYarns(patternId) {
  const response = await apiFetch(`/patterns/${patternId}/yarns`);

  if (!response.ok) {
    const error = await response.json();
    const detail = error.detail;
    throw new Error(
      typeof detail === "string" ? detail : "Failed to load user yarns",
    );
  }

  return response.json();
}

export async function putUserYarn(patternId, patternYarnId, data) {
  const response = await apiFetch(
    `/patterns/${patternId}/yarns/${patternYarnId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    const detail = error.detail;
    throw new Error(
      typeof detail === "string" ? detail : "Failed to save user yarn",
    );
  }

  return response.json();
}

export async function getYarnCalculation(patternId) {
  const response = await apiFetch(`/patterns/${patternId}/yarn-calculation`);

  if (!response.ok) {
    const error = await response.json();
    const detail = error.detail;
    throw new Error(
      typeof detail === "string" ? detail : "Failed to calculate yarn needed",
    );
  }

  return response.json();
}

export async function importPatternFromText(text) {
  const response = await apiFetch(`/patterns/import/text`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: text,
  });

  if (!response.ok) {
    const error = await response.json();
    const detail = error.detail;
    throw new Error(
      typeof detail === "string" ? detail : "Error al importar el patrón",
    );
  }

  return response.json();
}
