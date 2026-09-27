import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

function Profile() {
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    avatar_url: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setMessage('');

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setMessage('Please login first.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          avatar_url: data.avatar_url || '',
        });
      }
    } catch (error) {
      console.error('PROFILE FETCH ERROR:', error);
      setMessage('Unable to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage('');

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setMessage('Please login first.');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name.trim() || null,
          phone: profile.phone.trim() || null,
          avatar_url: profile.avatar_url.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage('Profile saved successfully!');
    } catch (error) {
      console.error('PROFILE UPDATE ERROR:', error);
      setMessage('Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '700px',
        margin: '60px auto',
        padding: '30px',
      }}
    >
      <h1>My Profile</h1>

      <p style={{ color: '#666', marginBottom: '30px' }}>
        Manage your personal information.
      </p>

      <form onSubmit={handleSave}>
        <div style={{ marginBottom: '20px' }}>
          <label>Full Name</label>

          <input
            type="text"
            name="full_name"
            value={profile.full_name}
            onChange={handleChange}
            placeholder="Enter your full name"
            style={{
              display: 'block',
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Phone</label>

          <input
            type="tel"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            style={{
              display: 'block',
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Avatar URL</label>

          <input
            type="url"
            name="avatar_url"
            value={profile.avatar_url}
            onChange={handleChange}
            placeholder="Enter profile image URL"
            style={{
              display: 'block',
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '12px 24px',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '20px' }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default Profile;