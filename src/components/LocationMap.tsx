import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
  location?: string;
  className?: string;
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
}

interface Coordinates {
  lat: number;
  lng: number;
}

const MapUpdater = ({ center }: { center: Coordinates }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], 13);
  }, [center, map]);
  return null;
};

const LocationMap = ({ 
  location, 
  className = "h-48 w-full rounded-xl overflow-hidden",
  interactive = false,
  onLocationSelect 
}: LocationMapProps) => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const geocodeLocation = async () => {
      if (!location) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
          {
            headers: {
              'User-Agent': 'TangleDatingApp/1.0',
            },
          }
        );
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          setCoordinates({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          });
        } else {
          setError('Location not found');
        }
      } catch (err) {
        setError('Failed to load map');
        console.error('Geocoding error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    geocodeLocation();
  }, [location]);

  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    if (!interactive || !onLocationSelect) return;
    
    const { lat, lng } = e.latlng;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'TangleDatingApp/1.0',
          },
        }
      );
      
      const data = await response.json();
      const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      
      setCoordinates({ lat, lng });
      onLocationSelect(lat, lng, address);
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      onLocationSelect(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  if (isLoading) {
    return (
      <div className={`${className} bg-secondary flex items-center justify-center`}>
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !coordinates) {
    return (
      <div className={`${className} bg-secondary flex items-center justify-center`}>
        <p className="text-muted-foreground text-sm">
          {error || 'No location available'}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <MapContainer
        center={[coordinates.lat, coordinates.lng]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        // Note: onClick is handled via useMapEvents in more complex scenarios
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coordinates.lat, coordinates.lng]}>
          <Popup>{location}</Popup>
        </Marker>
        <MapUpdater center={coordinates} />
      </MapContainer>
    </div>
  );
};

export default LocationMap;
