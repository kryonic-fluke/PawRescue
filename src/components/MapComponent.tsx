import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mock data for Delhi rescue locations
const rescueLocations = [
  {
    id: 1,
    position: [28.6139, 77.2090] as [number, number],
    title: "Injured Stray Dog",
    description: "Reported 2 hours ago near India Gate",
    type: "rescue"
  },
  {
    id: 2,
    position: [28.5355, 77.3910] as [number, number],
    title: "Lost Cat",
    description: "Missing from Noida sector 18",
    type: "rescue"
  },
  {
    id: 3,
    position: [28.4595, 77.0266] as [number, number],
    title: "Animal Shelter",
    description: "Gurgaon Animal Care Center",
    type: "shelter"
  },
  {
    id: 4,
    position: [28.7041, 77.1025] as [number, number],
    title: "Veterinary Hospital",
    description: "24/7 Emergency Animal Care",
    type: "shelter"
  },
  {
    id: 5,
    position: [28.6304, 77.2177] as [number, number],
    title: "Abandoned Puppies",
    description: "Connaught Place - Need immediate help",
    type: "rescue"
  }
];

interface MapComponentProps {
  className?: string;
  height?: string;
  showControls?: boolean;
}

const MapComponent = ({ className = "", height = "400px", showControls = true }: MapComponentProps) => {
  // Delhi coordinates
  const delhiCenter: [number, number] = [28.6139, 77.2090];

  return (
    <div className={`${className} rounded-xl overflow-hidden shadow-elegant border border-primary/20`} style={{ height }}>
      <MapContainer
        center={delhiCenter}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="map-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {rescueLocations.map((location) => (
          <Marker
            key={location.id}
            position={location.position}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm mb-1">{location.title}</h3>
                <p className="text-xs text-gray-600">{location.description}</p>
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    location.type === 'rescue' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {location.type === 'rescue' ? 'Emergency' : 'Shelter'}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;