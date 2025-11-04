import React from 'react';

interface FooterProps {}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-3 mt-5" id="footer">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap -mx-4 pb-4">
          {/* ABOUT */}
          <div className="w-full md:w-4/12 px-4 mb-4 md:mb-0">
            <h5 className="font-bold font-montserrat text-lg mb-3">A.P. Taekwondo Association</h5>
            <p className="text-sm text-gray-400 mb-4">
              Promoting Olympic values and developing Taekwondo across Andhra Pradesh, India. Proudly affiliated with World Taekwondo and TFI.
            </p>
            <div className="flex space-x-2">
              <a href="#" className="text-white hover:text-primary text-xl transition-colors duration-200" title="Facebook"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-white hover:text-primary text-xl transition-colors duration-200" title="Twitter"><i className="bi bi-twitter"></i></a>
              <a href="#" className="text-white hover:text-primary text-xl transition-colors duration-200" title="YouTube"><i className="bi bi-youtube"></i></a>
            </div>
          </div>
          {/* CATEGORIES */}
          <div className="w-full md:w-4/12 px-4 mb-4 md:mb-0">
            <h6 className="font-bold text-lg mb-3">Categories</h6>
            <ul className="list-unstyled text-sm space-y-2">
              <li><a href="#events" className="text-gray-400 hover:text-primary transition-colors duration-200">Events & Championships</a></li>
              <li><a href="#objectives" className="text-gray-400 hover:text-primary transition-colors duration-200">About Taekwondo</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200">Club Registration</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200">Athlete Registration</a></li>
              <li><a href="#results" className="text-gray-400 hover:text-primary transition-colors duration-200">Results</a></li>
            </ul>
          </div>
          {/* QUICK LINKS */}
          <div className="w-full md:w-4/12 px-4">
            <h6 className="font-bold text-lg mb-3">Quick Links</h6>
            <ul className="list-unstyled text-sm space-y-2">
              <li><a href="#objectives" className="text-gray-400 hover:text-primary transition-colors duration-200">About Us</a></li>
              <li><a href="#footer" className="text-gray-400 hover:text-primary transition-colors duration-200">Contact</a></li>
              <li><a href="#gallery-section" className="text-gray-400 hover:text-primary transition-colors duration-200">Gallery</a></li> {/* Placeholder link */}
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200">Login</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors duration-200">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <hr className="border-gray-700 opacity-50 my-4" />
        <div className="flex flex-col md:flex-row justify-between items-center pt-2 text-sm text-gray-500">
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