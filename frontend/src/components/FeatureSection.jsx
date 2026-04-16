import React from 'react';

const FeatureCard = ({ icon, title, description, delay }) => {
  return (
    <div 
      className="glassmorphism p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300"
      style={{ animationDelay: delay }}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-6 text-3xl shadow-inner border border-slate-700/50">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
};

const FeatureSection = () => {
  const features = [
    {
      icon: '🏆',
      title: 'Gamified Learning',
      description: 'Earn points, unlock character badges, maintain learning streaks, and climb the global leaderboards.',
      delay: '0ms'
    },
    {
      icon: '🧠',
      title: 'Adaptive Intelligence',
      description: 'The platform automatically adjusts difficulty based on your performance to keep you perfectly challenged.',
      delay: '100ms'
    },
    {
      icon: '📶',
      title: 'Offline Learning',
      description: 'No internet? No problem. Complete downloaded lessons and sync your progress when you reconnect.',
      delay: '200ms'
    },
    {
      icon: '📊',
      title: 'Teacher Analytics',
      description: 'Educators get powerful dashboards to track student progress, identify weak points, and assign rewards.',
      delay: '300ms'
    },
    {
      icon: '🗣️',
      title: 'Multilingual Learning',
      description: 'Learn in your native language with full support for regional dialects including Hindi and Marathi.',
      delay: '400ms'
    },
    {
      icon: '⚡',
      title: 'Low Bandwidth Friendly',
      description: 'Engineered specifically for rural connectivity, our platform loads fast even on 2G and 3G networks.',
      delay: '500ms'
    }
  ];

  return (
    <section id="features" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-black text-white mb-6">Why RuralLearn?</h2>
          <p className="text-xl text-slate-300">
            A comprehensive, technology-driven approach designed to bring world-class education to every corner of the globe.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
