import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../utils/translations';
import Chatbot from '../components/Chatbot';

const QuizPage = () => {
  const { user } = useAuth();
  const t = useTranslation(user);
  
  const { lessonId } = useParams();
  const navigate = useNavigate();
  
  const [currentQuestion, setCurrentQuestion] = useState(null);
  
  // Adaptive State
  const [ciScore, setCiScore] = useState(50);
  const [targetDifficulty, setTargetDifficulty] = useState('medium');
  const [attemptedQIds, setAttemptedQIds] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentSelection, setCurrentSelection] = useState('');
  
  // Submission State
  const [isFinished, setIsFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  const fetchNextQuestion = async (difficulty, excludeIds) => {
    try {
      setLoading(true);
      if (excludeIds.length >= 5) {
        setIsFinished(true);
        return;
      }
      const res = await api.post(`/quizzes/lesson/${lessonId}/next`, {
        difficultyLevel: difficulty,
        attemptedQIds: excludeIds
      });
      if (res.data) {
        setCurrentQuestion(res.data);
      } else {
        // Fallback if no more questions available in DB AT ALL
        setIsFinished(true);
      }
    } catch (err) {
      console.error('Failed to fetch next question:', err);
      setIsFinished(true);
    } finally {
      setLoading(false);
    }
  };

  // Initial Question Selection
  useEffect(() => {
    if (currentQuestion === null && !isFinished && attemptedQIds.length === 0) {
      fetchNextQuestion('medium', []);
    }
  }, [lessonId]);

  // Handle final submission sequence once finished flag is set
  useEffect(() => {
    if (isFinished && !result && !submitting && attemptedQIds.length > 0) {
      submitAdaptiveQuiz();
    }
  }, [isFinished]);

  const handleAnswerSubmit = () => {
    if (!currentSelection) return;

    const isCorrect = currentSelection === currentQuestion.correctAnswer;
    
    // Adapt CI & Difficulty
    let newCI = ciScore;
    let newDiff = targetDifficulty;
    
    if (isCorrect) {
      newCI = Math.min(100, newCI + 15);
      if (newDiff === 'easy') newDiff = 'medium';
      else if (newDiff === 'medium') newDiff = 'hard';
    } else {
      newCI = Math.max(0, newCI - 10);
      if (newDiff === 'hard') newDiff = 'medium';
      else if (newDiff === 'medium') newDiff = 'easy';
    }
    
    setCiScore(newCI);
    setTargetDifficulty(newDiff);
    
    const newAttemptedIds = [...attemptedQIds, currentQuestion._id];
    setAttemptedQIds(newAttemptedIds);
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion._id]: currentSelection
    }));
    
    setCurrentSelection('');
    
    // Trigger next evaluation dynamically
    fetchNextQuestion(newDiff, newAttemptedIds);
  };

  const submitAdaptiveQuiz = async () => {
    setSubmitting(true);
    
    const answersPayload = Object.keys(selectedAnswers).map(quizId => ({
      quizId,
      selectedOption: selectedAnswers[quizId]
    }));
    
    const timeSpentSec = Math.floor((Date.now() - startTime) / 1000);

    try {
      const res = await api.post('/quizzes/submit', {
        lessonId,
        answers: answersPayload,
        timeSpentSec
      });
      // Override backend result with frontend adapted live CI if needed, 
      // but let's show whatever backend validated based on true logic.
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Error submitting quiz map. Check logs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold animate-pulse">Initializing Adaptive Engine...</div>;
  
  if (isFinished && attemptedQIds.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 bg-slate-50">No quizzes mapped to this lesson boundary.</div>;
  }

  // Render Completion Result
  if (result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full p-8 rounded-3xl shadow-xl text-center border border-slate-100">
          <div className="w-24 h-24 bg-teal-100 text-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-black">{Math.round(result.accuracy)}%</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Adaptive Quiz Complete!</h2>
          <p className="text-slate-600 mb-6">You got {result.correctCount} out of {result.total} questions correct in this sprint.</p>
          
          <div className="bg-slate-50 p-4 rounded-xl mb-8 flex items-center justify-around border border-slate-100">
             <div className="text-center">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Live CI Score</p>
              <p className="text-xl font-bold text-indigo-600">{Math.round(ciScore)}</p>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div className="text-center">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Peak Diff</p>
              <p className={`text-xl font-bold capitalize ${targetDifficulty === 'hard' ? 'text-rose-500' : targetDifficulty === 'medium' ? 'text-amber-500' : 'text-emerald-500'}`}>{targetDifficulty}</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/student/lessons')}
            className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl border-b-4 border-teal-700 hover:border-b-0 hover:translate-y-1 transition-all shadow-md hover:shadow-lg"
          >
            {t('back_to_modules')}
          </button>
        </div>
      </div>
    );
  }

  if (isFinished || submitting || !currentQuestion) {
    return <div className="min-h-screen flex items-center justify-center text-indigo-500 font-bold animate-pulse">Compiling performance matrix...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Dynamic Header Stats */}
      <div className="w-full max-w-2xl mb-4 flex justify-between items-end px-2">
         <div className="flex gap-4">
           <div>
             <span className="block text-xs uppercase text-slate-400 font-bold mb-1">Live CI Rating</span>
             <span className="text-lg font-black text-indigo-600 tracking-tight">{Math.round(ciScore)}</span>
           </div>
           <div>
             <span className="block text-xs uppercase text-slate-400 font-bold mb-1">Active Class</span>
             <span className={`px-3 py-0.5 rounded-lg text-xs font-bold uppercase tracking-widest ${targetDifficulty === 'hard' ? 'bg-rose-100 text-rose-600' : targetDifficulty === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {targetDifficulty}
             </span>
           </div>
         </div>
         <div className="text-right">
            <span className="text-slate-400 font-bold text-sm">{t('question')} {attemptedQIds.length + 1} / 5</span>
         </div>
      </div>

      <div className="bg-white max-w-2xl w-full p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
        {/* Decorative background visual matching difficulty */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/3 transition-colors duration-1000 ${currentQuestion.difficultyLevel === 'hard' ? 'bg-rose-500' : currentQuestion.difficultyLevel === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>

        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 relative z-10 leading-snug">{currentQuestion.question}</h2>

        <div className="space-y-4 mb-10 relative z-10">
          {currentQuestion.options.map((opt, i) => {
            const isSelected = currentSelection === opt;
            return (
              <button
                key={i}
                onClick={() => setCurrentSelection(opt)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 group flex items-center gap-4 ${isSelected ? 'border-indigo-500 bg-indigo-50/50 shadow-md transform -translate-y-0.5' : 'border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50'}`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'border-indigo-500' : 'border-slate-300 group-hover:border-slate-400'}`}>
                  {isSelected && <div className="w-3 h-3 bg-indigo-500 rounded-full animate-in zoom-in duration-200"></div>}
                </div>
                <span className={`text-lg font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{opt}</span>
              </button>
            )
          })}
        </div>

        <div className="flex justify-end gap-4 relative z-10 border-t border-slate-100 pt-6 mt-4">
          <button 
            onClick={handleAnswerSubmit}
            disabled={!currentSelection}
            className="px-8 py-3.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl disabled:opacity-30 disabled:hover:bg-slate-900 transition-all shadow-lg disabled:shadow-none shadow-slate-900/20"
          >
            {t('submit_answer')}
          </button>
        </div>
      </div>
      
      {/* ProgressBar */}
      <div className="w-full max-w-2xl mt-6 bg-slate-200 h-2 rounded-full overflow-hidden">
         <div className="h-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${(attemptedQIds.length / 5) * 100}%` }}></div>
      </div>
      {/* Expose Chatbot with Quiz Context when a wrong answer is being pondered or after selecting */}
      <Chatbot quizContext={
        currentSelection && currentSelection !== currentQuestion?.correctAnswer
          ? { question: currentQuestion.question, options: currentQuestion.options, incorrectAnswer: currentSelection } 
          : null
      } />
    </div>
  );
};

export default QuizPage;
