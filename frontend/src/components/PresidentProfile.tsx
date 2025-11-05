import React from 'react';

interface PresidentProfileProps {
  name: string;
  role: string;
  affiliation1?: string;
  affiliation2?: string;
  image: string;
  email?: string;
  phone?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
}

export const PresidentProfile: React.FC<PresidentProfileProps> = ({
  name,
  role,
  affiliation1,
  affiliation2,
  image,
  email,
  phone,
  facebook,
  twitter,
  linkedin,
}) => {
  return (
    <section className="container mx-auto py-5 px-4">
      <div className="flex justify-center">
        <div className="w-full md:w-6/12 lg:w-5/12">
          <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
            <img src={image} alt={name} className="w-32 h-32 rounded-full mx-auto mt-3 mb-4 object-cover border-2 border-primary" />
            <div className="text-center">
              <h4 className="font-montserrat font-bold text-2xl mb-1 text-gray-800">{name}</h4>
              <div className="text-gray-600 mb-3 text-sm">
                {role}
                {affiliation1 && <><br />{affiliation1}</>}
                {affiliation2 && <><br />{affiliation2}</>}
              </div>
              <div className="flex justify-center space-x-2 my-2">
                {email && (
                  <a href={`mailto:${email}`} className="btn-icon text-primary hover:bg-primary hover:text-white border border-primary rounded-full p-2" title="Email">
                    <i className="bi bi-envelope"></i>
                  </a>
                )}
                {phone && (
                  <a href={`tel:${phone}`} className="btn-icon text-success hover:bg-success hover:text-white border border-success rounded-full p-2" title="Call">
                    <i className="bi bi-telephone"></i>
                  </a>
                )}
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer" className="btn-icon text-primary hover:bg-primary hover:text-white border border-primary rounded-full p-2" title="Facebook">
                    <i className="bi bi-facebook"></i>
                  </a>
                )}
                {twitter && (
                  <a href={twitter} target="_blank" rel="noopener noreferrer" className="btn-icon text-info hover:bg-info hover:text-white border border-info rounded-full p-2" title="Twitter">
                    <i className="bi bi-twitter"></i>
                  </a>
                )}
                {linkedin && (
                  <a href={linkedin} target="_blank" rel="noopener noreferrer" className="btn-icon text-blue-700 hover:bg-blue-700 hover:text-white border border-blue-700 rounded-full p-2" title="LinkedIn">
                    <i className="bi bi-linkedin"></i>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};