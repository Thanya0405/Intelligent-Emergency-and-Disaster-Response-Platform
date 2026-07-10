import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ShieldAlert, Navigation, PhoneOff, CheckCircle } from 'lucide-react';
import { emergencyApi } from '../services/resources';
import { useSocket } from '../context/SocketContext';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { TableSkeleton } from '../components/ui/SkeletonLoader';
import toast from 'react-hot-toast';

const SOS = () => {
  const [activeSOS, setActiveSOS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { socket } = useSocket() || {};

  const fetchActiveSOS = async () => {
    try {
      const res = await emergencyApi.getHistory({ limit: 10 });
      // Find latest active/responding emergency
      const active = res.data.data.find(e => e.status === 'active' || e.status === 'responding');
      setActiveSOS(active || null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update active alert logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSOS();
  }, []);

  // Handle Socket.io status changes
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = ({ emergency }) => {
      if (activeSOS && emergency._id === activeSOS._id) {
        setActiveSOS(emergency);
        toast.success(`SOS telemetry status updated: ${emergency.status}`);
      }
    };

    socket.on('emergency:updated', handleUpdate);
    return () => {
      socket.off('emergency:updated', handleUpdate);
    };
  }, [socket, activeSOS]);

  const triggerSOS = async (type = 'sos') => {
    setTriggering(true);
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

      const res = await emergencyApi.trigger({
        type,
        location,
        description: 'SOS Manual Emergency Trigger',
        affectedPersons: 1
      });

      setActiveSOS(res.data.data);
      toast.error('🆘 SOS DISPATCH ALERT TRIGGERED!');
    } catch (err) {
      console.error(err);
      toast.error('Dispatcher connection error');
    } finally {
      setTriggering(false);
    }
  };

  const resolveSOS = async () => {
    if (!activeSOS) return;
    setCancelling(true);
    try {
      const res = await emergencyApi.updateStatus(activeSOS._id, {
        status: 'resolved',
        step: 'Manually marked as resolved'
      });
      setActiveSOS(null);
      toast.success('SOS incident marked as resolved.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update incident status');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">SOS Control Room</h1>
        <p className="text-white/40 text-sm">Send emergency SOS signals and view active response timelines</p>
      </div>

      {/* Quick Demo Instruction Helper */}
      <GlassCard className="p-4 border border-red-500/20 bg-red-950/5 text-xs space-y-2">
        <p className="font-semibold text-red-400">🆘 How to Test Emergency SOS Alert:</p>
        <ol className="list-decimal pl-4 space-y-1 text-white/60">
          <li>Click one of the <strong className="text-red-400">SOS Trigger</strong> buttons below (Generic SOS, Accident, Medical, Flood). A dispatcher alert fires immediately.</li>
          <li>Your GPS location is captured automatically (falls back to Mumbai if GPS denied).</li>
          <li>Monitor the <strong className="text-blue-300">live timeline</strong> on the right as responders update the status via the Command Center.</li>
          <li>Click <strong className="text-emerald-400">Resolve Incident</strong> to close the emergency and archive it in Reports.</li>
        </ol>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trigger section */}
        <GlassCard className="p-6 text-center space-y-6 lg:col-span-1 flex flex-col justify-center min-h-[350px] relative overflow-hidden">
          {activeSOS ? (
            <div className="space-y-6 relative z-10">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                <div className="relative w-24 h-24 bg-red-600/30 border border-red-500 rounded-full flex items-center justify-center">
                  <ShieldAlert size={40} className="text-red-500 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-display font-semibold">SOS ACTIVE</h3>
                <p className="text-xs text-white/40 mt-1 font-mono">Telemetry link is hot</p>
              </div>
              <Button
                variant="ghost"
                fullWidth
                onClick={resolveSOS}
                loading={cancelling}
                icon={PhoneOff}
                className="hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
              >
                Resolve Emergency
              </Button>
            </div>
          ) : (
            <div className="space-y-6 relative z-10">
              <button
                onClick={() => triggerSOS('sos')}
                disabled={triggering}
                className="w-40 h-40 rounded-full bg-gradient-to-br from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-2xl shadow-red-500/40 border-4 border-red-500/20 flex flex-col items-center justify-center gap-1.5 transition-all mx-auto active:scale-95 disabled:opacity-50"
              >
                <div className="text-4xl font-display font-black tracking-widest text-white">SOS</div>
                <div className="text-[10px] font-mono text-white/80 font-medium tracking-wide uppercase">Press to Trigger</div>
              </button>
              <p className="text-xs text-white/40 max-w-xs mx-auto leading-relaxed">
                Triggering SOS instantly alerts safety responder teams and broadcasts real-time GPS locations to your emergency contacts.
              </p>
            </div>
          )}
        </GlassCard>

        {/* Timeline Tracking */}
        <GlassCard className="p-6 lg:col-span-2 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <AlertCircle size={18} className="text-blue-400" /> Active Dispatch Status
              </h3>
              {activeSOS && <StatusBadge status={activeSOS.status} type="status" />}
            </div>

            {loading ? (
              <div className="py-6">
                <TableSkeleton rows={3} />
              </div>
            ) : activeSOS ? (
              <div className="py-4 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-white/40 uppercase">Incident ID</span>
                    <p className="font-mono text-xs text-white/80">{activeSOS._id}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-white/40 uppercase">Assigned Location</span>
                    <p className="text-xs text-blue-400 flex items-center gap-1 mt-0.5">
                      <Navigation size={12} /> {activeSOS.location.lat.toFixed(4)}, {activeSOS.location.lng.toFixed(4)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block">Response Logs</span>
                  <div className="relative border-l border-white/10 pl-6 ml-3 space-y-5">
                    {activeSOS.timeline?.map((step, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[30px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-bg-primary" />
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-white/95">{step.step}</p>
                          <p className="text-[10px] text-white/40 font-mono">{new Date(step.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-white/30 space-y-3">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-2xl">🟢</div>
                <p className="text-sm">No active emergency alerts recorded. All systems are green.</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default SOS;
