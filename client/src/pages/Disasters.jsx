import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, AlertTriangle, ShieldCheck, Heart, Info, RefreshCw, Sparkles, Navigation } from 'lucide-react';
import { alertApi, aiApi } from '../services/resources';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import toast from 'react-hot-toast';

const Disasters = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riskQuery, setRiskQuery] = useState({
    region: 'Maharashtra',
    weatherSignal: 'Heavy Monsoon rain, 120mm/hr',
    seismicActivity: 'No significant tremor detected'
  });
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertApi.getAll({ limit: 10 });
      setAlerts(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load disaster telemetry data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleRiskChange = (e) => {
    setRiskQuery({ ...riskQuery, [e.target.name]: e.target.value });
  };

  const checkRiskAssessment = async (e) => {
    e.preventDefault();
    setRiskLoading(true);
    try {
      const res = await aiApi.disasterRisk(riskQuery);
      setRiskAnalysis(res.data.data);
      toast.success('Gemini AI regional risk report updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to query disaster risk profile');
    } finally {
      setRiskLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Disaster Risk & Emergency Center</h1>
          <p className="text-white/40 text-sm">Monitor natural warning signals and regional hazards</p>
        </div>
        <button
          onClick={fetchAlerts}
          className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white/70"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Quick Demo Instruction Helper */}
      <GlassCard className="p-4 border border-yellow-500/20 bg-yellow-950/5 text-xs space-y-2">
        <p className="font-semibold text-yellow-400">🌊 How to Test Disaster Warning & AI Risk Assessment:</p>
        <ol className="list-decimal pl-4 space-y-1 text-white/60">
          <li>Active regional alerts are shown on the left panel — click the refresh icon to fetch the latest.</li>
          <li>In the <strong className="text-yellow-300">AI Disaster Risk Analyzer</strong> panel, configure region, weather signal, and terrain type.</li>
          <li>Click <strong className="text-yellow-300">Analyze Regional Risk</strong> to run a Gemini AI hazard forecast with evacuation recommendations.</li>
        </ol>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts list */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-display font-semibold text-lg flex items-center gap-2">
            <AlertTriangle size={18} className="text-yellow-400" /> Active Threat Telemetry alerts
          </h3>

          {loading ? (
            <SkeletonLoader lines={5} />
          ) : alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <GlassCard key={alert._id} className="p-5 space-y-4 border border-white/5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">⚠️</span>
                        <h4 className="font-semibold text-base">{alert.title}</h4>
                      </div>
                      <p className="text-xs font-mono text-white/40 flex items-center gap-1">
                        <Navigation size={10} /> Region: {alert.region} | Source: {alert.source}
                      </p>
                    </div>
                    <StatusBadge status={alert.severity} type="severity" size="md" />
                  </div>

                  <p className="text-sm text-white/70 leading-relaxed">{alert.description}</p>

                  {alert.safetyInstructions?.length > 0 && (
                    <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-2">
                      <span className="text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
                        Safety Protocols
                      </span>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {alert.safetyInstructions.map((ins, i) => (
                          <li key={i} className="text-xs text-white/60 flex items-start gap-1.5">
                            <span className="text-blue-500">•</span> {ins}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {alert.evacuationGuidance && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-xs flex items-start gap-2">
                      <Info size={14} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block mb-0.5">Evacuation Route:</span>
                        {alert.evacuationGuidance}
                      </div>
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="p-8 text-center text-white/30 text-sm">
              No hazard warnings are active.
            </GlassCard>
          )}
        </div>

        {/* AI risk analysis simulator */}
        <div className="space-y-6">
          <GlassCard className="p-6 space-y-5">
            <h3 className="font-display font-semibold text-lg flex items-center gap-2 border-b border-white/5 pb-3">
              <Sparkles size={18} className="text-violet-400" /> AI Risk Assessor
            </h3>

            <form onSubmit={checkRiskAssessment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-white/50 uppercase tracking-wider block">Region</label>
                <input
                  type="text"
                  name="region"
                  value={riskQuery.region}
                  onChange={handleRiskChange}
                  className="input-field py-2 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-white/50 uppercase tracking-wider block">Weather / Meteorological Signal</label>
                <input
                  type="text"
                  name="weatherSignal"
                  value={riskQuery.weatherSignal}
                  onChange={handleRiskChange}
                  className="input-field py-2 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-white/50 uppercase tracking-wider block">Seismic Activity</label>
                <input
                  type="text"
                  name="seismicActivity"
                  value={riskQuery.seismicActivity}
                  onChange={handleRiskChange}
                  className="input-field py-2 text-sm"
                  required
                />
              </div>

              <Button type="submit" variant="primary" fullWidth loading={riskLoading}>
                Generate AI Risk Profile
              </Button>
            </form>
          </GlassCard>

          {/* AI Risk assessment output card */}
          {riskAnalysis && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <GlassCard className="p-6 space-y-4 border border-violet-500/20">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-xs font-mono text-white/40 uppercase">AI Threat Forecast</span>
                  <StatusBadge status={riskAnalysis.riskLevel} type="severity" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-white/40 uppercase block">Guidance Guidelines</span>
                  <p className="text-xs text-white/80 leading-relaxed">{riskAnalysis.guidance}</p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-white/40 uppercase block">Safe Zones & Shelters</span>
                  <div className="flex flex-wrap gap-1.5">
                    {riskAnalysis.safeZones?.map((z, i) => (
                      <span key={i} className="text-[10px] bg-white/5 border border-white/5 text-blue-400 px-2 py-0.5 rounded font-mono">
                        📍 {z}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                  <span className="text-white/60">Evacuation Advised?</span>
                  <span className={`font-semibold ${riskAnalysis.evacuationRecommended ? 'text-red-400' : 'text-green-400'}`}>
                    {riskAnalysis.evacuationRecommended ? 'RECOMMENDED' : 'NOT ADVISED'}
                  </span>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Disasters;
