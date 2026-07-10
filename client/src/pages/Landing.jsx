import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Eye, HeartPulse, Activity, Zap } from 'lucide-react';
import Button from '../components/ui/Button';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden relative font-body flex flex-col justify-between">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <nav className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">
            SafeGuard <span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to="/register" className="hidden sm:inline-block">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 md:py-24 flex flex-col lg:flex-row items-center gap-16 relative z-10 flex-1 justify-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 space-y-8 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-medium">
            <Zap size={12} className="animate-pulse" />
            Next-Gen Emergency Response
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-[1.1] text-white">
            Intelligent Protection When{' '}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-indigo-500 bg-clip-text text-transparent">
              Every Second Counts
            </span>
          </h1>

          <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-light">
            SafeGuard AI fuses sensor telemetry, real-time alerts, and Gemini AI analysis to coordinate rapid response, first aid routing, and family safety tracking instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">Create Free Account</Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto">Access Command Console</Button>
            </Link>
          </div>

          {/* Demo Credentials Box */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs font-mono space-y-2 max-w-sm mx-auto lg:mx-0">
            <p className="text-white/40 uppercase tracking-widest text-[10px] mb-2">Quick Demo Access Credentials</p>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Standard User</span>
              <span className="text-blue-400">demo@safeguard.ai / user123</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Admin Access</span>
              <span className="text-violet-400">admin@safeguard.ai / admin123</span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5 max-w-md mx-auto lg:mx-0">
            <div>
              <p className="text-2xl sm:text-3xl font-display font-bold text-blue-400">99.9%</p>
              <p className="text-xs text-white/40 font-mono">Uptime SLA</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-display font-bold text-violet-400">&lt; 3s</p>
              <p className="text-xs text-white/40 font-mono">AI Dispatch</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-display font-bold text-emerald-400">100%</p>
              <p className="text-xs text-white/40 font-mono">End-to-End Encrypted</p>
            </div>
          </div>
        </motion.div>

        {/* Right Content - Radar/Pulse Sweep Console Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="flex-1 w-full max-w-md lg:max-w-none flex items-center justify-center relative"
        >
          <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-blue-500/20 bg-blue-950/5 flex items-center justify-center backdrop-blur-xl shadow-2xl shadow-blue-500/5">
            {/* Sweep hand */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/2 w-1/2 h-1/2 bg-gradient-to-r from-blue-500/20 to-transparent origin-bottom-left radar-sweep" />
            </div>

            {/* Radar concentric circles */}
            <div className="absolute w-[80%] h-[80%] rounded-full border border-blue-500/10" />
            <div className="absolute w-[60%] h-[60%] rounded-full border border-blue-500/10" />
            <div className="absolute w-[40%] h-[40%] rounded-full border border-blue-500/10" />
            <div className="absolute w-[20%] h-[20%] rounded-full border border-blue-500/10" />

            {/* Radar axes */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-blue-500/10" />
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-blue-500/10" />

            {/* Pulsing signal nodes */}
            <div className="absolute top-[25%] left-[30%] w-3 h-3 bg-red-500 rounded-full animate-ping" />
            <div className="absolute top-[25%] left-[30%] w-3 h-3 bg-red-500 rounded-full border border-white" />

            <div className="absolute bottom-[30%] right-[25%] w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <div className="absolute top-[40%] right-[35%] w-2 h-2 bg-amber-500 rounded-full animate-pulse" />

            {/* Core logo center */}
            <div className="w-20 h-20 rounded-full bg-bg-card border border-white/10 flex items-center justify-center relative shadow-lg">
              <Shield size={28} className="text-blue-400" />
            </div>

            {/* Holographic scanner effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-blue-500/10 rounded-full scan-line pointer-events-none" />
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-6 text-center text-xs text-white/30 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 SafeGuard AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Emergency Protocol</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
