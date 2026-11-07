import {
  MapContainer,
  Marker,
  TileLayer,
  Popup,
  Polyline,
  useMap
} from "react-leaflet";

import "../index.css";
import L from "leaflet";
import type { RouteOption } from "../types/route";
import type { Place } from "../types/place";
import { useEffect } from "react";

const redIcon = L.divIcon({
  className: "custom-red-marker",
  html: `<div class="marker-pin"><div class="marker-core"></div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
});

interface MapProps {
  places: Place[];
  route: RouteOption[];
  selectedPlace: Place | null;
}

function MapAutoFit({ route }: { route: RouteOption[] }) {
  const map = useMap();

  useEffect(() => {
    if (!route.length || !route[0].geometry.length) return;

    const coordinates = route[0].geometry.map(
      (point) => L.latLng(point.latitude, point.longitude)
    );

    const bounds = L.latLngBounds(coordinates);

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [80, 80],
        maxZoom: 15,
        animate: true,
      });
    }
  }, [route, map]);

  return null;
}


function Mapview({ places, route, selectedPlace }: MapProps) {
  const pune: [number, number] = [18.5204, 73.8567];

  return (
    <MapContainer
      center={pune}
      zoom={13}
      style={{ height: "600px", width: "100%" }}
      className="map"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapAutoFit route={route} />

      {/* Nearby place markers */}
      {places.map((place) => (
        <Marker
          key={place.id}
          icon={redIcon}
          position={[place.latitude, place.longitude]}
        >
          <Popup>
            <strong>{place.name}</strong>
            <br />
            {place.category} · {place.city}
            <br />

            ⭐ {place.reviewCount > 0
              ? place.averageRating.toFixed(1)
              : "New"} ({place.reviewCount} reviews)

            <br />

            {place.distance !== null
              ? `${place.distance.toFixed(2)} km away`
              : "Distance unavailable"}
          </Popup>
        </Marker>
      ))}

      {/* Selected destination marker */}
      {selectedPlace && (
        <Marker
          position={[
            selectedPlace.latitude,
            selectedPlace.longitude,
          ]}
        >
          <Popup>
            Destination: {selectedPlace.name}
          </Popup>
        </Marker>
      )}

      {/* Draw route */}
      {route.map((item, index) => (
        <Polyline
          key={index}
          positions={item.geometry.map((point) => [
            point.latitude,
            point.longitude,
          ])}
          pathOptions={{
            color: index === 0 ? "#e63946" : "#64748b",
            weight: index === 0 ? 6 : 4,
          }}
        />
      ))}
    </MapContainer>
  );
}

export default Mapview;