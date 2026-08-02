"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/lib/tasks";
import { formatPKR } from "@/lib/format";

const LOCATION_COORDS: Record<string, [number, number]> = {
  Karachi: [24.8607, 67.0011],
  Lahore: [31.5204, 74.3587],
  Islamabad: [33.6844, 73.0479],
  Rawalpindi: [33.5651, 73.0169],
  Faisalabad: [31.4504, 73.1350],
  Multan: [30.1575, 71.5249],
  Peshawar: [34.0151, 71.5249],
  Sydney: [-33.8688, 151.2093],
  "Bondi Beach": [-33.8915, 151.2767],
  Randwick: [-33.9161, 151.2422],
};

function getCoords(location: string, index: number): [number, number] {
  if (!location) return [31.5204 + (index * 0.02), 74.3587 + (index * 0.02)];
  for (const [key, coords] of Object.entries(LOCATION_COORDS)) {
    if (location.toLowerCase().includes(key.toLowerCase())) {
      return [coords[0] + (index * 0.008 - 0.004), coords[1] + (index * 0.008 - 0.004)];
    }
  }
  return [31.5204 + ((index % 5) * 0.03 - 0.06), 74.3587 + ((index % 4) * 0.03 - 0.06)];
}

export default function TaskMap({
  tasks,
  selectedTaskId,
  onSelectTask,
}: {
  tasks: Task[];
  selectedTaskId?: string | null;
  onSelectTask?: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    import("leaflet").then((leaflet) => {
      setL(leaflet.default || leaflet);
    });
  }, []);

  useEffect(() => {
    if (!mounted || !L) return;

    const mapElement = document.getElementById("workly-map");
    if (!mapElement) return;

    let map = (mapElement as any)._leaflet_map;
    if (!map) {
      map = L.map("workly-map", {
        zoomControl: false,
      }).setView([-33.8688, 151.2093], 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      (mapElement as any)._leaflet_map = map;
    }

    if ((mapElement as any)._leaflet_markers) {
      (mapElement as any)._leaflet_markers.forEach((m: any) => m.remove());
    }

    const markers: any[] = [];
    const bounds = L.latLngBounds([]);

    tasks.forEach((task, index) => {
      const coords = getCoords(task.location, index);
      bounds.extend(coords);

      const isSelected = task.id === selectedTaskId;

      const markerHtml = `
        <div class="cursor-pointer group flex items-center justify-center">
          <div class="px-2.5 py-1 rounded-full text-xs font-black shadow-md transition-transform duration-200 ${
            isSelected
              ? "bg-slate-900 text-white ring-4 ring-brand scale-110"
              : "bg-brand text-white hover:bg-slate-900 hover:scale-105"
          }">
            <span class="inline-block">W</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-workly-pin",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker(coords, { icon: customIcon }).addTo(map);
      
      const popupContent = `
        <div style="font-family: inherit; padding: 4px;">
          <div style="font-size: 14px; font-weight: 800; color: #0d1e38; margin-bottom: 4px;">${task.title}</div>
          <div style="font-size: 14px; font-weight: 900; color: #0052cc; margin-bottom: 6px;">${formatPKR(task.budget)}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">📍 ${task.location || "Remote"}</div>
          <a href="/tasks/${task.id}" style="display: inline-block; background: #0052cc; color: white; padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 800; text-decoration: none;">View task</a>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on("click", () => {
        if (task.id && onSelectTask) {
          onSelectTask(task.id);
        }
      });

      markers.push(marker);
    });

    (mapElement as any)._leaflet_markers = markers;

    if (tasks.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [mounted, L, tasks, selectedTaskId]);

  if (!mounted) {
    return (
      <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-sm font-semibold">
        Loading Map...
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div id="workly-map" className="h-full w-full z-10" />
      <div className="absolute bottom-2 left-2 z-20 rounded bg-white/80 px-2 py-1 text-[10px] font-bold text-slate-600 backdrop-blur">
        MapLibre | OpenStreetMap
      </div>
    </div>
  );
}
