"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import "./restaurant-map.css";
import { PIN, gridToRects } from "@/lib/pixel/art";
import { DEFAULT_CENTER } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type MapPin = {
  slug: string;
  name: string;
  city: string;
  lng: number;
  lat: number;
};

/** Above this many places, nearby pins are grouped into numbered clusters. */
const CLUSTER_ABOVE = 12;

const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

function pinElement(label: string) {
  const NS = "http://www.w3.org/2000/svg";
  const size = 4;
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("width", String(PIN[0]!.length * size));
  svg.setAttribute("height", String(PIN.length * size));
  svg.setAttribute("viewBox", `0 0 ${PIN[0]!.length} ${PIN.length}`);
  svg.setAttribute("shape-rendering", "crispEdges");
  for (const r of gridToRects(PIN)) {
    const rect = document.createElementNS(NS, "rect");
    rect.setAttribute("x", String(r.x));
    rect.setAttribute("y", String(r.y));
    rect.setAttribute("width", String(r.w));
    rect.setAttribute("height", "1");
    rect.setAttribute("fill", r.fill);
    svg.appendChild(rect);
  }
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.style.cssText =
    "background:none;border:0;padding:0;cursor:pointer;display:block;";
  button.appendChild(svg);
  return button;
}

function popupContent(pin: MapPin) {
  const body = document.createElement("div");
  body.className = "rp-body";
  const head = document.createElement("div");
  head.className = "rp-head";
  head.appendChild(pinElement(pin.name).firstElementChild!.cloneNode(true));
  const text = document.createElement("div");
  const name = document.createElement("div");
  name.className = "rp-name";
  name.textContent = pin.name;
  const city = document.createElement("div");
  city.className = "rp-city";
  city.textContent = pin.city;
  text.append(name, city);
  head.appendChild(text);
  const rule = document.createElement("div");
  rule.className = "rp-rule";
  const link = document.createElement("a");
  link.className = "rp-go";
  link.href = `/restaurants/${pin.slug}`;
  const label = document.createElement("span");
  label.textContent = "View details";
  const arrow = document.createElement("span");
  arrow.textContent = "▶";
  arrow.setAttribute("aria-hidden", "true");
  link.append(label, arrow);
  body.append(head, rule, link);
  return body;
}

