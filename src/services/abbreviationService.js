const API_URL = import.meta.env.VITE_API_URL;

export async function getAbbreviations(craft, type) {
  const params = new URLSearchParams();
  if (craft) params.set("craft", craft);
  if (type) params.set("type", type);
  const query = params.size ? `?${params}` : "";

  const response = await fetch(`${API_URL}/abbreviations${query}`);

  if (!response.ok) {
    const error = await response.json();
    const detail = error.detail;
    throw new Error(
      typeof detail === "string" ? detail : "Error al obtener las abreviaturas",
    );
  }

  const data = await response.json();
  return data.abbreviations;
}

export async function getAbbreviationById(id) {
  const response = await fetch(`${API_URL}/abbreviations/${id}`);

  if (!response.ok) {
    const error = await response.json();
    const detail = error.detail;
    throw new Error(
      typeof detail === "string" ? detail : "Error al obtener la abreviatura",
    );
  }

  return response.json();
}

export async function getAbbreviationByCode(code) {
  const response = await fetch(`${API_URL}/abbreviations/code/${code}`);

  if (!response.ok) {
    const error = await response.json();
    const detail = error.detail;
    throw new Error(
      typeof detail === "string" ? detail : "Error al obtener la abreviatura",
    );
  }

  return response.json();
}
