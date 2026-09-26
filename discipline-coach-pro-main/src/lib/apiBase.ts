/**
 * Returns the API base URL:
 * - In development (Vite proxy): returns "" (relative path, forwarded by Vite proxy to localhost:5000)
 * - In production (deployed): returns the full Render backend URL via VITE_API_BASE_URL env var
 */
const API_BASE =
  (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export default API_BASE;
