import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Paintbrush, ArrowLeft } from 'lucide-react';
import './Customizer.css';

const Customizer = () => {
  const { slug } = useParams();

  return (
    <div className="customizer-page container fade-in">
      <Link to={slug ? `/product/${slug}` : '/shop'} className="customizer-back">
        <ArrowLeft size={18} />
        Back to Product
      </Link>

      <div className="customizer-hero">
        <div className="customizer-icon-wrapper">
          <Paintbrush size={56} />
        </div>
        <h1>Design Customizer</h1>
        <p className="customizer-subtitle">
          Upload your artwork, choose placement, and preview your custom design in real-time.
        </p>
        <div className="customizer-coming-soon">
          <span className="badge-glow">Coming Soon</span>
          <p>We're building a powerful drag-and-drop customizer so you can create unique designs on any product. Stay tuned!</p>
        </div>
      </div>
    </div>
  );
};

export default Customizer;
