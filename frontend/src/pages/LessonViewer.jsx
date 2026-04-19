import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, PlayCircle, FileText, ExternalLink, ArrowRight, MessageSquare } from 'lucide-react';
import Chatbot from '../components/Chatbot';

const LessonViewer = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await api.get(`/lessons/${lessonId}`);
        setLesson(res.data);
      } catch (err) {
        console.error('Failed to fetch lesson', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading lesson content...</div>;
  }

  if (!lesson) {
    return <div className="min-h-screen flex items-center justify-center text-rose-500">Lesson not found.</div>;
  }

  // Helper to safely convert any YouTube URL into an embeddable src
  const getEmbedUrl = (url) => {
    if (!url) return null;
    try {
      // Handle youtu.be/VIDEO_ID short links
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }
      // Handle youtube.com/watch?v=VIDEO_ID
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get('v');
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }
      // If it's already an embed URL, return as-is
      if (url.includes('youtube.com/embed/')) {
        return url.split('?')[0]; // strip any extra params
      }
    } catch (e) {
      return null;
    }
    return null; // unrecognised URL format — trigger fallback
  };

  const embeddedVideo = getEmbedUrl(lesson.videoUrl);
  const hasVideoUrl = !!lesson.videoUrl;
  const isVideoValid = !!embeddedVideo;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {lesson.subject}
            </span>
            <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {lesson.language}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">{lesson.title}</h1>
        </header>

        <main className="space-y-8 mb-12">
          {hasVideoUrl && (
            <section className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {isVideoValid ? (
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900">
                  <iframe 
                    src={embeddedVideo} 
                    title={lesson.title} 
                    className="w-full h-full border-0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="aspect-video w-full rounded-xl bg-slate-100 flex flex-col items-center justify-center gap-3 border border-dashed border-slate-300">
                  <PlayCircle size={48} className="text-slate-300" />
                  <p className="text-slate-700 font-bold">Invalid video link provided by teacher.</p>
                  <p className="text-slate-400 text-sm">The stored URL could not be converted to an embeddable format.</p>
                  <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-sm font-bold">Open link manually</a>
                </div>
              )}
            </section>
          )}

          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="text-blue-500" size={24} /> Lesson Content
              </h2>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))}
                className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold rounded-lg transition-colors border border-teal-200 shadow-sm"
              >
                <MessageSquare size={18} /> Ask about this lesson
              </button>
            </div>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
              {lesson.content}
            </div>
          </section>

          {(lesson.documentUrl || lesson.externalLink) && (
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Additional Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lesson.documentUrl && (
                  <a 
                    href={`${import.meta.env.VITE_API_URL}${lesson.documentUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center p-4 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                  >
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600 mr-4 group-hover:bg-blue-200 transition-colors">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Download Document</h3>
                      <p className="text-xs text-slate-500 mt-1">PDF, DOC, or PPT resource</p>
                    </div>
                  </a>
                )}
                {lesson.externalLink && (
                  <a 
                    href={lesson.externalLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center p-4 border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-colors group"
                  >
                    <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600 mr-4 group-hover:bg-emerald-200 transition-colors">
                      <ExternalLink size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">External Resource</h3>
                      <p className="text-xs text-slate-500 mt-1">Read more on the web</p>
                    </div>
                  </a>
                )}
              </div>
            </section>
          )}
        </main>

        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-sm">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h3 className="text-xl font-bold text-teal-800 mb-1">Ready to test your knowledge?</h3>
            <p className="text-teal-600">Take the quiz to improve your Competency Index!</p>
          </div>
          <button 
            onClick={() => navigate(`/student/quiz/${lessonId}`)}
            className="flex items-center gap-2 px-8 py-4 bg-teal-600 text-white font-bold rounded-xl shadow-lg hover:bg-teal-700 hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            Start Quiz <ArrowRight size={20} />
          </button>
        </div>
      </div>
      <Chatbot lessonContext={lesson} />
    </div>
  );
};

export default LessonViewer;
