import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'yoventra_cart_lines';

export function CartProvider({ children }) {
  const [lines, setLines] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines]);

  const addToCart = (product, { size = null, customization = null, qty = 1 } = {}) => {
    setLines((prev) => {
      // If personalized, always treat as distinct item
      if (customization) {
        return [...prev, { product, size, customization, qty }];
      }

      // Check for existing non-personalized line
      const existingIdx = prev.findIndex(
        (l) => l.product.id === product.id && l.size === size && !l.customization
      );

      if (existingIdx >= 0) {
        const copy = [...prev];
        const maxStock = product.stock ?? 99;
        const newQty = Math.min(copy[existingIdx].qty + qty, maxStock);
        copy[existingIdx] = { ...copy[existingIdx], qty: newQty };
        return copy;
      }

      return [...prev, { product, size, customization, qty }];
    });
  };

  const updateQty = (index, newQty) => {
    if (newQty <= 0) {
      removeFromCart(index);
      return;
    }
    setLines((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        const maxStock = copy[index].product.stock ?? 99;
        copy[index] = { ...copy[index], qty: Math.min(newQty, maxStock) };
      }
      return copy;
    });
  };

  const removeFromCart = (index) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setLines([]);
  };

  const cartCount = lines.reduce((acc, l) => acc + l.qty, 0);

  const subtotal = lines.reduce((acc, l) => {
    const price = l.product.effectivePrice ?? l.product.price ?? 0;
    return acc + price * l.qty;
  }, 0);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        lines,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
