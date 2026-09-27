import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import './ProductCard.css';

const ProductCard = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist, reviews } = useStore();

  const isLiked = isInWishlist(product.id || product._id);

  // Toggle wishlist state
  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiked) {
      removeFromWishlist(product.id || product._id);
    } else {
      addToWishlist(product);
    }
  };

  // Calculate dynamic rating based on approved reviews
  const productReviews = reviews.filter(
    r => (r.productId === product.id || r.productId === product._id || r.productId?._id === product._id) && r.approved
  );
  
  const averageRating = productReviews.length > 0
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
    : 4.8; // Default placeholder rating if no reviews exist yet

  // Calculate discount percentage
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Generate product link using slug if available
  const productLink = product.slug ? `/product/${product.slug}` : `/product/id/${product.id || product._id}`;

  return (
    <div className="product-card glass">
      {/* Badge Overlay */}
      {product.badge && (
        <span className={`badge-label ${product.badge.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
          {product.badge}
        </span>
      )}

      {/* Wishlist Heart Icon */}
      <button 
        className={`wishlist-heart-btn ${isLiked ? 'liked' : ''}`}
        onClick={handleWishlistToggle}
        aria-label="Toggle Wishlist"
      >
        <Heart size={20} fill={isLiked ? "var(--accent-cyan)" : "none"} color={isLiked ? "var(--accent-cyan)" : "white"} />
      </button>

      {/* Image & Quick View Wrapper */}
      <div className="product-image-wrapper">
        <Link to={productLink} className="image-link">
          <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
        </Link>
        {onQuickView && (
          <button 
            className="quick-view-overlay-btn"
            onClick={(e) => {
              e.preventDefault();
              onQuickView(product);
            }}
          >
            <Eye size={16} /> Quick View
          </button>
        )}
      </div>

      {/* Product Information */}
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <Link to={productLink}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        
        {/* Star Rating Widget */}
        <div className="card-rating">
          <Star size={14} fill="currentColor" color="var(--accent-purple)" />
          <span className="rating-score">{averageRating}</span>
          <span className="rating-count">({productReviews.length || 24})</span>
        </div>

        {/* Pricing Layout */}
        <div className="card-price-row">
          <div className="price-container">
            <span className="product-price">₹{product.price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="product-original-price">₹{product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          {hasDiscount && (
            <span className="discount-tag">-{discountPercent}% OFF</span>
          )}
        </div>

        {/* Add to Cart button */}
        <button 
          className="btn-primary add-to-cart-btn card-cart-btn"
          onClick={() => addToCart(product)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
