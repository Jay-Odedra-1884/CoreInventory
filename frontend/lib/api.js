const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("authToken");

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem("authToken");
    window.location.href = "/auth";
    return null;
  }

  return res.json();
};
