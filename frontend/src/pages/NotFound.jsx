import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <h1 className="text-6xl font-bold text-slate-800 mb-4">404</h1>
      <p className="text-xl text-slate-600 mb-8">Page not found.</p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
};

export default NotFound;
