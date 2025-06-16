import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export function GeoMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const ncBounds = L.latLngBounds(
    L.latLng(33.8423, -84.3219), // Southwest (lat, lng)
    L.latLng(36.5881, -75.4606)  // Northeast (lat, lng)
  );

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [35.7596, -79.0193], 
      zoom: 6,
      maxBounds: ncBounds,
      minZoom: 6,
      maxZoom: 12
    });

    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Enforce bounds
    map.on('drag', () => {
      if (!ncBounds.contains(map.getCenter())) {
        map.panInsideBounds(ncBounds, { animate: true });
      }
    });

    // Load GeoJSON
    fetch('/data/nc.geojson')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load GeoJSON');
        return res.json();
      })
      .then((data: GeoJSON.Feature) => {
        L.geoJSON(data, {
          style: {
            color: 'black',
            weight: 2,
            fillOpacity: 0
          }
        }).addTo(map);
      })

    const points = [
      [35.7796, -78.6382], // Raleigh
      [35.2271, -80.8431], // Charlotte
      [36.0726, -79.7920], // Greensboro
    ];

    points.forEach(([lat, lng]) => {
      L.circleMarker([lat, lng], {
        radius: 5,        
        color: 'white',
        fillColor: 'blue', 
        fillOpacity: 0.8,
        weight: 2
      }).addTo(map);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '600px', height: '510px' }}>
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}