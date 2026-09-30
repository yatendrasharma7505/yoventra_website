const TOKEN_KEY = 'yoventra_influencer_token';

export const tokenStorage = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* private mode — session lasts for this tab only */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Listeners (the auth context) react to an expired session or a forced password change.
const sessionListeners = new Set();
export function onSessionEvent(fn) {
  sessionListeners.add(fn);
  return () => sessionListeners.delete(fn);
}

/** Calls the Yoventra backend at /api/influencers/* (proxied by Vite in dev and
 * by vercel.json in production). */
export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = tokenStorage.get();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    const init = { method, headers };
    if (body !== undefined) init.body = JSON.stringify(body);
    res = await fetch(`/api/influencers${path}`, init);
  } catch {
    throw new ApiError(0, 'Could not reach Yoventra. Check your internet connection and try again.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    const err = new ApiError(res.status, data?.error ?? 'Something went wrong. Please try again.', data?.code);
    if (auth && token) {
      if (res.status === 401) sessionListeners.forEach((fn) => fn('expired'));
      else if (data?.code === 'PASSWORD_CHANGE_REQUIRED') sessionListeners.forEach((fn) => fn('password'));
      else if (data?.code === 'ACCOUNT_INACTIVE') sessionListeners.forEach((fn) => fn('inactive'));
    }
    throw err;
  }
  return data;
}
