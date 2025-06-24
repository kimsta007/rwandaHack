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
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const { data, selectedIndices, brushBox, selectedDataset, colorMap, selectedFeature } = useStore();

  const datasetBounds: Record<string, L.LatLngBounds> = {
    'North Carolina': L.latLngBounds(
      L.latLng(33.8423, -84.3219),
      L.latLng(36.5881, -75.4606)
    ),
    'Rwanda': L.latLngBounds(
      L.latLng(-2.84, 28.86),
      L.latLng(-1.02, 30.89)
    )
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: datasetBounds[selectedDataset].getCenter(),
        zoom: 6,
        maxBounds: datasetBounds[selectedDataset],
        minZoom: 6,
        maxZoom: 12
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      mapRef.current = map;
    }

    const map = mapRef.current;

    map.setMaxBounds(datasetBounds[selectedDataset]);
    map.flyToBounds(datasetBounds[selectedDataset]);

    // Enforce bounds
    const handleDrag = () => {
      if (!datasetBounds[selectedDataset].contains(map.getCenter())) {
        map.panInsideBounds(datasetBounds[selectedDataset], { animate: true });
      }
    };
    map.on('drag', handleDrag);

    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.remove();
    }
    map.eachLayer((layer) => {
      if (layer === brushedMarkersRef.current || layer === markerRef.current) return;
      if ((layer as any)._url) return; 
      map.removeLayer(layer);
    });

    fetch('/data/' + selectedDataset + '.geojson')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load GeoJSON');
        return res.json();
      })
      .then((data: GeoJSON.Feature) => {
        geoJsonLayerRef.current = L.geoJSON(data, {
          style: {
            color: 'black',
            weight: 1.5,
            fillOpacity: 0
          }
        }).addTo(map);
      })
      .catch(console.error);

    // Add data points
    data.forEach(row => {
      const lat = row.latitude;
      const lng = row.longitude;
      if (lat && lng) {
        const value = selectedFeature ? row.features[selectedFeature] : null;
        const fillColor = value != null ? colorMap[value] ?? '#999' : '#ccc';
        L.circleMarker([lat, lng], {
          radius: 5,
          color: 'black',
          fillColor,
          fillOpacity: 0.8,
          weight: 1
        }).addTo(map);
      }
    });

    return () => {
      map.off('drag', handleDrag);
    };
  }, [selectedDataset, data, selectedFeature]);

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