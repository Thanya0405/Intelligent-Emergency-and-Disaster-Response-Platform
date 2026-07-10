import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { severityColors } from '../../utils/formatters';

const createEmergencyIcon = (severity) => {
  const color = severity === 'critical' ? '#ef4444' : severity === 'high' ? '#f97316' : severity === 'medium' ? '#f59e0b' : '#3b82f6';
  return new L.DivIcon({
    html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:40px;height:40px;">
      <div style="position:absolute;inset:0;background:${color};opacity:0.25;border-radius:50%;animation:ping 1.2s infinite;"></div>
      <div style="position:relative;width:24px;height:24px;background:${color};border:2px solid #ffffff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.6);font-size:10px;">
        🚨
      </div>
    </div>`,
    className: 'custom-command-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 12, { animate: true });
    }
  }, [center, map]);
  return null;
};

const CommandMap = ({ emergencies, activeEmergency }) => {
  const defaultCenter = [19.076, 72.8777];

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 relative">
      <MapContainer
        center={defaultCenter}
        zoom={11}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {emergencies.map((e) => (
          <Marker
            key={e._id}
            position={[e.location.lat, e.location.lng]}
            icon={createEmergencyIcon(e.severity)}
          >
            <Popup>
              <div className="text-xs space-y-1.5 min-w-[150px]">
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                  <span className="font-bold text-white capitalize">{e.type} Incident</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold capitalize ${
                    e.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {e.severity}
                  </span>
                </div>
                <p className="text-white/60">{e.description || 'Emergency SOS Ping active'}</p>
                <div className="flex justify-between items-center text-[10px] text-white/40 pt-1">
                  <span>Status:</span>
                  <span className="uppercase font-semibold text-blue-400">{e.status}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {activeEmergency?.location?.lat && (
          <MapController center={[activeEmergency.location.lat, activeEmergency.location.lng]} />
        )}
      </MapContainer>
    </div>
  );
};

export default CommandMap;
