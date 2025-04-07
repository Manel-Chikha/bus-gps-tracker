import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapTracker = () => {
  const [position, setPosition] = useState([36.8065, 10.1815]);
  const [history, setHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

const API_BASE_URL = 'https://gps-application-latest.onrender.com/api/gps';
  const fetchLatestPosition = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/latest`);
      if (response.data) {
        const { latitude, longitude } = response.data;
        setPosition([latitude, longitude]);
        setIsConnected(true);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching GPS data:', error);
      setIsConnected(false);
    }
  };

  const fetchPositionHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/all`);
      if (response.data) {
        setHistory(response.data);
      }
    } catch (error) {
      console.error('Error fetching GPS history:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLatestPosition();
      fetchPositionHistory();
    }, 5000);

    fetchLatestPosition();
    fetchPositionHistory();

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <Marker position={position}>
          <Popup>
            Position actuelle du bus <br />
            Latitude: {position[0].toFixed(6)} <br />
            Longitude: {position[1].toFixed(6)}
          </Popup>
        </Marker>

        {history.map((item, index) => (
          <Marker
            key={index}
            position={[item.latitude, item.longitude]}
            opacity={0.6}
          >
            <Popup>
              Position historique <br />
              {new Date(item.timestamp).toLocaleString()} <br />
              Lat: {item.latitude.toFixed(6)} <br />
              Lng: {item.longitude.toFixed(6)}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 0 10px rgba(0,0,0,0.2)'
      }}>
        <h3>Statut du GPS</h3>
        <p>Connecté: {isConnected ? '✅' : '❌'}</p>
        <p>Dernière mise à jour: {lastUpdate.toLocaleTimeString()}</p>
        <p>Latitude: {position[0].toFixed(6)}</p>
        <p>Longitude: {position[1].toFixed(6)}</p>
      </div>
    </div>
  );
};

export default MapTracker;
