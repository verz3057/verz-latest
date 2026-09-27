import React from 'react';
import { Link } from 'react-router-dom';
import { HeartOff, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlist } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page container empty-wishlist fade-in">
        <HeartOff size={64} color="var(--accent-purple)" style={{ marginBottom: '1.5rem' }} />
        <h2>Your Wishlist is Empty</h2>
        <p>Explore our shop and tap the heart icon on any custom design to bookmark it here!</p>
        <Link to="/shop" className="btn-primary continue-shopping-btn" style={{ marginTop: '1.5rem' }}>
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="wishlist-page container fade-in">
      <div className="wishlist-header">
        <h1>My Wishlist</h1>
        <p>Bookmarked custom prints and hoodies ready for purchase.</p>
      </div>

      <div className="wishlist-grid">
        {wishlist.map((product) => (
          <ProductCard key={product.id || product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
