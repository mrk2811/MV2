const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

let _getToken: (() => Promise<string | null>) | null = null;

export function setTokenProvider(getToken: () => Promise<string | null>) {
  _getToken = getToken;
}

async function request<T>(
  path: string,
  options?: RequestInit & { tenantId?: string },
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (_getToken) {
    const token = await _getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  if (options?.tenantId) {
    headers['x-tenant-id'] = options.tenantId;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string, tenantId?: string) =>
    request<T>(path, { tenantId }),
  post: <T>(path: string, body: unknown, tenantId?: string) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), tenantId }),
  patch: <T>(path: string, body: unknown, tenantId?: string) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body), tenantId }),
  delete: <T>(path: string, tenantId?: string) =>
    request<T>(path, { method: 'DELETE', tenantId }),
};
