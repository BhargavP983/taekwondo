import React from 'react';

interface PresidentProfileProps {}

export const PresidentProfile: React.FC<PresidentProfileProps> = () => {
  return (
    <section className="container mx-auto py-5" id="presidentProfile">
      <div className="flex justify-center -mx-4">
        <div className="w-full md:w-6/12 lg:w-5/12 px-4">
          <div className="card shadow rounded-xl p-3 bg-white transform hover:scale-105 transition-transform duration-300">
            <img
              src="img/Shekhar.jpg"
              alt="T Harsha Vardhana Prasad"
              className="w-32 h-32 rounded-full border-2 border-primary object-cover mx-auto mt-3 mb-2"
            />
            <div className="card-body text-center p-4">
              <h4 className="font-montserrat font-bold text-xl mb-1">T Harsha Vardhana Prasad</h4>
              <div className="text-gray-600 mb-3 text-sm">
                President, A.P. Taekwondo Association<br />
                Vice President, Taekwondo Federation of India
              </div>
              <div className="flex justify-center space-x-2">
                <a
                  href="mailto:support@aptaekwondo.org"
                  className="btn btn-sm border border-primary text-primary hover:bg-primary hover:text-white rounded-full p-2"
                  title="Email President"
                >
                  <i className="bi bi-envelope"></i>
                </a>
                <a
                  href="tel:+918341810905"
                  className="btn btn-sm border border-success text-success hover:bg-success hover:text-white rounded-full p-2"
                  title="Call President"
                >
                  <i className="bi bi-telephone"></i>
                </a>
                <a
                  href="https://www.facebook.com/yourpresidentprofile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm border border-primary text-primary hover:bg-primary hover:text-white rounded-full p-2"
                  title="Facebook"
                >
                  <i className="bi bi-facebook"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};