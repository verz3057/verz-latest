import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Search, Check, X, Filter, ShoppingCart, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import './Shop.css';

const Shop = () => {
  const { products, banners, shippingSettings } = useStore();
  const { addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewSize, setQuickViewSize] = useState('M');
  const [quickViewColor, setQuickViewColor] = useState('Black');
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [quickViewImageIndex, setQuickViewImageIndex] = useState(0);

  // Extract category query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryQuery = params.get('category');
    if (categoryQuery) {
      setActiveCategory(categoryQuery);
    } else {
      setActiveCategory('all');
    }
  }, [location.search]);

  // Find max product price in list to initialize the slider max bounds
  const absoluteMaxPrice = useMemo(() => {
    if (products.length === 0) return 1000;
    return Math.max(...products.map(p => p.price));
  }, [products]);

  useEffect(() => {
    setMaxPrice(absoluteMaxPrice);
  }, [absoluteMaxPrice]);

  // Get active Category Banner details
  const activeBanner = useMemo(() => {
    if (activeCategory === 'all') return null;
    return banners.find(b => b.category === activeCategory) || null;
  }, [activeCategory, banners]);

  // Filter products list based on search query and sidebar options
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 1. Category Filter
      if (activeCategory !== 'all' && product.category !== activeCategory) {
        return false;
      }

      // 2. Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesCategory = product.category.toLowerCase().includes(query);
        const matchesDesc = product.description && product.description.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesDesc) {
          return false;
        }
      }

      // 3. Price Filter
      if (product.price > maxPrice) {
        return false;
      }

      // 4. Availability
      if (showInStockOnly && !product.inStock) {
        return false;
      }

      // 5. Sizes Filter (applies only to products with variants)
      if (selectedSizes.length > 0) {
        const productHasSize = product.variants && product.variants.some(
          v => v.size && selectedSizes.includes(v.size) && v.stock > 0
        );
        if (!productHasSize) return false;
      }

      // 6. Colors Filter (applies to products with variants matching selected colors)
      if (selectedColors.length > 0) {
        const productHasColor = product.variants && product.variants.some(
          v => v.color && selectedColors.includes(v.color) && v.stock > 0
        );
        if (!productHasColor) return false;
      }

      return true;
    });
  }, [products, activeCategory, searchQuery, maxPrice, showInStockOnly, selectedSizes, selectedColors]);

  // Available Filter Options across products
  const filterOptions = useMemo(() => {
    const colors = new Set();
    const sizes = new Set();
    products.forEach(p => {
      if (p.variants) {
        p.variants.forEach(v => {
          if (v.color) colors.add(v.color);
          if (v.size) sizes.add(v.size);
        });
      }
    });
    return {
      colors: Array.from(colors),
      sizes: Array.from(sizes)
    };
  }, [products]);

  // Colors Palette mapping
  const colorMap = {
    'Black': '#000000',
    'White': '#ffffff',
    'Red': '#ff003c',
    'Blue': '#0077ff',
    'Silver': '#c0c0c0',
    'Clear': 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.1))',
    'Green': '#00cc66'
  };

  const handleSizeToggle = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleColorToggle = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const resetFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setMaxPrice(absoluteMaxPrice);
    setShowInStockOnly(false);
    setSearchQuery('');
  };

  // Open Quick View Modal
  const handleOpenQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewQty(1);
    setQuickViewImageIndex(0);
    // Select default attributes if apparel
    if (product.category === 'tshirts') {
      const apparelSizes = product.variants.filter(v => v.size);
      if (apparelSizes.length > 0) setQuickViewSize(apparelSizes[0].size);
      
      const apparelColors = product.variants.filter(v => v.color);
      if (apparelColors.length > 0) setQuickViewColor(apparelColors[0].color);
    } else {
      setQuickViewSize(null);
      if (product.variants && product.variants.length > 0) {
        setQuickViewColor(product.variants[0].color);
      } else {
        setQuickViewColor(null);
      }
    }
  };

  const handleQuickViewAddToCart = () => {
    if (!quickViewProduct) return;
    
    // Find stock matching variant
    let selectedVariant = null;
    if (quickViewProduct.variants && quickViewProduct.variants.length > 0) {
      selectedVariant = quickViewProduct.variants.find(
        v => (!quickViewSize || v.size === quickViewSize) && (!quickViewColor || v.color === quickViewColor)
      );
    }

    const itemToAdd = {
      ...quickViewProduct,
      selectedSize: quickViewSize,
      selectedColor: quickViewColor,
      variantStock: selectedVariant ? selectedVariant.stock : quickViewProduct.stock
    };

    for (let i = 0; i < quickViewQty; i++) {
      addToCart(itemToAdd);
    }
    setQuickViewProduct(null);
  };

  // Highlight matches text helper
  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="highlight">{part}</mark> : part
    );
  };

  // Switch category programmatically
  const selectCategory = (category) => {
    setActiveCategory(category);
    navigate(`/shop?category=${category}`);
    setIsMobileFilterOpen(false);
  };

  return (
    <div className="shop-page container fade-in">
      
      {/* Category Landing Banner */}
      {activeBanner && (
        <div className="category-banner glass" style={{ backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.7), rgba(10, 10, 10, 0.75)), url(${activeBanner.image})` }}>
          <div className="category-banner-content">
            <span className="banner-offer">{activeBanner.offerText}</span>
            <h1 className="banner-title">{activeBanner.title}</h1>
            <p className="banner-subtitle">{activeBanner.subtitle}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
              {activeBanner.buttonText && (
                <a href={activeBanner.buttonLink || '#'} className="btn-primary banner-cta-btn">
                  {activeBanner.buttonText}
                </a>
              )}
              <Link to="/shop" className="btn-secondary" onClick={() => selectCategory('all')}>
                All Products
              </Link>
            </div>
          </div>
        </div>
      )}

      {!activeBanner && (
        <div className="shop-header">
          <h1>Explore Store</h1>
          <p>Discover premium printing designs for clothing, mug templates, and desk setups.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            <Link to="/shop" className="btn-primary" onClick={() => selectCategory('all')}>
              All Products
            </Link>
          </div>
        </div>
      )}

      {/* Live Search and Mobile Filters Trigger */}
      <div className="shop-toolbar glass">
        <div className="search-bar-wrapper">
          <Search size={20} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search custom t-shirts, mugs, water bottles, mousepads..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
              <X size={18} />
            </button>
          )}
        </div>
        
        <button 
          className="mobile-filter-trigger btn-secondary"
          onClick={() => setIsMobileFilterOpen(true)}
        >
          <Filter size={18} /> Filters
        </button>
      </div>

      <div className="shop-layout">
        
        {/* Desktop Sidebar Filters */}
        <aside className="shop-sidebar glass">
          <div className="filter-header">
            <h3>Filters</h3>
            <button className="reset-filter-btn" onClick={resetFilters}>Clear All</button>
          </div>

          {/* Category List */}
          <div className="filter-group">
            <h4>Categories</h4>
            <ul className="category-list">
              <li>
                <button className={activeCategory === 'all' ? 'active' : ''} onClick={() => selectCategory('all')}>
                  All Products
                </button>
              </li>
              <li>
                <button className={activeCategory === 'tshirts' ? 'active' : ''} onClick={() => selectCategory('tshirts')}>
                  Printed T-Shirts
                </button>
              </li>
              <li>
                <button className={activeCategory === 'cups' ? 'active' : ''} onClick={() => selectCategory('cups')}>
                  Custom Cups
                </button>
              </li>
              <li>
                <button className={activeCategory === 'bottles' ? 'active' : ''} onClick={() => selectCategory('bottles')}>
                  Water Bottles
                </button>
              </li>
              <li>
                <button className={activeCategory === 'mousepads' ? 'active' : ''} onClick={() => selectCategory('mousepads')}>
                  Gaming Mousepads
                </button>
              </li>
            </ul>
          </div>

          {/* Size Filter (Apparel only) */}
          {(activeCategory === 'tshirts' || activeCategory === 'all') && filterOptions.sizes.length > 0 && (
            <div className="filter-group">
              <h4>Select Size</h4>
              <div className="size-filter-grid">
                {['S', 'M', 'L', 'XL', 'XXL'].map(size => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button 
                      key={size}
                      className={`size-filter-badge ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSizeToggle(size)}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color Filter */}
          {filterOptions.colors.length > 0 && (
            <div className="filter-group">
              <h4>Select Color</h4>
              <div className="color-filter-grid">
                {filterOptions.colors.map(color => {
                  const isSelected = selectedColors.includes(color);
                  const isClear = color === 'Clear';
                  return (
                    <button 
                      key={color}
                      className={`color-circle-btn ${isSelected ? 'selected' : ''}`}
                      style={{ background: colorMap[color] || '#555' }}
                      onClick={() => handleColorToggle(color)}
                      title={color}
                    >
                      {isSelected && <Check size={14} color={isClear || color === 'White' ? 'black' : 'white'} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price Range Slider */}
          <div className="filter-group">
            <div className="price-label-row">
              <h4>Max Price</h4>
              <span className="price-val">₹{maxPrice}</span>
            </div>
            <input 
              type="range" 
              min={100} 
              max={absoluteMaxPrice} 
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="price-slider-input"
            />
            <div className="slider-bounds">
              <span>₹100</span>
              <span>₹{absoluteMaxPrice}</span>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="filter-group">
            <h4>Availability</h4>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={showInStockOnly}
                onChange={(e) => setShowInStockOnly(e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              In Stock Only
            </label>
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {isMobileFilterOpen && (
          <div className="mobile-filter-backdrop">
            <div className="mobile-filter-drawer glass fade-in">
              <div className="mobile-filter-header">
                <h3>Filter Options</h3>
                <button onClick={() => setIsMobileFilterOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="mobile-filter-body">
                {/* Categories */}
                <div className="filter-group">
                  <h4>Category</h4>
                  <div className="category-mobile-grid">
                    {['all', 'tshirts', 'cups', 'bottles', 'mousepads'].map(cat => (
                      <button 
                        key={cat} 
                        className={`cat-mobile-btn ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => selectCategory(cat)}
                      >
                        {cat === 'all' ? 'All Products' : cat === 'tshirts' ? 'T-Shirts' : cat === 'cups' ? 'Cups' : cat === 'bottles' ? 'Bottles' : 'Mousepads'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                {(activeCategory === 'tshirts' || activeCategory === 'all') && (
                  <div className="filter-group">
                    <h4>Size</h4>
                    <div className="size-filter-grid">
                      {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                        <button 
                          key={size}
                          className={`size-filter-badge ${selectedSizes.includes(size) ? 'selected' : ''}`}
                          onClick={() => handleSizeToggle(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color */}
                <div className="filter-group">
                  <h4>Color</h4>
                  <div className="color-filter-grid">
                    {filterOptions.colors.map(color => (
                      <button 
                        key={color}
                        className={`color-circle-btn ${selectedColors.includes(color) ? 'selected' : ''}`}
                        style={{ background: colorMap[color] || '#555' }}
                        onClick={() => handleColorToggle(color)}
                        title={color}
                      >
                        {selectedColors.includes(color) && <Check size={14} color={color === 'White' || color === 'Clear' ? 'black' : 'white'} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="filter-group">
                  <div className="price-label-row">
                    <h4>Max Price</h4>
                    <span className="price-val">₹{maxPrice}</span>
                  </div>
                  <input 
                    type="range" 
                    min={100} 
                    max={absoluteMaxPrice} 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="price-slider-input"
                  />
                </div>

                {/* Availability */}
                <div className="filter-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={showInStockOnly}
                      onChange={(e) => setShowInStockOnly(e.target.checked)}
                    />
                    <span className="checkbox-custom"></span>
                    In Stock Only
                  </label>
                </div>
              </div>

              <div className="mobile-filter-footer">
                <button className="btn-secondary" onClick={resetFilters}>Clear All</button>
                <button className="btn-primary" onClick={() => setIsMobileFilterOpen(false)}>Apply Filters</button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <main className="shop-grid-section">
          {filteredProducts.length > 0 ? (
            <div className="shop-grid">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id || product._id} 
                  product={product} 
                  onQuickView={handleOpenQuickView} 
                />
              ))}
            </div>
          ) : (
            <div className="no-products glass">
              <X size={48} color="var(--accent-purple)" />
              <h3>No Products Match Filters</h3>
              <p>Try resetting the price filters, search queries, colors, or sizing toggles.</p>
              <button className="btn-primary" onClick={resetFilters} style={{ marginTop: '1rem' }}>
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Quick View Modal Dialog */}
      {quickViewProduct && (
        <div className="quickview-backdrop" onClick={() => setQuickViewProduct(null)}>
          <div className="quickview-modal glass fade-in" onClick={(e) => e.stopPropagation()}>
            <button className="quickview-close-btn" onClick={() => setQuickViewProduct(null)}>
              <X size={24} />
            </button>
            
            <div className="quickview-layout">
              {/* Product Gallery (Left) */}
              <div className="quickview-gallery">
                <div className="qv-main-image glass">
                  <img 
                    src={quickViewProduct.images && quickViewProduct.images.length > 0 ? quickViewProduct.images[quickViewImageIndex] : quickViewProduct.image} 
                    alt={quickViewProduct.name} 
                  />
                </div>
                {quickViewProduct.images && quickViewProduct.images.length > 1 && (
                  <div className="qv-thumbnails">
                    {quickViewProduct.images.slice(0, 4).map((img, idx) => (
                      <div 
                        key={idx}
                        className={`qv-thumb glass ${quickViewImageIndex === idx ? 'active' : ''}`}
                        onClick={() => setQuickViewImageIndex(idx)}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info (Right) */}
              <div className="quickview-info">
                <span className="qv-category">{quickViewProduct.category}</span>
                <h2 className="qv-title">{quickViewProduct.name}</h2>
                
                <div className="qv-rating">
                  <Star size={16} fill="currentColor" color="var(--accent-purple)" />
                  <span className="score">4.8</span>
                  <span className="count">(Based on 24 Reviews)</span>
                </div>

                <div className="qv-price-row">
                  <span className="price">₹{quickViewProduct.price.toFixed(2)}</span>
                  {quickViewProduct.originalPrice && quickViewProduct.originalPrice > quickViewProduct.price && (
                    <span className="original-price">₹{quickViewProduct.originalPrice.toFixed(2)}</span>
                  )}
                </div>

                <p className="qv-description">{quickViewProduct.description}</p>

                {/* Sizing Selectors for Apparel */}
                {quickViewProduct.category === 'tshirts' && (
                  <div className="qv-selector-group">
                    <span className="label">Select Size</span>
                    <div className="qv-size-grid">
                      {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                        <button
                          key={size}
                          className={`qv-size-btn ${quickViewSize === size ? 'active' : ''}`}
                          onClick={() => setQuickViewSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors Selection */}
                {quickViewProduct.variants && quickViewProduct.variants.some(v => v.color) && (
                  <div className="qv-selector-group">
                    <span className="label">Select Color</span>
                    <div className="qv-color-grid">
                      {Array.from(new Set(quickViewProduct.variants.map(v => v.color).filter(Boolean))).map(color => (
                        <button
                          key={color}
                          className={`color-circle-btn qv-color-btn ${quickViewColor === color ? 'selected' : ''}`}
                          style={{ background: colorMap[color] || '#555' }}
                          onClick={() => setQuickViewColor(color)}
                          title={color}
                        >
                          {quickViewColor === color && <Check size={14} color={color === 'White' || color === 'Clear' ? 'black' : 'white'} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity and Checkout Row */}
                <div className="qv-checkout-row">
                  <div className="quantity-selector qv-qty">
                    <button onClick={() => setQuickViewQty(Math.max(1, quickViewQty - 1))}>-</button>
                    <span>{quickViewQty}</span>
                    <button onClick={() => setQuickViewQty(quickViewQty + 1)}>+</button>
                  </div>
                  
                  <button 
                    className="btn-primary qv-add-btn"
                    onClick={handleQuickViewAddToCart}
                  >
                    <ShoppingCart size={18} /> Add to Cart
                  </button>
                </div>

                <div className="qv-details-link">
                  <Link to={quickViewProduct.slug ? `/product/${quickViewProduct.slug}` : `/product/id/${quickViewProduct.id || quickViewProduct._id}`} onClick={() => setQuickViewProduct(null)}>
                    View Full Details & Live Preview Customizer →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
