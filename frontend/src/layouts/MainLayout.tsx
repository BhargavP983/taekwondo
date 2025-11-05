import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const MainLayout: React.FC = () => {
  const [isSticky, setIsSticky] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show Header/Footer on auth pages
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header isSticky={isSticky} />
      
      {/* Add padding-top to prevent content from going behind header */}
      <main className="flex-grow pt-20 lg:pt-24">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};
