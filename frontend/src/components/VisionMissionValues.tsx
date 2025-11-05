import React from 'react';

interface VisionMissionValuesProps {}

export const VisionMissionValues: React.FC<VisionMissionValuesProps> = () => {
  return (
    <section className="container mx-auto py-5" id="about">
      <div className="flex flex-wrap justify-center text-center -mx-4">
        <div className="w-full md:w-4/12 px-4 mb-4">
          <div className="card h-full shadow rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="card-body">
              <h5 className="font-montserrat font-bold text-xl text-primary mb-3">
                <i className="bi bi-eye-fill mr-2"></i>Vision
              </h5>
              <p className="text-gray-700">Taekwondo For All.</p>
            </div>
          </div>
        </div>
        <div className="w-full md:w-4/12 px-4 mb-4">
          <div className="card h-full shadow rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="card-body">
              <h5 className="font-montserrat font-bold text-xl text-success mb-3">
                <i className="bi bi-bullseye mr-2"></i>Mission
              </h5>
              <p className="text-gray-700">
                Develop and grow Taekwondo from grassroots to elite—every person can play, watch, and enjoy the sport
                regardless of age, gender, or ability.
              </p>
            </div>
          </div>
        </div>
        <div className="w-full md:w-4/12 px-4 mb-4">
          <div className="card h-full shadow rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="card-body">
              <h5 className="font-montserrat font-bold text-xl text-warning mb-3">
                <i className="bi bi-stars mr-2"></i>Values
              </h5>
              <p className="text-gray-700">Inclusiveness, Leadership, Respect, Tolerance, Excellence, Integrity.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};