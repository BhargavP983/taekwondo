import React, { useState } from 'react';
import { PresidentProfile } from '../src/components/PresidentProfile';

// Define an interface for executive member data, similar to PresidentProfileProps but simpler for now.
interface ExecutiveMember {
  name: string;
  role: string;
  image: string;
  affiliation?: string; // Optional affiliation
  email?: string;
  phone?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  district: string; // Add district for filtering
  type: 'state' | 'district'; // To distinguish State vs. District executives
}

const executiveMembers: ExecutiveMember[] = [
  {
    name: 'T Harsha Vardhana Prasad',
    role: 'President',
    image: 'img/Shekhar.jpg',
    affiliation: 'Vice President, Taekwondo Federation of India',
    email: 'president@aptaekwondo.org',
    phone: '+918341810905',
    facebook: 'https://www.facebook.com/thvprasad',
    district: 'Andhra Pradesh',
    type: 'state',
  },
  {
    name: 'Dr. K. S. Murthy',
    role: 'General Secretary',
    image: 'https://picsum.photos/id/65/300/300',
    email: 'secretary@aptaekwondo.org',
    phone: '+919876543210',
    district: 'Andhra Pradesh',
    type: 'state',
  },
  {
    name: 'Smt. P. Lavanya',
    role: 'Treasurer',
    image: 'https://picsum.photos/id/66/300/300',
    email: 'treasurer@aptaekwondo.org',
    phone: '+919988776655',
    district: 'Andhra Pradesh',
    type: 'state',
  },
  {
    name: 'Mr. A. Ramesh',
    role: 'Vice President',
    image: 'https://picsum.photos/id/67/300/300',
    email: 'vp.ramesh@aptaekwondo.org',
    district: 'Anantapur',
    type: 'district',
  },
  {
    name: 'Ms. G. Swetha',
    role: 'Joint Secretary',
    image: 'https://picsum.photos/id/68/300/300',
    email: 'js.swetha@aptaekwondo.org',
    district: 'Anantapur',
    type: 'district',
  },
  {
    name: 'Mr. V. Anjaneyulu',
    role: 'Executive Member',
    image: 'https://picsum.photos/id/69/300/300',
    email: 'em.anjan@aptaekwondo.org',
    district: 'Chittoor',
    type: 'district',
  },
  {
    name: 'Smt. L. Bharathi',
    role: 'District President',
    image: 'https://picsum.photos/id/70/300/300',
    email: 'dp.bharathi@aptaekwondo.org',
    district: 'East Godavari',
    type: 'district',
  },
  {
    name: 'Mr. K. Sai Kumar',
    role: 'District Secretary',
    image: 'https://picsum.photos/id/71/300/300',
    email: 'ds.saikumar@aptaekwondo.org',
    district: 'East Godavari',
    type: 'district',
  },
  {
    name: 'Dr. Ramesh Kumar',
    role: 'General Secretary',
    image: 'img/dr-ramesh-kumar.jpeg', // Example image if available
    email: 'secretary@aptaekwondo.org',
    facebook: 'https://facebook.com/drramesh',
    district: 'Guntur',
    type: 'district',
  },
  {
    name: 'Smt. Anjali Devi',
    role: 'Vice President',
    image: 'img/smt-anjali-devi.jpeg', // Example image if available
    email: 'anjali.devi@aptaekwondo.org',
    twitter: 'https://twitter.com/anjalidevi',
    district: 'Krishna',
    type: 'district',
  },
  {
    name: 'Sri. Krishna Prasad',
    role: 'Treasurer',
    image: 'img/sri-krishna-prasad.jpeg', // Example image if available
    email: 'krishna.prasad@aptaekwondo.org',
    linkedin: 'https://linkedin.com/in/krishnaprasad',
    district: 'Kurnool',
    type: 'district',
  },
  {
    name: 'Prakash Rao',
    role: 'District President',
    image: 'img/prakash-rao.jpeg', // Example image if available
    email: 'prakash.rao@aptaekwondo.org',
    district: 'Nellore',
    type: 'district',
  },
  // Add more members for other districts
  { name: 'S. Rajeswari', role: 'Executive Member', image: 'https://picsum.photos/id/72/300/300', district: 'Prakasam', type: 'district' },
  { name: 'M. Sudheer', role: 'Executive Member', image: 'https://picsum.photos/id/73/300/300', district: 'Srikakulam', type: 'district' },
  { name: 'R. Divya', role: 'Executive Member', image: 'https://picsum.photos/id/74/300/300', district: 'Visakhapatnam', type: 'district' },
  { name: 'G. Harish', role: 'Executive Member', image: 'https://picsum.photos/id/75/300/300', district: 'Vizianagaram', type: 'district' },
  { name: 'P. Krishna', role: 'Executive Member', image: 'https://picsum.photos/id/76/300/300', district: 'West Godavari', type: 'district' },
  { name: 'N. Durga Prasad', role: 'Executive Member', image: 'https://picsum.photos/id/77/300/300', district: 'YSR Kadapa', type: 'district' },
];

