import React, { useState, useEffect, useCallback } from 'react';

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = useCallback(() => {
    if (window.scrollY > 100) { // Same threshold as original HTML
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <button
      className={`fixed bottom-8 right-8 z-50 transition-opacity duration-300
        ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title="Back to top"
      style={{
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(34, 41, 246, 0.7)', /* Using the primary blue from the new theme */
        borderRadius: '50%',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}
    >
      <svg width="30" height="30" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polyline className="arrow arrow-up" points="11,19 19,11 27,19" stroke="white" strokeWidth="3.5"
          strokeLinecap="round" strokeLinejoin="round" />
        <polyline className="arrow arrow-down" points="11,27 19,19 27,27" stroke="white" strokeWidth="3.5"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
};