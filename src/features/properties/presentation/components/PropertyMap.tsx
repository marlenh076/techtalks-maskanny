"use client";

import { useEffect, useState } from "react";
import { divIcon, type Marker as LeafletMarker } from "leaflet";
import { MapContainer, Marker, TileLayer, ZoomControl, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Coordinates } from "./property-location";
export type { Coordinates } from "./property-location";
import "./property-map.css";

const markerIcon = divIcon({
  className: "property-location-marker",
  html: '<span aria-hidden="true"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function MapSelection({
  position,
  disabled,
  onSelect,
}: {
  position: Coordinates | null;
  disabled: boolean;
  onSelect: (point: Coordinates) => void;
}) {
  const map = useMap();
  useMapEvents({
    keydown(event) {
      if (
        disabled ||
        event.originalEvent.key !== "Enter" ||
        event.originalEvent.target !== map.getContainer()
      )
        return;
      event.originalEvent.preventDefault();
      const point = map.getCenter().wrap();
      onSelect({ latitude: point.lat, longitude: point.lng });
    },
    click(event) {
      if (!disabled) {
        const point = event.latlng.wrap();
        onSelect({ latitude: point.lat, longitude: point.lng });
      }
    },
  });
  useEffect(() => {
    const container = map.getContainer();
    container.setAttribute("role", "region");
    container.setAttribute("aria-label", "Property location map");
    container.setAttribute("aria-describedby", "location-instructions location-keyboard-help");
  }, [map]);
  useEffect(() => {
    if (position) map.setView([position.latitude, position.longitude], Math.max(map.getZoom(), 15));
  }, [map, position]);

  return position ? (
    <Marker
      position={[position.latitude, position.longitude]}
      icon={markerIcon}
      draggable={!disabled}
      title="Selected property location"
      alt="Selected property location"
      eventHandlers={{
        dragend(event) {
          if (disabled) return;
          const point = (event.target as LeafletMarker).getLatLng().wrap();
          onSelect({ latitude: point.lat, longitude: point.lng });
        },
      }}
    />
  ) : null;
}

function MapPreview({ position, interactive }: { position: Coordinates; interactive: boolean }) {
  const map = useMap();
  useEffect(() => {
    map.setView([position.latitude, position.longitude], 15, { animate: false });
  }, [map, position.latitude, position.longitude]);
  useEffect(() => {
    const container = map.getContainer();
    container.setAttribute("role", "region");
    container.setAttribute("aria-label", "Property location map");
    container.setAttribute("aria-describedby", "property-map-help");
    container.style.touchAction = interactive ? "none" : "pan-y";
    for (const handler of [
      map.dragging,
      map.touchZoom,
      map.doubleClickZoom,
      map.keyboard,
      map.boxZoom,
    ]) {
      if (interactive) handler.enable();
      else handler.disable();
    }
  }, [map, interactive]);
  return (
    <Marker
      position={[position.latitude, position.longitude]}
      icon={markerIcon}
      title="Saved property location"
      alt="Saved property location"
      keyboard={false}
      interactive={false}
    />
  );
}

type PropertyMapProps =
  | {
      position: Coordinates | null;
      disabled: boolean;
      onSelect: (point: Coordinates) => void;
      readOnly?: false;
    }
  | { position: Coordinates; readOnly: true; interactive: boolean };

export default function PropertyMap(props: PropertyMapProps) {
  const { position } = props;
  const interactive = !props.readOnly || props.interactive;
  const [tileError, setTileError] = useState(false);
  return (
    <div>
      <MapContainer
        // Initial viewport only. Never used as the submitted property location.
        center={position ? [position.latitude, position.longitude] : [33.8938, 35.5018]}
        zoom={position ? 15 : 12}
        minZoom={2}
        maxZoom={19}
        scrollWheelZoom={false}
        zoomControl={false}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        keyboard={interactive}
        className="property-location-map"
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          eventHandlers={{ tileerror: () => setTileError(true) }}
        />
        {interactive && <ZoomControl position="topleft" />}
        {props.readOnly ? (
          <MapPreview position={props.position} interactive={props.interactive} />
        ) : (
          <MapSelection position={position} disabled={props.disabled} onSelect={props.onSelect} />
        )}
      </MapContainer>
      {tileError && (
        <p role="status" className="mt-2 text-sm text-(--danger)">
          {props.readOnly
            ? "Map tiles could not load. You can still open directions to the saved location."
            : "Map tiles could not load. Check your connection; you can still use your current location."}
        </p>
      )}
    </div>
  );
}
