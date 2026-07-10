import { useState, useEffect } from 'react';
import { Monitor, Bell, Activity, Navigation, Sparkles, MessageCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { emergencyApi, alertApi, aiApi } from '../services/resources';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import CommandMap from '../components/map/CommandMap';
import StatusBadge from '../components/ui/StatusBadge';
import SkeletonLoader, { CardSkeleton, MapSkeleton } from '../components/ui/SkeletonLoader';
import toast from 'react-hot-toast';

const CommandCenter = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIncident, setActiveIncident] = useState(null);
  const [aiInsight, setAiInsight] = useState('Select an active emergency coordinates log to compile dispatch recommendation report.');
  const [aiLoading, setAiLoading] = useState(false);

  const { socket, connected } = useSocket() || {};

  const fetchData = async () => {
    try {
      const [emRes, alRes] = await Promise.all([
        emergencyApi.getActive(),
        alertApi.getAll({ limit: 10 })
      ]);
      setEmergencies(emRes.data.data);
      setAlerts(alRes.data.data);
      if (emRes.data.data.length > 0) {
        setActiveIncident(emRes.data.data[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to connect to Command Center live feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Socket triggers
  useEffect(() => {
    if (!socket) return;

    const handleNewEmergency = ({ emergency }) => {
      setEmergencies(prev => [emergency, ...prev]);
      toast.error(`🚨 COMMAND DETECTED: New ${emergency.type} warning triggered!`, { duration: 5000 });
    };

    const handleUpdatedEmergency = ({ emergency }) => {
      setEmergencies(prev => prev.map(e => e._id === emergency._id ? emergency : e));
      if (activeIncident && activeIncident._id === emergency._id) {
        setActiveIncident(emergency);
      }
    };

    socket.on('emergency:new', handleNewEmergency);
    socket.on('emergency:updated', handleUpdatedEmergency);

    return () => {
      socket.off('emergency:new', handleNewEmergency);
      socket.off('emergency:updated', handleUpdatedEmergency);
    };
  }, [socket, activeIncident]);

  useEffect(() => {
    if (activeIncident) {
      generateIncidentInsight(activeIncident);
    }
  }, [activeIncident]);

  const generateIncidentInsight = async (incident) => {
    setAiLoading(true);
    try {
      const res = await aiApi.generateReport(incident);
      setAiInsight(res.data.data.aiAnalysis.executiveSummary || 'Triage compiler finished.');
    } catch (err) {
      setAiInsight('Unable to generate AI incident triage analysis at this moment.');
    } finally {
      setAiLoading(false);
    }
  };

  const updateIncidentStatus = async (id, status) => {
    try {
      const res = await emergencyApi.updateStatus(id, {
        status,
        step: `Command Center status update: ${status}`
      });
      toast.success(`Incident status updated to ${status}`);
      // update state
      setEmergencies(prev => prev.map(e => e._id === id ? res.data.data : e));
      setActiveIncident(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to change dispatcher status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold flex items-center gap-2">
            <Monitor size={28} className="text-blue-500 animate-pulse" /> Live Command Console
          </h1>
          <p className="text-white/40 text-sm">Real-time emergency dispatch coordinate matrix</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${
          connected ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400 animate-ping'}`} />
          {connected ? 'SOCKET LINK ESTABLISHED' : 'SOCKET DISCONNECTED'}
        </div>
      </div>

      {/* Quick Demo Instruction Helper */}
      <GlassCard className="p-4 border border-blue-500/20 bg-blue-950/5 text-xs space-y-2">
        <p className="font-semibold text-blue-400">💡 How to Monitor Live Emergency Dispatches:</p>
        <ol className="list-decimal pl-4 space-y-1 text-white/60">
          <li>Trigger an alert in another tab (e.g., Accident simulation or SOS button).</li>
          <li>Observe the live incident card appear instantly in the <strong className="text-blue-300">Dispatches Active</strong> list and plot on the map via Socket.io.</li>
          <li>Select the active emergency card to generate a real-time <strong className="text-violet-400">Gemini Dispatch Advisory</strong>.</li>
          <li>Use the action buttons (<strong className="text-blue-300">Set Responding</strong> / <strong className="text-blue-300">Set Resolved</strong>) to toggle live status signals.</li>
        </ol>
      </GlassCard>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Active Emergencies Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          <GlassCard className="p-5 flex flex-col h-[500px]">
            <h3 className="font-display font-semibold text-base flex items-center gap-2 border-b border-white/5 pb-3">
              <Activity size={16} className="text-red-400" /> Dispatches Active
            </h3>

            {loading ? (
              <div className="py-4">
                <SkeletonLoader lines={4} />
              </div>
            ) : emergencies.length > 0 ? (
              <div className="space-y-3 py-3 overflow-y-auto pr-1 flex-1 text-xs">
                {emergencies.map((e) => (
                  <div
                    key={e._id}
                    onClick={() => setActiveIncident(e)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      activeIncident?._id === e._id
                        ? 'bg-blue-600/10 border-blue-500/30'
                        : 'bg-white/5 border-white/5 hover:bg-white/[0.07]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white capitalize">{e.type}</span>
                      <StatusBadge status={e.severity} type="severity" />
                    </div>
                    <p className="text-[10px] text-white/50 line-clamp-1">{e.description || 'Emergency ping active'}</p>
                    <div className="flex justify-between items-center border-t border-white/5 pt-1.5 text-[9px] font-mono">
                      <span className="text-white/40">{new Date(e.createdAt).toLocaleTimeString()}</span>
                      <span className="uppercase text-blue-400 font-semibold">{e.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/30 text-xs flex-1 flex flex-col justify-center">
                No active dispatches.
              </div>
            )}
          </GlassCard>
        </div>

        {/* Live Tracking map */}
        <div className="xl:col-span-2 min-h-[400px] h-[500px]">
          {loading ? (
            <MapSkeleton className="w-full h-full" />
          ) : (
            <CommandMap emergencies={emergencies} activeEmergency={activeIncident} />
          )}
        </div>

        {/* Action Panel & AI response tracker */}
        <div className="xl:col-span-1 space-y-6">
          {activeIncident ? (
            <GlassCard className="p-5 space-y-4 flex flex-col justify-between h-[500px] overflow-hidden">
              <div className="space-y-4 overflow-y-auto flex-1 pr-1">
                <div className="border-b border-white/5 pb-3 flex justify-between items-start">
                  <div>
                    <h3 className="font-display font-semibold text-base capitalize">{activeIncident.type} Telemetry</h3>
                    <p className="text-[10px] font-mono text-white/40 truncate">{activeIncident._id}</p>
                  </div>
                  <StatusBadge status={activeIncident.status} type="status" />
                </div>

                <div className="text-xs space-y-3">
                  <div>
                    <span className="text-[10px] font-mono text-white/40 block">DESCRIPTION</span>
                    <p className="text-white/80 mt-0.5">{activeIncident.description || 'No description logs'}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-white/40 block">COORDINATE GPS</span>
                    <p className="text-blue-400 font-mono">
                      {activeIncident.location?.lat.toFixed(5)}, {activeIncident.location?.lng.toFixed(5)}
                    </p>
                  </div>

                  <div className="space-y-2 border-t border-white/5 pt-3">
                    <span className="text-[10px] font-mono text-violet-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                      <Sparkles size={12} /> Gemini Dispatch Advisory
                    </span>
                    <div className="p-3 bg-violet-950/20 border border-violet-500/20 rounded-xl leading-relaxed text-violet-200">
                      {aiLoading ? (
                        <div className="flex space-x-1.5 items-center justify-center py-2">
                          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : aiInsight}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update dispatcher controls */}
              <div className="border-t border-white/5 pt-4 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => updateIncidentStatus(activeIncident._id, 'responding')}
                  disabled={activeIncident.status === 'responding'}
                  className="text-xs py-2 px-1 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/10"
                >
                  Set Responding
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => updateIncidentStatus(activeIncident._id, 'resolved')}
                  disabled={activeIncident.status === 'resolved'}
                  className="text-xs py-2 px-1 text-green-400 border-green-500/20 hover:bg-green-500/10"
                >
                  Set Resolved
                </Button>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-8 text-center text-white/30 text-xs h-[500px] flex flex-col justify-center">
              <div className="text-2xl mb-2">📡</div>
              Select an active coordinate node to open control matrix.
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
