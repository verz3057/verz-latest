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
              <svg role="img" viewBox="0 0 24 24" fill="currentColor" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><title>Amazon</title><path d="M13.68 18.069C10.742 18.069 7.7 17.07 5.176 15.342c-.221-.144-.458.127-.247.337 2.768 2.658 6.438 4.148 10.222 4.148 3.518 0 6.643-1.127 9.07-3.033.26-.205.152-.619-.17-.468-2.915 1.341-6.495 1.743-10.371 1.743zM23.013 14.156c.301.815.333 2.302-.387 2.736-.713.433-2.909-.236-3.832-.544-.86-.299-1.085-.589-1.085-.589s1.319 1.139 2.946 1.316c1.603.189 2.906-.316 3.376-.84.468-.535.331-2.316-.1-2.637l-.918.558zM15.421 6.842c-2.42 0-3.328 1.485-3.565 2.193v-2.02h-4.48v10.227h4.63v-5.289c0-1.688.75-2.008 1.408-2.008.243 0 .768.077 1.162.247v-4.14a4.137 4.137 0 0 0-1.503-.432h.01V6.842zM8.388 9.531c-.328-.803-1.106-1.542-2.352-1.536-1.896.02-3.153 1.385-3.153 3.655 0 1.93.916 3.125 2.502 3.144 1.32.012 2.365-.63 2.759-1.222v1.077h4.092V6.657h-4.32v2.871l.472.003zM5.568 12.392c0 1.056-.479 1.439-1.138 1.439-.623.003-1.15-.363-1.136-1.327.018-1.42.724-1.921 1.464-1.921.432-.014.81.169.81.169v1.64h-.002z"/></svg>
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
