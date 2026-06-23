'use client';

import dynamic from 'next/dynamic';
import { LatLngExpression } from 'leaflet';

type Location = {
  id: number;
  address: string;
  latitude: string;
  longitude: string;
  location_type: 'pick' | 'drop';
};

interface DeliveryRouteCardProps {
  locations: Location[];
}
// Dynamically import React Leaflet map (client-only)
const MapComponent = dynamic(() => import('../mapcomponent'), {
  ssr: false, // <-- Prevent SSR
});

const DeliveryRouteCard: React.FC<DeliveryRouteCardProps> = ({ locations }) => {
  const pickUp = locations?.find((loc) => loc.location_type === 'pick');
  const dropOff = locations?.find((loc) => loc.location_type === 'drop');
if (!pickUp || !dropOff) return <p>No valid route data available</p>;

  const positionPick: LatLngExpression = [
    parseFloat(pickUp.latitude),
    parseFloat(pickUp.longitude),
  ];
  const positionDrop: LatLngExpression = [
    parseFloat(dropOff.latitude),
    parseFloat(dropOff.longitude),
  ];

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 w-full max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-2">Delivery Route</h2>
      <div className="h-64 rounded-lg overflow-hidden">
        <MapComponent positionPick={positionPick} positionDrop={positionDrop} pickUp={pickUp} dropOff={dropOff} />
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-start gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full mt-1" />
          <p className="text-sm">
            <span className="font-semibold">Pick Up:</span> {pickUp.address}
          </p>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full mt-1" />
          <p className="text-sm">
            <span className="font-semibold">Drop Off:</span> {dropOff.address}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryRouteCard;
