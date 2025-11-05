import React from 'react';

interface StatsOverlayProps {}

export const StatsOverlay: React.FC<StatsOverlayProps> = () => {
  return (
    <section className="container mx-auto my-5 py-4">
      <div className="flex flex-wrap justify-center text-center -mx-4"> {/* Adjusted for Tailwind's negative margin system */}
        <div className="w-full sm:w-10/12 md:w-3/12 px-4 mb-4 md:mb-0">
          <div className="bg-white py-4 px-3 shadow rounded-lg transform hover:scale-105 transition-transform duration-300">
            <i className="bi bi-people-fill text-primary text-4xl mb-2"></i>
            <h2 className="font-bold font-montserrat text-3xl mb-1">6,000+</h2>
            <p className="mb-0 text-secondary">Registered Athletes</p>
          </div>
        </div>
        <div className="w-full sm:w-10/12 md:w-3/12 px-4 mb-4 md:mb-0">
          <div className="bg-white py-4 px-3 shadow rounded-lg transform hover:scale-105 transition-transform duration-300">
            <i className="bi bi-house-check-fill text-success text-4xl mb-2"></i>
            <h2 className="font-bold font-montserrat text-3xl mb-1">200+</h2>
            <p className="mb-0 text-secondary">Registered Clubs</p>
          </div>
        </div>
        <div className="w-full sm:w-10/12 md:w-3/12 px-4">
          <div className="bg-white py-4 px-3 shadow rounded-lg transform hover:scale-105 transition-transform duration-300">
            <i className="bi bi-person-check text-warning text-4xl mb-2"></i>
            <h2 className="font-bold font-montserrat text-3xl mb-1">300+</h2>
            <p className="mb-0 text-secondary">Registered Officials</p>
          </div>
        </div>
      </div>
    </section>
  );
};