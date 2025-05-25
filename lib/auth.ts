import { apiFetch, API_BASE } from './api';

export async function getCSRF() {
  await fetch(`${API_BASE}/sanctum/csrf-cookie`, {
    credentials: 'include',
  });
}

export async function login(data: { email: string; password: string }) {
  await getCSRF();
  return apiFetch('/api/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  await getCSRF();
  return apiFetch('/api/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function logout() {
  return apiFetch('/api/logout', { method: 'POST' });
}

export async function getUser() {
  return apiFetch('/api/user');
}
