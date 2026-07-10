import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { statusColors } from '../../utils/formatters';

const createMemberIcon = (status) => {
  const color = status === 'safe' ? '#22c55e' : status === 'warning' ? '#f59e0b' : status === 'emergency' ? '#ef4444' : '#6b7280';
  return new L.DivIcon({
    html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:40px;height:40px;">
      ${status === 'emergency' ? `<div style="position:absolute;inset:0;background:${color};opacity:0.3;border-radius:50%;animation:ping 1s infinite;"></div>` : ''}
      <div style="position:relative;width:28px;height:28px;background:${color};border:2px solid #ffffff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;box-shadow:0 2px 5px rgba(0,0,0,0.5);">
        👤
      </div>
    </div>`,
    className: 'custom-family-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13, { animate: true });
    }
  }, [center, map]);
  return null;
};

const FamilyMap = ({ members, activeMember }) => {
  const defaultCenter = [19.076, 72.8777]; // Fallback center

  // Filter out members with no location coords
  const mapMembers = members.filter(m => m.location?.lat && m.location?.lng);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 relative">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {mapMembers.map((m) => (
          <Marker
            key={m._id}
            position={[m.location.lat, m.location.lng]}
            icon={createMemberIcon(m.status)}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-semibold text-white">{m.memberName}</p>
                <p className="text-white/60">Relation: {m.relation}</p>
                <p className="text-white/40 font-mono">{m.phone}</p>
                <div className="pt-1.5 flex items-center justify-between border-t border-white/5 mt-1.5">
                  <span className="text-[10px] text-white/40">Status:</span>
                  <span className={`font-semibold uppercase tracking-wider text-[10px] ${
                    m.status === 'safe' ? 'text-green-400' : m.status === 'warning' ? 'text-yellow-400' : m.status === 'emergency' ? 'text-red-400' : 'text-white/50'
                  }`}>
                    {m.status}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {activeMember?.location?.lat && (
          <MapController center={[activeMember.location.lat, activeMember.location.lng]} />
        )}
      </MapContainer>
    </div>
  );
};

export default FamilyMap;
