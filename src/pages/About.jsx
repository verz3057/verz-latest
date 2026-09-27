import React from 'react';
import { Coffee, Droplets, Layers, MousePointer2, PenTool, ShieldCheck, Shirt, Sparkles } from 'lucide-react';
import './About.css';

const productCards = [
  {
    title: 'Printed T-Shirts',
    text: 'Bold graphics, streetwear-inspired prints, and custom ideas made wearable.',
    icon: Shirt,
    featured: true,
  },
  {
    title: 'Custom Cups',
    text: 'Daily-use mugs and cups with personal designs, names, and expressive artwork.',
    icon: Coffee,
  },
  {
    title: 'Water Bottles',
    text: 'Printed bottles for school, gym, work, gifting, and everyday carry.',
    icon: Droplets,
  },
  {
    title: 'Gaming Mousepads',
    text: 'Desk mats and mousepads made for setup lovers, gamers, and anime fans.',
    icon: MousePointer2,
  },
];

const reasons = [
  {
    title: 'Premium Materials',
    text: 'Products are selected for comfort, durability, and daily use.',
    icon: ShieldCheck,
  },
  {
    title: 'Sharp Print Quality',
    text: 'Clean colors and crisp artwork that help every design stand out.',
    icon: Sparkles,
  },
  {
    title: 'Custom Design Support',
    text: 'Bring your idea, name, quote, artwork, or vibe. We help shape it into a product.',
    icon: PenTool,
  },
  {
    title: 'Made for Everyday Use',
    text: 'Pieces that look good, feel useful, and fit into normal life.',
    icon: Layers,
  },
];

const About = () => {
  return (
    <div className="about-page">
      <section className="about-hero container fade-in">
        <div className="about-hero-copy">
          <span className="about-kicker">VERZ Custom Printing</span>
          <h1>About VERZ</h1>
          <p>Custom printed T-shirts and lifestyle products made for people who want to wear their vibe.</p>
        </div>
        <div className="about-hero-visual" aria-hidden="true">
          <img src="/products/tshirts/VERZ Midnight Blossom Tee1.jpeg" alt="" />
          <div className="about-hero-badge">Bold prints first</div>
        </div>
      </section>

      <section className="about-story-band">
        <div className="container about-story-grid">
          <div>
            <span className="about-section-label">Brand Story</span>
            <h2>Built for people who do not want regular.</h2>
          </div>
          <div className="about-story-copy">
            <p>
              VERZ is a custom printing brand focused on bold printed T-shirts, streetwear-inspired graphics, and personalized products that feel like they belong to you.
            </p>
            <p>
              We serve customers who want unique designs instead of boring regular products. A tee with a sharper graphic. A cup with a personal touch. A mousepad that matches the setup. A bottle that does not look like everyone else's.
            </p>
          </div>
        </div>
      </section>

      <section className="container about-section">
        <div className="about-section-header">
          <span className="about-section-label">What We Make</span>
          <h2>Printed products with T-shirts at the center.</h2>
        </div>
        <div className="about-products-grid">
          {productCards.map(({ title, text, icon: Icon, featured }) => (
            <article className={`about-product-card ${featured ? 'featured' : ''}`} key={title}>
              <div className="about-card-icon">
                <Icon size={24} strokeWidth={2.1} />
              </div>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container about-section">
        <div className="about-section-header compact">
          <span className="about-section-label">Why Customers Choose Us</span>
          <h2>Clean products. Clear prints. Real personality.</h2>
        </div>
        <div className="about-reasons-grid">
          {reasons.map(({ title, text, icon: Icon }) => (
            <article className="about-reason-card" key={title}>
              <Icon size={22} strokeWidth={2.2} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container about-tone-section">
        <div className="about-tone-card">
          <span>Brand Tone</span>
          <h2>Bold. Personal. Original.</h2>
          <p>That is the VERZ promise: products that feel expressive, useful, and made for your own style.</p>
        </div>
      </section>
    </div>
  );
};

export default About;
