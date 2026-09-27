import React from 'react';

const FAQ = () => {
  const faqs = [
    { q: "How long does shipping take?", a: "Standard shipping takes 5-7 business days. Express options are available at checkout." },
    { q: "What is your return policy?", a: "We accept returns within 30 days for unwashed, unused items. Custom print items are final sale unless defective." },
    { q: "How does the custom printing process work?", a: "You can upload your own design on the product page or request basic text customization. We use high-grade sublimation and DTG printing." },
    { q: "Do you ship internationally?", a: "Yes! We ship worldwide. International delivery times vary by destination." },
    { q: "How can I track my order?", a: "Once your order ships, you will receive an email with a tracking link." }
  ];

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '4rem', maxWidth: '800px' }}>
      <h1 className="neon-text-cyan" style={{ fontSize: '3rem', marginBottom: '2rem', textAlign: 'center' }}>Frequently Asked Questions</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {faqs.map((faq, index) => (
          <div key={index} className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{faq.q}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default FAQ;
