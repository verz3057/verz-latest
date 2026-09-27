import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, Gem, PenTool, ShieldCheck, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import './Home.css';

const tshirtFiles = import.meta.glob('/public/products/tshirts/*.{jpg,jpeg,png,webp}', { eager: true });
const cupFiles = import.meta.glob('/public/products/cups/*.{jpg,jpeg,png,webp}', { eager: true });
const bottleFiles = import.meta.glob('/public/products/water-bottles/*.{jpg,jpeg,png,webp}', { eager: true });
const mousepadFiles = import.meta.glob('/public/products/mousepads/*.{jpg,jpeg,png,webp}', { eager: true });

const getCleanPath = (path) => path ? path.replace(/^\/public/, '') : '';

const FALLBACK_IMAGE = 'https://placehold.co/400x400/111111/ffffff?text=VERZ';

const defaultCategoryImages = {
  tshirts: Object.keys(tshirtFiles).length > 0 ? getCleanPath(Object.keys(tshirtFiles)[0]) : FALLBACK_IMAGE,
  cups: Object.keys(cupFiles).length > 0 ? getCleanPath(Object.keys(cupFiles)[0]) : FALLBACK_IMAGE,
  bottles: Object.keys(bottleFiles).length > 0 ? getCleanPath(Object.keys(bottleFiles)[0]) : FALLBACK_IMAGE,
  mousepads: Object.keys(mousepadFiles).length > 0 ? getCleanPath(Object.keys(mousepadFiles)[0]) : FALLBACK_IMAGE,
};

const heroHighlights = [
  { icon: Gem, title: 'Premium Quality', description: 'Top-notch printing quality' },
  { icon: PenTool, title: 'Custom Prints', description: 'Your imagination, our print' },
  { icon: Truck, title: 'Fast Shipping', description: 'Reliable and quick delivery' },
  { icon: ShieldCheck, title: 'Secure Checkout', description: '100% secure payments' },
];

const Home = () => {
  const { banners } = useStore();

  const getCategoryImage = (category) => {
    return defaultCategoryImages[category] || '/placeholder.jpg';
  };

  return (
    <div className="home-page">
      <section className="hero">
        <video autoPlay loop muted playsInline className="hero-video">
          <source src="/verzlogo.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <h1 className="hero-brand">VERZ</h1>
          <p className="hero-tagline">Print Your Style. Wear Your Vibe.</p>
          <p className="hero-subtitle">Premium prints for every vibe and every moment.</p>

          <div className="hero-cta-group">
            <Link to="/shop" className="hero-btn hero-btn-primary">
              <span>Shop Now</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/shop" className="hero-btn hero-btn-secondary">
              <span>Explore</span>
            </Link>
          </div>
        </div>

        <div className="hero-bottom-bar">
          <div className="hero-highlights container">
            {heroHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="hero-highlight-item">
                  <div className="hero-highlight-icon">
                    <Icon size={18} strokeWidth={1.8} />
                  </div>
                  <div className="hero-highlight-copy">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <a href="#featured-categories" className="hero-scroll-btn" aria-label="Scroll to categories">
            <ArrowDown size={20} />
          </a>
        </div>
      </section>

      <section id="featured-categories" className="featured container">
        <h2 className="section-title">Shop by Category</h2>
        <div className="category-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {banners && banners.map((banner, index) => (
            <div key={index} className="category-card" style={{ position: 'relative', overflow: 'hidden', borderRadius: '1rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--surface-color)' }}>
              <img src={getCategoryImage(banner.category) || banner.image} alt={banner.title} style={{ width: '100%', height: '300px', objectFit: 'cover', display: 'block', borderRadius: '12px' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '2rem 1.5rem 1.5rem', textAlign: 'center' }}>
                <h3 style={{ color: 'white', margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: '600' }}>{banner.title}</h3>
                <Link to={banner.buttonLink || `/shop?category=${banner.category}`} className="category-arrow-btn" aria-label={`Explore ${banner.title}`}>
                  <ArrowRight size={18} strokeWidth={1.8} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
