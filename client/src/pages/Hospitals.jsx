import { useState, useEffect } from 'react';
import { Hospital, MapPin, Search, Star, Phone, Sparkles, Navigation, RefreshCw } from 'lucide-react';
import { hospitalApi, aiApi } from '../services/resources';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import HospitalMap from '../components/map/HospitalMap';
import SkeletonLoader, { CardSkeleton, MapSkeleton } from '../components/ui/SkeletonLoader';
import toast from 'react-hot-toast';

const Hospitals = () => {
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [userLoc, setUserLoc] = useState({ lat: 19.076, lng: 72.8777 }); // Fallback Mumbai
  const [activeHospital, setActiveHospital] = useState(null);

  // AI Recommendation triage state
  const [condition, setCondition] = useState('Severe lacerations, heavy bleeding, suspect fracture');
  const [aiRecs, setAiRecs] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchHospitals = async (lat, lng) => {
    try {
      const res = await hospitalApi.getNearby(lat, lng, 30);
      setHospitals(res.data.data);
      if (res.data.data.length > 0) {
        setActiveHospital(res.data.data[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to locate nearby emergency medical centers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLoc(loc);
          fetchHospitals(loc.lat, loc.lng);
        },
        () => {
          toast.warn('Location access denied. Using default telemetry coordinates.');
          fetchHospitals(userLoc.lat, userLoc.lng);
        }
      );
    } else {
      fetchHospitals(userLoc.lat, userLoc.lng);
    }
  }, []);

  const handleRecommend = async (e) => {
    e.preventDefault();
    if (!condition.trim()) return;
    setAiLoading(true);
    try {
      const res = await aiApi.hospitalRecommendation(condition, hospitals);
      setAiRecs(res.data.data);
      toast.success('Gemini Medical Triage response completed');
    } catch (err) {
      console.error(err);
      toast.error('AI Triage recommendation failure');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Emergency Hospital Finder</h1>
          <p className="text-white/40 text-sm">Find nearby medical centers and triage routing recommendations</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchHospitals(userLoc.lat, userLoc.lng)}
            icon={RefreshCw}
          >
            Scan Location
          </Button>
        </div>
      </div>

      {/* Quick Demo Instruction Helper */}
      <GlassCard className="p-4 border border-blue-500/20 bg-blue-950/5 text-xs space-y-2">
        <p className="font-semibold text-blue-400">💡 How to Triage Hospital Suitability:</p>
        <ol className="list-decimal pl-4 space-y-1 text-white/60">
          <li>Click <strong className="text-blue-300">Scan Location</strong> to discover local hospitals on the interactive map (fallbacks to Mumbai coords if GPS denied).</li>
          <li>In the <strong className="text-blue-300">AI Hospital Triage</strong> widget, type/edit patient trauma details (e.g., "Heavy breathing, chest pain").</li>
          <li>Click <strong className="text-blue-300">Generate Suitability Rankings</strong> to invoke Gemini AI suitability ranks based on available beds, specialties, and distance.</li>
        </ol>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hospitals list & AI recommendation inputs */}
        <div className="space-y-6 lg:col-span-1">
          {/* Medical Triage widget */}
          <GlassCard className="p-5 space-y-4">
            <h3 className="font-display font-semibold text-base flex items-center gap-2 border-b border-white/5 pb-2">
              <Sparkles size={16} className="text-violet-400" /> AI Hospital Triage
            </h3>
            <form onSubmit={handleRecommend} className="space-y-3">
              <textarea
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="Describe victim condition/injuries in detail..."
                rows="3"
                className="input-field text-xs resize-none"
                required
              />
              <Button type="submit" variant="secondary" size="sm" fullWidth loading={aiLoading}>
                Generate Suitability Rankings
              </Button>
            </form>
          </GlassCard>

          {/* hospital list */}
          <GlassCard className="p-5 flex-1 flex flex-col max-h-[450px] overflow-hidden">
            <h3 className="font-display font-semibold text-base flex items-center gap-2 border-b border-white/5 pb-3 flex-shrink-0">
              <Hospital size={16} className="text-blue-400" /> Nearby Clinics & Trauma Centers
            </h3>

            {loading ? (
              <div className="space-y-3 py-4 overflow-y-auto">
                <SkeletonLoader lines={4} />
              </div>
            ) : hospitals.length > 0 ? (
              <div className="space-y-3 py-4 overflow-y-auto pr-1 flex-1">
                {hospitals.map((h) => {
                  const rankedInfo = aiRecs?.rankedHospitals?.find(r => r.hospitalId === h._id);

                  return (
                    <div
                      key={h._id}
                      onClick={() => setActiveHospital(h)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-2 ${
                        activeHospital?._id === h._id
                          ? 'bg-blue-600/10 border-blue-500/30'
                          : 'bg-white/5 border-white/5 hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-semibold text-white/90 truncate">{h.name}</p>
                        {rankedInfo && (
                          <span className="bg-violet-500/20 text-violet-400 border border-violet-500/30 text-[9px] px-2 py-0.5 rounded font-mono">
                            Rank {rankedInfo.rank}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between text-white/40 font-mono text-[10px]">
                        <span>Beds: <b className="text-emerald-400">{h.availableBeds}</b>/{h.capacity}</span>
                        <span>{h.distance ? `${h.distance.toFixed(1)} km` : 'Near'}</span>
                      </div>
                      {rankedInfo && (
                        <p className="text-[10px] text-violet-300 italic bg-violet-950/20 p-2 rounded">
                          Reasoning: {rankedInfo.reasoning}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-white/30 text-xs">
                No active medical hubs found within range parameters.
              </div>
            )}
          </GlassCard>
        </div>

        {/* Live map panel */}
        <div className="lg:col-span-2 min-h-[400px] h-[550px] lg:h-auto">
          {loading ? (
            <MapSkeleton className="w-full h-full" />
          ) : (
            <HospitalMap
              userLocation={userLoc}
              hospitals={hospitals}
              activeHospital={activeHospital}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Hospitals;
