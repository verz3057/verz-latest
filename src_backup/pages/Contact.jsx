import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '4rem' }}>
      <h1 className="neon-text-cyan" style={{ fontSize: '3rem', marginBottom: '2rem' }}>Contact Us</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
        <div className="glass" style={{ padding: '3rem', borderRadius: '12px' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Get in Touch</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <input type="text" required placeholder="Your Name" />
            <input type="email" required placeholder="Your Email" />
            <textarea required rows="5" placeholder="Your Message"></textarea>
            <button type="submit" className="btn-primary">
              {sent ? 'Message Sent!' : 'Send Message'}
            </button>
          </form>
        </div>
        <div className="glass" style={{ padding: '3rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <h2>Business Information</h2>
          <p style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
            <Mail color="var(--accent-cyan)" /> verz3057@gmail.com
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
            <Phone color="var(--accent-cyan)" /> +91 - 8058258156
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
            <MapPin color="var(--accent-cyan)" /> Near Rajput Hostel, Jaipur Road, Dausa (Rajasthan) - 303303
          </p>
          <div style={{ marginTop: 'auto', background: 'rgba(0,0,0,0.5)', height: '200px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Interactive Map Placeholder</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Contact;
