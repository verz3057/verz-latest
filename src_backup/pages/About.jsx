import React from 'react';

const About = () => {
  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '4rem' }}>
      <h1 className="neon-text-cyan" style={{ fontSize: '3rem', marginBottom: '2rem' }}>About VERZ</h1>
      <div className="glass" style={{ padding: '3rem', borderRadius: '12px' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-purple)' }}>Print Your Style. Wear Your Vibe.</h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.8' }}>
          VERZ was born out of a desire to break the mold. We believe that what you wear and use every day should reflect who you truly are. Specializing in high-quality custom printing for t-shirts, cups, bottles, and gaming mousepads, we're here to help you express your unique style with edge and creativity.
        </p>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          Our mission is to provide premium, durable, and striking printed products that make our community stand out. Powered by a modern gaming and retrowave aesthetic, VERZ isn't just a store—it's a lifestyle. Join us in bringing art to the everyday.
        </p>
      </div>
    </div>
  );
};
export default About;
