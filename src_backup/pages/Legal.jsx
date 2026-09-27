import React from 'react';

const Legal = () => {
  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '4rem', maxWidth: '900px' }}>
      <h1 className="neon-text-cyan" style={{ fontSize: '3rem', marginBottom: '3rem', textAlign: 'center' }}>Legal Information</h1>
      
      <div className="glass" style={{ padding: '3rem', borderRadius: '12px', marginBottom: '2rem' }} id="privacy">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-purple)' }}>Privacy Policy</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>We value your privacy. Your data is collected only for order processing and internal analytics. We never sell your personal information to third parties.</p>
      </div>

      <div className="glass" style={{ padding: '3rem', borderRadius: '12px', marginBottom: '2rem' }} id="terms">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-purple)' }}>Terms & Conditions</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>By using the VERZ website, you agree to our terms of service. All designs uploaded for custom printing must be your own intellectual property or used with explicit permission.</p>
      </div>

      <div className="glass" style={{ padding: '3rem', borderRadius: '12px', marginBottom: '2rem' }} id="refunds">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-purple)' }}>Refund Policy</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>Refunds are issued to the original payment method within 5-10 business days of receiving the returned item. Custom items are non-refundable unless damaged upon arrival.</p>
      </div>
    </div>
  );
};
export default Legal;
