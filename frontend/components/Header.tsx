import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  isSticky: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isSticky }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [isGalleryDropdownOpen, setIsGalleryDropdownOpen] = useState(false);
  const [isRegistrationDropdownOpen, setIsRegistrationDropdownOpen] = useState(false);

  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAboutDropdownOpen(false);
    setIsGalleryDropdownOpen(false);
    setIsRegistrationDropdownOpen(false);
  }, [location]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const handleAboutMouseEnter = useCallback(() => setIsAboutDropdownOpen(true), []);
  const handleAboutMouseLeave = useCallback(() => setIsAboutDropdownOpen(false), []);

  const handleGalleryMouseEnter = useCallback(() => setIsGalleryDropdownOpen(true), []);
  const handleGalleryMouseLeave = useCallback(() => setIsGalleryDropdownOpen(false), []);

  const handleRegistrationMouseEnter = useCallback(() => setIsRegistrationDropdownOpen(true), []);
  const handleRegistrationMouseLeave = useCallback(() => setIsRegistrationDropdownOpen(false), []);

  // Ensure dropdowns are closed if mobile menu is closed
  useEffect(() => {
    if (!isMobileMenuOpen) {
      setIsAboutDropdownOpen(false);
      setIsGalleryDropdownOpen(false);
      setIsRegistrationDropdownOpen(false);
    }
  }, [isMobileMenuOpen]);

  return (
    <header>
      {/* Navbar */}
      <nav
        id="mainNavbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out font-montserrat
          ${isSticky ? 'bg-dark shadow-lg py-2' : 'bg-dark py-4'}
        `}
      >
        <div className="container mx-auto flex flex-wrap items-center justify-between px-4">
          <div className="relative flex items-center justify-between w-full lg:w-auto">
            <Link to="/" className="flex items-center">
              <img
                src="img/logo.jpg"
                alt="AP Taekwondo Logo"
                className={`transition-all duration-300 ease-in-out rounded-full border-2 border-primary
                  ${isSticky ? 'w-10 h-10 mr-2' : 'w-16 h-16 mr-3'}
                `}
              />
              <span className={`font-bold text-lg text-white ${isSticky ? 'text-lg' : 'text-xl'}`}>AP Taekwondo</span>
            </Link>

            <button
              className="lg:hidden text-white text-2xl focus:outline-none"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation"
              aria-expanded={isMobileMenuOpen ? 'true' : 'false'}
            >
              <i className={isMobileMenuOpen ? 'bi bi-x-lg' : 'bi bi-list'}></i>
            </button>
          </div>

          {/* Desktop and Mobile Nav Links */}
          <div
            className={`w-full lg:flex lg:items-center lg:w-auto mt-4 lg:mt-0 ${
              isMobileMenuOpen ? 'block' : 'hidden'
            }`}
            id="mainNav"
          >
            <ul className="flex flex-col lg:flex-row lg:ml-auto space-y-2 lg:space-y-0 lg:space-x-6">
              <li className="nav-item">
                <Link
                  className="block py-2 px-3 text-white hover:text-primary transition-colors duration-200"
                  to="/"
                >
                  HOME
                </Link>
              </li>

              {/* About Us Dropdown */}
              <li
                className="nav-item relative"
                onMouseEnter={handleAboutMouseEnter}
                onMouseLeave={handleAboutMouseLeave}
              >
                <button
                  className="flex items-center w-full py-2 px-3 text-white hover:text-primary transition-colors duration-200 focus:outline-none lg:bg-transparent"
                  onClick={() => setIsAboutDropdownOpen((prev) => !prev)}
                  aria-expanded={isAboutDropdownOpen ? 'true' : 'false'}
                >
                  ABOUT US <i className="bi bi-caret-down-fill ml-1 text-xs"></i>
                </button>
                {(isAboutDropdownOpen || isMobileMenuOpen) && (
                  <ul
                    className={`lg:absolute lg:top-full lg:left-0 bg-dark lg:bg-white lg:shadow-md lg:rounded-md text-white lg:text-dark w-full lg:w-48 py-2 lg:py-0
                      ${isAboutDropdownOpen ? 'block' : 'hidden lg:block'}
                    `}
                    aria-labelledby="aboutDropdown"
                  >
                    <li>
                      <Link
                        className="block px-4 py-2 hover:bg-gray-200 lg:hover:bg-primary lg:hover:text-white transition-colors duration-200"
                        to="/about"
                      >
                        About Taekwondo
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="block px-4 py-2 hover:bg-gray-200 lg:hover:bg-primary lg:hover:text-white transition-colors duration-200"
                        to="/executive-members"
                      >
                        Executive Members
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li className="nav-item">
                <a
                  className="block py-2 px-3 text-white hover:text-primary transition-colors duration-200"
                  href="/#events"
                >
                  EVENTS
                </a>
              </li>

              {/* Gallery Dropdown */}
              <li
                className="nav-item relative"
                onMouseEnter={handleGalleryMouseEnter}
                onMouseLeave={handleGalleryMouseLeave}
              >
                <button
                  className="flex items-center w-full py-2 px-3 text-white hover:text-primary transition-colors duration-200 focus:outline-none lg:bg-transparent"
                  onClick={() => setIsGalleryDropdownOpen((prev) => !prev)}
                  aria-expanded={isGalleryDropdownOpen ? 'true' : 'false'}
                >
                  GALLERY <i className="bi bi-caret-down-fill ml-1 text-xs"></i>
                </button>
                {(isGalleryDropdownOpen || isMobileMenuOpen) && (
                  <ul
                    className={`lg:absolute lg:top-full lg:left-0 bg-dark lg:bg-white lg:shadow-md lg:rounded-md text-white lg:text-dark w-full lg:w-48 py-2 lg:py-0
                      ${isGalleryDropdownOpen ? 'block' : 'hidden lg:block'}
                    `}
                    aria-labelledby="galleryDropdown"
                  >
                    <li>
                      <Link
                        className="block px-4 py-2 hover:bg-gray-200 lg:hover:bg-primary lg:hover:text-white transition-colors duration-200"
                        to="/gallery"
                      >
                        Photo Gallery
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="block px-4 py-2 hover:bg-gray-200 lg:hover:bg-primary lg:hover:text-white transition-colors duration-200"
                        to="/gallery"
                      >
                        Video Gallery
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Registration Dropdown - NEW */}
              <li
                className="nav-item relative"
                onMouseEnter={handleRegistrationMouseEnter}
                onMouseLeave={handleRegistrationMouseLeave}
              >
                <button
                  className="flex items-center w-full py-2 px-3 text-white hover:text-primary transition-colors duration-200 focus:outline-none lg:bg-transparent"
                  onClick={() => setIsRegistrationDropdownOpen((prev) => !prev)}
                  aria-expanded={isRegistrationDropdownOpen ? 'true' : 'false'}
                >
                  REGISTRATION <i className="bi bi-caret-down-fill ml-1 text-xs"></i>
                </button>
                {(isRegistrationDropdownOpen || isMobileMenuOpen) && (
                  <ul
                    className={`lg:absolute lg:top-full lg:left-0 bg-dark lg:bg-white lg:shadow-md lg:rounded-md text-white lg:text-dark w-full lg:w-56 py-2 lg:py-0
                      ${isRegistrationDropdownOpen ? 'block' : 'hidden lg:block'}
                    `}
                    aria-labelledby="registrationDropdown"
                  >
                    <li>
                      <Link
                        className="block px-4 py-2 hover:bg-gray-200 lg:hover:bg-primary lg:hover:text-white transition-colors duration-200"
                        to="/registration/cadet"
                      >
                        Cadet Application
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="block px-4 py-2 hover:bg-gray-200 lg:hover:bg-primary lg:hover:text-white transition-colors duration-200"
                        to="/registration/poomsae"
                      >
                        Poomsae Application
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li className="nav-item">
                <Link
                  className="block py-2 px-3 text-white hover:text-primary transition-colors duration-200"
                  to="/contact"
                >
                  CONTACT US
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className="block py-2 px-3 text-white hover:text-primary transition-colors duration-200"
                  to="/login"
                >
                  LOGIN
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};
