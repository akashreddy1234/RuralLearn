const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the API only if the key is present
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const aiModelName = 'gemini-2.5-flash-lite';

const extractVideoId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
  return match ? match[1] : null;
};

// Base system prompt
const baseSystemPrompt = `You are an intelligent AI assistant like ChatGPT. 
You can answer any question. 
When lesson context is available, use it. 
Otherwise, respond using general knowledge. 
Do not generate false assumptions.

Core Behaviors:
1. DUAL MODE & CONTEXT PRIORITY: Try to use lesson/video context FIRST. If the question is general or context is irrelevant, fallback to general knowledge.
2. NO HALLUCINATION: If context is weak or missing, do NOT guess the topic. Answer generally or ask for clarification.
3. GENERAL CHAT SUPPORT: You allow and fully support coding questions, general doubts, and concepts not strictly tied to the platform.
4. RESPONSE STYLE: Keep explanations clear, simple, and student-friendly. Provide examples when needed and explain concepts step-by-step.
5. QUIZ SUPPORT: Guide students with hints, do not directly give answers unless asked.`;

exports.handleChat = async (req, res) => {
  try {
    const { message, context, history, action } = req.body;

    if (!message && !action) {
      return res.status(400).json({ success: false, message: 'Message or action is required' });
    }

    if (!genAI) {
      return res.status(503).json({ 
        success: false, 
        message: 'AI Assistant is currently unavailable. GEMINI_API_KEY is missing in the server configuration.' 
      });
    }

    let dynamicPrompt = baseSystemPrompt + "\n\n";

    // --- Action: Summarize Video or Video Doubt ---
    if (context?.videoUrl && (action === 'summarize_video' || action === 'video_doubt')) {
      const videoId = extractVideoId(context.videoUrl);
      console.log(`[YoutubeTranscript] Analyzing URL: ${context.videoUrl} -> Extracted ID: ${videoId}`);
      let transcriptText = "";
      
      try {
        if (!videoId) throw new Error("Invalid Video ID");
        const { YoutubeTranscript } = require('youtube-transcript');
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        
        if (transcript && transcript.length > 0) {
          transcriptText = transcript.map(t => t.text).join(' ');
          console.log(`[YoutubeTranscript] Processed transcript length: ${transcriptText.length} characters.`);
        }
      } catch (err) {
        console.error(`[YoutubeTranscript] ERROR for video ${videoId}:`, err.message);
        transcriptText = ""; // Continue even if transcript fails
      }

      dynamicPrompt += `[CONTEXT: VIDEO LESSON]\nTitle: ${context.title || 'Unknown Title'}\nSubject: ${context.subject || 'General'}\n`;
      
      if (transcriptText) {
        dynamicPrompt += `Transcript snippet: ${transcriptText.substring(0, 3000)}\n\n`;
      } else {
        dynamicPrompt += `Transcript: NOT AVAILABLE. Attempt to infer the topic from the title/subject, OR simply answer the student's question normally using your general knowledge.\n\n`;
      }
      
      if (action === 'summarize_video') {
        dynamicPrompt += `INSTRUCTION: Provide a clear, structured summary or explanation of the topic presented in this video. Explain it simply like a tutor.`;
      } else {
        dynamicPrompt += `INSTRUCTION: Answer the student's doubt about this video/topic. Explain step-by-step with reasoning. Do not just give a direct answer.`;
      }
    } 
    // --- Action: Explain Quiz ---
    else if (context?.quizContext && action === 'explain_quiz') {
      const { question, options, incorrectAnswer } = context.quizContext;
      dynamicPrompt += `[CONTEXT: QUIZ EXPLANATION]\nQuestion: ${question}\nOptions: ${options.join(', ')}\nStudent selected (Wrong): ${incorrectAnswer}\n\n`;
      dynamicPrompt += `INSTRUCTION: Guide the student to the correct answer using hints. Explain WHY their choice is incorrect. DO NOT directly reveal the correct option string unless explicitly asked after multiple tries.`;
    } 
    // --- Action: CI Advice ---
    else if (action === 'ci_advice' && context?.performanceContext) {
      const perf = context.performanceContext;
      const weakTopics = perf.masteryProgress ? perf.masteryProgress.filter(p => parseFloat(p.percentage) < 60) : [];
      let topicsString = weakTopics.map(w => w.subject).join(', ') || 'None formally identified';
      
      dynamicPrompt += `[CONTEXT: STUDENT PERFORMANCE]\nStreak: ${perf.stats?.streak}\nPoints: ${perf.stats?.totalPoints}\nAvg Accuracy: ${perf.stats?.avgAccuracy}%\nWeak Topics Identified: ${topicsString}\n\n`;
      dynamicPrompt += `INSTRUCTION: Provide performance guidance. Congratulate them on their efforts so far, suggest reviewing their weak areas, and give practical tips on how to improve. Be highly conversational and supportive.`;
    }
    // --- Standard Chat ---
    else {
      if (context?.title || context?.subject) {
        dynamicPrompt += `[CONTEXT: CURRENT LESSON/TOPIC]\nTitle: ${context.title || 'Unknown'}\nSubject: ${context.subject || 'General'}\n`;
        if (context?.content) dynamicPrompt += `Content Summary: ${context.content.substring(0, 1500)}\n`;
        dynamicPrompt += `\nINSTRUCTION: Determine if the user's question relates to the lesson context above. If yes, use the context. If it is a general question, ignore context and answer using your ChatGPT general knowledge.`;
      } else {
        dynamicPrompt += `\nINSTRUCTION: No specific lesson context provided. Answer the user's message normally using your general ChatGPT knowledge (coding, study help, general concepts).`;
      }
    }

    const model = genAI.getGenerativeModel({ model: aiModelName });

    // Format chat history
    const formattedHistory = [
      { role: 'user', parts: [{ text: dynamicPrompt + "\n\nUnderstood?" }] },
      { role: 'model', parts: [{ text: "Understood. I will act as the AI Learning Assistant following those specific context instructions." }] },
    ];

    if (history && history.length > 0) {
      history.forEach(h => {
        formattedHistory.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      });
    }

    const chatSession = model.startChat({ history: formattedHistory });
    
    // Fallback message if no actual user message was provided but action was meant to trigger bot
    const userMsg = message || "Please process the requested action.";
    const result = await chatSession.sendMessage(userMsg);
    
    res.status(200).json({
      success: true,
      data: result.response.text()
    });
  } catch (error) {
    console.error('Chat AI Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process AI request' });
  }
};
