export const API_BASE = 'http://localhost:8000'; // Ganti dengan URL Laravel Anda

export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include', // Penting untuk cookie Sanctum
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) throw await res.json();
  return res.json();
}
