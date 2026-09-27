import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="brand-logo">
          VERZ
        </Link>
        
        <nav className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
          <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
          <Link to="/faq" onClick={() => setIsMobileMenuOpen(false)}>FAQ</Link>
          {user && user.role === 'admin' && (
            <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--accent-pink)', fontWeight: 'bold' }}>Admin Panel</Link>
          )}
        </nav>

        <div className="nav-actions">
          {isAuthenticated ? (
            <div className="user-profile-nav" style={{ marginRight: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="user-name" style={{ fontSize: '0.9rem', fontWeight: '500' }}>Hi, {user.name.split(' ')[0]}</span>
              <button 
                onClick={logout} 
                style={{ 
                  background: 'none', 
                  border: '1px solid var(--accent-cyan)', 
                  color: 'var(--accent-cyan)', 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" style={{ display: 'flex', alignItems: 'center', marginRight: '1.2rem', color: 'inherit' }}>
              <User size={24} />
            </Link>
          )}
          <a href="https://www.amazon.in/s?k=verz&ref=nb_sb_noss" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', marginRight: '1.2rem', color: 'inherit', transition: 'color 0.3s ease' }}>
            <svg role="img" viewBox="0 0 24 24" fill="currentColor" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><title>Amazon</title><path d="M13.68 18.069C10.742 18.069 7.7 17.07 5.176 15.342c-.221-.144-.458.127-.247.337 2.768 2.658 6.438 4.148 10.222 4.148 3.518 0 6.643-1.127 9.07-3.033.26-.205.152-.619-.17-.468-2.915 1.341-6.495 1.743-10.371 1.743zM23.013 14.156c.301.815.333 2.302-.387 2.736-.713.433-2.909-.236-3.832-.544-.86-.299-1.085-.589-1.085-.589s1.319 1.139 2.946 1.316c1.603.189 2.906-.316 3.376-.84.468-.535.331-2.316-.1-2.637l-.918.558zM15.421 6.842c-2.42 0-3.328 1.485-3.565 2.193v-2.02h-4.48v10.227h4.63v-5.289c0-1.688.75-2.008 1.408-2.008.243 0 .768.077 1.162.247v-4.14a4.137 4.137 0 0 0-1.503-.432h.01V6.842zM8.388 9.531c-.328-.803-1.106-1.542-2.352-1.536-1.896.02-3.153 1.385-3.153 3.655 0 1.93.916 3.125 2.502 3.144 1.32.012 2.365-.63 2.759-1.222v1.077h4.092V6.657h-4.32v2.871l.472.003zM5.568 12.392c0 1.056-.479 1.439-1.138 1.439-.623.003-1.15-.363-1.136-1.327.018-1.42.724-1.921 1.464-1.921.432-.014.81.169.81.169v1.64h-.002z"/></svg>
          </a>
          <Link to="/cart" className="cart-icon">
            <ShoppingCart size={24} />
            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </Link>
          <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
