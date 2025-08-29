import React, { useState, useEffect } from 'react';
import NewsletterPopup from './NewsletterPopup';

export const NewsletterPopupTrigger = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Check if user has already seen the popup today
    const hasSeenToday = localStorage.getItem('newsletter-popup-seen-today');
    const today = new Date().toDateString();
    
    if (hasSeenToday !== today) {
      // Show popup after 3 seconds delay
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false);
    // Mark as seen for today
    const today = new Date().toDateString();
    localStorage.setItem('newsletter-popup-seen-today', today);
  };

  return (
    <NewsletterPopup 
      isOpen={showPopup} 
      onClose={handleClosePopup} 
    />
  );
};

export default NewsletterPopupTrigger;