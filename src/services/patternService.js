const API_URL = import.meta.env.VITE_API_URL;

export async function getPattern(patternId) {
  const response = await fetch(`${API_URL}/patterns/${patternId}`);

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
  const response = await fetch(`${API_URL}/patterns/${patternId}/confirm`, {
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

  const response = await fetch(`${API_URL}/patterns/import/pdf`, {
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

export async function importPatternFromText(text) {
  const response = await fetch(`${API_URL}/patterns/import/text`, {
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
