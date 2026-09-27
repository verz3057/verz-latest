import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [hasFetched, setHasFetched] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Fetch cart from backend on login
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartFromBackend();
    } else {
      // Clear cart on logout
      setCartItems([]);
      localStorage.removeItem('cart');
      setHasFetched(false); // Reset on logout
    }
  }, [isAuthenticated]);

  const fetchCartFromBackend = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        // Merge guest cart with database cart
        setCartItems(prev => {
          // If guest cart is empty, just take DB cart
          if (prev.length === 0) return data;
          
          // Merge logic
          const merged = [...data];
          prev.forEach(guestItem => {
            const existingInDB = merged.find(dbItem => dbItem.id === guestItem.id);
            if (existingInDB) {
              existingInDB.quantity += guestItem.quantity;
            } else {
              merged.push(guestItem);
            }
          });
          return merged;
        });
        setHasFetched(true); // Now we can safely sync changes back to DB
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      // In case of error, we still set hasFetched to true to allow manual changes to sync
      setHasFetched(true); 
    }
  };

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync with backend if logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    // ONLY sync if we have finished fetching the initial cart from DB
    if (token && hasFetched) {
      syncCartWithBackend(cartItems);
    }
  }, [cartItems, hasFetched]);

  const syncCartWithBackend = async (items) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch('http://localhost:5000/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cart: items })
      });
    } catch (err) {
      console.error('Failed to sync cart:', err);
    }
  };

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    setCartItems(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const clearCart = () => setCartItems([]);

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
};
