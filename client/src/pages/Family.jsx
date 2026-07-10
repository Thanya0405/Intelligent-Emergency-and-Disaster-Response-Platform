import { useState, useEffect } from 'react';
import { Users, UserPlus, Phone, MapPin, Trash, Sparkles, Navigation, Edit3 } from 'lucide-react';
import { familyApi } from '../services/resources';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import FamilyMap from '../components/map/FamilyMap';
import StatusBadge from '../components/ui/StatusBadge';
import SkeletonLoader, { CardSkeleton, MapSkeleton } from '../components/ui/SkeletonLoader';
import toast from 'react-hot-toast';

const Family = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMember, setActiveMember] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add member form state
  const [newMember, setNewMember] = useState({
    memberName: '',
    relation: '',
    phone: '',
    bloodGroup: '',
    medicalInfo: '',
    lat: '',
    lng: ''
  });

  const fetchFamily = async () => {
    try {
      const res = await familyApi.getAll();
      setMembers(res.data.data);
      if (res.data.data.length > 0) {
        setActiveMember(res.data.data[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to connect to family status database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamily();
  }, []);

  const handleInputChange = (e) => {
    setNewMember({ ...newMember, [e.target.name]: e.target.value });
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.memberName || !newMember.relation || !newMember.phone) {
      return toast.error('Required fields: Name, Relation, Phone');
    }

    try {
      const payload = {
        memberName: newMember.memberName,
        relation: newMember.relation,
        phone: newMember.phone,
        bloodGroup: newMember.bloodGroup || 'unknown',
        medicalInfo: newMember.medicalInfo || 'None',
        location: newMember.lat && newMember.lng ? {
          lat: parseFloat(newMember.lat),
          lng: parseFloat(newMember.lng)
        } : { lat: 19.076, lng: 72.8777 } // default Mumbai
      };

      await familyApi.add(payload);
      toast.success(`${newMember.memberName} registered successfully`);
      setNewMember({ memberName: '', relation: '', phone: '', bloodGroup: '', medicalInfo: '', lat: '', lng: '' });
      setShowAddForm(false);
      fetchFamily();
    } catch (err) {
      console.error(err);
      toast.error('Failed to register family member profile');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await familyApi.updateStatus(id, { status });
      toast.success('Member status profile updated');
      fetchFamily();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status telemetry');
    }
  };

  const deleteMember = async (id) => {
    if (!confirm('Are you sure you want to remove this family member link?')) return;
    try {
      await familyApi.delete(id);
      toast.success('Family member link deleted');
      fetchFamily();
    } catch (err) {
      console.error(err);
      toast.error('Deletion request rejected');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Family Safety Telemetry</h1>
          <p className="text-white/40 text-sm">Monitor GPS location and safety flags of registered family contacts</p>
        </div>
        <Button
          variant={showAddForm ? 'ghost' : 'primary'}
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          icon={UserPlus}
        >
          {showAddForm ? 'Close Profile Panel' : 'Link New Member'}
        </Button>
      </div>

      {/* Quick Demo Instruction Helper */}
      <GlassCard className="p-4 border border-emerald-500/20 bg-emerald-950/5 text-xs space-y-2">
        <p className="font-semibold text-emerald-400">👨‍👩‍👧 How to Use Family Safety Tracking:</p>
        <ol className="list-decimal pl-4 space-y-1 text-white/60">
          <li>Three demo family members are pre-loaded — click any card to center the map and view their GPS position.</li>
          <li>Use the <strong className="text-emerald-300">status badge dropdown</strong> on each card to simulate check-ins: Safe, Unknown, or Danger.</li>
          <li>Click <strong className="text-emerald-300">Link New Member</strong> to fill in a family member's details and GPS coordinates (or leave blank for Mumbai default).</li>
        </ol>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column profile settings & list */}
        <div className="space-y-6 lg:col-span-1">
          {/* Add member form */}
          {showAddForm && (
            <GlassCard className="p-5 space-y-4">
              <h3 className="font-display font-semibold text-base">New Family Link</h3>
              <form onSubmit={handleAddMember} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase">Name</label>
                    <input
                      type="text"
                      name="memberName"
                      value={newMember.memberName}
                      onChange={handleInputChange}
                      className="input-field py-2 px-3 text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase">Relation</label>
                    <input
                      type="text"
                      name="relation"
                      value={newMember.relation}
                      onChange={handleInputChange}
                      className="input-field py-2 px-3 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/40 uppercase">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newMember.phone}
                    onChange={handleInputChange}
                    className="input-field py-2 px-3 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase">Latitude</label>
                    <input
                      type="number"
                      name="lat"
                      step="0.000001"
                      value={newMember.lat}
                      onChange={handleInputChange}
                      className="input-field py-2 px-3 text-xs"
                      placeholder="19.0760"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase">Longitude</label>
                    <input
                      type="number"
                      name="lng"
                      step="0.000001"
                      value={newMember.lng}
                      onChange={handleInputChange}
                      className="input-field py-2 px-3 text-xs"
                      placeholder="72.8777"
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" size="sm" fullWidth>
                  Save Link Connection
                </Button>
              </form>
            </GlassCard>
          )}

          {/* Members list */}
          <GlassCard className="p-5 flex flex-col max-h-[450px]">
            <h3 className="font-display font-semibold text-base flex items-center gap-2 border-b border-white/5 pb-3">
              <Users size={16} className="text-blue-400" /> Link Roster
            </h3>

            {loading ? (
              <div className="py-4">
                <SkeletonLoader lines={3} />
              </div>
            ) : members.length > 0 ? (
              <div className="space-y-3 py-4 overflow-y-auto pr-1 flex-1">
                {members.map((m) => (
                  <div
                    key={m._id}
                    onClick={() => setActiveMember(m)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-3 ${
                      activeMember?._id === m._id
                        ? 'bg-blue-600/10 border-blue-500/30'
                        : 'bg-white/5 border-white/5 hover:bg-white/[0.07]'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-semibold text-white/95">{m.memberName}</p>
                        <p className="text-[10px] text-white/40 font-mono">{m.relation} | {m.phone}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteMember(m._id); }}
                        className="text-white/30 hover:text-red-400 p-1"
                      >
                        <Trash size={12} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1 border-t border-white/5 pt-2">
                      {['safe', 'warning', 'emergency'].map((status) => (
                        <button
                          key={status}
                          onClick={(e) => { e.stopPropagation(); updateStatus(m._id, status); }}
                          className={`px-2 py-0.5 rounded text-[9px] font-mono border capitalize transition-all ${
                            m.status === status
                              ? status === 'safe'
                                ? 'bg-green-500/20 text-green-400 border-green-500/30 font-semibold'
                                : status === 'warning'
                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 font-semibold'
                                : 'bg-red-500/20 text-red-400 border-red-500/30 font-semibold'
                              : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/30 text-xs">
                No family members configured. Use buttons above to register links.
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right column map panel */}
        <div className="lg:col-span-2 min-h-[400px] h-[550px] lg:h-auto">
          {loading ? (
            <MapSkeleton className="w-full h-full" />
          ) : (
            <FamilyMap members={members} activeMember={activeMember} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Family;
