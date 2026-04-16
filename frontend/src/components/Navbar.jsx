import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-900/90 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0 cursor-pointer" onClick={() => scrollToSection('home')}>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-300 tracking-tight">RuralLearn</span>
          </div>
          
          <div className="hidden md:flex flex-1 justify-center space-x-8">
            <button onClick={() => scrollToSection('home')} className="text-slate-300 hover:text-teal-400 font-medium transition-colors">Home</button>
            <button onClick={() => scrollToSection('features')} className="text-slate-300 hover:text-teal-400 font-medium transition-colors">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-slate-300 hover:text-teal-400 font-medium transition-colors">How It Works</button>
            <button onClick={() => scrollToSection('impact')} className="text-slate-300 hover:text-teal-400 font-medium transition-colors">Impact</button>
            <button onClick={() => scrollToSection('about')} className="text-slate-300 hover:text-teal-400 font-medium transition-colors">About</button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-slate-300 hover:text-teal-400 font-bold transition-colors">
              Login
            </Link>
            <Link to="/register" className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-2 px-5 rounded-full shadow-[0_0_15px_rgba(192,38,211,0.4)] hover:shadow-[0_0_25px_rgba(192,38,211,0.6)] hover:-translate-y-0.5 transition-all duration-300">
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
