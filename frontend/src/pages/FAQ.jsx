import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

const faqData = [
  {
    question: "How do I get started with Khorlo?",
    answer: "Getting started is easy! Simply create an account, complete your onboarding profile to tell us about your brand or content style, and you can immediately start exploring active campaigns or creating your own."
  },
  {
    question: "Is Khorlo free to use?",
    answer: "Khorlo offers a free tier for creators to browse and apply to campaigns. Brands can post their first campaign for free, with premium features available for advanced targeting and analytics."
  },
  {
    question: "How does compensation work?",
    answer: "Compensation is handled directly between the brand and the creator based on the terms agreed upon during the application process. Khorlo currently tracks 'Paid', 'Free Product', and 'Hybrid' compensation types."
  },
  {
    question: "Can I connect multiple social media accounts?",
    answer: "Yes! During onboarding or in your Profile settings, you can connect your TikTok, Instagram, YouTube, and X (Twitter) accounts to showcase your full reach."
  },
  {
    question: "How do I edit my profile after onboarding?",
    answer: "You can update your niches, formats, social links, and basic info at any time by navigating to the 'Profile' section in the sidebar."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', minHeight: 'calc(100vh - 100px)' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(17,17,17,0.05)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem', border: '1px solid var(--glass-border)' }}>
          <MessageSquare size={32} color="var(--text-primary)" />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.02em' }}>Frequently Asked Questions</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
          Everything you need to know about Khorlo, campaigns, and getting the most out of the platform.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {faqData.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className="glass-panel faq-item"
              style={{ 
                padding: '0',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                border: isOpen ? '1px solid var(--accent)' : '1px solid var(--glass-border)'
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  // [Reason] Stop the parent glass-panel press shift from cancelling the accordion click
                  e.stopPropagation();
                  toggleAccordion(index);
                }}
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1.5rem', 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--text-primary)', 
                  fontSize: '1.125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span>{item.question}</span>
                {isOpen ? <ChevronUp size={20} color="var(--accent)" /> : <ChevronDown size={20} color="var(--text-secondary)" />}
              </button>
              
              <div 
                style={{ 
                  maxHeight: isOpen ? '500px' : '0', 
                  opacity: isOpen ? 1 : 0, 
                  transition: 'all 0.3s ease',
                  padding: isOpen ? '0 1.5rem 1.5rem 1.5rem' : '0 1.5rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6
                }}
              >
                {item.answer}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '4rem', textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--glass-border)' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Still have questions?</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>We're here to help you navigate the platform.</p>
        <button className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Contact Support</button>
      </div>
    </div>
  );
};

export default FAQ;
