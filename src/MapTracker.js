import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Correction pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapTracker = () => {
  const [position, setPosition] = useState([36.8065, 10.1815]);
  const [gpsData, setGpsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://gps-application-latest.onrender.com/api/gps/latest');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      if (data.latitude && data.longitude) {
        setPosition([data.latitude, data.longitude]);
        setGpsData(prev => [...prev.slice(-10), data]); // Garder seulement les 10 dernières positions
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching GPS data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '5px'
        }}>
          Chargement des données GPS...
        </div>
      )}
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          backgroundColor: 'red',
          color: 'white',
          padding: '20px',
          borderRadius: '5px'
        }}>
          Erreur: {error}
        </div>
      )}
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
          <Popup>
            <div>
              <h3>Position du bus</h3>
              <p>Latitude: {position[0].toFixed(6)}</p>
              <p>Longitude: {position[1].toFixed(6)}</p>
              <p>Dernière mise à jour: {gpsData.length > 0 ? new Date(gpsData[gpsData.length - 1].timestamp).toLocaleTimeString() : 'N/A'}</p>
              {loading && <p>Mise à jour en cours...</p>}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapTracker;