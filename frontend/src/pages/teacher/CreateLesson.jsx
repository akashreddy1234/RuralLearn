import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Returns the embed URL if valid, or null if invalid
const getYouTubeEmbedUrl = (url) => {
  if (!url || !url.trim()) return { embedUrl: '', error: null };
  try {
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) return { embedUrl: `https://www.youtube.com/embed/${videoId}`, error: null };
    }
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return { embedUrl: `https://www.youtube.com/embed/${videoId}`, error: null };
    }
    if (url.includes('youtube.com/embed/')) {
      return { embedUrl: url.split('?')[0], error: null };
    }
  } catch (e) {}
  return { embedUrl: null, error: 'Invalid YouTube URL. Use: youtube.com/watch?v=... or youtu.be/...' };
};

const CreateLesson = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    language: 'English',
    mediaType: 'Mixed',
    videoUrl: '',
    externalLink: '',
    content: ''
  });
  const [file, setFile] = useState(null);
  const [videoError, setVideoError] = useState('');
  const [assignedSubject, setAssignedSubject] = useState('');
  const [loadingSubject, setLoadingSubject] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.subjects && res.data.subjects.length > 0) {
          setAssignedSubject(res.data.subjects[0]);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoadingSubject(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear video error when user changes the video URL
    if (e.target.name === 'videoUrl') setVideoError('');
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate and auto-convert YouTube URL
    let finalVideoUrl = '';
    if (formData.videoUrl && formData.videoUrl.trim()) {
      const { embedUrl, error } = getYouTubeEmbedUrl(formData.videoUrl.trim());
      if (error) {
        setVideoError(error);
        return; // Block submission
      }
      finalVideoUrl = embedUrl;
    }

    try {
      const data = new FormData();
      const payload = { ...formData, videoUrl: finalVideoUrl };
      Object.keys(payload).forEach(key => {
        data.append(key, payload[key]);
      });
      if (file) {
        data.append('document', file);
      }

      await api.post('/lessons', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Lesson Created Successfully! Students can now see this in their modules.');
      navigate('/teacher/dashboard');
    } catch (err) {
      console.error('Submission error', err);
      alert(err.response?.data?.message || 'Failed to create lesson');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Create Lesson</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Lesson Title</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
              {loadingSubject ? (
                <div className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-medium">
                  Loading subject...
                </div>
              ) : assignedSubject ? (
                <div className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-semibold flex items-center justify-between">
                  <span>{assignedSubject}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full whitespace-nowrap">Auto-assigned</span>
                </div>
              ) : (
                <div className="w-full px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-medium whitespace-break-spaces">
                  No subject assigned. Contact admin.
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Language</label>
              <select 
                name="language" 
                value={formData.language} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Marathi">Marathi</option>
                <option value="Telugu">Telugu</option>
                <option value="Tamil">Tamil</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">YouTube / Video URL</label>
              <input 
                type="url" 
                name="videoUrl" 
                value={formData.videoUrl} 
                onChange={handleChange} 
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${videoError ? 'border-rose-400 ring-2 ring-rose-300' : 'border-slate-200'}`} 
                placeholder="https://youtube.com/watch?v=... or https://youtu.be/..." 
              />
              {videoError && (
                <p className="text-rose-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                  ⚠️ {videoError}
                </p>
              )}
              {formData.videoUrl && !videoError && (() => {
                const { embedUrl } = getYouTubeEmbedUrl(formData.videoUrl);
                return embedUrl ? (
                  <p className="text-emerald-600 text-xs font-semibold mt-1.5">✅ Valid YouTube link detected</p>
                ) : null;
              })()}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">External Study Link</label>
              <input 
                type="url" 
                name="externalLink" 
                value={formData.externalLink} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="https://wikipedia.org/..." 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Document (PDF, PPT, DOC)</label>
            <input 
              type="file" 
              name="document" 
              onChange={handleFileChange} 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Lesson Content</label>
            <textarea 
              name="content" 
              rows="6" 
              value={formData.content} 
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required
            ></textarea>
          </div>
          <div className="flex justify-end gap-4">
            <button 
              type="button" 
              onClick={() => navigate('/teacher/dashboard')} 
              className="px-6 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!assignedSubject}
              className={`px-6 py-3 font-semibold text-white rounded-xl shadow-lg transition-colors ${assignedSubject ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-400 cursor-not-allowed'}`}
            >
              Submit Lesson
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLesson;
