import React from 'react';

export const ContactPage: React.FC = () => {
  return (
    <section className="container mx-auto py-8">
      <h1 className="text-center font-montserrat font-bold text-4xl mb-6 text-primary">Contact Us</h1>
      <div className="flex flex-wrap -mx-4 justify-center">
        <div className="w-full md:w-8/12 lg:w-6/12 px-4 mb-4">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-lg text-gray-700 mb-4">
              We'd love to hear from you! Please reach out to us with any questions, feedback, or inquiries.
            </p>
            <form>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Your Name"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Your Email"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="subject" className="block text-gray-700 text-sm font-bold mb-2">Subject</label>
                <input
                  type="text"
                  id="subject"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Subject"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">Message</label>
                <textarea
                  id="message"
                  rows={5}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Your Message"
                ></textarea>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap -mx-4 justify-center mt-8">
        <div className="w-full md:w-4/12 px-4 mb-4">
          <div className="bg-white shadow rounded-lg p-6 text-center h-full">
            <h5 className="font-montserrat font-bold text-xl text-success mb-3">Our Office</h5>
            <p className="text-gray-700">123 Taekwondo Street</p>
            <p className="text-gray-700">Visakhapatnam, AP 530001</p>
            <p className="text-gray-700">India</p>
          </div>
        </div>
        <div className="w-full md:w-4/12 px-4 mb-4">
          <div className="bg-white shadow rounded-lg p-6 text-center h-full">
            <h5 className="font-montserrat font-bold text-xl text-warning mb-3">Contact Details</h5>
            <p className="text-gray-700"><i className="bi bi-envelope mr-2"></i>support@aptaekwondo.org</p>
            <p className="text-gray-700"><i className="bi bi-telephone mr-2"></i>+91 123 456 7890</p>
          </div>
        </div>
      </div>
    </section>
  );
};