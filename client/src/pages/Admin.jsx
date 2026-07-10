import { useState, useEffect } from 'react';
import { ShieldCheck, Users, AlertTriangle, BarChart3, Plus, RefreshCw, Trash2, ArrowUpRight } from 'lucide-react';
import { adminApi, alertApi } from '../services/resources';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import SkeletonLoader, { TableSkeleton } from '../components/ui/SkeletonLoader';
import toast from 'react-hot-toast';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  // New alert form state
  const [newAlert, setNewAlert] = useState({
    type: 'flood',
    severity: 'medium',
    title: '',
    description: '',
    region: '',
    safetyInstructions: '',
    evacuationGuidance: ''
  });
  const [creatingAlert, setCreatingAlert] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, analyticsRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getAnalytics()
      ]);
      setUsers(usersRes.data.data);
      setAnalytics(analyticsRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Access denied or telemetry loading failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setNewAlert({ ...newAlert, [e.target.name]: e.target.value });
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!newAlert.title || !newAlert.description || !newAlert.region) {
      return toast.error('Required: Title, Description, Region');
    }
    setCreatingAlert(true);
    try {
      const parsedInstructions = newAlert.safetyInstructions
        .split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0);

      await alertApi.create({
        type: newAlert.type,
        severity: newAlert.severity,
        title: newAlert.title,
        description: newAlert.description,
        region: newAlert.region,
        safetyInstructions: parsedInstructions,
        evacuationGuidance: newAlert.evacuationGuidance,
        location: { lat: 19.0760, lng: 72.8777 } // default Mumbai
      });

      toast.success('Disaster warning broadcasted to all channels');
      setNewAlert({
        type: 'flood',
        severity: 'medium',
        title: '',
        description: '',
        region: '',
        safetyInstructions: '',
        evacuationGuidance: ''
      });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to dispatch alert warning');
    } finally {
      setCreatingAlert(false);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await adminApi.updateUserRole(userId, nextRole);
      toast.success('Agent role clearance code updated');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Cleared authorization update rejected');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold flex items-center gap-2">
            <ShieldCheck className="text-violet-500" /> Admin Command Matrix
          </h1>
          <p className="text-white/40 text-sm">System authorization portal for security administrators</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white/80"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 gap-4">
        {[
          { id: 'users', label: 'Registered Agents', icon: Users },
          { id: 'alerts', label: 'Broadcast warning', icon: AlertTriangle },
          { id: 'analytics', label: 'System Analytics', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium transition-all flex items-center gap-2 border-b-2 ${
                activeTab === tab.id
                  ? 'border-violet-500 text-violet-400 font-bold'
                  : 'border-transparent text-white/40 hover:text-white/80'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div className="space-y-6">
          {/* User Tab */}
          {activeTab === 'users' && (
            <GlassCard className="p-6 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 font-mono uppercase">
                    <th className="py-3 px-4">Agent Name</th>
                    <th className="py-3 px-4">Email Credentials</th>
                    <th className="py-3 px-4">Clearance Role</th>
                    <th className="py-3 px-4">Telemetry profile</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 font-semibold text-white/90">{u.name}</td>
                      <td className="py-3.5 px-4 text-white/60 font-mono">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                          u.role === 'admin' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-white/5 text-white/40'
                        }`}>
                          {u.role?.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] ${u.onboardingComplete ? 'text-emerald-400' : 'text-white/30'}`}>
                          {u.onboardingComplete ? 'Active' : 'Uninitialized'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRoleToggle(u._id, u.role)}
                          className="py-1 px-2.5 text-[10px]"
                        >
                          Toggle clearance
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>
          )}

          {/* Broadcast alert tab */}
          {activeTab === 'alerts' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard className="p-6 space-y-4">
                <h3 className="font-display font-semibold text-base">Broadcast System Warning</h3>
                <form onSubmit={handleCreateAlert} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-white/40 font-mono uppercase text-[10px]">Hazard Type</label>
                      <select
                        name="type"
                        value={newAlert.type}
                        onChange={handleInputChange}
                        className="input-field py-2.5 text-xs cursor-pointer appearance-none"
                      >
                        {['flood', 'fire', 'earthquake', 'cyclone', 'landslide', 'tsunami', 'chemical'].map(t => (
                          <option key={t} value={t}>{t.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-white/40 font-mono uppercase text-[10px]">Severity Level</label>
                      <select
                        name="severity"
                        value={newAlert.severity}
                        onChange={handleInputChange}
                        className="input-field py-2.5 text-xs cursor-pointer appearance-none"
                      >
                        {['low', 'medium', 'high', 'critical'].map(s => (
                          <option key={s} value={s}>{s.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-white/40 font-mono uppercase text-[10px]">Headline Title</label>
                    <input
                      type="text"
                      name="title"
                      value={newAlert.title}
                      onChange={handleInputChange}
                      placeholder="Cyclone Alert: Sea wind speeds warning..."
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-white/40 font-mono uppercase text-[10px]">Target Region</label>
                      <input
                        type="text"
                        name="region"
                        value={newAlert.region}
                        onChange={handleInputChange}
                        placeholder="Maharashtra"
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-white/40 font-mono uppercase text-[10px]">Evacuation Directions</label>
                      <input
                        type="text"
                        name="evacuationGuidance"
                        value={newAlert.evacuationGuidance}
                        onChange={handleInputChange}
                        placeholder="Move away from coastlines to designated concrete centers."
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-white/40 font-mono uppercase text-[10px]">
                      Immediate Actions (comma-separated instructions)
                    </label>
                    <textarea
                      name="safetyInstructions"
                      value={newAlert.safetyInstructions}
                      onChange={handleInputChange}
                      placeholder="Ensure food stock for 3 days, Stay indoors, Keep phone charged..."
                      rows="3"
                      className="input-field resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-white/40 font-mono uppercase text-[10px]">Hazard Description</label>
                    <textarea
                      name="description"
                      value={newAlert.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="input-field resize-none"
                      required
                    />
                  </div>

                  <Button type="submit" variant="danger" fullWidth loading={creatingAlert}>
                    Broadcast Global Alarm
                  </Button>
                </form>
              </GlassCard>

              {/* Alert Guidelines review */}
              <GlassCard className="p-6 space-y-4">
                <h3 className="font-display font-semibold text-base">Clearance guidelines</h3>
                <p className="text-white/60 leading-relaxed text-xs">
                  Broadcasting warning signals initiates automated Socket broadcasts immediately, warning all connected active agents client-side. Keep declarations clear and actionable.
                </p>
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex gap-2">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <span className="font-bold block mb-0.5">Critical broadcast parameter:</span>
                    Sending critical warnings triggers SMS alerts on Twilio configurations if active. Do not trigger test signals without authorization.
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* Analytics charts summary dashboard */}
          {activeTab === 'analytics' && analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <GlassCard className="p-5">
                <p className="text-xs font-mono text-white/40 uppercase">Total User base</p>
                <p className="text-3xl font-display font-bold mt-1 text-white">{analytics.totalUsers}</p>
              </GlassCard>
              <GlassCard className="p-5">
                <p className="text-xs font-mono text-white/40 uppercase">Reported emergencies</p>
                <p className="text-3xl font-display font-bold mt-1 text-red-400">{analytics.totalEmergencies}</p>
              </GlassCard>
              <GlassCard className="p-5">
                <p className="text-xs font-mono text-white/40 uppercase">Warnings Broadcasted</p>
                <p className="text-3xl font-display font-bold mt-1 text-yellow-400">{analytics.activeAlerts}</p>
              </GlassCard>
              <GlassCard className="p-5">
                <p className="text-xs font-mono text-white/40 uppercase">Incidents Resolved</p>
                <p className="text-3xl font-display font-bold mt-1 text-green-400">{analytics.resolvedEmergencies}</p>
              </GlassCard>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
