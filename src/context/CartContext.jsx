import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef
} from 'react';

import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { useStore } from './StoreContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { products } = useStore();

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // Prevent duplicate fetch/sync requests
  const fetchingRef = useRef(false);
  const syncingRef = useRef(false);
  const pendingCartRef = useRef(null);

  // --------------------------------------------------
  // FETCH CART FROM SUPABASE
  // --------------------------------------------------

  const fetchCartFromBackend = async () => {
    if (!user || products.length === 0 || fetchingRef.current) {
      return;
    }

    fetchingRef.current = true;
    setCartLoading(true);

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const restoredCart = (data || [])
        .map(item => {
          const product = products.find(
            p => String(p.id) === String(item.product_id)
          );

          if (!product) {
            console.warn(
              'Skipping cart item because product was not found:',
              item.product_id
            );
            return null;
          }

          return {
            ...product,
            quantity: Math.max(
              1,
              Number.parseInt(item.quantity, 10) || 1
            )
          };
        })
        .filter(Boolean);

      setCartItems(restoredCart);

      console.log(
        'CART RESTORED SUCCESSFULLY:',
        restoredCart
      );
    } catch (err) {
      console.error(
        'FAILED TO FETCH CART:',
        err
      );
    } finally {
      fetchingRef.current = false;
      setHasFetched(true);
      setCartLoading(false);
    }
  };

  // --------------------------------------------------
  // LOGIN / LOGOUT CART HANDLING
  // --------------------------------------------------

  useEffect(() => {
    if (!user) {
      // User logged out
      setCartItems([]);
      setHasFetched(false);

      localStorage.removeItem('cart');

      fetchingRef.current = false;
      syncingRef.current = false;
      pendingCartRef.current = null;

      return;
    }

    // Wait until StoreContext has real DB products
    if (products.length === 0) return;

    if (!hasFetched) {
      fetchCartFromBackend();
    }
  }, [user, products, hasFetched]);

  // --------------------------------------------------
  // LOCAL STORAGE
  // --------------------------------------------------

  useEffect(() => {
    if (!user) {
      localStorage.removeItem('cart');
      return;
    }

    localStorage.setItem(
      'cart',
      JSON.stringify(cartItems)
    );
  }, [cartItems, user]);

  // --------------------------------------------------
  // SYNC CART TO SUPABASE
  // --------------------------------------------------

  const syncCartToBackend = async (cart) => {
    if (!user || !hasFetched) return;

    // If another sync is running, remember the latest cart.
    if (syncingRef.current) {
      pendingCartRef.current = cart;
      return;
    }

    syncingRef.current = true;

    try {
      // Delete current user's cart
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error(
          'CART DELETE ERROR:',
          deleteError
        );
        return;
      }

      // Insert current cart
      if (cart.length > 0) {
        const payload = cart
          .filter(item => item?.id)
          .map(item => ({
            user_id: user.id,
            product_id: String(item.id),
            quantity: Math.max(
              1,
              Number.parseInt(item.quantity, 10) || 1
            ),
            price_at_time: Number(item.price) || 0
          }));

        if (payload.length > 0) {
          console.log(
            'CART INSERT PAYLOAD:',
            payload
          );

          const { data, error: insertError } =
            await supabase
              .from('cart_items')
              .insert(payload)
              .select();

          if (insertError) {
            console.error(
              'CART INSERT ERROR:',
              insertError
            );
            return;
          }

          console.log(
            'CART SAVED SUCCESSFULLY:',
            data
          );
        }
      } else {
        console.log(
          'CART CLEARED SUCCESSFULLY'
        );
      }
    } catch (err) {
      console.error(
        'CART SYNC ERROR:',
        err
      );
    } finally {
      syncingRef.current = false;

      // If cart changed while sync was running,
      // sync the newest version once more.
      if (
        pendingCartRef.current !== null
      ) {
        const latestCart =
          pendingCartRef.current;

        pendingCartRef.current = null;

        await syncCartToBackend(
          latestCart
        );
      }
    }
  };

  // --------------------------------------------------
  // WATCH CART CHANGES
  // --------------------------------------------------

  useEffect(() => {
    if (
      !user ||
      !hasFetched ||
      fetchingRef.current
    ) {
      return;
    }

    syncCartToBackend(cartItems);
  }, [cartItems, user, hasFetched]);

  // --------------------------------------------------
  // ADD TO CART
  // --------------------------------------------------

  const addToCart = (product) => {
    if (!product?.id) return;

    setCartItems(prev => {
      const existing = prev.find(
        item =>
          String(item.id) ===
          String(product.id)
      );

      if (existing) {
        return prev.map(item =>
          String(item.id) ===
          String(product.id)
            ? {
                ...item,
                quantity:
                  Number(item.quantity || 0) + 1
              }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          quantity: 1
        }
      ];
    });
  };

  // --------------------------------------------------
  // REMOVE FROM CART
  // --------------------------------------------------

  const removeFromCart = (productId) => {
    setCartItems(prev =>
      prev.filter(
        item =>
          String(item.id) !==
          String(productId)
      )
    );
  };

  // --------------------------------------------------
  // UPDATE QUANTITY
  // --------------------------------------------------

  const updateQuantity = (
    productId,
    quantity
  ) => {
    const newQuantity = Number(quantity);

    if (
      !Number.isFinite(newQuantity) ||
      newQuantity < 1
    ) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        String(item.id) ===
        String(productId)
          ? {
              ...item,
              quantity: Math.floor(
                newQuantity
              )
            }
          : item
      )
    );
  };

  // --------------------------------------------------
  // CLEAR CART
  // --------------------------------------------------

  const clearCart = () => {
    setCartItems([]);
  };

  // --------------------------------------------------
  // CART TOTAL
  // --------------------------------------------------

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) =>
        total +
        (Number(item.price) || 0) *
          (Number(item.quantity) || 0),
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        isCartOpen,
        setIsCartOpen,
        cartLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};