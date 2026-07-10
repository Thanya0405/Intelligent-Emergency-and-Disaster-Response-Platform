import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { emergencyApi } from '../../services/resources';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SOSFloatingButton = () => {
  const [pressed, setPressed] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [triggered, setTriggered] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSOSPress = () => {
    if (triggered) return;
    setPressed(true);
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        triggerSOS();
      }
    }, 1000);
  };

  const handleCancel = () => {
    setPressed(false);
    setCountdown(3);
    toast('SOS cancelled', { icon: '✋' });
  };

  const triggerSOS = async () => {
    setTriggered(true);
    setPressed(false);
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
        description: 'Emergency SOS triggered from mobile interface',
        affectedPersons: 1
      });

      toast.error('🆘 SOS TRIGGERED! Emergency contacts notified!', { duration: 6000 });
      navigate('/sos');
    } catch (err) {
      toast.error('SOS failed — call 108 immediately!');
    } finally {
      setTimeout(() => setTriggered(false), 5000);
      setCountdown(3);
    }
  };

  return (
    <>
      <AnimatePresence>
        {pressed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-900/20 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#111827] border border-red-500/30 rounded-2xl p-8 text-center max-w-sm mx-4"
            >
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                <div className="relative w-24 h-24 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-display font-bold text-white">{countdown}</span>
                </div>
              </div>
              <h2 className="text-xl font-display font-bold text-white mb-2">SOS Activating...</h2>
              <p className="text-white/60 text-sm mb-6">Emergency services will be alerted. Press cancel to abort.</p>
              <button
                onClick={handleCancel}
                className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all"
              >
                <X size={16} className="inline mr-2" /> Cancel SOS
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          {/* Pulse rings */}
          {!pressed && (
            <>
              <div className="absolute inset-0 bg-red-500/30 rounded-full animate-ping scale-150" />
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping scale-125 animation-delay-150" />
            </>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onMouseDown={handleSOSPress}
            onTouchStart={handleSOSPress}
            className="relative w-14 h-14 bg-red-600 hover:bg-red-500 rounded-full shadow-2xl shadow-red-500/40 flex items-center justify-center transition-colors focus:outline-none focus:ring-4 focus:ring-red-500/50"
            aria-label="SOS Emergency Button"
            title="Hold for SOS"
          >
            <Phone size={22} className="text-white" />
          </motion.button>
        </div>
        <p className="text-center text-xs text-white/40 mt-1.5 font-mono">SOS</p>
      </div>
    </>
  );
};

export default SOSFloatingButton;
