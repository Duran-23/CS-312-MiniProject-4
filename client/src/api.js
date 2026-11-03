export async function api(url, options = {}) {
  const response = await fetch(`/api${url}`, {
    credentials: "same-origin",

    ...options,

    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}