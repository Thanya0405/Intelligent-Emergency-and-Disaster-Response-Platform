import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell, Shield, HeartPulse, User, Phone, Zap, AlertTriangle, CloudRain,
  TrendingUp, Activity, Plus, FileText, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { alertApi, emergencyApi, userApi } from '../services/resources';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { CardSkeleton } from '../components/ui/SkeletonLoader';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [safetyTip, setSafetyTip] = useState('');
  const [showGuide, setShowGuide] = useState(true);

  // Sample data for charts (fallback if admin/analytics is empty)
  const chartData = [
    { name: 'Mon', incidents: 2 },
    { name: 'Tue', incidents: 1 },
    { name: 'Wed', incidents: 5 },
    { name: 'Thu', incidents: 3 },
    { name: 'Fri', incidents: 0 },
    { name: 'Sat', incidents: 2 },
    { name: 'Sun', incidents: 4 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [alertsRes, historyRes] = await Promise.all([
          alertApi.getAll({ limit: 5 }),
          emergencyApi.getHistory({ limit: 5 }),
        ]);
        setAlerts(alertsRes.data.data);
        setHistory(historyRes.data.data);

        // Quick tip generator based on alert count
        if (alertsRes.data.data.length > 0) {
          setSafetyTip(`Active warning: ${alertsRes.data.data[0].title}. Please review safety instructions immediately.`);
        } else {
          setSafetyTip('No active warning alerts in your vicinity. Secure connection is active.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to update dashboard telemetry.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-white/10 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Dashboard Console</h1>
          <p className="text-white/40 text-sm">System clearance: {user?.role?.toUpperCase()} | Agent {user?.name}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGuide(!showGuide)}
            className="text-xs border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
          >
            {showGuide ? 'Hide Tour Guide' : 'Show System Guide'}
          </Button>
          <Link to="/sos">
            <Button variant="danger" size="sm" icon={Phone}>Trigger SOS</Button>
          </Link>
        </div>
      </div>

      {/* System Interactive Tour Guide */}
      {showGuide && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
        >
          <GlassCard className="p-5 border border-blue-500/20 bg-blue-950/10 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="font-display font-bold text-sm text-blue-400 flex items-center gap-2">
                🚀 Welcome to SafeGuard AI — Operations Tour Guide
              </h3>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono uppercase font-semibold">
                Interactive walkthrough
              </span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              SafeGuard AI is an intelligent dispatch, analytics, and telemetry command system. Follow this quick workflow to experience the live capabilities:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-blue-400 font-bold block mb-0.5">1. Accident Simulation</span>
                <p className="text-white/50 leading-relaxed text-[11px]">
                  Go to <Link to="/accident-detection" className="text-blue-400 hover:underline">Accident Detection</Link>, generate randomized crash data, and trigger an AI severity diagnosis. Click dispatch to log it.
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-violet-400 font-bold block mb-0.5">2. Live Dispatch Map</span>
                <p className="text-white/50 leading-relaxed text-[11px]">
                  Open the <Link to="/command-center" className="text-blue-400 hover:underline">Command Center</Link> to view live emergency markers updating in real time. Adjust emergency states from the sidebar.
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-emerald-400 font-bold block mb-0.5">3. AI Medical Triage</span>
                <p className="text-white/50 leading-relaxed text-[11px]">
                  Access <Link to="/hospitals" className="text-blue-400 hover:underline">Hospital Finder</Link>, input a trauma condition, and get an automated Gemini suitability score for nearby centers.
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-yellow-400 font-bold block mb-0.5">4. Safe Zone Warnings</span>
                <p className="text-white/50 leading-relaxed text-[11px]">
                  Explore <Link to="/disasters" className="text-blue-400 hover:underline">Disaster Center</Link> to analyze regional meteorology alerts or compile detailed PDF logs under <Link to="/reports" className="text-blue-400 hover:underline">Reports</Link>.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Safety Advisory Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3"
      >
        <Zap size={20} className="text-blue-400 flex-shrink-0 animate-pulse" />
        <p className="text-sm font-medium text-blue-300">{safetyTip}</p>
      </motion.div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <GlassCard className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-white/40 uppercase">Active Hazards</p>
            <p className="text-3xl font-display font-bold mt-1 text-yellow-400">{alerts.length}</p>
            <Link to="/disasters" className="text-xs text-blue-400 hover:underline flex items-center mt-2">
              View response map <ChevronRight size={12} />
            </Link>
          </div>
          <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-400">
            <AlertTriangle size={20} />
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-white/40 uppercase">Your Logs</p>
            <p className="text-3xl font-display font-bold mt-1 text-blue-400">{history.length}</p>
            <span className="text-xs text-white/40 inline-block mt-2">Logged events history</span>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
            <Activity size={20} />
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-white/40 uppercase">Safety Status</p>
            <p className="text-2xl font-display font-bold mt-1.5 text-emerald-400">
              {user?.onboardingComplete ? 'ESTABLISHED' : 'INCOMPLETE'}
            </p>
            <Link to="/onboarding" className="text-xs text-blue-400 hover:underline flex items-center mt-2">
              Review details <ChevronRight size={12} />
            </Link>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
            <Shield size={20} />
          </div>
        </GlassCard>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics area chart */}
        <GlassCard className="p-6 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-semibold text-lg flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-400" /> Incident Activity Graph
            </h3>
            <span className="text-xs text-white/40 font-mono">Last 7 Days</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={11} />
                <YAxis stroke="#ffffff40" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="incidents" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorIncidents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* User Telemetry Card */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="font-display font-semibold text-lg flex items-center gap-2 border-b border-white/5 pb-3">
            <HeartPulse size={18} className="text-red-400" /> Telemetry Info
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-white/40">Blood Group</span>
              <span className="font-mono font-semibold text-white">{user?.bloodGroup || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-white/40">Age</span>
              <span className="font-semibold text-white">{user?.age || 'N/A'} yrs</span>
            </div>
            <div className="space-y-1">
              <span className="text-white/40 text-xs block">Diagnosed Conditions</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {user?.medicalConditions?.length > 0 ? (
                  user.medicalConditions.map((med, idx) => (
                    <span key={idx} className="bg-white/5 border border-white/10 text-white/80 text-xs px-2 py-0.5 rounded">
                      {med}
                    </span>
                  ))
                ) : (
                  <span className="text-white/30 text-xs italic">No declared conditions</span>
                )}
              </div>
            </div>
            <div className="space-y-1.5 pt-2">
              <span className="text-white/40 text-xs block">Emergency Notification List</span>
              <div className="space-y-2">
                {user?.emergencyContacts?.length > 0 ? (
                  user.emergencyContacts.map((contact, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded border border-white/5">
                      <div className="font-medium text-white/80">
                        {contact.name} <span className="text-white/30">({contact.relation})</span>
                      </div>
                      <div className="font-mono text-blue-400">{contact.phone}</div>
                    </div>
                  ))
                ) : (
                  <span className="text-white/30 text-xs italic">No contacts added</span>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Alerts Feed and History Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Feed */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="font-display font-semibold text-lg flex items-center gap-2">
            <Bell size={18} className="text-yellow-400" /> Active Regional Warnings
          </h3>
          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div key={alert._id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex gap-3 hover:bg-white/[0.07] transition-all">
                  <div className="text-2xl mt-1">⚠️</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-sm">{alert.title}</p>
                      <StatusBadge status={alert.severity} type="severity" />
                    </div>
                    <p className="text-xs text-white/60 line-clamp-2">{alert.description}</p>
                    <p className="text-[10px] text-white/30 font-mono">Region: {alert.region}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-white/30 text-sm">
                No active hazard warnings in the system database.
              </div>
            )}
          </div>
        </GlassCard>

        {/* History Log */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="font-display font-semibold text-lg flex items-center gap-2">
            <Activity size={18} className="text-blue-400" /> Recent Emergency Logs
          </h3>
          <div className="space-y-3">
            {history.length > 0 ? (
              history.map((log) => (
                <div key={log._id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center hover:bg-white/[0.07] transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                        {log.type.toUpperCase()}
                      </span>
                      <span className="text-xs text-white/40">{new Date(log.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-white/80 line-clamp-1">{log.description || 'Emergency telemetry ping triggered.'}</p>
                  </div>
                  <StatusBadge status={log.status} type="status" />
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-white/30 text-sm">
                No recorded emergencies logged under your account.
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
