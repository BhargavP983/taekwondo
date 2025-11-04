// Fix: Added a basic functional component for Header as the file was empty.
import React from 'react';

interface HeaderProps {
  isSticky: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isSticky }) => {
  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isSticky ? 'bg-white shadow-lg py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <a href="#" className="flex items-center space-x-2">
          <img src="img/logo.jpg" alt="AP Taekwondo Logo" className="h-10" />
          <span className={`font-montserrat font-bold text-xl ${isSticky ? 'text-dark' : 'text-white'}`}>
            AP Taekwondo
          </span>
        </a>

        {/* Navigation - simplified for now */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li>
              <a href="#heroCarousel" className={`font-montserrat font-medium ${isSticky ? 'text-dark' : 'text-white'} hover:text-primary transition-colors duration-200`}>Home</a>
            </li>
            <li>
              <a href="#about" className={`font-montserrat font-medium ${isSticky ? 'text-dark' : 'text-white'} hover:text-primary transition-colors duration-200`}>About</a>
            </li>
            <li>
              <a href="#objectives" className={`font-montserrat font-medium ${isSticky ? 'text-dark' : 'text-white'} hover:text-primary transition-colors duration-200`}>Objectives</a>
            </li>
            <li>
              <a href="#events" className={`font-montserrat font-medium ${isSticky ? 'text-dark' : 'text-white'} hover:text-primary transition-colors duration-200`}>Events</a>
            </li>
            <li>
              <a href="#results" className={`font-montserrat font-medium ${isSticky ? 'text-dark' : 'text-white'} hover:text-primary transition-colors duration-200`}>Results</a>
            </li>
            <li>
              <a href="#footer" className={`font-montserrat font-medium ${isSticky ? 'text-dark' : 'text-white'} hover:text-primary transition-colors duration-200`}>Contact</a>
            </li>
          </ul>
        </nav>

        {/* Mobile Menu Button - Placeholder */}
        <button className="md:hidden text-2xl" aria-label="Open menu">
          <i className={`bi bi-list ${isSticky ? 'text-dark' : 'text-white'}`}></i>
        </button>
      </div>
    </header>
  );
};