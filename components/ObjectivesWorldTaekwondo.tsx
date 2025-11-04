import React, { useState } from 'react';

interface ObjectivesWorldTaekwondoProps {}

export const ObjectivesWorldTaekwondo: React.FC<ObjectivesWorldTaekwondoProps> = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <section className="container mx-auto py-5" id="objectives">
      <div className="flex flex-wrap -mx-4">
        <div className="w-full md:w-6/12 px-4 mb-4 md:mb-0">
          <h3 className="font-montserrat font-bold text-2xl mb-3 text-primary">
            Association’s Aims & Objectives
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Add value to the Olympic movement & promote Olympic values.</li>
            <li>Develop high-impact, sustainable events statewide.</li>
            <li>Support club development & grassroots growth.</li>
            <li>Foster inclusive, respectful sporting culture.</li>
            <li>Increase participation in taekwondo across Andhra Pradesh.</li>
            <li>Ensure high standards of coaching and officiating.</li>
            <li>Build partnerships with schools, colleges, and sports authorities.</li>
          </ol>
        </div>
        <div className="w-full md:w-6/12 px-4">
          <h3 className="font-montserrat font-bold text-2xl mb-3 text-success">
            About World Taekwondo
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Founded in 1973, Seoul, Korea.</li>
            <li>Recognized Olympic sport since 2000, Sydney Games.</li>
            <li>200+ member countries worldwide.</li>
          </ul>
          <button
            className="btn border border-primary text-primary hover:bg-primary hover:text-white rounded-full text-sm py-2 px-4 mt-4 transition-colors duration-200"
            type="button"
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
            aria-controls="moreTaekwondo"
          >
            {isExpanded ? 'Read Less' : 'Read More'}
          </button>
          <div
            id="moreTaekwondo"
            className={`mt-3 overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="card bg-light text-secondary p-4 rounded-lg">
              <ul className="list-disc list-inside space-y-2">
                <li>World Taekwondo oversees and regulates major competitions internationally.</li>
                <li>Emphasizes inclusiveness, discipline, and Olympic values worldwide.</li>
                <li>India’s athletes actively participate at World and Asian championships.</li>
                <li>A.P. Taekwondo Association aligns with World Taekwondo principles.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};