const API_URL = import.meta.env.VITE_API_URL;

export async function importPatternFromPdf(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/patterns/import/pdf`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Error al importar el patrón");
  }

  return response.json();
}
