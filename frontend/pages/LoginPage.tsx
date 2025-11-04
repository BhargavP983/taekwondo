import React from 'react';

export const LoginPage: React.FC = () => {
  return (
    <section className="container mx-auto py-10 px-4 flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="font-montserrat font-bold text-4xl text-primary mb-6">Login</h1>
      <p className="text-lg text-gray-700">This login page is currently under construction. Please check back later!</p>
      <div className="mt-8">
        <img src="https://picsum.photos/id/350/300/200" alt="Under Construction" className="rounded-lg shadow-md" />
      </div>
    </section>
  );
};


// import React from 'react';

// export const LoginPage: React.FC = () => {
//   return (
//     <section className="container mx-auto py-12 px-4 text-center">
//       <h1 className="font-montserrat font-bold text-4xl mb-5 text-primary">Login</h1>
//       <p className="text-lg text-gray-700">
//         This is the Login page. Functionality is under construction.
//       </p>
//       <div className="mt-8 p-6 bg-white shadow-lg rounded-lg max-w-md mx-auto">
//         <h2 className="font-montserrat font-bold text-2xl mb-4 text-dark">Account Access</h2>
//         <form className="space-y-4">
//           <div>
//             <label htmlFor="username" className="sr-only">Username</label>
//             <input
//               type="text"
//               id="username"
//               className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
//               placeholder="Username"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="password" className="sr-only">Password</label>
//             <input
//               type="password"
//               id="password"
//               className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
//               placeholder="Password"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="bg-primary hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline transition-colors duration-200 w-full"
//           >
//             Sign In
//           </button>
//         </form>
//         <p className="mt-4 text-sm text-gray-600">
//           <a href="#" className="text-primary hover:underline">Forgot Password?</a>
//         </p>
//       </div>
//     </section>
//   );
// };