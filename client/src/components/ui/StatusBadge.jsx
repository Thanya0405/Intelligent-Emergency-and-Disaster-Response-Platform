import { severityColors, statusColors, capitalize } from '../../utils/formatters';

const StatusBadge = ({ status, type = 'status', size = 'sm' }) => {
  const colors = type === 'severity' ? severityColors : statusColors;
  const color = colors[status] || statusColors.unknown;
  const sizeClass = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-full border ${color.bg} ${color.text} ${color.border} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${color.text.replace('text-', 'bg-')}`} />
      {capitalize(status?.replace('_', ' '))}
    </span>
  );
};

export default StatusBadge;
