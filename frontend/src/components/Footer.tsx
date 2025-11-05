import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-3 mt-5">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap -mx-4 pb-4">
          {/* ABOUT */}
          <div className="w-full md:w-4/12 px-4 mb-8 md:mb-0">
            <h5 className="font-bold text-xl mb-3 font-montserrat">A.P. Taekwondo Association</h5>
            <p className="text-sm text-gray-300 mb-4">
              Promoting Olympic values and developing Taekwondo across Andhra Pradesh, India. Proudly affiliated with World Taekwondo and TFI.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors duration-200" title="Facebook">
                <i className="bi bi-facebook text-lg"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors duration-200" title="Twitter">
                <i className="bi bi-twitter text-lg"></i>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors duration-200" title="YouTube">
                <i className="bi bi-youtube text-lg"></i>
              </a>
            </div>
          </div>
          {/* CATEGORIES */}
          <div className="w-full md:w-4/12 px-4 mb-8 md:mb-0">
            <h6 className="font-bold text-lg mb-3 font-montserrat">Categories</h6>
            <ul className="list-none p-0 text-sm text-gray-300">
              <li className="mb-2"><a href="/#events" className="hover:text-primary transition-colors duration-200">Events & Championships</a></li>
              <li className="mb-2"><Link to="/about" className="hover:text-primary transition-colors duration-200">About Taekwondo</Link></li>
              <li className="mb-2"><a href="#" className="hover:text-primary transition-colors duration-200">Club Registration</a></li>
              <li className="mb-2"><a href="#" className="hover:text-primary transition-colors duration-200">Athlete Registration</a></li>
              <li className="mb-2"><a href="/#results" className="hover:text-primary transition-colors duration-200">Results</a></li>
            </ul>
          </div>
          {/* QUICK LINKS */}
          <div className="w-full md:w-4/12 px-4">
            <h6 className="font-bold text-lg mb-3 font-montserrat">Quick Links</h6>
            <ul className="list-none p-0 text-sm text-gray-300">
              <li className="mb-2"><a href="/about" className="hover:text-primary transition-colors duration-200">About Us</a></li>
              <li className="mb-2"><Link to="/contact-us" className="hover:text-primary transition-colors duration-200">Contact</Link></li>
              <li className="mb-2"><Link to="/gallery" className="hover:text-primary transition-colors duration-200">Gallery</Link></li>
              <li className="mb-2"><Link to="/login" className="hover:text-primary transition-colors duration-200">Login</Link></li>
              <li className="mb-2"><a href="#" className="hover:text-primary transition-colors duration-200">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <hr className="border-gray-700 opacity-50 my-6" />
        <div className="flex flex-col md:flex-row justify-between items-center pt-2 text-xs text-gray-400">
          <div>
            © 2025 A.P. Taekwondo Association.
          </div>
          <div>
            Designed by <span className="text-primary">[Your Name / Team]</span>
          </div>
        </div>
      </div>
    </footer>
  );
};