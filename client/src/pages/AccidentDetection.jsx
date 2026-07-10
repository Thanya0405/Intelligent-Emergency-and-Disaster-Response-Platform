import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert, Cpu, Check, RefreshCw } from 'lucide-react';
import { aiApi, emergencyApi } from '../services/resources';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import toast from 'react-hot-toast';

const AccidentDetection = () => {
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  // Simulated Sensor Data
  const [sensors, setSensors] = useState({
    gForce: 1.2,
    speedChange: -5,
    orientationAngle: 12,
    impactLocation: 'Rear Bumper',
    airbagDeployed: false
  });

  const randomizeSensors = () => {
    // Generate random readings simulating a serious vehicle crash
    const isImpact = Math.random() > 0.4;
    setSensors({
      gForce: isImpact ? parseFloat((Math.random() * 8 + 4).toFixed(1)) : parseFloat((Math.random() * 2 + 0.5).toFixed(1)),
      speedChange: isImpact ? -Math.floor(Math.random() * 50 + 30) : -Math.floor(Math.random() * 15),
      orientationAngle: isImpact ? Math.floor(Math.random() * 90 + 40) : Math.floor(Math.random() * 15),
      impactLocation: ['Front bumper', 'Rear-end', 'Driver side door', 'Passenger side door', 'Rollover'][Math.floor(Math.random() * 5)],
      airbagDeployed: isImpact && Math.random() > 0.3
    });
    setAnalysis(null);
    toast.success('Generated fresh mock sensor readings');
  };

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await aiApi.accidentAnalysis(sensors);
      setAnalysis(res.data.data);
      toast.success('Gemini AI telemetry analysis complete');
    } catch (err) {
      console.error(err);
      toast.error('AI telemetry processing failed');
    } finally {
      setLoading(false);
    }
  };

  const dispatchEmergency = async () => {
    if (!analysis) return;
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

      await emergencyApi.trigger({
        type: 'accident',
        location,
        description: `Crash Telemetry Analysis: Impact to ${sensors.impactLocation} with G-Force: ${sensors.gForce}G. Recommended: ${analysis.recommendedAction}`,
        affectedPersons: 1,
        sensorData: sensors
      });

      toast.error('🆘 CRITICAL DISPATCH SIGNAL SENT to emergency responders!', { duration: 5000 });
    } catch (err) {
      console.error(err);
      toast.error('Dispatcher alert failed.');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Crash & Accident Detection</h1>
        <p className="text-white/40 text-sm">Simulate and analyze real-time device telemetry with Gemini AI</p>
      </div>

      {/* Quick Demo Instruction Helper */}
      <GlassCard className="p-4 border border-blue-500/20 bg-blue-950/5 text-xs space-y-2">
        <p className="font-semibold text-blue-400">💡 How to Test Accident & Dispatch Telemetry:</p>
        <ol className="list-decimal pl-4 space-y-1 text-white/60">
          <li>Click <strong className="text-blue-300">Regenerate Data</strong> on the telemetry stream to simulate crash readings (High G-Force, Airbags, etc.).</li>
          <li>Click <strong className="text-blue-300">Run AI Impact Assessment</strong> to analyze the mock data via Gemini AI classification.</li>
          <li>View the compiled severity diagnosis, recommended first aid steps, and estimated dispatch priority.</li>
          <li>Click the <strong className="text-red-400">Dispatch Signal</strong> button to broadcast this emergency live to the Command Center.</li>
        </ol>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sensor Simulation controls */}
        <GlassCard className="p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="font-display font-semibold text-lg flex items-center gap-2">
              <Cpu size={18} className="text-blue-400" /> Device Telemetry Stream
            </h3>
            <button
              onClick={randomizeSensors}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
            >
              <RefreshCw size={12} /> Regenerate Data
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center">
              <p className="text-xs text-white/40 font-mono">IMPACT FORCE</p>
              <p className={`text-2xl font-bold mt-1 ${sensors.gForce > 3.0 ? 'text-red-400' : 'text-white'}`}>
                {sensors.gForce} G
              </p>
            </div>
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center">
              <p className="text-xs text-white/40 font-mono">VELOCITY DELTA</p>
              <p className={`text-2xl font-bold mt-1 ${sensors.speedChange < -25 ? 'text-red-400' : 'text-white'}`}>
                {sensors.speedChange} km/h
              </p>
            </div>
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center">
              <p className="text-xs text-white/40 font-mono">ORIENTATION TILT</p>
              <p className={`text-2xl font-bold mt-1 ${sensors.orientationAngle > 30 ? 'text-yellow-400' : 'text-white'}`}>
                {sensors.orientationAngle}°
              </p>
            </div>
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center">
              <p className="text-xs text-white/40 font-mono">AIRBAG STATUS</p>
              <p className={`text-xl font-bold mt-1.5 ${sensors.airbagDeployed ? 'text-red-400' : 'text-white/40'}`}>
                {sensors.airbagDeployed ? 'DEPLOYED ⚠️' : 'SECURE'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
            <div>
              <p className="text-xs text-white/40 font-mono">LAST ESTIMATED IMPACT AREA</p>
              <p className="text-sm font-semibold mt-0.5 text-white/80">{sensors.impactLocation}</p>
            </div>
            <ShieldAlert size={20} className={sensors.gForce > 3.0 ? 'text-red-400 animate-bounce' : 'text-white/30'} />
          </div>

          <Button
            variant={sensors.gForce > 3.0 ? 'danger' : 'primary'}
            fullWidth
            onClick={runAnalysis}
            loading={loading}
          >
            Run AI Impact Assessment
          </Button>
        </GlassCard>

        {/* AI Analysis Console output */}
        <GlassCard className="p-6 flex flex-col justify-between min-h-[400px]">
          <div>
            <h3 className="font-display font-semibold text-lg flex items-center gap-2 border-b border-white/5 pb-3">
              <Cpu size={18} className="text-violet-400" /> AI Severity Diagnosis
            </h3>

            {loading ? (
              <div className="py-6">
                <SkeletonLoader lines={5} />
              </div>
            ) : analysis ? (
              <div className="space-y-5 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Classification:</span>
                  <StatusBadge status={analysis.severityLevel} type="severity" size="md" />
                </div>

                <div className="flex justify-between items-center font-mono text-xs">
                  <span className="text-white/40">Confidence Score:</span>
                  <span className="text-white">{(analysis.confidence * 100).toFixed(0)}%</span>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-mono text-white/40 uppercase">Recommended Emergency Step:</p>
                  <p className="text-sm bg-white/5 border border-white/5 p-3 rounded-xl text-white/95 leading-relaxed">
                    {analysis.recommendedAction}
                  </p>
                </div>

                {analysis.riskFactors?.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-mono text-white/40 uppercase">Calculated Risk Hazards:</p>
                    <ul className="space-y-1">
                      {analysis.riskFactors.map((r, i) => (
                        <li key={i} className="text-xs text-red-400/90 flex items-start gap-1.5 font-mono">
                          <span>•</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-white/30 space-y-3">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-2xl">📡</div>
                <p className="text-sm">Initiate AI analysis to process active telemetry streams</p>
              </div>
            )}
          </div>

          {analysis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-6 border-t border-white/5"
            >
              <Button
                variant="danger"
                fullWidth
                onClick={dispatchEmergency}
                loading={triggering}
                icon={Check}
              >
                Dispatch Signal (Severity: {analysis.severityLevel?.toUpperCase()})
              </Button>
            </motion.div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default AccidentDetection;
