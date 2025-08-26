import http, { setAuthToken } from "./http";

export async function login({ username, password }) {
  const { data } = await http.post("/api/auth/login", { username, password });
  if (data?.token) {
    localStorage.setItem("token", data.token);
    setAuthToken(data.token);
  }
  return data;
}

export async function registerDoctor(payload) {
  const { data } = await http.post("/api/auth/register", payload);
  return data;
}

export function logout() {
  localStorage.removeItem("token");
  setAuthToken(null);
}
