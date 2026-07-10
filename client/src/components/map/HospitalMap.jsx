import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

// Premium custom SVG map markers
const createMarkerIcon = (color) => {
  return new L.DivIcon({
    html: `<div style="display:flex;align-items:center;justify-center;width:30px;height:30px;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
      </svg>
    </div>`,
    className: 'custom-leaflet-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

const defaultIcon = createMarkerIcon('#3b82f6'); // Blue for hospitals
const userIcon = createMarkerIcon('#ef4444');    // Red for user location

// Helper to center the map dynamically when selection updates
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13, { animate: true });
    }
  }, [center, map]);
  return null;
};

const HospitalMap = ({ userLocation, hospitals, activeHospital }) => {
  const defaultCenter = userLocation ? [userLocation.lat, userLocation.lng] : [19.076, 72.8777];

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 relative">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-xs">
                <p className="font-semibold">Your Location</p>
                <p className="text-white/40">Broadcasting emergency coordinates</p>
              </div>
            </Popup>
          </Marker>
        )}

        {hospitals.map((h) => (
          <Marker
            key={h._id}
            position={[h.location.lat, h.location.lng]}
            icon={defaultIcon}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-semibold text-blue-400">{h.name}</p>
                <p className="text-white/60">Beds: {h.availableBeds}/{h.capacity}</p>
                <p className="text-white/40 font-mono">{h.phone}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapController center={activeHospital ? [activeHospital.location.lat, activeHospital.location.lng] : defaultCenter} />
      </MapContainer>
    </div>
  );
};

export default HospitalMap;
