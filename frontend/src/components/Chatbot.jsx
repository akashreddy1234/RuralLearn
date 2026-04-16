import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, Youtube, HelpCircle, Activity } from 'lucide-react';
import { useTranslation } from '../utils/translations';
import ReactMarkdown from 'react-markdown';

const Chatbot = ({ lessonContext = null, quizContext = null, performanceContext = null, isOpenDefault = false }) => {
  const { user } = useAuth();
  const t = useTranslation(user);
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    const handleOpenChatbot = () => setIsOpen(true);
    window.addEventListener('open-chatbot', handleOpenChatbot);
    return () => window.removeEventListener('open-chatbot', handleOpenChatbot);
  }, []);

  if (user?.role?.toLowerCase() !== 'student') return null;

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      let welcomeMsg = `Hi ${user?.name}! Ready to learn? Ask me anything about your subjects!`;
      if (quizContext) welcomeMsg = `I see you need help with a quiz question. What's confusing you?`;
      else if (lessonContext) welcomeMsg = `Have any questions about *${lessonContext.title}*?`;
      else if (performanceContext) welcomeMsg = `Here to review your Competency Index! Need advice?`;
        
      setMessages([{ id: 1, role: 'model', text: welcomeMsg }]);
    }
  }, [isOpen, lessonContext, quizContext, performanceContext, messages.length, user]);

  const handleAction = async (actionType, promptText) => {
    setIsOpen(true);
    const newMsg = { id: Date.now(), role: 'user', text: promptText };
    setMessages(prev => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const history = messages.slice(1).map(m => ({ role: m.role, text: m.text }));
      const payload = {
        message: promptText,
        history,
        action: actionType,
        context: {
          title: lessonContext?.title,
          subject: lessonContext?.subject,
          content: lessonContext?.content?.substring(0, 1000),
          videoUrl: lessonContext?.videoUrl,
          quizContext: quizContext,
          performanceContext: performanceContext
        }
      };

      const res = await api.post('/chat', payload);
      if (res.data.success) {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'model', text: res.data.data }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'model', text: 'Sorry, I encountered an error answering that.' }]);
      }
    } catch (err) {
      console.error('Chat AI request failed:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.data || 'I am currently unable to reach the AI servers.';
      
      // Fallback for transcript
      if (actionType === 'summarize_video' || actionType === 'video_doubt') {
        const msgText = err.response?.data?.data === "Transcript not available for this video" ? err.response?.data?.data : errorMsg;
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'model', text: msgText }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'model', text: errorMsg }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const text = inputVal.trim();
    setInputVal('');
    
    // Auto-detect doubt for videos
    let activeAction = 'general';
    if (lessonContext?.videoUrl) activeAction = 'video_doubt';

    await handleAction(activeAction, text);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={handleOpen}
        className="fixed bottom-6 right-6 p-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-[0_0_20px_rgba(13,148,136,0.5)] transition-all hover:scale-105 z-50 flex items-center justify-center animate-bounce group"
      >
        <Sparkles size={28} className="absolute blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
        <MessageSquare size={28} className="relative z-10" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-full max-w-[380px] sm:max-w-sm h-[550px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 border border-slate-200" style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-teal-500 p-4 text-white flex justify-between items-center shadow-md relative z-20">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-md">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight tracking-tight">AI Assistant</h3>
            <p className="text-xs text-indigo-100 opacity-90">{quizContext ? 'Quiz Helper' : performanceContext ? 'Insights Engine' : lessonContext ? `Context: ${lessonContext.title}` : 'RuralLearn Support'}</p>
          </div>
        </div>
        <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Action Chips */}
      {(lessonContext?.videoUrl || quizContext || performanceContext) && (
        <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide shrink-0 relative z-10 shadow-sm">
          {lessonContext?.videoUrl && (
            <button 
              onClick={() => handleAction('summarize_video', 'Summarize Video')}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-full text-xs font-bold transition-colors disabled:opacity-50"
            >
              <Youtube size={14} /> Summarize Video
            </button>
          )}
          {quizContext && (
            <button 
              onClick={() => handleAction('explain_quiz', 'Explain this question')}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-full text-xs font-bold transition-colors disabled:opacity-50"
            >
              <HelpCircle size={14} /> Explain Question
            </button>
          )}
          {performanceContext && (
            <button 
              onClick={() => handleAction('ci_advice', 'Suggest lessons to revise')}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-full text-xs font-bold transition-colors disabled:opacity-50"
            >
              <Activity size={14} /> Analyze Weak Topics
            </button>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#f8fafc] scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-auto shadow-sm ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-teal-100 text-teal-600'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3.5 text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-[20px] rounded-br-[4px] shadow-md shadow-indigo-500/20' : 'bg-white border border-slate-100 text-slate-700 rounded-[20px] rounded-bl-[4px] shadow-sm'}`}>
                {msg.role === 'user' ? (
                  msg.text
                ) : (
                  <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-a:text-teal-600 prose-strong:text-slate-800">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 flex-row max-w-[85%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-auto shadow-sm bg-teal-100 text-teal-600">
                 <Bot size={16} />
              </div>
              <div className="p-4 bg-white border border-slate-100 rounded-[20px] rounded-bl-[4px] shadow-sm flex items-center gap-3">
                <Loader2 size={16} className="animate-spin text-teal-500" />
                <span className="text-xs text-slate-500 font-medium">Analyzing context...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask a question..."
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-3.5 pl-5 pr-14 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none text-slate-700 shadow-inner"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={!inputVal.trim() || isLoading}
            className="absolute right-2 p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-md disabled:shadow-none"
          >
            <Send size={16} className="ml-0.5" />
          </button>
        </form>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
