export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
};

export const formatTimeAgo = (date) => {
  if (!date) return 'Unknown';
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const formatDistance = (km) => {
  if (!km && km !== 0) return 'Unknown';
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
};

export const severityColors = {
  low: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', hex: '#3b82f6' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', hex: '#f59e0b' },
  high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', hex: '#f97316' },
  critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', hex: '#ef4444' },
};

export const statusColors = {
  safe: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  warning: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  emergency: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  unknown: { bg: 'bg-white/10', text: 'text-white/50', border: 'border-white/20' },
  active: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  responding: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  resolved: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  false_alarm: { bg: 'bg-white/10', text: 'text-white/50', border: 'border-white/20' },
};

export const alertTypeIcons = {
  flood: '🌊',
  fire: '🔥',
  earthquake: '⚡',
  cyclone: '🌀',
  landslide: '⛰️',
  tsunami: '🌊',
  chemical: '☣️',
  other: '⚠️',
};

export const emergencyTypeIcons = {
  accident: '🚗',
  medical: '🏥',
  fire: '🔥',
  flood: '🌊',
  earthquake: '⚡',
  sos: '🆘',
  other: '⚠️',
};

export const capitalize = (str) => str?.charAt(0).toUpperCase() + str?.slice(1) || '';
