import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h2 style={{ color: 'white', WebkitTextStroke: '1.5px black' }}>VERZ</h2>
          <p>Print Your Style. Wear Your Vibe.</p>
          <div className="social-links">
            <a href="https://www.instagram.com/verz_vz/" target="_blank" rel="noopener noreferrer"><Instagram /></a>
            <a href="https://www.amazon.in/s?k=verz&ref=nb_sb_noss" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/amazon logo.svg" alt="Amazon" style={{ width: '36px', height: '36px', objectFit: 'contain', display: 'block' }} />
            </a>
          </div>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>
          <Link to="/shop">Shop</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/faq">FAQ</Link>
        </div>

        <div className="footer-links">
          <h3>Legal</h3>
          <Link to="/legal#privacy">Privacy Policy</Link>
          <Link to="/legal#terms">Terms & Conditions</Link>
          <Link to="/legal#refunds">Refund Policy</Link>
        </div>

        <div className="footer-contact">
          <h3>Contact Us</h3>
          <p><MapPin size={16} /> Near Rajput Hostel, Jaipur Road, Dausa (Rajasthan) - 303303</p>
          <p><Phone size={16} /> +91 - 8058258156</p>
          <p><Mail size={16} /> verz3057@gmail.com</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} VERZ Custom Printing. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;


