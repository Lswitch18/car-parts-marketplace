import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Warehouse {
  id: string;
  name: string;
  city: string;
  country: 'BR' | 'JP';
  lat: number;
  lng: number;
  capacity: number;
  occupation: number;
}

interface LogisticsMapProps {
  warehouses: Warehouse[];
  height?: number;
}

// Custom marker icon
const createNeonIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border-radius: 50%;
        box-shadow: 0 0 15px ${color}, 0 0 30px ${color}40;
        animation: pulse 2s infinite;
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const brazilIcon = createNeonIcon('#00f5ff');
const japanIcon = createNeonIcon('#ff00ff');

// Component to fit bounds
function FitBounds({ warehouses }: { warehouses: Warehouse[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (warehouses.length > 0) {
      const bounds = L.latLngBounds(warehouses.map(w => [w.lat, w.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, warehouses]);
  
  return null;
}

export function LogisticsMap({ warehouses, height = 300 }: LogisticsMapProps) {
  const brazilWarehouses = warehouses.filter(w => w.country === 'BR');
  const japanWarehouses = warehouses.filter(w => w.country === 'JP');
  
  // Calculate center (between Brazil and Japan)
  const center: [number, number] = [-10, -60];
  
  return (
    <div className="rounded-xl overflow-hidden border border-dark-border" style={{ height }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        .leaflet-popup-content-wrapper {
          background: #12121a !important;
          color: #fff !important;
          border: 1px solid #00f5ff !important;
          border-radius: 8px !important;
        }
        .leaflet-popup-tip {
          background: #12121a !important;
        }
        .leaflet-popup-content {
          margin: 12px !important;
          font-family: 'JetBrains Mono', monospace !important;
        }
      `}</style>
      
      <MapContainer 
        center={center} 
        zoom={3} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <FitBounds warehouses={warehouses} />
        
        {/* Brazil Warehouses */}
        {brazilWarehouses.map((wh) => (
          <Marker 
            key={wh.id}
            position={[wh.lat, wh.lng]}
            icon={brazilIcon}
          >
            <Popup>
              <div className="text-center">
                <div className="text-neon-cyan font-bold mb-1">{wh.name}</div>
                <div className="text-gray-400 text-sm">{wh.city}</div>
                <div className="text-gray-500 text-xs mt-2">
                  Capacidade: {wh.capacity.toLocaleString()} m³
                </div>
                <div className="text-gray-500 text-xs">
                  Ocupação: {Math.round((wh.occupation / wh.capacity) * 100)}%
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Japan Warehouses */}
        {japanWarehouses.map((wh) => (
          <Marker 
            key={wh.id}
            position={[wh.lat, wh.lng]}
            icon={japanIcon}
          >
            <Popup>
              <div className="text-center">
                <div className="text-neon-magenta font-bold mb-1">{wh.name}</div>
                <div className="text-gray-400 text-sm">{wh.city}</div>
                <div className="text-gray-500 text-xs mt-2">
                  Capacidade: {wh.capacity.toLocaleString()} m³
                </div>
                <div className="text-gray-500 text-xs">
                  Ocupação: {Math.round((wh.occupation / wh.capacity) * 100)}%
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Route line between Brazil and Japan */}
        {brazilWarehouses.length > 0 && japanWarehouses.length > 0 && (
          <Polyline
            positions={[
              [brazilWarehouses[0].lat, brazilWarehouses[0].lng],
              [japanWarehouses[0].lat, japanWarehouses[0].lng]
            ]}
            pathOptions={{
              color: '#00f5ff',
              weight: 2,
              dashArray: '10, 10',
              opacity: 0.6
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}

// Map legend component
export function MapLegend() {
  return (
    <div className="flex gap-4 text-xs text-gray-400 mt-2">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-neon-cyan shadow-neon-cyan"></div>
        <span>Brasil</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-neon-magenta shadow-neon-magenta"></div>
        <span>Japão</span>
      </div>
    </div>
  );
}