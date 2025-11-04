import React from 'react';

// Define an interface for an executive member
interface ExecutiveMember {
  name: string;
  position: string;
  image: string; // Path to image
  email?: string;
  phone?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
}

// Sample data for executive members
const executiveMembers: ExecutiveMember[] = [
  {
    name: 'T Harsha Vardhana Prasad',
    position: 'President',
    image: 'img/Shekhar.jpg', // Reusing the image from PresidentProfile.tsx
    email: 'president@aptaekwondo.org',
    phone: '+918341810905',
    facebook: 'https://www.facebook.com/yourpresidentprofile',
  },
  {
    name: 'Dr. S. K. Singh',
    position: 'General Secretary',
    image: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=SK+Singh', // Placeholder image
    email: 'secretary@aptaekwondo.org',
    phone: '+919876543210',
    linkedin: 'https://www.linkedin.com/in/sksingh',
  },
  {
    name: 'Ms. A. Lakshmi',
    position: 'Treasurer',
    image: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=A+Lakshmi', // Placeholder image
    email: 'treasurer@aptaekwondo.org',
  },
  {
    name: 'Mr. B. Rao',
    position: 'Vice President',
    image: 'https://via.placeholder.com/150/008000/FFFFFF?text=B+Rao', // Placeholder image
  },
  // Add more members as needed
];

export const ExecutiveMembers: React.FC = () => {
  return (
    <section className="container mx-auto py-8">
      <h1 className="text-center font-montserrat font-bold text-4xl mb-6 text-primary">Executive Members</h1>
      <p className="text-center text-lg text-gray-700 mb-8">
        Meet the dedicated individuals leading the AP Taekwondo Association.
      </p>

      <div className="flex flex-wrap justify-center -mx-4 -my-4">
        {executiveMembers.map((member, index) => (
          <div key={index} className="w-full sm:w-6/12 md:w-4/12 lg:w-3/12 px-4 py-4">
            <div className="card shadow rounded-xl p-3 bg-white h-full flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300">
              <img
                src={member.image}
                alt={member.name}
                className="w-32 h-32 rounded-full border-2 border-primary object-cover mx-auto mt-3 mb-2"
              />
              <div className="card-body p-4">
                <h4 className="font-montserrat font-bold text-xl mb-1">{member.name}</h4>
                <div className="text-gray-600 mb-3 text-sm">{member.position}</div>
                <div className="flex justify-center space-x-2">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="btn btn-sm border border-primary text-primary hover:bg-primary hover:text-white rounded-full p-2"
                      title={`Email ${member.name}`}
                    >
                      <i className="bi bi-envelope"></i>
                    </a>
                  )}
                  {member.phone && (
                    <a
                      href={`tel:${member.phone}`}
                      className="btn btn-sm border border-success text-success hover:bg-success hover:text-white rounded-full p-2"
                      title={`Call ${member.name}`}
                    >
                      <i className="bi bi-telephone"></i>
                    </a>
                  )}
                  {member.facebook && (
                    <a
                      href={member.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm border border-primary text-primary hover:bg-primary hover:text-white rounded-full p-2"
                      title="Facebook"
                    >
                      <i className="bi bi-facebook"></i>
                    </a>
                  )}
                  {member.twitter && (
                    <a
                      href={member.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm border border-info text-info hover:bg-info hover:text-white rounded-full p-2"
                      title="Twitter"
                    >
                      <i className="bi bi-twitter"></i>
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-full p-2"
                      title="LinkedIn"
                    >
                      <i className="bi bi-linkedin"></i>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};