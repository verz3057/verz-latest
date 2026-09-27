import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Shield, Truck, RotateCcw, Heart, ShoppingCart, PenTool, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { 
    products, 
    reviews, 
    addReview, 
    isInWishlist, 
    addToWishlist, 
    removeFromWishlist,
    addToRecentlyViewed,
    recentlyViewed
  } = useStore();

  // Load product by slug or id fallback
  const product = useMemo(() => {
    let found = products.find(p => p.slug === slug);
    if (!found && slug.match(/^[0-9]+$/)) {
      found = products.find(p => p.id === parseInt(slug));
    }
    if (!found && slug.match(/^[0-9a-fA-F]{24}$/)) {
      found = products.find(p => p._id === slug);
    }
    return found;
  }, [slug, products]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customText, setCustomText] = useState('');
  
  // Review form states
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Gallery swipe helper
  const galleryRef = useRef(null);

  // Add to recently viewed on mount or product change
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
      setActiveImageIndex(0);
      setQuantity(1);
      
      // Auto select first color variant if exists
      if (product.variants && product.variants.length > 0) {
        const colors = product.variants.map(v => v.color).filter(Boolean);
        if (colors.length > 0) setSelectedColor(colors[0]);
      } else {
        setSelectedColor('');
      }
    }
  }, [product]);

  // Dynamic reviews filtering
  const productReviews = useMemo(() => {
    if (!product) return [];
    return reviews.filter(
      r => (r.productId === product.id || r.productId === product._id || r.productId?._id === product._id) && r.approved
    );
  }, [product, reviews]);

  const averageRating = useMemo(() => {
    if (productReviews.length === 0) return 4.8;
    return (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1);
  }, [productReviews]);

  if (!product) {
    return (
      <div className="container error-page" style={{ paddingTop: '140px', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <p>The product you are looking for does not exist or has been removed.</p>
        <button className="btn-primary" onClick={() => navigate('/shop')} style={{ marginTop: '20px' }}>
          Go to Shop
        </button>
      </div>
    );
  }

  // Double check variant stock
  const currentVariant = product.variants ? product.variants.find(
    v => (!product.category === 'tshirts' || v.size === selectedSize) && (!selectedColor || v.color === selectedColor)
  ) : null;

  const currentStock = currentVariant ? currentVariant.stock : product.stock;
  const isOutOfStock = currentStock <= 0;

  const isLiked = isInWishlist(product.id || product._id);

  const handleWishlistToggle = () => {
    if (isLiked) {
      removeFromWishlist(product.id || product._id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const itemToAdd = {
      ...product,
      selectedSize: product.category === 'tshirts' ? selectedSize : null,
      selectedColor: selectedColor || null,
      customText: customText || null,
      variantStock: currentStock
    };

    for(let i = 0; i < quantity; i++) {
      addToCart(itemToAdd);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    handleAddToCart();
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;

    const result = await addReview(product._id || product.id, {
      name: reviewName,
      rating: reviewRating,
      comment: reviewComment
    });

    if (result) {
      setReviewSuccess(true);
      setReviewName('');
      setReviewComment('');
      setReviewRating(5);
      setTimeout(() => setReviewSuccess(false), 5000);
    }
  };

  // Generate 4 images gallery
  const galleryImages = useMemo(() => {
    if (product.images && product.images.length >= 4) {
      return product.images.slice(0, 4);
    }
    
    // Duplicate primary images or fallback
    const list = [...(product.images || [])];
    if (list.length === 0) list.push(product.image);
    
    while (list.length < 4) {
      list.push(product.image); // Replicate primary
    }
    return list;
  }, [product]);

  // Color circles map
  const colorMap = {
    'Black': '#000000',
    'White': '#ffffff',
    'Red': '#ff003c',
    'Blue': '#0077ff',
    'Silver': '#c0c0c0',
    'Clear': 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.1))',
    'Green': '#00cc66'
  };

  return (
    <div className="product-detail-page container fade-in">
      <div className="breadcrumb-nav">
        <Link to="/">Home</Link> &gt; <Link to="/shop">Shop</Link> &gt; <span>{product.name}</span>
      </div>

      <div className="product-main-layout">
        {/* Left Side: Product Gallery */}
        <div className="product-gallery-section">
          <div className="main-display-wrapper glass">
            <img 
              src={galleryImages[activeImageIndex]} 
              alt={`${product.name} view`} 
              className="main-display-image"
            />
            {/* Wishlist float button */}
            <button className={`gallery-wishlist-btn ${isLiked ? 'liked' : ''}`} onClick={handleWishlistToggle}>
              <Heart size={22} fill={isLiked ? "var(--accent-cyan)" : "none"} color={isLiked ? "var(--accent-cyan)" : "white"} />
            </button>
          </div>
          
          {/* Scrollable Thumbnails */}
          <div className="gallery-thumbnails-row" ref={galleryRef}>
            {galleryImages.map((img, index) => (
              <button 
                key={index}
                className={`gallery-thumb-btn glass ${activeImageIndex === index ? 'active' : ''}`}
                onClick={() => setActiveImageIndex(index)}
              >
                <img src={img} alt={`Thumbnail ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Product Configuration Info Panel */}
        <div className="product-config-panel context-panel glass">
          {product.badge && (
            <span className="qv-badge">{product.badge}</span>
          )}
          <span className="product-category-tag">{product.category}</span>
          <h1 className="detail-product-title">{product.name}</h1>
          
          <div className="detail-rating-row">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  size={16} 
                  fill={s <= Math.round(averageRating) ? "currentColor" : "none"} 
                  color="var(--accent-purple)" 
                />
              ))}
            </div>
            <span className="rating-avg">{averageRating} ★</span>
            <span className="rating-count">({productReviews.length || 24} verified reviews)</span>
          </div>

          <div className="detail-price-row">
            <span className="price">₹{product.price.toFixed(2)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="original-price">₹{product.originalPrice.toFixed(2)}</span>
                <span className="savings-badge">SAVE ₹{(product.originalPrice - product.price).toFixed(0)}</span>
              </>
            )}
          </div>

          <p className="detail-description">{product.description}</p>

          {/* Size Selectors (Apparel Only) */}
          {product.category === 'tshirts' && (
            <div className="selector-group">
              <span className="selector-label">Select Size</span>
              <div className="size-buttons-grid">
                {['S', 'M', 'L', 'XL', 'XXL'].map(size => {
                  const sizeStock = product.variants 
                    ? product.variants.find(v => v.size === size && (!selectedColor || v.color === selectedColor))?.stock || 0
                    : 10;
                  const isSizeOut = sizeStock <= 0;
                  return (
                    <button
                      key={size}
                      className={`size-select-btn ${selectedSize === size ? 'active' : ''} ${isSizeOut ? 'size-out' : ''}`}
                      onClick={() => !isSizeOut && setSelectedSize(size)}
                      disabled={isSizeOut}
                    >
                      {size}
                      {isSizeOut && <span className="slash"></span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Colors Selection */}
          {product.variants && product.variants.some(v => v.color) && (
            <div className="selector-group">
              <span className="selector-label">Select Color</span>
              <div className="color-buttons-grid">
                {Array.from(new Set(product.variants.map(v => v.color).filter(Boolean))).map(color => (
                  <button
                    key={color}
                    className={`color-circle-btn detail-color-btn ${selectedColor === color ? 'selected' : ''}`}
                    style={{ background: colorMap[color] || '#555' }}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                  >
                    {selectedColor === color && <Star size={12} color={color === 'White' || color === 'Clear' ? 'black' : 'white'} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Surcharge Text field for customized prints */}
          <div className="customization-group selector-group">
            <span className="selector-label">
              Add Custom Name / Text <span className="label-note">(Optional)</span>
            </span>
            <input 
              type="text" 
              placeholder="e.g. John Doe 07"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="detail-custom-input"
            />
          </div>

          {/* Inventory and CTA Panel */}
          <div className="detail-checkout-row">
            <div className="qty-picker">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={isOutOfStock}>-</button>
              <span>{isOutOfStock ? 0 : quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} disabled={isOutOfStock}>+</button>
            </div>
            
            <button 
              className={`btn-primary add-cart-btn ${isOutOfStock ? 'disabled-btn' : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart size={18} /> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          <div className="secondary-checkout-row">
            <button 
              className={`btn-secondary detail-buy-btn ${isOutOfStock ? 'disabled-btn' : ''}`}
              onClick={handleBuyNow}
              disabled={isOutOfStock}
            >
              Buy It Now
            </button>

            {/* Launch Custom Printing Live Preview studio */}
            <Link to={`/customize/${product.slug || product.id}`} className="btn-primary customize-live-btn">
              <PenTool size={16} /> Design Customizer Studio
            </Link>
          </div>

          <div className="detail-stock-status">
            {!isOutOfStock ? (
              <span className="in-stock-label">● In Stock ({currentStock} items left)</span>
            ) : (
              <span className="out-stock-label">● Currently Out of Stock</span>
            )}
          </div>

          {/* D2C trust metrics list */}
          <div className="features-list">
            <div className="feature-item">
              <Truck size={20} color="var(--accent-cyan)" />
              <span>Free Delivery above ₹799 (3-7 days)</span>
            </div>
            <div className="feature-item">
              <Shield size={20} color="var(--accent-cyan)" />
              <span>100% Secure SSL Payment Gateways</span>
            </div>
            <div className="feature-item">
              <RotateCcw size={20} color="var(--accent-cyan)" />
              <span>Hassle-Free 7-Day Replacement Policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="detail-reviews-container glass">
        <div className="reviews-layout">
          {/* Left panel: Statistics and Form */}
          <div className="reviews-summary-column">
            <h2>Customer Reviews</h2>
            <div className="stat-score-row">
              <span className="big-score">{averageRating}</span>
              <div>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      size={18} 
                      fill={s <= Math.round(averageRating) ? "currentColor" : "none"} 
                      color="var(--accent-purple)" 
                    />
                  ))}
                </div>
                <span className="reviews-count-label">Based on {productReviews.length} Reviews</span>
              </div>
            </div>

            {/* Review form */}
            <form className="write-review-form" onSubmit={handleReviewSubmit}>
              <h3>Write a Review</h3>
              {reviewSuccess && (
                <div className="review-success-banner">
                  🎉 Review submitted successfully! It is pending moderator approval.
                </div>
              )}
              <div className="form-row">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  required 
                />
                <select 
                  value={reviewRating}
                  onChange={(e) => setReviewRating(parseInt(e.target.value))}
                >
                  <option value="5">5 Stars (Excellent)</option>
                  <option value="4">4 Stars (Very Good)</option>
                  <option value="3">3 Stars (Average)</option>
                  <option value="2">2 Stars (Poor)</option>
                  <option value="1">1 Star (Terrible)</option>
                </select>
              </div>
              <textarea 
                placeholder="Share your experience with print details, fabrics, and fit..." 
                rows="4"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                required
              ></textarea>
              <button type="submit" className="btn-primary submit-review-btn">
                Submit Moderated Review
              </button>
            </form>
          </div>

          {/* Right panel: Reviews list */}
          <div className="reviews-feed-column">
            {productReviews.length > 0 ? (
              <div className="reviews-scroll-feed">
                {productReviews.map((rev) => (
                  <div key={rev._id || rev.id} className="review-card glass">
                    <div className="rev-card-header">
                      <h4>{rev.name}</h4>
                      <span className="rev-date">
                        {new Date(rev.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </span>
                    </div>
                    <div className="stars" style={{ margin: '4px 0 10px 0' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          size={14} 
                          fill={s <= rev.rating ? "currentColor" : "none"} 
                          color="var(--accent-purple)" 
                        />
                      ))}
                    </div>
                    <p className="rev-comment">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-reviews glass">
                <Sparkles size={32} color="var(--accent-cyan)" />
                <h4>No Public Reviews Yet</h4>
                <p>Be the first to share your printing custom design review!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recently Viewed Products Widget */}
      {recentlyViewed.length > 1 && (
        <div className="recently-viewed-section">
          <h2 className="section-title">Recently Viewed</h2>
          <div className="recent-viewed-grid">
            {recentlyViewed
              .filter(p => p.id !== product.id)
              .slice(0, 4)
              .map(p => (
                <ProductCard key={p.id || p._id} product={p} />
              ))}
          </div>
        </div>
      )}

      {/* Sticky Add to Cart (Mobile bottom panel) */}
      <div className="mobile-sticky-action-bar glass">
        <div className="sticky-info-wrap">
          <span className="sticky-title">{product.name}</span>
          <span className="sticky-price">₹{product.price.toFixed(2)}</span>
        </div>
        <button 
          className="btn-primary sticky-add-btn"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'Sold Out' : 'Add'}
        </button>
      </div>

    </div>
  );
};

export default ProductDetail;
