import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const DeliveryContext = createContext(null);
const PINCODE_STORAGE_KEY = 'yoventra_delivery_pincode';

export function DeliveryProvider({ children }) {
  const [pincode, setPincode] = useState(() => {
    try {
      return localStorage.getItem(PINCODE_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  const [deliveryInfo, setDeliveryInfo] = useState({
    status: 'idle', // 'idle' | 'checking' | 'serviceable' | 'notServiceable' | 'error'
    city: null,
    district: null,
    stateCode: null,
    codAvailable: false,
    prepaidAvailable: false,
    errorMessage: null,
  });

  const checkPincode = async (pinToTest) => {
    const pin = (pinToTest || pincode).trim();
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setDeliveryInfo({
        status: 'error',
        city: null,
        district: null,
        stateCode: null,
        codAvailable: false,
        prepaidAvailable: false,
        errorMessage: 'Please enter a valid 6-digit PIN code.',
      });
      return false;
    }

    setDeliveryInfo((prev) => ({ ...prev, status: 'checking', errorMessage: null }));
    try {
      const res = await api.checkPincodeServiceability(pin);
      if (res?.serviceable) {
        setPincode(pin);
        try {
          localStorage.setItem(PINCODE_STORAGE_KEY, pin);
        } catch {}

        setDeliveryInfo({
          status: 'serviceable',
          city: res.city,
          district: res.district,
          stateCode: res.stateCode,
          codAvailable: res.codAvailable ?? true,
          prepaidAvailable: res.prepaidAvailable ?? true,
          errorMessage: null,
        });
        return true;
      } else {
        setDeliveryInfo({
          status: 'notServiceable',
          city: res?.city || null,
          district: null,
          stateCode: null,
          codAvailable: false,
          prepaidAvailable: false,
          errorMessage: res?.message || 'Delivery is currently not available to this pincode.',
        });
        return false;
      }
    } catch (err) {
      setDeliveryInfo({
        status: 'error',
        city: null,
        district: null,
        stateCode: null,
        codAvailable: false,
        prepaidAvailable: false,
        errorMessage: err.message || 'Unable to check delivery availability. Please try again.',
      });
      return false;
    }
  };

  useEffect(() => {
    if (pincode && pincode.length === 6) {
      checkPincode(pincode);
    }
  }, []);

  return (
    <DeliveryContext.Provider
      value={{
        pincode,
        deliveryInfo,
        checkPincode,
        setPincode,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery() {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error('useDelivery must be used within DeliveryProvider');
  return ctx;
}
