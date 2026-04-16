import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const res = await api.post('/auth/otp/request', { email });
      setInfo(res.data.message);
      setStep(2);
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request OTP. Ensure email is correct.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/otp/verify', { email, otp });
      login(res.data);
      if (res.data.role) {
        navigate(`/${res.data.role.toLowerCase()}/dashboard`);
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or Expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 p-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="glassmorphism w-full max-w-md p-8 rounded-3xl z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-300 tracking-tight drop-shadow-sm">RuralLearn</h1>
          <p className="text-slate-300 mt-3 font-medium">Secure OTP Access</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-xl mb-6 text-sm text-center font-medium backdrop-blur-md shadow-inner">
            {error}
          </div>
        )}
        
        {info && (
          <div className="bg-teal-500/10 border border-teal-500/30 text-teal-200 p-4 rounded-xl mb-6 text-sm text-center font-medium backdrop-blur-md shadow-inner">
            {info}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-5 py-3.5 rounded-xl glassmorphism-input"
                placeholder="teacher@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full mt-4 py-4 px-6 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:shadow-[0_0_30px_rgba(20,184,166,0.6)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : cooldown > 0 ? `Wait ${cooldown}s to Resend` : 'Request OTP Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Enter 6-Digit OTP</label>
              <input
                type="text"
                required
                className="w-full px-5 py-3.5 rounded-xl glassmorphism-input text-center tracking-[0.5em] text-2xl font-bold"
                placeholder="------"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full mt-4 py-4 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Authenticate'}
            </button>
            
            <div className="text-center mt-4">
               <button 
                type="button" 
                onClick={handleRequestOtp} 
                disabled={cooldown > 0 || loading}
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:hover:text-slate-400"
               >
                 {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
               </button>
            </div>
            <div className="text-center mt-2">
               <button 
                type="button" 
                onClick={() => { setStep(1); setOtp(''); setInfo(''); }} 
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
               >
                 Change Email Address
               </button>
            </div>
          </form>
        )}

        <p className="mt-8 text-center text-sm font-medium text-slate-400">
          Student Self-Enrollment?{' '}
          <Link to="/register" className="font-bold text-teal-400 hover:text-teal-300 hover:underline transition-colors">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
