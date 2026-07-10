import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, HeartPulse, ShieldAlert, Sparkles, MessageCircleWarning } from 'lucide-react';
import { aiApi } from '../services/resources';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import VoiceInputButton from '../components/chat/VoiceInputButton';
import toast from 'react-hot-toast';

const FirstAid = () => {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: `Hello! I am your SafeGuard AI First Aid Assistant. 

Tell me the injury, condition, or situation, and I'll give you clear, step-by-step first aid instructions.

⚠️ ALWAYS CALL 108/112 (or local emergency) IMMEDIATELY for life-threatening emergencies.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput('');

    // Append user message
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Build conversation history format for API
      const history = messages.map(m => ({
        role: m.role === 'ai' ? 'model' : 'user',
        content: m.content
      }));

      const res = await aiApi.firstAid(text, history);
      setMessages(prev => [...prev, { role: 'ai', content: res.data.data.response }]);
    } catch (err) {
      console.error(err);
      toast.error('AI chat failed. Try again.');
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          content: '⚠️ Telemetry timeout. Please seek certified emergency assistance immediately if there is danger.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      <div className="flex-shrink-0">
        <h1 className="text-2xl sm:text-3xl font-display font-bold">First Aid AI Assistant</h1>
        <p className="text-white/40 text-sm">Instant first-aid guidelines powered by Google Gemini AI</p>
      </div>

      {/* Quick Demo Instruction Helper */}
      <GlassCard className="flex-shrink-0 p-4 border border-blue-500/20 bg-blue-950/5 text-xs space-y-2">
        <p className="font-semibold text-blue-400">💡 How to query first-aid guidelines:</p>
        <ul className="list-disc pl-4 space-y-1 text-white/60">
          <li>Type a query in the text area (e.g. <strong className="text-blue-300">"What to do for heat stroke?"</strong> or <strong className="text-blue-300">"CPR steps"</strong>).</li>
          <li>Or click the <strong className="text-blue-300">Microphone</strong> button to speak and transcribe your query hands-free.</li>
        </ul>
      </GlassCard>

      {/* Critical Medical Disclaimer Banner */}
      <div className="flex-shrink-0 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
        <MessageCircleWarning size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-red-400">EMERGENCY DISCLAIMER</p>
          <p className="text-xs text-white/60">
            This AI tool provides informational guidelines only and is NOT a substitute for professional medical care. For severe trauma or critical conditions, call 108/112 immediately.
          </p>
        </div>
      </div>

      {/* Chat Window container */}
      <GlassCard className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white/5 border border-white/5 text-white/90 rounded-bl-none'
                }`}
              >
                {m.role === 'ai' && (
                  <div className="flex items-center gap-1.5 mb-1.5 text-xs text-blue-400 font-semibold font-mono uppercase">
                    <Sparkles size={12} /> AI Responder
                  </div>
                )}
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-none p-4 max-w-[85%]">
                <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold font-mono uppercase mb-2">
                  <Sparkles size={12} className="animate-spin" /> Analyzing conditions...
                </div>
                <div className="flex space-x-1.5 justify-center items-center py-2 px-4">
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/5 bg-white/[0.02] flex items-center gap-2">
          <VoiceInputButton
            onTranscript={(text) => {
              setInput(text);
              toast.success('Voice recognized: ' + text.substring(0, 30) + '...');
            }}
            disabled={loading}
          />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            rows="1"
            placeholder="Type injury or ask about symptoms (e.g. burn care, CPR)..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <Button
            variant="primary"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-3 rounded-xl flex-shrink-0"
          >
            <Send size={16} />
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};

export default FirstAid;
