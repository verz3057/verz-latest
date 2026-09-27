import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

// Enriched Seed Products for Client-side fallback
const initialLocalProducts = [
  {
    id: 1,
    slug: "cyber-neon-t-shirt",
    name: "Cyber Neon T-Shirt",
    category: "tshirts",
    price: 499.00,
    originalPrice: 699.00,
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600",
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=600"
    ],
    description: "Premium cotton t-shirt with cyberpunk inspired neon print. Pre-shrunk, soft fabric.",
    stock: 15,
    variants: [
      { size: "S", color: "Black", stock: 3 },
      { size: "M", color: "Black", stock: 5 },
      { size: "L", color: "Black", stock: 4 },
      { size: "XL", color: "Black", stock: 2 },
      { size: "XXL", color: "Black", stock: 1 }
    ],
    inStock: true
  },
  {
    id: 2,
    slug: "glitch-art-hoodie",
    name: "Glitch Art Hoodie",
    category: "tshirts",
    price: 499.00,
    originalPrice: 799.00,
    badge: "Trending",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=600"
    ],
    description: "Comfortable hoodie featuring custom glitch art style printing, warm inner lining.",
    stock: 8,
    variants: [
      { size: "S", color: "Black", stock: 2 },
      { size: "M", color: "Black", stock: 2 },
      { size: "L", color: "Black", stock: 2 },
      { size: "XL", color: "Black", stock: 2 },
      { size: "XXL", color: "Black", stock: 0 }
    ],
    inStock: true
  },
  {
    id: 4,
    slug: "void-black-custom-mug",
    name: "Void Black Custom Mug",
    category: "cups",
    price: 499.00,
    originalPrice: 599.00,
    badge: "Limited Stock",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600",
    images: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1539223470305-1823002ba09d?auto=format&fit=crop&q=80&w=600"
    ],
    description: "Matte black ceramic mug with custom logo print option, heat-resistant grip.",
    stock: 50,
    variants: [
      { size: null, color: "Black", stock: 50 }
    ],
    inStock: true
  },
  {
    id: 5,
    slug: "neon-glow-water-bottle",
    name: "Neon Glow Water Bottle",
    category: "bottles",
    price: 499.00,
    originalPrice: 749.00,
    badge: "Hot Deal",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600",
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1618506464199-a17af17f9014?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=600"
    ],
    description: "Insulated stainless steel bottle, keeps drinks cold for 24h or hot for 12h.",
    stock: 25,
    variants: [
      { size: null, color: "Silver", stock: 15 },
      { size: null, color: "Black", stock: 10 }
    ],
    inStock: true
  },
  {
    id: 7,
    slug: "itachi-uchiha-akatsuki-desk-mat",
    name: "Itachi Uchiha Akatsuki Desk Mat",
    category: "mousepads",
    price: 499.00,
    originalPrice: 699.00,
    badge: "Best Seller",
    image: "/products/mousepad3.jpeg",
    images: [
      "/products/mousepad3.jpeg",
      "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1632292224971-0d45778bd364?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600"
    ],
    description: "High-quality anime gaming mousepad featuring Itachi Uchiha. Ultra smooth tracking, anti-fray stitched edges.",
    stock: 20,
    variants: [
      { size: null, color: "Red", stock: 20 }
    ],
    inStock: true
  },
  {
    id: 8,
    slug: "blue-lock-discipline-gaming-mousepad",
    name: "Blue Lock Discipline Gaming Mousepad",
    category: "mousepads",
    price: 499.00,
    originalPrice: 699.00,
    badge: "New Arrival",
    image: "/products/mousepad4.jpeg",
    images: [
      "/products/mousepad4.jpeg",
      "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1632292224971-0d45778bd364?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600"
    ],
    description: "Premium gaming mousepad with glowing discipline graphic. Non-slip rubber base.",
    stock: 20,
    variants: [
      { size: null, color: "Blue", stock: 20 }
    ],
    inStock: true
  },
  {
    id: 15,
    slug: "cute-panda-glass-mug",
    name: "Cute Panda Glass Mug",
    category: "cups",
    price: 249.00,
    originalPrice: 399.00,
    badge: "Trending",
    image: "/products/cups.jpeg",
    images: [
      "/products/cups.jpeg",
      "/products/cupss.jpeg",
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600"
    ],
    description: "Adorable transparent glass mug featuring a sitting panda with bamboo. Made of high borosilicate glass.",
    stock: 20,
    variants: [
      { size: null, color: "Clear", stock: 20 }
    ],
    inStock: true
  },
  {
    id: 16,
    slug: "deadpool-custom-white-bottle",
    name: "Deadpool Custom White Bottle",
    category: "bottles",
    price: 419.00,
    originalPrice: 599.00,
    badge: "Best Seller",
    image: "/products/deadphool.jpeg",
    images: [
      "/products/deadphool.jpeg",
      "/products/deadphooll.jpeg",
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&q=80&w=600"
    ],
    description: "Premium white metal water bottle featuring Deadpool mask with swords. Spill-proof cap, light-weight.",
    stock: 20,
    variants: [
      { size: null, color: "White", stock: 20 }
    ],
    inStock: true
  }
];

