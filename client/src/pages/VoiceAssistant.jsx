import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, ShieldAlert, Sparkles, Navigation, Command, CornerDownLeft } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { aiApi, emergencyApi } from '../services/resources';
import toast from 'react-hot-toast';

const VoiceAssistant = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('System ready. State your voice command (e.g. "Trigger SOS alert", "Navigate to hospitals").');
  const [recognition, setRecognition] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setTranscript('Listening...');
      };

      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processCommand(text);
      };

      rec.onerror = (e) => {
        console.error(e);
        toast.error('Voice input transcription failed');
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      return toast.error('Speech recognition not supported on this browser');
    }
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const processCommand = async (commandText) => {
    const cleanCmd = commandText.toLowerCase().trim();
    setLoading(true);

    // 1. Check local voice shortcuts first
    if (cleanCmd.includes('sos') || cleanCmd.includes('trigger emergency') || cleanCmd.includes('danger')) {
      setResponse('🚨 CRITICAL INSTRUCTION DETECTED: Triggering immediate SOS broadcast...');
      toast.error('Voice Command SOS Initiating!');
      setTimeout(() => {
        triggerVoiceEmergency();
      }, 1500);
      setLoading(false);
      return;
    }

    if (cleanCmd.includes('hospital') || cleanCmd.includes('medical')) {
      setResponse('Routing navigation coordinates to nearby hospital trauma centers...');
      setTimeout(() => navigate('/hospitals'), 1500);
      setLoading(false);
      return;
    }

    if (cleanCmd.includes('disaster') || cleanCmd.includes('alerts') || cleanCmd.includes('hazard')) {
      setResponse('Opening regional hazard telemetry board...');
      setTimeout(() => navigate('/disasters'), 1500);
      setLoading(false);
      return;
    }

    if (cleanCmd.includes('family') || cleanCmd.includes('members') || cleanCmd.includes('track')) {
      setResponse('Opening family tracking locator...');
      setTimeout(() => navigate('/family'), 1500);
      setLoading(false);
      return;
    }

    if (cleanCmd.includes('dashboard') || cleanCmd.includes('home')) {
      setResponse('Opening main dashboard overview console...');
      setTimeout(() => navigate('/dashboard'), 1500);
      setLoading(false);
      return;
    }

    // 2. Query Gemini AI for general first aid / assistance voice questions
    try {
      const res = await aiApi.firstAid(commandText, []);
      setResponse(res.data.data.response);
    } catch (err) {
      setResponse('System failed to process query. Try saying "Trigger SOS", "Find hospitals", or "Check disasters".');
    } finally {
      setLoading(false);
    }
  };

  const triggerVoiceEmergency = async () => {
    try {
      const location = await new Promise((resolve) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve({ lat: 19.0760, lng: 72.8777 })
          );
        } else {
          resolve({ lat: 19.0760, lng: 72.8777 });
        }
      });

      await emergencyApi.trigger({
        type: 'sos',
        location,
        description: 'SOS Triggered via Voice Assistant activation command',
        affectedPersons: 1
      });

      toast.error('🆘 Voice Command SOS Activated!');
      navigate('/sos');
    } catch (e) {
      toast.error('Emergency dispatch request failed');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Hands-Free Voice Assister</h1>
        <p className="text-white/40 text-sm">Control security telemetry and trigger SOS alerts completely hands-free</p>
      </div>

      {/* Quick Demo Instruction Helper */}
      <GlassCard className="w-full p-4 border border-blue-500/20 bg-blue-950/5 text-xs space-y-2">
        <p className="font-semibold text-blue-400">🎤 Voice Commands You Can Speak (Chrome / Edge required):</p>
        <div className="grid grid-cols-2 gap-2 text-white/60">
          <div>“Trigger SOS” or “Danger” → <strong className="text-red-400">fires SOS dispatch</strong></div>
          <div>“Go to hospitals” → <strong className="text-blue-300">opens Hospital Finder</strong></div>
          <div>“Show disasters” → <strong className="text-yellow-300">opens Disaster Center</strong></div>
          <div>Any other query → <strong className="text-violet-300">answered by Gemini AI</strong></div>
        </div>
        <p className="text-white/30 italic">Click the microphone button and speak clearly — uses your browser’s Web Speech API.</p>
      </GlassCard>

      <GlassCard className="w-full p-8 text-center space-y-6 flex flex-col items-center relative overflow-hidden">
        {/* Pulsing ring indicator */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {isListening && (
            <>
              <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping scale-150" />
              <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping scale-125" />
            </>
          )}
          <button
            onClick={toggleListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center border transition-all ${
              isListening
                ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            {isListening ? <MicOff size={32} /> : <Mic size={32} />}
          </button>
        </div>

        <div className="space-y-1 w-full">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Voice Transcript Input</span>
          <p className="text-sm font-semibold min-h-6 italic text-white/90">
            {transcript || '"..."'}
          </p>
        </div>

        <div className="w-full border-t border-white/5 pt-4 space-y-2 text-left">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">System Response</span>
          <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-xs text-white/80 leading-relaxed font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
            {loading ? 'AI Telemetry processing...' : response}
          </div>
        </div>
      </GlassCard>

      {/* Voice command reference card */}
      <GlassCard className="w-full p-6">
        <h3 className="text-xs font-mono text-white/50 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Command size={14} /> Voice Command Shortcuts
        </h3>
        <div className="grid grid-cols-2 gap-3 text-xs text-white/60">
          <div className="flex items-center gap-2">
            <span className="text-red-400">•</span> "Trigger SOS / Emergency"
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400">•</span> "Find Hospitals / Trauma"
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">•</span> "Check Disasters / Alerts"
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400">•</span> "Track Family Members"
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default VoiceAssistant;