export const ExecutiveMembers: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');

  const districts = [
    'All',
    'Anantapur',
    'Chittoor',
    'East Godavari',
    'Guntur',
    'Krishna',
    'Kurnool',
    'Nellore',
    'Prakasam',
    'Srikakulam',
    'Visakhapatnam',
    'Vizianagaram',
    'West Godavari',
    'YSR Kadapa',
  ];

  const filteredMembers = executiveMembers.filter((member) => {
    if (selectedDistrict === 'All') {
      return true; // Show all district members if 'All' is selected for district executives
    }
    if (selectedDistrict === 'Andhra Pradesh' && member.type === 'state') {
      return true; // Show only state executives if 'Andhra Pradesh' is selected
    }
    return member.district === selectedDistrict && member.type === 'district';
  });

  return (
    <section className="container mx-auto py-10 px-4">
      <h1 className="text-center font-montserrat font-bold text-4xl text-primary mb-8 pt-10">Executive Council Members</h1>
      <p className="text-center text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
        Meet the dedicated individuals leading the A.P. Taekwondo Association at both state and district levels.
      </p>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-3/12 lg:w-2/12 bg-light p-4 shadow-lg rounded-lg h-fit sticky top-28"> {/* sticky top for sidebar */}
          <h5 className="font-montserrat font-bold text-lg mb-2 px-3"><strong>State Executives</strong></h5>
          <ul className="nav flex-col mb-4 px-3">
            <li className="mb-1">
              <button
                onClick={() => setSelectedDistrict('Andhra Pradesh')}
                className={`w-full text-left py-2 px-3 rounded-md transition-colors duration-200
                  ${selectedDistrict === 'Andhra Pradesh' ? 'bg-primary text-white shadow' : 'text-gray-700 hover:bg-gray-200'}
                `}
              >
                Andhra Pradesh
              </button>
            </li>
          </ul>

          <h5 className="font-montserrat font-bold text-lg mb-2 px-3"><strong>District Executives</strong></h5>
          <ul className="nav flex-col px-3">
            {districts.map((district) => (
              <li key={district} className="mb-1">
                <button
                  onClick={() => setSelectedDistrict(district)}
                  className={`w-full text-left py-2 px-3 rounded-md transition-colors duration-200
                    ${selectedDistrict === district && district !== 'Andhra Pradesh' ? 'bg-primary text-white shadow' : 'text-gray-700 hover:bg-gray-200'}
                  `}
                >
                  {district}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Member Grid */}
        <main className="w-full md:w-9/12 lg:w-10/12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-2"> {/* Changed xl:grid-cols-4 to xl:grid-cols-3 */}
            {filteredMembers.map((member, index) => (
              <PresidentProfile
                key={index}
                name={member.name}
                role={member.role}
                affiliation1={member.affiliation}
                image={member.image}
                email={member.email}
                phone={member.phone}
                facebook={member.facebook}
                twitter={member.twitter}
                linkedin={member.linkedin}
              />
            ))}
          </div>
        </main>
      </div>
    </section>
  );
};