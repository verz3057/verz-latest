import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
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
        const { data, error } = await supabase.auth.signUp({
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
        setFormData({ name: '', email: formData.email, password: '' });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        
        authLogin(data.user, data.session.access_token);
        alert(`Logged in successfully!`);
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
      <div className="login-container glass">
        <h2 style={{ color: 'white', WebkitTextStroke: '1.5px black', textShadow: 'none' }}>
          {isRegistering ? 'Sign Up' : 'Welcome Back'}
        </h2>
        <p className="login-subtitle">
          {isRegistering 
            ? 'Join the elite gaming community today.' 
            : 'Enter your credentials to access your account.'}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="John Doe" 
                required 
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="you@example.com" 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="••••••••" 
              required 
            />
          </div>

          {!isRegistering && (
            <div className="forgot-password">
              <a href="#">Forgot your password?</a>
            </div>
          )}

          <button type="submit" className="btn-primary login-btn bw-theme">
            {isRegistering ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div className="social-login-divider">
          Or continue with
        </div>

        <div className="social-login-grid">
          <button className="social-btn" type="button">
            <div className="icon-wrapper">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            Google
          </button>

          <button className="social-btn" type="button">
            <div className="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="black" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-apple"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 3 0 .5-.1 1-.5 1-1-.5-2-2-2-3 0-.5.1-1 .5-1Z"/></svg>
            </div>
            Apple
          </button>

          <button className="social-btn" type="button">
            <div className="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1877F2" stroke="#1877F2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </div>
            Facebook
          </button>

          <button className="social-btn" type="button">
            <div className="icon-wrapper" style={{background: '#5865F2'}}>
              <svg width="24" height="24" viewBox="0 0 127.14 96.36" fill="white">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.58,67.58,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
            </div>
            Discord
          </button>
        </div>

        <div className="login-footer">
          <p>
            {isRegistering ? 'Already have an account?' : "Don't have an account yet?"}
            <span 
              className="toggle-mode" 
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? ' Log In' : ' Sign Up'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
