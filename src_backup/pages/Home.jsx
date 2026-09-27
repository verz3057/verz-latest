import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="hero-video"
        >
          <source src="/verzlogo.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-content fade-in">
          <h1 className="hero-brand">VERZ</h1>
          <p className="hero-tagline" style={{ color: 'white', textDecoration: 'underline', textDecorationColor: 'white', textUnderlineOffset: '8px', textDecorationThickness: '2px', textShadow: 'none' }}>Print Your Style. Wear Your Vibe.</p>
          <Link to="/shop" className="btn-primary hero-btn bw-theme">Shop Now</Link>
        </div>
      </section>

      <section className="featured container">
        <h2 className="section-title">Shop by Category</h2>
        <div className="category-grid">
          <Link to="/shop?category=tshirts" className="category-card glass">
            <h3>T-Shirts</h3>
          </Link>
          <Link to="/shop?category=cups" className="category-card glass">
            <h3>Cups</h3>
          </Link>
          <Link to="/shop?category=bottles" className="category-card glass">
            <h3>Water Bottles</h3>
          </Link>
          <Link to="/shop?category=mousepads" className="category-card glass">
            <h3>Gaming Mousepads</h3>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
