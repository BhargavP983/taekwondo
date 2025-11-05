import React from 'react';

interface ResultsAchievementsProps {}

export const ResultsAchievements: React.FC<ResultsAchievementsProps> = () => {
  return (
    <section className="container mx-auto py-5" id="results">
      <h2 className="text-center font-montserrat font-bold text-4xl mb-5 text-success">
        Recent Results & Achievements
      </h2>
      <div className="flex flex-wrap justify-center -mx-4 -my-2">
        {/* Results Card (Completed Event) */}
        <div className="w-full md:w-6/12 lg:w-4/12 px-4 py-2">
          <div className="card h-full shadow rounded-lg p-6 bg-white transform hover:scale-105 transition-transform duration-300">
            <div className="card-body">
              <h5 className="font-montserrat font-bold text-xl mb-2">
                <i className="bi bi-trophy-fill text-warning mr-2"></i>AP State Championship 2025
              </h5>
              <p className="text-gray-700 mb-2">
                Winners: <strong>Junior - S. Krishna; Senior - P. Sai; Cadet - A. Dinesh</strong>
              </p>
              <p className="text-sm mb-0 text-gray-600">
                <i className="bi bi-calendar-event mr-1"></i> Held: 29-31 Jan 2025
              </p>
            </div>
          </div>
        </div>
        {/* Placeholder Card (Coming Soon) */}
        <div className="w-full md:w-6/12 lg:w-4/12 px-4 py-2">
          <div className="card h-full shadow rounded-lg p-6 bg-light text-center flex flex-col justify-center transform hover:scale-105 transition-transform duration-300">
            <div className="card-body">
              <h5 className="font-montserrat font-bold text-xl mb-2">
                <i className="bi bi-clock-history text-primary mr-2"></i>Upcoming Results
              </h5>
              <div className="bg-info bg-opacity-10 text-info border border-info px-4 py-3 rounded relative mb-3">
                Results for next championship will be posted soon!
              </div>
              <span className="text-sm text-gray-600">Check back after events for detailed results.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};