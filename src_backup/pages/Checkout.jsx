import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: JSON.parse(localStorage.getItem('user'))?.email || '',
    address: '',
    city: '',
    postalCode: ''
  });

  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? 40.00 : 0; // Standard shipping INR
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const resScript = await loadRazorpayScript();
    if (!resScript) {
      alert("Razorpay SDK failed to load. Are you online?");
      setIsProcessing(false);
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        alert("Please login to place an order");
        navigate('/login');
        return;
      }

      // 1. Create Order in Backend
      const orderRes = await fetch('http://localhost:5000/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          items: cartItems,
          shippingAddress: shippingData,
          userId: user.id
        })
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        alert("Failed to create order");
        setIsProcessing(false);
        return;
      }

      // 2. Open Razorpay Modal
      const options = {
        key: orderData.keyId, // Fetched dynamically from backend
        amount: orderData.order.amount,
        currency: "INR",
        name: "VERZ Store",
        description: "Transaction for your Verz Order",
        order_id: orderData.order.id,
        handler: async (response) => {
          // 3. Verify Payment
          const verifyRes = await fetch('http://localhost:5000/api/orders/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              dbOrderId: orderData.dbOrderId
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setIsProcessing(false);
            setIsSuccess(true);
            clearCart();
          } else {
            alert("Payment verification failed");
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${shippingData.firstName} ${shippingData.lastName}`,
          email: shippingData.email,
        },
        theme: {
          color: "#00f3ff", // Neon Cyan
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      alert("Something went wrong during checkout");
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="checkout-page container success-view fade-in">
        <div className="glass success-card">
          <CheckCircle size={64} color="var(--accent-cyan)" />
          <h2>Payment Successful!</h2>
          <p>Your order #VZ-{Math.floor(Math.random() * 100000)} has been confirmed.</p>
          <p>We've sent a confirmation email to you.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Return to Home</button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-page container fade-in">
      <h1 className="checkout-title">Secure Checkout</h1>
      
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleCheckout}>
          <div className="form-section glass">
            <h2>Shipping Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="firstName" required placeholder="John" onChange={handleInputChange} value={shippingData.firstName} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="lastName" required placeholder="Doe" onChange={handleInputChange} value={shippingData.lastName} />
              </div>
              <div className="form-group full-width">
                <label>Email Address</label>
                <input type="email" name="email" required placeholder="john@example.com" onChange={handleInputChange} value={shippingData.email} />
              </div>
              <div className="form-group full-width">
                <label>Address</label>
                <input type="text" name="address" required placeholder="123 Neon Street" onChange={handleInputChange} value={shippingData.address} />
              </div>
              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" required placeholder="Cyber City" onChange={handleInputChange} value={shippingData.city} />
              </div>
              <div className="form-group">
                <label>Postal Code</label>
                <input type="text" name="postalCode" required placeholder="10101" onChange={handleInputChange} value={shippingData.postalCode} />
              </div>
            </div>
          </div>

          <div className="form-section glass">
            <h2>Payment Method <CreditCard size={20} /></h2>
            <p className="payment-note">Secured by Razorpay. Pay with UPI, Cards, Netbanking or Wallets.</p>
            <div className="payment-secure-badge">
              <span>🔒 SSL Secured</span>
              <span>💳 Multiple Payment Options</span>
            </div>
          </div>

          <button type="submit" className="btn-primary place-order-btn" disabled={isProcessing}>
            {isProcessing ? 'Processing Payment...' : `Pay ₹${total.toFixed(2)}`}
          </button>
        </form>
        
        <div className="order-summary glass">
          <h3>Order Details</h3>
          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item.id} className="summary-item">
                <div className="item-img">
                  <img src={item.image} alt={item.name} />
                  <span className="item-qty">{item.quantity}</span>
                </div>
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>₹{item.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>₹{shipping.toFixed(2)}</span>
            </div>
            <div className="summary-row final-total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
