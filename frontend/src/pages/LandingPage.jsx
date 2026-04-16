import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FeatureSection from '../components/FeatureSection';
import Footer from '../components/Footer';

const LandingPage = () => {
  // Smooth scroll helper for hash links if needed on load
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 overflow-x-hidden font-sans text-slate-300">
      <Navbar />

      {/* HERO SECTION */}
      <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex items-center min-h-screen">
        {/* Decorative Orbs */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-fuchsia-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-teal-500/20 rounded-full mix-blend-screen filter blur-[128px] animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 text-center lg:text-left mb-16 lg:mb-0">
              <div className="inline-flex items-center px-4 py-2 rounded-full glassmorphism text-teal-300 text-sm font-semibold mb-6">
                <span className="flex h-2 w-2 rounded-full bg-teal-400 mr-2 animate-ping"></span>
                Play, Learn, Grow!
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight mb-8 leading-tight">
                Gamified Learning for <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-fuchsia-400">Rural Students</span>
              </h1>
              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Empowering education through adaptive learning, rewards, and offline accessibility designed for the leaders of tomorrow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold rounded-full shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:shadow-[0_0_30px_rgba(20,184,166,0.6)] hover:-translate-y-1 transition-all duration-300 text-lg text-center">
                  Start Your Journey
                </Link>
                <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 glassmorphism text-white font-bold rounded-full hover:bg-white/10 transition-all text-center">
                  Explore Features
                </button>
              </div>
            </div>
            <div className="lg:col-span-6 flex justify-center lg:justify-end relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500/20 to-teal-500/20 rounded-full filter blur-3xl transform scale-150"></div>
              {/* Abstract Illustration Placeholder using tailwind/CSS */}
              <div className="relative w-full max-w-lg aspect-square glassmorphism rounded-[2rem] border border-white/10 shadow-2xl p-8 flex items-center justify-center overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="absolute top-10 left-10 w-24 h-24 bg-teal-500/80 rounded-2xl rotate-12 backdrop-blur-md animate-bounce" style={{animationDuration: '3s'}}></div>
                  <div className="absolute bottom-20 right-10 w-32 h-32 bg-fuchsia-500/80 rounded-full backdrop-blur-md animate-pulse"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-400/80 rounded-3xl -rotate-12 backdrop-blur-md shadow-2xl z-10 flex items-center justify-center">
                    <span className="text-6xl">🎓</span>
                  </div>
                  <div className="absolute bottom-4 left-4 glassmorphism px-4 py-2 rounded-xl text-white font-bold text-sm shadow-xl flex items-center gap-2">
                    <span className="text-yellow-400">⭐</span> +500 XP Earned!
                  </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION Component */}
      <FeatureSection />

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 bg-slate-900/50 relative border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">How It Works</h2>
            <p className="text-xl text-slate-400">Four simple steps to transform your educational journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 z-0"></div>

            {[
              { num: '01', title: 'Create Profile', desc: 'Securely register as a Student, Teacher, or Parent.' },
              { num: '02', title: 'Complete Lessons', desc: 'Engage with interactive, multimedia course materials.' },
              { num: '03', title: 'Take Quizzes', desc: 'Test your knowledge & earn rewards and badges.' },
              { num: '04', title: 'Level Up', desc: 'Adaptive algorithms target weaknesses to help you improve faster.' }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center text-2xl font-black text-teal-400 mb-6 shadow-xl">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT SECTION */}
      <section id="impact" className="py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-fuchsia-900/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Our Growing Impact</h2>
            <p className="text-xl text-slate-400">Join a thriving community of learners across the country.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { val: '1,000+', label: 'Students Learning' },
              { val: '50+', label: 'Teachers Empowered' },
              { val: '20+', label: 'Schools Connected' },
              { val: '10K+', label: 'Lessons Completed' }
            ].map((stat, idx) => (
              <div key={idx} className="glassmorphism p-8 rounded-3xl text-center border-teal-500/20">
                <div className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-tr from-emerald-400 to-teal-300 mb-2">
                  {stat.val}
                </div>
                <div className="text-slate-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-24 bg-slate-800/20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black text-white mb-8">Our Mission</h2>
          <p className="text-2xl text-slate-300 leading-relaxed font-medium italic">
            "RuralLearn bridges the digital education gap by combining gamification, adaptive learning, and offline-first technology designed specifically for the unique needs of rural students."
          </p>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">What the Community Says</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glassmorphism p-8 rounded-3xl relative">
              <div className="text-4xl text-fuchsia-400 absolute top-4 left-6 opacity-50">"</div>
              <p className="text-slate-300 mb-8 relative z-10 pt-4">Earnings points and badges makes learning math actually fun. I don't even want to stop playing!</p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold mr-4">S</div>
                <div>
                  <h4 className="text-white font-bold">Aarav</h4>
                  <p className="text-slate-400 text-sm">Student, Grade 6</p>
                </div>
              </div>
            </div>
            
             <div className="glassmorphism p-8 rounded-3xl relative">
              <div className="text-4xl text-teal-400 absolute top-4 left-6 opacity-50">"</div>
              <p className="text-slate-300 mb-8 relative z-10 pt-4">The offline sync feature is a lifesaver. My students can complete homework even when the village loses internet.</p>
               <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-fuchsia-500 flex items-center justify-center text-white font-bold mr-4">T</div>
                <div>
                  <h4 className="text-white font-bold">Priya Sharma</h4>
                  <p className="text-slate-400 text-sm">Math Teacher</p>
                </div>
              </div>
            </div>

            <div className="glassmorphism p-8 rounded-3xl relative">
              <div className="text-4xl text-emerald-400 absolute top-4 left-6 opacity-50">"</div>
              <p className="text-slate-300 mb-8 relative z-10 pt-4">The parent dashboard lets me see exactly where my child needs help without being intrusive.</p>
               <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold mr-4">P</div>
                <div>
                  <h4 className="text-white font-bold">Raj Patel</h4>
                  <p className="text-slate-400 text-sm">Parent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900 to-fuchsia-900 opacity-50"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center glassmorphism p-12 rounded-[3rem] border-white/20">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Start Your Learning Adventure Today</h2>
          <p className="text-xl text-slate-300 mb-10">Join thousands of students turning their education into an epic quest.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-10 py-4 bg-white text-slate-900 font-black rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-1 transition-all duration-300 text-lg">
              Create Free Account
            </Link>
            <Link to="/login" className="px-10 py-4 glassmorphism text-white font-bold rounded-full hover:bg-white/10 transition-all text-lg">
              Login
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
