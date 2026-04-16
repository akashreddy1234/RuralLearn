import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, Clock, PlayCircle, Folder, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../utils/translations';

const LessonsPage = () => {
  const { user } = useAuth();
  const t = useTranslation(user);

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await api.get('/lessons');
        setLessons(res.data);
      } catch (err) {
        console.error('Failed to fetch lessons', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

  const groupedLessons = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.subject]) acc[lesson.subject] = [];
    acc[lesson.subject].push(lesson);
    return acc;
  }, {});

  const subjects = Object.keys(groupedLessons);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{t('lessons')}</h1>
            <p className="text-slate-500">Explore subjects and improve your competency index.</p>
          </div>
          {selectedSubject && (
            <button 
              onClick={() => setSelectedSubject(null)}
              className="px-4 py-2 flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ChevronLeft size={18} /> Back to Subjects
            </button>
          )}
        </header>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading modules...</div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
             No lessons or subjects available yet. Check back soon!
          </div>
        ) : !selectedSubject ? (
          /* SUBJECTS VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map(subject => (
              <div 
                key={subject} 
                onClick={() => setSelectedSubject(subject)}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-100 flex flex-col items-center justify-center text-center cursor-pointer group"
              >
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Folder size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{subject}</h3>
                <p className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {groupedLessons[subject].length} Lesson{groupedLessons[subject].length !== 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
        ) : (
          /* LESSONS VIEW FOR SPECIFIC SUBJECT */
          <div>
            <div className="mb-6 flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                 <BookOpen size={20} />
               </div>
               <h2 className="text-2xl font-bold text-slate-800">{selectedSubject} {t('available_modules')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedLessons[selectedSubject].map(lesson => (
                <div key={lesson._id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-slate-100 overflow-hidden flex flex-col group">
                  <div className="h-32 bg-gradient-to-tr from-indigo-500 to-purple-600 p-5 flex items-start justify-between relative overflow-hidden">
                    <BookOpen size={64} className="absolute -bottom-4 -right-4 text-white opacity-20 transform group-hover:scale-110 transition-transform" />
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                      {lesson.language}
                    </span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{lesson.title}</h3>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mt-auto pt-4">
                      <div className="flex items-center gap-1">
                        <PlayCircle size={14} /> <span>{lesson.mediaType}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} /> <span>View</span>
                      </div>
                    </div>
                    <Link 
                      to={`/student/lesson/${lesson._id}`} 
                      className="mt-6 block w-full text-center py-2.5 bg-slate-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-colors border border-slate-100"
                    >
                      {t('view_content')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonsPage;
