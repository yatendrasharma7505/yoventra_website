import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, onSessionEvent, tokenStorage } from './api';

const InfluencerAuthContext = createContext(undefined);

export function InfluencerAuthProvider({ children }) {
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionMessage, setSessionMessage] = useState(null);

  const logout = useCallback((message = null) => {
    tokenStorage.clear();
    setInfluencer(null);
    setSessionMessage(message);
  }, []);

  useEffect(() => {
    if (!tokenStorage.get()) {
      setLoading(false);
      return;
    }
    api('/me')
      .then(setInfluencer)
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  useEffect(
    () =>
      onSessionEvent((event) => {
        if (event === 'expired') logout('Your session has ended. Please log in again.');
        if (event === 'inactive') logout('Your influencer account is not active. Please contact Yoventra.');
        if (event === 'password') setInfluencer((i) => (i ? { ...i, mustChangePassword: true } : i));
      }),
    [logout],
  );

  async function login(influencerCode, password) {
    const data = await api('/auth/login', { method: 'POST', body: { influencerCode, password }, auth: false });
    tokenStorage.set(data.token);
    setSessionMessage(null);
    setInfluencer(data.influencer);
    return data;
  }

  async function changePassword(currentPassword, newPassword) {
    const data = await api('/me/change-password', { method: 'POST', body: { currentPassword, newPassword } });
    tokenStorage.set(data.token);
    setInfluencer(data.influencer);
  }

  return (
    <InfluencerAuthContext.Provider value={{ influencer, setInfluencer, loading, login, logout, changePassword, sessionMessage }}>
      {children}
    </InfluencerAuthContext.Provider>
  );
}

export function useInfluencerAuth() {
  const ctx = useContext(InfluencerAuthContext);
  if (!ctx) throw new Error('useInfluencerAuth must be used within InfluencerAuthProvider');
  return ctx;
}