// Initial Banners
const initialBanners = [
  {
    category: "tshirts",
    title: "Printed T-Shirts",
    subtitle: "Premium Cotton Collection",
    offerText: "BUY ANY 3 T-SHIRTS FOR ₹1199",
    buttonText: "Shop Collection",
    buttonLink: "/shop?category=tshirts",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200"
  },
  {
    category: "cups",
    title: "Custom Cups",
    subtitle: "Premium Custom Printed Mugs",
    offerText: "CUSTOM PRINTED MUGS STARTING AT ₹199",
    buttonText: "Shop Collection",
    buttonLink: "/shop?category=cups",
    image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&q=80&w=1200"
  },
  {
    category: "bottles",
    title: "Water Bottles",
    subtitle: "Custom Engraved & Insulated Bottles",
    offerText: "CUSTOM BOTTLES STARTING AT ₹299",
    buttonText: "Shop Collection",
    buttonLink: "/shop?category=bottles",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&q=80&w=1200"
  },
  {
    category: "mousepads",
    title: "Gaming Mousepads",
    subtitle: "Professional Smooth Desk Mats",
    offerText: "PREMIUM GAMING MOUSEPADS STARTING AT ₹399",
    buttonText: "Shop Collection",
    buttonLink: "/shop?category=mousepads",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200"
  }
];

// Seed Reviews
const initialLocalReviews = [
  { id: "rev-1", productId: 1, name: "Rahul Sharma", rating: 5, comment: "Amazing print quality and fabric quality.", date: "2026-06-11T12:00:00Z", approved: true },
  { id: "rev-2", productId: 1, name: "Sneha Patel", rating: 4, comment: "Great fit! Colors are extremely bright. Will order again.", date: "2026-06-10T10:00:00Z", approved: true },
  { id: "rev-3", productId: 2, name: "Aditya Roy", rating: 5, comment: "Glitch print is insane! The hoodie is soft and comfortable.", date: "2026-06-08T09:00:00Z", approved: true },
  { id: "rev-4", productId: 4, name: "Priya Das", rating: 4, comment: "Mug looks premium. Customizable options worked easily.", date: "2026-06-07T14:30:00Z", approved: true },
  { id: "rev-5", productId: 7, name: "Kunal Sen", rating: 5, comment: "Stitched borders are perfect. Mouse moves like butter.", date: "2026-06-06T18:00:00Z", approved: true }
];

// Seed Coupons
const initialLocalCoupons = [
  { id: "c-1", code: "WELCOME10", discountType: "percentage", discountValue: 10, expiryDate: "2026-12-31" },
  { id: "c-2", code: "SAVE20", discountType: "percentage", discountValue: 20, expiryDate: "2026-12-31" },
  { id: "c-3", code: "FLAT150", discountType: "fixed", discountValue: 150, expiryDate: "2026-12-31" }
];

const BACKEND_URL = 'http://localhost:5000/api';

