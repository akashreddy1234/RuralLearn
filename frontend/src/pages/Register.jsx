import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AVAILABLE_LANGUAGES } from '../utils/translations';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    parentName: '',
    parentEmail: '',
    languagePreference: 'English',
    schoolCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      alert(res.data.message);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-900 p-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-[40%] left-[20%] w-64 h-64 bg-amber-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-10 animate-pulse" style={{ animationDelay: '3s' }}></div>

      <div className="glassmorphism w-full max-w-xl p-8 rounded-3xl z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-purple-300 tracking-tight drop-shadow-sm">Student Enrollment</h1>
          <p className="text-slate-300 mt-3 font-medium">Join thousands of learners in RuralLearn</p>
        </div>

        {error && (
           <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-xl mb-6 text-sm text-center font-medium backdrop-blur-md shadow-inner">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Student Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-5 py-3.5 rounded-xl glassmorphism-input"
                placeholder="Ex: John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Student Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-5 py-3.5 rounded-xl glassmorphism-input"
                placeholder="student@school.edu"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Parent/Guardian Name</label>
              <input
                type="text"
                name="parentName"
                className="w-full px-5 py-3.5 rounded-xl glassmorphism-input"
                placeholder="Ex: Jane Doe"
                value={formData.parentName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Parent/Guardian Email</label>
              <input
                type="email"
                name="parentEmail"
                required
                className="w-full px-5 py-3.5 rounded-xl glassmorphism-input"
                placeholder="parent@home.com"
                value={formData.parentEmail}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Realm Language</label>
              <div className="relative">
                <select
                  name="languagePreference"
                  className="w-full px-5 py-3.5 rounded-xl glassmorphism-input appearance-none bg-slate-900/50"
                  value={formData.languagePreference}
                  onChange={handleChange}
                >
                  {AVAILABLE_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code} className="bg-slate-800 text-white">
                      {lang.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">School Code (Optional)</label>
              <input
                type="text"
                name="schoolCode"
                className="w-full px-5 py-3.5 rounded-xl glassmorphism-input"
                placeholder="RURAL2024"
                value={formData.schoolCode}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-4 px-6 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(192,38,211,0.4)] hover:shadow-[0_0_30px_rgba(192,38,211,0.6)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register as Student'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-fuchsia-400 hover:text-fuchsia-300 hover:underline transition-colors">
            Login via OTP
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
