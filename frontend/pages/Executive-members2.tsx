import React from 'react';

export const ExecutiveMembers: React.FC = () => {
  return (
    <section className="container mx-auto py-10 px-4">
      <h1 className="text-center font-montserrat font-bold text-4xl text-primary mb-8 pt-10">Executive Members</h1>
      <p className="text-center text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
        Meet the dedicated individuals leading the A.P. Taekwondo Association.
      </p>
      {/* Placeholder for executive members' profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Example member */}
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <img src="https://picsum.photos/id/64/150/150" alt="Member Name" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-primary" />
          <h3 className="font-montserrat font-bold text-xl text-gray-800">Member One</h3>
          <p className="text-gray-600 text-sm">Role: Secretary</p>
          <p className="text-gray-500 text-xs mt-2">Dedicated to promoting Taekwondo values.</p>
        </div>
        {/* Add more member profiles as needed */}
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <img src="https://picsum.photos/id/65/150/150" alt="Member Name" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-primary" />
          <h3 className="font-montserrat font-bold text-xl text-gray-800">Member Two</h3>
          <p className="text-gray-600 text-sm">Role: Treasurer</p>
          <p className="text-gray-500 text-xs mt-2">Manages financial operations with integrity.</p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <img src="https://picsum.photos/id/66/150/150" alt="Member Name" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-primary" />
          <h3 className="font-montserrat font-bold text-xl text-gray-800">Member Three</h3>
          <p className="text-gray-600 text-sm">Role: Technical Director</p>
          <p className="text-gray-500 text-xs mt-2">Oversees training standards and competition rules.</p>
        </div>
      </div>
    </section>
  );
};