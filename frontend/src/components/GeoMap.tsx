import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useStore } from '../store/useStore';
import 'leaflet/dist/leaflet.css';

export function GeoMap({
  scatterHovered,
  heatmapHovered,
}: {
  scatterHovered: { familyCode: string; surveyNumber: string } | null;
  heatmapHovered: { familyCode: string; surveyNumber: string } | null;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const brushedMarkersRef = useRef<L.LayerGroup | null>(null);
  const { data, selectedIndices, brushBox } = useStore();

  const ncBounds = L.latLngBounds(
    L.latLng(33.8423, -84.3219),  
    L.latLng(36.5881, -75.4606)  
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

    data.forEach(row => {
      const lat = row.latitude;
      const lng = row.longitude;
      if (lat && lng) {
        L.circleMarker([lat, lng], {
          radius: 5,
          color: 'white',
          fillColor: 'black',
          fillOpacity: 0.8,
          weight: 2
        }).addTo(map);
      }
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
      if (!mapRef.current) return;

      const active = heatmapHovered ?? scatterHovered;
      if (!active) {
        markerRef.current?.remove();
        return;
      }

      const match = data.find(
        (d) =>
          d.familyCode === active.familyCode &&
          d.surveyNumber === active.surveyNumber &&
          d?.latitude &&
          d?.longitude
      );

      if (!match) return;

      markerRef.current?.remove();

      const marker = L.circleMarker([match.latitude, match.longitude], {
        radius: 7,
        fillColor: 'blue',
        fillOpacity: 0.9,
        color: 'white',
        weight: 2,
      }).addTo(mapRef.current);

      markerRef.current = marker;
    }, [scatterHovered, heatmapHovered, data]);

    useEffect(() => {
    if (!mapRef.current) return;

    brushedMarkersRef.current?.clearLayers();

    const group = L.layerGroup();

    selectedIndices.forEach((index) => {
      const d = data[index];
      if (d?.latitude && d?.longitude && brushBox) {
        const marker = L.circleMarker([d.latitude, d.longitude], {
          radius: 6,
          fillColor: 'blue',
          fillOpacity: 0.8,
          color: 'white',
          weight: 2,
        });
        marker.addTo(group);
      }
    });

    group.addTo(mapRef.current);
    brushedMarkersRef.current = group;
  }, [selectedIndices, data]);

  return (
    <div style={{ position: 'relative', width: '600px', height: '510px' }}>
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}