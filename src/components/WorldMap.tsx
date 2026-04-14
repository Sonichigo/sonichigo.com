"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface TalkItem {
  title: string;
  event_name: string;
  date?: string;
  image_url?: string;
  event_url?: string;
  video_url?: string;
}

interface MapLocation {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  purpose?: string;
  notes?: string;
  image_url?: string;
  event_url?: string;
  video_url?: string;
  talks?: TalkItem[];
}

// Custom marker icon (vibrant orange/coral dot)
const createCustomIcon = () => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 14px;
        height: 14px;
        background: linear-gradient(135deg, #ff6b35 0%, #f77f00 100%);
        border: 2px solid #fff;
        border-radius: 50%;
        box-shadow: 0 0 15px rgba(255, 107, 53, 0.8), 0 0 30px rgba(247, 127, 0, 0.4);
      "></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -7],
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
          backgroundColor: "#1a1f2e",
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

  const customIcon = createCustomIcon();

  return (
    <div className="w-full" style={{ height: "500px", position: "relative", zIndex: 1 }}>
      <style jsx global>{`
        .leaflet-container {
          background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #1e2838 100%);
          border-radius: 8px;
          position: relative;
          z-index: 1;
        }

        .leaflet-tile-pane {
          filter: grayscale(40%) brightness(0.7) contrast(1.3) saturate(0.8);
          opacity: 0.85;
        }

        .leaflet-popup-content-wrapper {
          background: linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%);
          color: #ff6b35;
          border: 2px solid #ff6b35;
          border-radius: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          padding: 0;
          max-width: 280px;
          box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
        }

        .leaflet-popup-content {
          margin: 0;
          min-width: 160px;
          max-height: 400px;
          overflow-y: auto;
        }

        .popup-image {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 4px 4px 0 0;
          display: block;
        }

        .popup-content-wrapper {
          padding: 8px;
        }

        .leaflet-popup-tip {
          background: linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%);
          border: 2px solid #ff6b35;
          border-left: none;
          border-bottom: none;
        }

        .leaflet-popup-close-button {
          color: #ff6b35 !important;
          font-size: 18px !important;
          padding: 4px 8px !important;
        }

        .leaflet-popup-close-button:hover {
          color: #f77f00 !important;
        }

        .popup-city {
          font-weight: bold;
          color: #ff6b35;
          margin-bottom: 4px;
        }

        .popup-detail {
          color: #a0a0a0;
          font-size: 10px;
          margin: 2px 0;
        }

        .popup-links {
          display: flex;
          gap: 8px;
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px solid #333;
        }

        .popup-link {
          color: #ff6b35;
          font-size: 10px;
          text-decoration: none;
          transition: color 0.2s;
        }

        .popup-link:hover {
          color: #f77f00;
        }

        .leaflet-control-zoom a {
          background: rgba(26, 31, 46, 0.95) !important;
          color: #ff6b35 !important;
          border: 1px solid #ff6b35 !important;
        }

        .leaflet-control-zoom a:hover {
          background: #ff6b35 !important;
          color: #1a1f2e !important;
        }

        .leaflet-control-attribution {
          background: rgba(26, 31, 46, 0.8) !important;
          color: #a0a0a0 !important;
          font-size: 10px !important;
        }

        .leaflet-control-attribution a {
          color: #ff6b35 !important;
        }

        /* Constrain Leaflet z-indexes to not overlap header */
        .leaflet-pane,
        .leaflet-top,
        .leaflet-bottom {
          z-index: 1 !important;
        }

        .leaflet-popup-pane {
          z-index: 2 !important;
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

        {/* Location markers */}
        {locations.map((loc, idx) => (
          <Marker
            key={idx}
            position={[loc.latitude, loc.longitude]}
            icon={customIcon}
          >
            <Popup maxWidth={320}>
              <div>
                {loc.image_url && (
                  <img
                    src={loc.image_url}
                    alt={`${loc.city}, ${loc.country}`}
                    className="popup-image"
                  />
                )}
                <div className="popup-content-wrapper">
                  <div className="popup-city">
                    {loc.city}, {loc.country}
                  </div>
                  {loc.purpose && (
                    <div className="popup-detail">📍 {loc.purpose}</div>
                  )}
                  {loc.notes && <div className="popup-detail">💡 {loc.notes}</div>}
                  {(loc.event_url || loc.video_url) && (
                    <div className="popup-links">
                      {loc.event_url && (
                        <a
                          href={loc.event_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="popup-link"
                        >
                          Event ↗
                        </a>
                      )}
                      {loc.video_url && (
                        <a
                          href={loc.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="popup-link"
                        >
                          Video ↗
                        </a>
                      )}
                    </div>
                  )}

                  {/* Display talks for this location */}
                  {loc.talks && loc.talks.length > 0 && (
                    <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #333" }}>
                      <div style={{ fontSize: "10px", color: "#ff6b35", marginBottom: "6px", fontWeight: "bold" }}>
                        Talks at this location ({loc.talks.length})
                      </div>
                      {loc.talks.map((talk, talkIdx) => (
                        <div key={talkIdx} style={{ marginBottom: "8px" }}>
                          {talk.image_url && (
                            <img
                              src={talk.image_url}
                              alt={talk.title}
                              className="popup-image"
                              style={{ marginBottom: "6px", height: "120px" }}
                            />
                          )}
                          <div style={{ fontSize: "11px", color: "#ff6b35", fontWeight: "bold", marginBottom: "2px" }}>
                            {talk.title}
                          </div>
                          <div style={{ fontSize: "9px", color: "#a0a0a0", marginBottom: "2px" }}>
                            {talk.event_name}
                          </div>
                          {talk.date && (
                            <div style={{ fontSize: "9px", color: "#a0a0a0", marginBottom: "4px" }}>
                              {new Date(talk.date + "T00:00:00").toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          )}
                          {(talk.event_url || talk.video_url) && (
                            <div className="popup-links" style={{ marginTop: "4px", paddingTop: "4px" }}>
                              {talk.event_url && (
                                <a
                                  href={talk.event_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="popup-link"
                                >
                                  Event ↗
                                </a>
                              )}
                              {talk.video_url && (
                                <a
                                  href={talk.video_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="popup-link"
                                >
                                  Video ↗
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
