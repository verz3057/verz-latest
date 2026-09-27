import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Legal from './pages/Legal';
import Login from './pages/Login';
import Wishlist from './pages/Wishlist';
import Customizer from './pages/Customizer';
import AdminDashboard from './pages/AdminDashboard';
import MyOrders from './pages/MyOrders';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <StoreProvider>
          <CartProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/product/id/:id" element={<ProductDetail />} /> {/* Fallback numeric routing */}
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/customize/:slug" element={<Customizer />} />
                  <Route path="/my-orders" element={<MyOrders />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/legal" element={<Legal />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </CartProvider>
        </StoreProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