/** MapLibre + OpenFreeMap map. Markers and popups are built via the DOM (no HTML strings) to stay XSS-safe. */
export default function RestaurantMap({
  pins,
  userLocation,
  zoom = 13,
  className,
  label = "Restaurant map",
}: {
  pins: MapPin[];
  userLocation?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  label?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = container.current;
    if (!node) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const maplibre = await import("maplibre-gl");
        if (cancelled) return;
        const first = pins[0];
        const center: [number, number] = userLocation
          ? [userLocation.lng, userLocation.lat]
          : first
            ? [first.lng, first.lat]
            : DEFAULT_CENTER;
        const map = new maplibre.Map({
          container: node,
          style: STYLE_URL,
          center,
          zoom,
          attributionControl: { compact: true },
        });
        map.addControl(
          new maplibre.NavigationControl({ showCompass: false }),
          "top-right",
        );
        let loaded = false;
        map.on("load", () => {
          loaded = true;
        });
        // Failed to load the map style (offline / blocked): show a message, not an empty box.
        map.on("error", () => {
          if (!loaded) setFailed(true);
        });

        const bounds = new maplibre.LngLatBounds();
        for (const pin of pins) bounds.extend([pin.lng, pin.lat]);
        const bySlug = new Map(pins.map((x) => [x.slug, x]));

        if (pins.length > CLUSTER_ABOVE) {
          // Many places: group nearby ones into numbered bubbles that split as you zoom in.
          map.on("load", () => {
            // Reuse a font the basemap style already ships (bold if there is one), so labels always render.
            const fonts = (map.getStyle().layers ?? [])
              .map((l) => (l.type === "symbol" ? l.layout?.["text-font"] : undefined))
              .filter((f): f is string[] => Array.isArray(f) && f.every((x) => typeof x === "string"));
            const countFont = fonts.find((f) => /bold/i.test(f.join(" "))) ?? fonts[0] ?? ["Noto Sans Bold"];
            map.addSource("pins", {
              type: "geojson",
              cluster: true,
              clusterRadius: 52,
              clusterMaxZoom: 15,
              data: {
                type: "FeatureCollection",
                features: pins.map((x) => ({
                  type: "Feature",
                  properties: { slug: x.slug },
                  geometry: { type: "Point", coordinates: [x.lng, x.lat] },
                })),
              },
            });
            map.addLayer({
              id: "pin-clusters",
              type: "circle",
              source: "pins",
              filter: ["has", "point_count"],
              paint: {
                "circle-color": [
                  "step",
                  ["get", "point_count"],
                  "#ff8fb3",
                  10,
                  "#ff4f8b",
                  40,
                  "#d81b60",
                ],
                "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 40, 32],
                "circle-stroke-width": 3,
                "circle-stroke-color": "#2a1b3d",
              },
            });
            map.addLayer({
              id: "pin-count",
              type: "symbol",
              source: "pins",
              filter: ["has", "point_count"],
              layout: {
                "text-field": ["get", "point_count_abbreviated"],
                "text-font": countFont,
                "text-size": 14,
                "text-allow-overlap": true,
              },
              paint: { "text-color": "#ffffff", "text-halo-color": "#2a1b3d", "text-halo-width": 1.5 },
            });
            map.addLayer({
              id: "pin-points",
              type: "circle",
              source: "pins",
              filter: ["!", ["has", "point_count"]],
              paint: {
                "circle-color": "#ff3b7f",
                "circle-radius": 8,
                "circle-stroke-width": 3,
                "circle-stroke-color": "#2a1b3d",
              },
            });
            const src = () => map.getSource("pins") as import("maplibre-gl").GeoJSONSource;
            map.on("click", "pin-clusters", async (e) => {
              const f = e.features?.[0];
              if (!f) return;
              const zoomTo = await src().getClusterExpansionZoom(
                f.properties.cluster_id as number,
              );
              map.easeTo({
                center: (f.geometry as GeoJSON.Point).coordinates as [number, number],
                zoom: zoomTo + 0.5,
              });
            });
            map.on("click", "pin-points", (e) => {
              const f = e.features?.[0];
              const pin = f ? bySlug.get(f.properties.slug as string) : undefined;
              if (!pin) return;
              new maplibre.Popup({ offset: 14, focusAfterOpen: false, className: "restoo-popup", maxWidth: "260px" })
                .setLngLat([pin.lng, pin.lat])
                .setDOMContent(popupContent(pin))
                .addTo(map);
            });
            for (const id of ["pin-clusters", "pin-points"]) {
              map.on("mouseenter", id, () => (map.getCanvas().style.cursor = "pointer"));
              map.on("mouseleave", id, () => (map.getCanvas().style.cursor = ""));
            }
          });
        } else {
          for (const pin of pins) {
            const el = pinElement(`Open ${pin.name}`);
            new maplibre.Marker({ element: el, anchor: "bottom" })
              .setLngLat([pin.lng, pin.lat])
              .setPopup(new maplibre.Popup({ offset: 50, focusAfterOpen: false, className: "restoo-popup", maxWidth: "260px" }).setDOMContent(popupContent(pin)))
              .addTo(map);
          }
        }
        if (userLocation) {
          const dot = document.createElement("div");
          dot.style.cssText =
            "width:16px;height:16px;background:#7cc8f2;border:4px solid #2a1b3d;box-shadow:2px 2px 0 #2a1b3d";
          dot.setAttribute("aria-label", "Your location");
          new maplibre.Marker({ element: dot }).setLngLat(center).addTo(map);
          bounds.extend(center);
        }
        if (pins.length > 1 || (pins.length === 1 && userLocation)) {
          map.fitBounds(bounds, { padding: 48, maxZoom: 16, duration: 0 });
        }
        // Re-measure whenever the box changes size (view toggle, hidden-then-shown route, rotation).
        const ro = new ResizeObserver(() => map.resize());
        ro.observe(node);
        requestAnimationFrame(() => map.resize());
        cleanup = () => {
          ro.disconnect();
          map.remove();
        };
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [pins, userLocation, zoom]);

  return (
    <div
      className={cn(
        "px-box relative overflow-hidden [--px-bg:var(--color-langit-100)]",
        className,
      )}
      data-no-rv
    >
      {/* MapLibre's CSS forces position:relative on its container, which would beat Tailwind's
          layered absolute/inset utilities and collapse the map to 0 height. So the sized wrapper
          is separate, and the map container just fills it with inline styles. */}
      <div className="absolute inset-0">
        <div
          ref={container}
          role="region"
          aria-label={label}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      {failed ? (
        <p
          role="status"
          className="bg-kartu text-krem border-terong-900 absolute inset-x-4 top-4 z-10 border-4 p-3 text-sm"
        >
          The map couldn&apos;t load (you may be offline). The restaurant list still
          works.
          {pins[0] ? (
            <>
              {" "}
              <a
                className="inline-block py-3 underline"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.openstreetmap.org/?mlat=${pins[0].lat}&mlon=${pins[0].lng}#map=16/${pins[0].lat}/${pins[0].lng}`}
              >
                Open in OpenStreetMap
              </a>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