export const StoreProvider = ({ children }) => {
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [banners, setBanners] = useState([]);
  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 799,
    shippingCharge: 99,
    estimatedDeliveryDays: '3-7 Days'
  });
  const [coupons, setCoupons] = useState([]);
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    const saved = localStorage.getItem('recentlyViewed');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Local Orders list (for offline simulation)
  const [localOrders, setLocalOrders] = useState(() => {
    const saved = localStorage.getItem('localOrders');
    return saved ? JSON.parse(saved) : [];
  });

  // Verify backend status and load initial state
  useEffect(() => {
    const initStore = async () => {
      try {
        const testRes = await fetch(`${BACKEND_URL}/products?category=all`, { method: 'GET' });
        if (testRes.ok) {
          setIsBackendOnline(true);
          console.log('✅ Connected to MongoDB Backend Server successfully.');
          
          // Load DB products
          const prodData = await testRes.json();
          setProducts(prodData);

          // Load DB banners
          const banRes = await fetch(`${BACKEND_URL}/settings/banners`);
          if (banRes.ok) setBanners(await banRes.ok ? await banRes.json() : initialBanners);

          // Load DB shipping settings
          const shipRes = await fetch(`${BACKEND_URL}/settings/shipping`);
          if (shipRes.ok) setShippingSettings(await shipRes.json());

          // Load DB reviews
          const token = localStorage.getItem('token');
          if (token) {
            const revRes = await fetch(`${BACKEND_URL}/reviews`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (revRes.ok) setReviews(await revRes.json());
            
            const coupRes = await fetch(`${BACKEND_URL}/coupons`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (coupRes.ok) setCoupons(await coupRes.json());
          } else {
            // Fetch public approved reviews
            const revRes = await fetch(`${BACKEND_URL}/reviews`);
            if (revRes.ok) setReviews(await revRes.json());
          }
        } else {
          loadOfflineFallback();
        }
      } catch (err) {
        console.warn('⚠️ MongoDB Backend Server offline. Falling back to local offline state.');
        loadOfflineFallback();
      }
    };

    const loadOfflineFallback = () => {
      setIsBackendOnline(false);
      
      const localProds = localStorage.getItem('localProducts');
      const localRevs = localStorage.getItem('localReviews');
      const localBans = localStorage.getItem('localBanners');
      const localCoups = localStorage.getItem('localCoupons');
      const localShip = localStorage.getItem('localShipping');

      const parsedProds = localProds ? JSON.parse(localProds) : null;
      setProducts(parsedProds && parsedProds.length > 0 ? parsedProds : initialLocalProducts);

      const parsedRevs = localRevs ? JSON.parse(localRevs) : null;
      setReviews(parsedRevs && parsedRevs.length > 0 ? parsedRevs : initialLocalReviews);

      const parsedBans = localBans ? JSON.parse(localBans) : null;
      setBanners(parsedBans && parsedBans.length > 0 ? parsedBans : initialBanners);

      const parsedCoups = localCoups ? JSON.parse(localCoups) : null;
      setCoupons(parsedCoups && parsedCoups.length > 0 ? parsedCoups : initialLocalCoupons);
      
      if (localShip) setShippingSettings(JSON.parse(localShip));
    };

    initStore();
  }, []);

  // Persist local state whenever changed (for offline backup)
  useEffect(() => {
    if (!isBackendOnline && products.length > 0) {
      localStorage.setItem('localProducts', JSON.stringify(products));
    }
  }, [products, isBackendOnline]);

  useEffect(() => {
    if (!isBackendOnline) {
      localStorage.setItem('localReviews', JSON.stringify(reviews));
    }
  }, [reviews, isBackendOnline]);

  useEffect(() => {
    if (!isBackendOnline) {
      localStorage.setItem('localBanners', JSON.stringify(banners));
    }
  }, [banners, isBackendOnline]);

  useEffect(() => {
    if (!isBackendOnline) {
      localStorage.setItem('localCoupons', JSON.stringify(coupons));
    }
  }, [coupons, isBackendOnline]);

  useEffect(() => {
    localStorage.setItem('localShipping', JSON.stringify(shippingSettings));
  }, [shippingSettings]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem('localOrders', JSON.stringify(localOrders));
  }, [localOrders]);

  // Dynamic Slug Generator
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Image WebP compression utility
  const optimizeAndCompressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // WebP output under 500KB
          const dataUrl = canvas.toDataURL('image/webp', 0.6);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Product CRUD
  const addProduct = async (productData) => {
    const productSlug = generateSlug(productData.name);
    const enrichedProduct = {
      ...productData,
      slug: productSlug,
      inStock: productData.stock > 0
    };

    if (isBackendOnline) {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${BACKEND_URL}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(enrichedProduct)
        });
        if (res.ok) {
          const data = await res.json();
          setProducts(prev => [...prev, data.product]);
          return true;
        }
      } catch (err) {
        console.error('API call failed, saving locally:', err);
      }
    }

    // Local fallback
    const id = products.length > 0 ? Math.max(...products.map(p => p.id || 0)) + 1 : 1;
    const localProd = { ...enrichedProduct, id, _id: `local-prod-${id}` };
    setProducts(prev => [...prev, localProd]);
    return true;
  };

  const updateProduct = async (id, productData) => {
    const productSlug = productData.name ? generateSlug(productData.name) : undefined;
    const updatedFields = {
      ...productData,
      ...(productSlug && { slug: productSlug }),
      inStock: productData.stock > 0
    };

    if (isBackendOnline) {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${BACKEND_URL}/products/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedFields)
        });
        if (res.ok) {
          const data = await res.json();
          setProducts(prev => prev.map(p => p._id === id ? data.product : p));
          return true;
        }
      } catch (err) {
        console.error('API update failed, saving locally:', err);
      }
    }

    // Local fallback
    setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? { ...p, ...updatedFields } : p));
    return true;
  };

  const deleteProduct = async (id) => {
    if (isBackendOnline) {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${BACKEND_URL}/products/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setProducts(prev => prev.filter(p => p._id !== id));
          return true;
        }
      } catch (err) {
        console.error('API delete failed, saving locally:', err);
      }
    }

    // Local fallback
    setProducts(prev => prev.filter(p => p._id !== id && p.id !== id));
    return true;
  };

  // Wishlist Actions
  const addToWishlist = (product) => {
    if (!wishlist.some(item => item.id === product.id)) {
      setWishlist(prev => [...prev, product]);
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  // Recently Viewed
  const addToRecentlyViewed = (product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [product, ...filtered].slice(0, 4); // Limit to 4 items
    });
  };

  // Reviews CRUD & Approval
  const addReview = async (productId, reviewData) => {
    const enrichedReview = {
      productId,
      name: reviewData.name,
      rating: reviewData.rating,
      comment: reviewData.comment,
      date: new Date().toISOString(),
      approved: reviewData.approved || false // default unapproved
    };

    if (isBackendOnline) {
      try {
        const res = await fetch(`${BACKEND_URL}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(enrichedReview)
        });
        if (res.ok) {
          const data = await res.json();
          // Reload reviews
          const allRes = await fetch(`${BACKEND_URL}/reviews`);
          if (allRes.ok) setReviews(await allRes.json());
          return true;
        }
      } catch (err) {
        console.error('API reviews post failed:', err);
      }
    }

    // Local fallback
    const id = `rev-${reviews.length + 1}`;
    setReviews(prev => [{ ...enrichedReview, id }, ...prev]);
    return true;
  };

  const approveReview = async (reviewId) => {
    if (isBackendOnline) {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${BACKEND_URL}/reviews/${reviewId}/approve`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, approved: true } : r));
          return true;
        }
      } catch (err) {
        console.error('API review approval failed:', err);
      }
    }

    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, approved: true } : r));
    return true;
  };

  const rejectReview = async (reviewId) => {
    if (isBackendOnline) {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${BACKEND_URL}/reviews/${reviewId}/reject`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, approved: false } : r));
          return true;
        }
      } catch (err) {
        console.error('API review rejection failed:', err);
      }
    }

    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, approved: false } : r));
    return true;
  };

  const deleteReview = async (reviewId) => {
    if (isBackendOnline) {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${BACKEND_URL}/reviews/${reviewId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setReviews(prev => prev.filter(r => r._id !== reviewId));
          return true;
        }
      } catch (err) {
        console.error('API review deletion failed:', err);
      }
    }

    setReviews(prev => prev.filter(r => r.id !== reviewId && r._id !== reviewId));
    return true;
  };

  // Coupons CRUD
  const addCoupon = async (couponData) => {
    if (isBackendOnline) {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${BACKEND_URL}/coupons`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(couponData)
        });
        if (res.ok) {
          const data = await res.json();
          setCoupons(prev => [...prev, data.coupon]);
          return true;
        }
      } catch (err) {
        console.error(err);
      }
    }

    const id = `c-${coupons.length + 1}`;
    setCoupons(prev => [...prev, { ...couponData, id }]);
    return true;
  };

  const editCoupon = async (couponId, couponData) => {
    if (isBackendOnline) {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${BACKEND_URL}/coupons/${couponId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(couponData)
        });
        if (res.ok) {
          const data = await res.json();
          setCoupons(prev => prev.map(c => c._id === couponId ? data.coupon : c));
          return true;
        }
      } catch (err) {
        console.error(err);
      }
    }

    setCoupons(prev => prev.map(c => (c.id === couponId || c._id === couponId) ? { ...c, ...couponData } : c));
    return true;
  };

  const deleteCoupon = async (couponId) => {
    if (isBackendOnline) {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${BACKEND_URL}/coupons/${couponId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setCoupons(prev => prev.filter(c => c._id !== couponId));
          return true;
        }
      } catch (err) {
        console.error(err);
      }
    }

    setCoupons(prev => prev.filter(c => c.id !== couponId && c._id !== couponId));
    return true;
  };

  const validateCoupon = async (code) => {
    if (isBackendOnline) {
      try {
        const res = await fetch(`${BACKEND_URL}/coupons/validate/${code}`);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Local validation
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (coupon) {
      if (new Date(coupon.expiryDate) >= new Date()) {
        return {
          success: true,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue
        };
      }
    }
    return { success: false, message: 'Invalid or expired coupon code' };
  };

  // Category Banners CRUD
  const updateCategoryBanner = async (category, bannerData) => {
    if (isBackendOnline) {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${BACKEND_URL}/settings/banners/${category}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(bannerData)
        });
        if (res.ok) {
          const data = await res.json();
          setBanners(prev => prev.map(b => b.category === category ? data.banner : b));
          return true;
        }
      } catch (err) {
        console.error(err);
      }
    }

    setBanners(prev => prev.map(b => b.category === category ? { ...b, ...bannerData } : b));
    return true;
  };

  // Shipping settings CRUD
  const updateShippingSettings = async (settingsData) => {
    if (isBackendOnline) {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${BACKEND_URL}/settings/shipping`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(settingsData)
        });
        if (res.ok) {
          const data = await res.json();
          setShippingSettings(data.settings);
          return true;
        }
      } catch (err) {
        console.error(err);
      }
    }

    setShippingSettings(settingsData);
    return true;
  };

  // Simulate place order (offline)
  const placeMockOrder = (orderData) => {
    const orderId = `vz_${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = {
      _id: `mock-ord-${Date.now()}`,
      razorpayOrderId: orderId,
      user: JSON.parse(localStorage.getItem('user')) || { name: 'Guest User', email: 'guest@example.com' },
      items: orderData.items,
      amount: orderData.amount,
      discountAmount: orderData.discountAmount || 0,
      shippingCharge: orderData.shippingCharge || 0,
      couponApplied: orderData.couponApplied,
      status: 'confirmed',
      paymentStatus: 'paid',
      shippingAddress: orderData.shippingAddress,
      shippingInfo: {
        courierCompany: 'Express Delivery Services',
        trackingNumber: `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`,
        dispatchDate: new Date().toISOString(),
        estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      timeline: [
        { status: 'pending', note: 'Order initiated', timestamp: new Date().toISOString() },
        { status: 'confirmed', note: 'Order payment successfully completed', timestamp: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString()
    };

    setLocalOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateMockOrderStatus = (orderId, status, note) => {
    setLocalOrders(prev => prev.map(o => {
      if (o._id === orderId || o.razorpayOrderId === orderId) {
        const updatedTimeline = [...o.timeline, { status, note: note || `Status updated to ${status}`, timestamp: new Date().toISOString() }];
        
        let paymentStatus = o.paymentStatus;
        if (status === 'delivered') paymentStatus = 'paid';
        if (status === 'refunded') paymentStatus = 'refunded';
        if (status === 'cancelled' && o.paymentStatus === 'paid') paymentStatus = 'refunded';

        return { ...o, status, paymentStatus, timeline: updatedTimeline };
      }
      return o;
    }));
  };

  const updateMockOrderShipping = (orderId, courier, tracking) => {
    setLocalOrders(prev => prev.map(o => {
      if (o._id === orderId || o.razorpayOrderId === orderId) {
        const timeline = [...o.timeline, { status: 'shipped', note: `Dispatched via ${courier} (Tracking: ${tracking})`, timestamp: new Date().toISOString() }];
        return {
          ...o,
          status: 'shipped',
          shippingInfo: {
            courierCompany: courier,
            trackingNumber: tracking,
            dispatchDate: new Date().toISOString(),
            estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          timeline
        };
      }
      return o;
    }));
  };

  // Dynamic values
  return (
    <StoreContext.Provider value={{
      isBackendOnline,
      products,
      reviews,
      banners,
      shippingSettings,
      coupons,
      wishlist,
      recentlyViewed,
      localOrders,
      
      // Methods
      addProduct,
      updateProduct,
      deleteProduct,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      addToRecentlyViewed,
      addReview,
      approveReview,
      rejectReview,
      deleteReview,
      addCoupon,
      editCoupon,
      deleteCoupon,
      validateCoupon,
      updateCategoryBanner,
      updateShippingSettings,
      optimizeAndCompressImage,
      
      // Offline helpers
      placeMockOrder,
      updateMockOrderStatus,
      updateMockOrderShipping
    }}>
      {children}
    </StoreContext.Provider>
  );
};
