'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';

interface MapProps {
  positionPick: LatLngExpression;
  positionDrop: LatLngExpression;
  pickUp: { address: string };
  dropOff: { address: string };
}

const MapComponent: React.FC<MapProps> = ({ positionPick, positionDrop, pickUp, dropOff }) => {
  const pickIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [35, 35],
  });

  const dropIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149059.png',
    iconSize: [35, 35],
  });

  return (
    <MapContainer
      bounds={[positionPick, positionDrop]}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={positionPick} icon={pickIcon}>
        <Popup>Pick Up: {pickUp.address}</Popup>
      </Marker>
      <Marker position={positionDrop} icon={dropIcon}>
        <Popup>Drop Off: {dropOff.address}</Popup>
      </Marker>
      <Polyline positions={[positionPick, positionDrop]} color="black" />
    </MapContainer>
  );
};

export default MapComponent;
