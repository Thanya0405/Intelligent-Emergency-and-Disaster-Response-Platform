const SkeletonLoader = ({ lines = 3, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div
          className="bg-white/5 rounded-lg h-4"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      </div>
    ))}
  </div>
);

export const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse ${className}`}>
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 bg-white/10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-white/10 rounded" />
      <div className="h-3 bg-white/10 rounded w-5/6" />
      <div className="h-3 bg-white/10 rounded w-4/6" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl animate-pulse">
        <div className="w-10 h-10 bg-white/10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-white/10 rounded w-2/3" />
          <div className="h-3 bg-white/5 rounded w-1/2" />
        </div>
        <div className="w-20 h-6 bg-white/10 rounded-full" />
      </div>
    ))}
  </div>
);

export const MapSkeleton = ({ className = '' }) => (
  <div className={`bg-white/5 rounded-2xl animate-pulse flex items-center justify-center ${className}`}>
    <div className="text-center text-white/30">
      <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-3" />
      <div className="h-3 bg-white/10 rounded w-24 mx-auto" />
    </div>
  </div>
);

export default SkeletonLoader;
