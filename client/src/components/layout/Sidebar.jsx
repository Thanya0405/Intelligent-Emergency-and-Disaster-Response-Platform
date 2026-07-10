import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, AlertTriangle, Phone, HeartPulse, CloudRain,
  Hospital, Users, Mic, FileText, Monitor, ShieldCheck, ChevronRight, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navSections = [
  {
    title: 'Core Operations',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Command Center', path: '/command-center', icon: Monitor },
      { label: 'SOS Alert Hub', path: '/sos', icon: Phone },
    ]
  },
  {
    title: 'AI Core Modules',
    items: [
      { label: 'Accident Detection', path: '/accident-detection', icon: AlertTriangle },
      { label: 'First Aid AI', path: '/first-aid', icon: HeartPulse },
      { label: 'Voice Command AI', path: '/voice-assistant', icon: Mic },
    ]
  },
  {
    title: 'Logistics & Safety',
    items: [
      { label: 'Hospital Finder', path: '/hospitals', icon: Hospital },
      { label: 'Disaster Center', path: '/disasters', icon: CloudRain },
      { label: 'Family Tracking', path: '/family', icon: Users },
      { label: 'AI Reports Logs', path: '/reports', icon: FileText },
    ]
  }
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-[#0d1117] border-r border-white/[0.06] z-30
          transform transition-transform duration-300 ease-in-out pt-16
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full overflow-y-auto py-4 px-3">
          {/* Navigation */}
          <nav className="flex-1 space-y-6">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1.5">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest px-3 block">
                  {section.title}
                </span>
                <div className="space-y-0.5">
                  {section.items.map(({ label, path, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group
                        ${isActive(path)
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : 'text-white/50 hover:text-white hover:bg-white/5'}
                      `}
                    >
                      <Icon size={15} className={isActive(path) ? 'text-blue-400' : 'text-white/40 group-hover:text-white/70'} />
                      {label}
                      {isActive(path) && <ChevronRight size={12} className="ml-auto" />}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Admin link */}
            {user?.role === 'admin' && (
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <span className="text-[10px] font-mono text-violet-400/50 uppercase tracking-widest px-3 block">
                  Security Clearance
                </span>
                <Link
                  to="/admin"
                  onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border
                    ${isActive('/admin')
                      ? 'bg-violet-600/20 text-violet-400 border-violet-500/30'
                      : 'text-violet-400/60 hover:text-violet-400 hover:bg-violet-600/10 border-violet-500/20'}
                  `}
                >
                  <ShieldCheck size={15} />
                  Admin Panel Command
                </Link>
              </div>
            )}
          </nav>


          {/* Bottom user card */}
          <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-white/40 truncate">{user?.role || 'User'}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
