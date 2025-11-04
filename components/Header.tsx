import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-40 py-3">
      <div className="container mx-auto flex justify-between items-center px-4">
        <a href="/" className="flex items-center space-x-2">
          <img src="img/logo.jpg" alt="AP Taekwondo Logo" className="h-10 w-auto" />
          <span className="font-montserrat font-bold text-xl text-primary">AP Taekwondo</span>
        </a>
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li><a href="/" className="text-gray-700 hover:text-primary transition-colors duration-200">Home</a></li>
            <li><a href="/about" className="text-gray-700 hover:text-primary transition-colors duration-200">About</a></li>
            <li><a href="/events" className="text-gray-700 hover:text-primary transition-colors duration-200">Events</a></li>
            <li><a href="/gallery" className="text-gray-700 hover:text-primary transition-colors duration-200">Gallery</a></li>
            <li><a href="/contact" className="text-gray-700 hover:text-primary transition-colors duration-200">Contact</a></li>
          </ul>
        </nav>
        <button className="md:hidden text-2xl text-gray-700 hover:text-primary">
          <i className="bi bi-list"></i>
        </button>
      </div>
    </header>
  );
};