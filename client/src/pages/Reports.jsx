import { useState, useEffect } from 'react';
import { FileText, Download, Sparkles, Plus, Search, Calendar, ChevronRight } from 'lucide-react';
import { reportApi } from '../services/resources';
import { exportReportPDF } from '../utils/pdfExport';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import SkeletonLoader, { TableSkeleton } from '../components/ui/SkeletonLoader';
import toast from 'react-hot-toast';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Form custom details for manual report trigger
  const [customData, setCustomData] = useState({
    type: 'accident',
    severity: 'medium',
    description: 'Minor traffic collision on SV Road near Bandra West. First aid administered.',
    affectedPersons: 1
  });

  const fetchReports = async () => {
    try {
      const res = await reportApi.getAll();
      setReports(res.data.data);
      if (res.data.data.length > 0) {
        // Load detailed analysis structure for the first report
        setSelectedReport(res.data.data[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load emergency reports logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleInputChange = (e) => {
    setCustomData({ ...customData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const payload = {
        customData: {
          type: customData.type,
          severity: customData.severity,
          description: customData.description,
          affectedPersons: parseInt(customData.affectedPersons),
          location: { lat: 19.076, lng: 72.8777, address: 'SV Road, Bandra West, Mumbai' },
          timeline: [
            { step: 'Incident detected by user', timestamp: new Date() },
            { step: 'AI Incident Report initialized', timestamp: new Date(Date.now() + 2 * 60 * 1000) }
          ]
        }
      };

      const res = await reportApi.generate(payload);
      toast.success('AI Report compiled successfully');
      fetchReports();
    } catch (err) {
      console.error(err);
      toast.error('Failed to compile report');
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDF = (report) => {
    if (!report) return;
    try {
      let aiAnalysis = null;
      if (report.aiInsights) {
        aiAnalysis = JSON.parse(report.aiInsights);
      }
      exportReportPDF(report, aiAnalysis);
      toast.success('PDF report download successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to compile PDF structure');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Emergency Incident Reports</h1>
        <p className="text-white/40 text-sm">Generate AI incident logs and export legal structure PDF documents</p>
      </div>

      {/* Quick Demo Instruction Helper */}
      <GlassCard className="p-4 border border-violet-500/20 bg-violet-950/5 text-xs space-y-2">
        <p className="font-semibold text-violet-400">📄 How to Generate & Export AI Incident Reports:</p>
        <ol className="list-decimal pl-4 space-y-1 text-white/60">
          <li>Past incident reports are pre-seeded — click any log card on the right to open its full AI analysis.</li>
          <li>Use the <strong className="text-violet-300">Compile AI Report</strong> form (left panel) to generate a brand new Gemini-written incident report from custom data.</li>
          <li>Once a report is selected, click <strong className="text-violet-300">Download PDF</strong> to export a structured, legal-format incident document via jsPDF.</li>
        </ol>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create manual report & list previous logs */}
        <div className="space-y-6 lg:col-span-1">
          {/* compilation config form */}
          <GlassCard className="p-5 space-y-4">
            <h3 className="font-display font-semibold text-base flex items-center gap-2 border-b border-white/5 pb-2">
              <Sparkles size={16} className="text-violet-400" /> Compile AI Report
            </h3>
            <form onSubmit={handleGenerate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/40 uppercase">Incident Type</label>
                  <select
                    name="type"
                    value={customData.type}
                    onChange={handleInputChange}
                    className="input-field py-2 px-3 text-xs appearance-none cursor-pointer"
                  >
                    {['accident', 'medical', 'fire', 'flood', 'earthquake', 'sos'].map(t => (
                      <option key={t} value={t}>{t.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/40 uppercase">Severity</label>
                  <select
                    name="severity"
                    value={customData.severity}
                    onChange={handleInputChange}
                    className="input-field py-2 px-3 text-xs appearance-none cursor-pointer"
                  >
                    {['low', 'medium', 'high', 'critical'].map(s => (
                      <option key={s} value={s}>{s.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/40 uppercase">Impact description</label>
                <textarea
                  name="description"
                  value={customData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="input-field text-xs resize-none"
                  required
                />
              </div>

              <Button type="submit" variant="secondary" size="sm" fullWidth loading={generating}>
                Compile structured Report
              </Button>
            </form>
          </GlassCard>

          {/* List reports logs */}
          <GlassCard className="p-5 flex flex-col max-h-[350px]">
            <h3 className="font-display font-semibold text-base flex items-center gap-2 border-b border-white/5 pb-3">
              <FileText size={16} className="text-blue-400" /> Previous Reports
            </h3>

            {loading ? (
              <div className="py-4">
                <SkeletonLoader lines={3} />
              </div>
            ) : reports.length > 0 ? (
              <div className="space-y-2 py-3 overflow-y-auto pr-1 flex-1 text-xs">
                {reports.map((r) => (
                  <div
                    key={r._id}
                    onClick={() => setSelectedReport(r)}
                    className={`p-3 rounded-xl border flex justify-between items-center transition-all cursor-pointer ${
                      selectedReport?._id === r._id
                        ? 'bg-blue-600/10 border-blue-500/30'
                        : 'bg-white/5 border-white/5 hover:bg-white/[0.07]'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-semibold text-white/90 capitalize truncate">{r.incidentType} LOG</p>
                      <p className="text-[10px] text-white/40 font-mono">
                        {new Date(r.time || r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-white/30 flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/30 text-xs">
                No compiled reports saved in system logs.
              </div>
            )}
          </GlassCard>
        </div>

        {/* Selected report details and download PDF preview */}
        <div className="lg:col-span-2">
          {selectedReport ? (
            <GlassCard className="p-6 space-y-6 flex flex-col justify-between h-full min-h-[500px]">
              <div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📄</span>
                    <h3 className="font-display font-bold text-lg capitalize">{selectedReport.incidentType} Report</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadPDF(selectedReport)}
                    icon={Download}
                  >
                    Export PDF
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 text-xs font-mono">
                  <div>
                    <span className="text-white/45 block uppercase text-[10px]">TIME RECORDED</span>
                    <span className="text-white/80">{new Date(selectedReport.time || selectedReport.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-white/45 block uppercase text-[10px]">SEVERITY FLAG</span>
                    <StatusBadge status={selectedReport.severity || 'medium'} type="severity" />
                  </div>
                  <div>
                    <span className="text-white/45 block uppercase text-[10px]">INCIDENT GPS</span>
                    <span className="text-blue-400">
                      {selectedReport.location?.lat?.toFixed(4) || 'N/A'}, {selectedReport.location?.lng?.toFixed(4) || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  {selectedReport.aiInsights && (
                    <>
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Executive Summary</span>
                        <p className="text-sm text-white/80 leading-relaxed bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                          {JSON.parse(selectedReport.aiInsights).executiveSummary}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Incident Analysis</span>
                        <p className="text-xs text-white/60 leading-relaxed bg-white/[0.02] border border-white/5 p-4 rounded-xl whitespace-pre-wrap">
                          {JSON.parse(selectedReport.aiInsights).incidentAnalysis}
                        </p>
                      </div>
                    </>
                  )}

                  {selectedReport.recommendedActions?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Next Steps Recommended</span>
                      <ul className="space-y-1.5 text-xs text-white/70">
                        {selectedReport.recommendedActions.map((act, i) => (
                          <li key={i} className="flex gap-2 items-start bg-white/5 border border-white/5 p-2.5 rounded-lg">
                            <span className="text-blue-400 font-bold">✓</span> {act}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-8 text-center text-white/30 text-sm h-full flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-2xl mb-3">📁</div>
              <p>Configure telemetry and select report above to open document compiler view</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
