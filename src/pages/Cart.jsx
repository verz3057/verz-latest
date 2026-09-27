import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  const total = getCartTotal();

  if (cartItems.length === 0) {
    return (
      <div className="cart-page container empty-cart fade-in">
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any products to your cart yet.</p>
        <Link to="/shop" className="btn-primary" style={{ marginTop: '20px' }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page container fade-in">
      <h1 className="cart-title">Your Shopping Cart</h1>
      
      <div className="cart-layout">
        <div className="cart-items-section">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item glass">
              <div className="cart-item-image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="cart-item-details">
                <Link to={`/product/${item.id}`}>
                  <h3>{item.name}</h3>
                </Link>
                <p className="cart-item-price">₹{item.price.toFixed(2)}</p>
                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button 
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 size={18} /> Remove
                  </button>
                </div>
              </div>
              <div className="cart-item-total">
                <p>₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="cart-summary glass">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <button 
            className="btn-primary checkout-btn"
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>
          <div className="continue-shopping">
            <Link to="/shop">or Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
