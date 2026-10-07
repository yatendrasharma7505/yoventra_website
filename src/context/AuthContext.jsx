import { createContext, useContext, useState, useEffect } from 'react';
import { api, customerTokenStorage } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => customerTokenStorage.getToken());
  const [customer, setCustomer] = useState(() => customerTokenStorage.getCustomer());
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    async function loadCustomer() {
      if (token) {
        try {
          const data = await api.getMe();
          if (data?.customer) {
            setCustomer(data.customer);
            customerTokenStorage.setCustomer(data.customer);
          }
        } catch (err) {
          if (err.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    }
    loadCustomer();
  }, [token]);

  const sendOtp = async (phoneNumber) => {
    return await api.sendOtp(phoneNumber);
  };

  const verifyOtp = async (phoneNumber, code) => {
    const res = await api.verifyOtp(phoneNumber, code);
    const sessionToken = res.token || res.accessToken;
    if (sessionToken) {
      setToken(sessionToken);
      customerTokenStorage.setToken(sessionToken);
      if (res.customer) {
        setCustomer(res.customer);
        customerTokenStorage.setCustomer(res.customer);
      } else {
        // Fetch profile
        try {
          const profile = await api.getMe();
          if (profile?.customer) {
            setCustomer(profile.customer);
            customerTokenStorage.setCustomer(profile.customer);
          }
        } catch {}
      }
    }
    return res;
  };

  const registerCustomer = async (name, email) => {
    const res = await api.registerCustomer(name, email);
    if (res?.customer) {
      setCustomer(res.customer);
      customerTokenStorage.setCustomer(res.customer);
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setCustomer(null);
    customerTokenStorage.clear();
  };

  const openAuthModal = (message = '') => {
    setAuthModal({ isOpen: true, message });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, message: '' });
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token,
        customer,
        loading,
        sendOtp,
        verifyOtp,
        registerCustomer,
        logout,
        authModal,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
