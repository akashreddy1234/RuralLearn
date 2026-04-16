import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import api from '../services/api';

const ChatModal = ({ isOpen, onClose, currentUser, otherUser, student, subject }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && otherUser && student && subject) {
      fetchThread();
    }
  }, [isOpen, otherUser, student, subject]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
      return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const fetchThread = async () => {
    setLoading(true);
    try {
      const otherId = otherUser.id || otherUser._id;
      const studId = student.id || student._id;
      const res = await api.get(`/messages/thread/${studId}/${subject}/${otherId}`);
      setMessages(res.data);

      const hasUnread = res.data.some(msg => {
        const receiverId = msg.receiver._id ? msg.receiver._id.toString() : msg.receiver.toString();
        return !msg.read && receiverId === currentUser._id.toString();
      });
      if (hasUnread) {
         api.post('/messages/read', {
           studentId: studId,
           subject: subject,
           otherUserId: otherId
         }).catch(console.error);
      }
    } catch (err) {
      console.error('Error fetching chat thread:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await api.post('/messages/send', {
        receiverId: otherUser.id || otherUser._id,
        studentId: student.id || student._id,
        subject,
        text: newMessage
      });
      // push new message locally
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col h-[600px] max-h-[90vh]">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50 rounded-t-3xl">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Chat with {otherUser.name} ({subject})</h3>
              <p className="text-xs text-indigo-600 font-semibold">Student: {student.name}</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {loading ? (
              <div className="text-center text-slate-400 mt-4">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-slate-400 mt-4">
                 {currentUser.role === 'Parent' ? "Start a conversation with your child's teacher" : "No parent queries yet"}
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.sender._id === currentUser._id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {formatRelativeTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100 rounded-b-3xl">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-3 rounded-xl transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
  );
};
export default ChatModal;
