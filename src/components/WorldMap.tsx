"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapLocation {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  purpose?: string;
  notes?: string;
}

// Custom marker icon (cyan dot)
const createCustomIcon = () => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 12px;
        height: 12px;
        background: #0084ff;
        border: 2px solid #fff;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(4, 117, 247, 0.84), 0 0 20px rgba(4, 166, 247, 0.3);
      "></div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -6],
  });
};

export function WorldMap({ locations }: { locations: MapLocation[] }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div
        className="w-full rounded-lg"
        style={{
          height: "500px",
          backgroundColor: "#404040",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-tertiary)",
          fontSize: "14px",
        }}
      >
        Loading map...
      </div>
    );
  }

  // Calculate bounds to fit all locations
  const bounds: L.LatLngBoundsExpression | undefined =
    locations.length > 0
      ? locations.map((loc) => [loc.latitude, loc.longitude] as [number, number])
      : undefined;

  // Create polyline coordinates for connection lines
  const polylinePositions: [number, number][] = locations.map((loc) => [
    loc.latitude,
    loc.longitude,
  ]);

  const customIcon = createCustomIcon();

  return (
    <div className="w-full" style={{ height: "500px", position: "relative" }}>
      <style jsx global>{`
        .leaflet-container {
          background: #404040;
          border-radius: 8px;
        }

        .leaflet-tile-pane {
          filter: grayscale(100%) brightness(0.6) contrast(1.2);
        }

        .leaflet-popup-content-wrapper {
          background: #1a1a1a;
          color: #22d3ee;
          border: 2px solid #22d3ee;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          padding: 0;
        }

        .leaflet-popup-content {
          margin: 8px;
          min-width: 160px;
        }

        .leaflet-popup-tip {
          background: #1a1a1a;
          border: 2px solid #22d3ee;
          border-left: none;
          border-bottom: none;
        }

        .leaflet-popup-close-button {
          color: #22d3ee !important;
          font-size: 18px !important;
          padding: 4px 8px !important;
        }

        .leaflet-popup-close-button:hover {
          color: #fff !important;
        }

        .popup-city {
          font-weight: bold;
          color: #22d3ee;
          margin-bottom: 4px;
        }

        .popup-detail {
          color: #a0a0a0;
          font-size: 10px;
          margin: 2px 0;
        }

        .leaflet-control-zoom a {
          background: #1a1a1a !important;
          color: #22d3ee !important;
          border: 1px solid #22d3ee !important;
        }

        .leaflet-control-zoom a:hover {
          background: #22d3ee !important;
          color: #1a1a1a !important;
        }

        .leaflet-control-attribution {
          background: rgba(26, 26, 26, 0.8) !important;
          color: #a0a0a0 !important;
          font-size: 10px !important;
        }

        .leaflet-control-attribution a {
          color: #22d3ee !important;
        }
      `}</style>

      <MapContainer
        bounds={bounds}
        zoom={2}
        style={{ height: "100%", width: "100%", borderRadius: "8px" }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
         attribution='&copy; <a href="https://carto.com/">carto.com</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
        />

        {/* Connection lines between locations */}
        {locations.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: "#22d3ee",
              weight: 2,
              opacity: 0.5,
              dashArray: "5, 6",
            }}
          />
        )}

        {/* Location markers */}
        {locations.map((loc, idx) => (
          <Marker
            key={idx}
            position={[loc.latitude, loc.longitude]}
            icon={customIcon}
          >
            <Popup>
              <div>
                <div className="popup-city">
                  {loc.city}, {loc.country}
                </div>
                {loc.purpose && (
                  <div className="popup-detail">📍 {loc.purpose}</div>
                )}
                {loc.notes && <div className="popup-detail">💡 {loc.notes}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
