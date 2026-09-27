import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.name,
            }
          }
        });

        if (error) throw error;

        alert(`Welcome to VERZ, ${formData.name}! Your account has been created.`);
        setIsRegistering(false);
        setShowPassword(false);
        setFormData({ name: '', email: formData.email, password: '' });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        authLogin(data.user, data.session.access_token);
        alert('Logged in successfully!');
        setShowPassword(false);
        setFormData({ name: '', email: '', password: '' });
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Authentication error connecting to Supabase.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <section className="login-brand-panel" aria-label="VERZ account benefits">
          <span className="login-kicker">VERZ Account</span>
          <h1>Custom prints, saved for your next drop.</h1>
          <p>Track orders, keep your wishlist close, and checkout faster when your next design is ready.</p>
          <div className="login-benefits">
            <span>Saved wishlist</span>
            <span>Order updates</span>
            <span>Faster checkout</span>
          </div>
        </section>

        <div className="login-container glass">
          <div className="login-heading">
            <span className="login-eyebrow">{isRegistering ? 'Create your profile' : 'Customer sign in'}</span>
            <h2>{isRegistering ? 'Create account' : 'Welcome back'}</h2>
            <p className="login-subtitle">
              {isRegistering
                ? 'Save your sizes, wishlist, and custom print orders in one place.'
                : 'Sign in to manage orders, wishlist items, and saved custom designs.'}
            </p>
          </div>

          <div className="social-login-grid" aria-label="Social sign in options">
            <button className="social-btn" type="button">
              <span className="icon-wrapper google-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
                </svg>
              </span>
              Google
            </button>

            <button className="social-btn" type="button">
              <span className="icon-wrapper facebook-icon" aria-hidden="true">f</span>
              Facebook
            </button>

            <button className="social-btn" type="button">
              <span className="icon-wrapper discord-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 127.14 96.36" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.58,67.58,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                </svg>
              </span>
              Discord
            </button>
          </div>

          <div className="social-login-divider">
            <span>or use email</span>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {isRegistering && (
              <div className="form-group">
                <label htmlFor="name">Full name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                maxLength={100}
                required
              />
            </div>

            <div className="form-group">
              <div className="password-label-row">
                <label htmlFor="password">Password</label>
                {!isRegistering && <a href="#">Forgot password?</a>}
              </div>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  maxLength={100}
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn">
              {isRegistering ? 'Create account' : 'Log in'}
            </button>
          </form>

          <div className="login-footer">
            <p>
              {isRegistering ? 'Already have an account?' : "Don't have an account yet?"}
              <button
                className="toggle-mode"
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering ? 'Log in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

