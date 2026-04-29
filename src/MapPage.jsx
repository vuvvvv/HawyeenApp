"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import BOY_SVG_URL from "./assets/boy.svg";
import GIRL_SVG_URL from "./assets/girl.svg";

const HOBBY_LABELS = {
  reading: "قراءة",
  sports: "رياضة",
  drawing: "رسم",
  music: "موسيقى",
  gaming: "ألعاب فيديو",
  cooking: "طبخ",
  travel: "سفر",
  photography: "تصوير",
  swimming: "سباحة",
  football: "كرة قدم",
};
function hobbyLabel(h) {
  return HOBBY_LABELS[h] ?? h;
}

function getAvatarUrl(gender) {
  if (gender === "female") return GIRL_SVG_URL;
  if (gender === "male") return BOY_SVG_URL;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="40" r="38" fill="#e8dfc8" stroke="#8a7a5a" stroke-width="2"/><circle cx="40" cy="32" r="14" fill="#b8a890"/><ellipse cx="40" cy="68" rx="20" ry="14" fill="#9a8e78"/></svg>`)}`;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcTrendByName(users, field, value, topN) {
  const filtered = users.filter((u) => u.location[field] === value);
  const count = {};
  filtered.forEach((u) =>
    u.profile.hobbies.forEach((h) => {
      count[h] = (count[h] ?? 0) + 1;
    }),
  );
  return Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);
}

function getZoomLevel(zoom) {
  if (zoom >= 15) return "neighborhood";
  return "city";
}

const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#f6f4ef" }] },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#9ac7d0" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: "#e8c170" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }],
  },
  { elementType: "labels.text.fill", stylers: [{ color: "#574F1E" }] },
  { elementType: "labels.text.stroke", stylers: [{ visibility: "off" }] },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#cbe86b" }],
  },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#e8e4d9" }],
  },
];

const MOCK_USERS = [
  {
    id: "1",
    profile: {
      name: "خالد",
      gender: "male",
      hobbies: ["reading", "sports", "drawing"],
    },
    location: {
      latitude: 24.4686,
      longitude: 39.6142,
      city: "المدينة المنورة",
      district: "العزيزية",
    },
  },
  {
    id: "2",
    profile: { name: "هيا", gender: "female", hobbies: ["reading", "music"] },
    location: {
      latitude: 24.47,
      longitude: 39.611,
      city: "المدينة المنورة",
      district: "العزيزية",
    },
  },
  {
    id: "3",
    profile: {
      name: "اريج",
      gender: "female",
      hobbies: ["reading", "cooking"],
    },
    location: {
      latitude: 24.4672,
      longitude: 39.6155,
      city: "المدينة المنورة",
      district: "العزيزية",
    },
  },
  {
    id: "4",
    profile: {
      name: "احمد",
      gender: "male",
      hobbies: ["swimming", "football", "reading"],
    },
    location: {
      latitude: 24.466,
      longitude: 39.617,
      city: "المدينة المنورة",
      district: "قربان",
    },
  },
  {
    id: "5",
    profile: {
      name: "ساره",
      gender: "female",
      hobbies: ["photography", "travel"],
    },
    location: {
      latitude: 24.4655,
      longitude: 39.6148,
      city: "المدينة المنورة",
      district: "قربان",
    },
  },
  {
    id: "6",
    profile: {
      name: "تهاني",
      gender: "female",
      hobbies: ["reading", "drawing"],
    },
    location: {
      latitude: 24.4645,
      longitude: 39.613,
      city: "المدينة المنورة",
      district: "قربان",
    },
  },
  {
    id: "7",
    profile: {
      name: "عبد الرحمن",
      gender: "male",
      hobbies: ["gaming", "sports"],
    },
    location: {
      latitude: 24.463,
      longitude: 39.612,
      city: "المدينة المنورة",
      district: "السلام",
    },
  },
  {
    id: "8",
    profile: {
      name: "صالح",
      gender: "male",
      hobbies: ["football", "swimming"],
    },
    location: {
      latitude: 24.462,
      longitude: 39.6138,
      city: "المدينة المنورة",
      district: "السلام",
    },
  },
  {
    id: "9",
    profile: {
      name: "ريم",
      gender: "female",
      hobbies: ["cooking", "travel", "photography"],
    },
    location: {
      latitude: 24.0925,
      longitude: 38.0628,
      city: "ينبع",
      district: "المركز",
    },
  },
  {
    id: "10",
    profile: {
      name: "فيصل",
      gender: "male",
      hobbies: ["gaming", "music", "drawing"],
    },
    location: {
      latitude: 24.0951,
      longitude: 38.0672,
      city: "ينبع",
      district: "المركز",
    },
  },
  {
    id: "11",
    profile: {
      name: "نوره",
      gender: "female",
      hobbies: ["travel", "photography"],
    },
    location: {
      latitude: 24.0889,
      longitude: 38.0585,
      city: "ينبع",
      district: "الورود",
    },
  },
  {
    id: "12",
    profile: {
      name: "محمد",
      gender: "male",
      hobbies: ["football", "sports", "gaming"],
    },
    location: {
      latitude: 24.1012,
      longitude: 38.071,
      city: "ينبع",
      district: "الورود",
    },
  },
];
function Toast({ message, type = "error", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [onClose]);

  const color = type === "warn" ? "#EF9F27" : "#E24B4A";
  const icon =
    type === "warn" ? (
      <path
        d="M12 2L2 20h20L12 2z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    ) : (
      <>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
        <path
          d="M12 8v4M12 16h.01"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    );

  return (
    <div
      style={{
        position: "fixed",
        bottom: "5vh",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "#1a1a1a",
        color: "#fff",
        padding: "12px 18px",
        borderRadius: "14px",
        fontSize: "clamp(13px, 3.5vw, 15px)",
        direction: "rtl",
        width: "clamp(200px, 80vw, 320px)",
        borderRight: `4px solid ${color}`,
        animation: "slideUpToast 0.25s ease",
        fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        style={{ flexShrink: 0 }}
      >
        {icon}
      </svg>
      <span>{message}</span>
      <style>{`
        @keyframes slideUpToast {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
function TrendBox({
  cityTrend,
  districtTrend,
  currentCity,
  currentDistrict,
  zoomLevel,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const isNeighborhood = zoomLevel === "neighborhood";
  const trend = isNeighborhood ? districtTrend : cityTrend;
  const label = isNeighborhood
    ? `ترند ${currentDistrict || "الحي"} `
    : `ترند ${currentCity || "المدينة"} `;

  const accentColor = isNeighborhood
    ? "rgba(212,201,138,1)"
    : "rgba(212,201,138,0.6)";
  const accentColorDim = isNeighborhood
    ? "rgba(212,201,138,0.55)"
    : "rgba(212,201,138,0.3)";
  const borderColor = isNeighborhood
    ? "rgba(212,201,138,0.25)"
    : "rgba(212,201,138,0.12)";
  const glowColor = isNeighborhood
    ? "rgba(212,201,138,0.35)"
    : "rgba(212,201,138,0.15)";

  if (trend.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        background: "rgba(10,9,6,0.82)",
        backdropFilter: "blur(14px)",
        borderRadius: 16,
        padding: collapsed ? "10px 14px" : "12px 16px",
        color: "rgba(212,201,138,0.85)",

        width: "min(210px, calc(100vw - 32px))",
        boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${borderColor}`,
        zIndex: 10,
        direction: "rtl",
        transition: "all 0.3s ease",

        maxHeight: collapsed ? 48 : "calc(50vh - 24px)",
        overflow: "hidden",
        fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          userSelect: "none",
          fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
        }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: accentColor,
            boxShadow: `0 0 8px ${glowColor}`,
            flexShrink: 0,
            fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
          }}
        />
        <p
          style={{
            margin: 0,
            fontWeight: 700,

            fontSize: "clamp(11px, 3vw, 11px)",
            color: accentColor,
            letterSpacing: "0.02em",
            flex: 1,
            fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
          }}
        >
          {label}
        </p>
        {!collapsed && (
          <span
            style={{
              fontSize: 10,
              color: accentColorDim,
              fontWeight: 400,
              fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
            }}
          >
            {trend.reduce((s, [, c]) => s + c, 0)} تفاعل
          </span>
        )}

        <span
          style={{
            color: accentColorDim,
            fontSize: 14,
            lineHeight: 1,
            marginRight: 2,
            transition: "transform 0.3s",
            transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
            display: "inline-block",
            fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
          }}
        >
          ▾
        </span>
      </div>

      {!collapsed && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginTop: 10,

            overflowY: "auto",
            maxHeight: "calc(50vh - 80px)",
            fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
          }}
        >
          {trend.map(([hobby, count], i) => {
            const maxCount = trend[0][1];
            const pct = Math.round((count / maxCount) * 100);
            const barOpacity = i === 0 ? 1 : Math.max(0.35, 1 - i * 0.1);
            return (
              <div key={hobby}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 3,

                    fontSize: "clamp(10px, 2.8vw, 12px)",
                    fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
                  }}
                >
                  <span style={{ color: `rgba(212,201,138,${barOpacity})` }}>
                    {hobbyLabel(hobby)}
                  </span>
                  <span
                    style={{
                      color: "rgba(212,201,138,0.35)",
                      fontSize: "clamp(9px, 2.5vw, 11px)",
                      fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
                    }}
                  >
                    {count}
                  </span>
                </div>
                <div
                  style={{
                    height: 3,
                    background: "rgba(212,201,138,0.08)",
                    borderRadius: 4,
                    overflow: "hidden",
                    fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: `rgba(212,201,138,${barOpacity * (isNeighborhood ? 0.7 : 0.45)})`,
                      borderRadius: 4,
                      transition: "width 0.5s ease",
                      fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PopupCard({ user, onClose }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 100,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(10,9,6,0.94)",
        backdropFilter: "blur(16px)",
        borderRadius: 20,
        padding: "16px 20px",
        color: "rgba(212,201,138,0.9)",
        fontFamily: "'Tajawal', sans-serif",
        width: "min(280px, calc(100vw - 32px))",
        boxShadow:
          "0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,201,138,0.15)",
        zIndex: 20,
        direction: "rtl",
        display: "flex",
        gap: 14,
        alignItems: "center",
        fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
      }}
    >
      <img
        src={getAvatarUrl(user.profile.gender)}
        alt="avatar"
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          border: "2px solid rgba(212,201,138,0.35)",
          objectFit: "cover",
          fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
        }}
      />
      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: 17,
            color: "rgba(212,201,138,1)",
            fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
          }}
        >
          {user.profile.name ?? "مجهول"}
        </p>
        {user.profile.hobbies.length > 0 && (
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}
          >
            {user.profile.hobbies.map((h) => (
              <span
                key={h}
                style={{
                  background: "rgba(212,201,138,0.1)",
                  color: "rgba(212,201,138,0.75)",
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 8,
                  border: "1px solid rgba(212,201,138,0.2)",
                  fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
                }}
              >
                {hobbyLabel(h)}
              </span>
            ))}
          </div>
        )}
        {user.profile.gender && (
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 11,
              color: "rgba(212,201,138,0.35)",
              fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
            }}
          >
            {user.profile.gender === "male"
              ? "ذكر"
              : user.profile.gender === "female"
                ? "أنثى"
                : "غير محدد"}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "rgba(212,201,138,0.4)",
          fontSize: 22,
          cursor: "pointer",
          padding: 4,
          alignSelf: "flex-start",
          lineHeight: 1,
          fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
        }}
      >
        ×
      </button>
    </div>
  );
}

const GOOGLE_MAPS_API_KEY = "AIzaSyCnzKY1hAi47gKsImk0pJ2Bulc18qWoTbc";
const API = import.meta.env.VITE_API_URL;
let cachedUsers = null;
export function clearMapCache() {
  cachedUsers = null;
}

function parseLocation(locationStr) {
  if (!locationStr) return { city: "", district: "" };
  const parts = locationStr.split(" - ").map((s) => s.trim());
  return { city: parts[1] ?? "", district: parts[2] ?? "" };
}

async function loadUsers() {
  if (cachedUsers) return cachedUsers;
  try {
    const res = await fetch(`${API}/users/with-location`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error();
    const raw = await res.json();
    cachedUsers = raw.map((u) => ({
      ...u,
      location: { ...u.location, ...parseLocation(u.location?.location) },
    }));
    return cachedUsers;
  } catch {
    cachedUsers = MOCK_USERS;
    return cachedUsers;
  }
}

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [mapReady, setMapReady] = useState(false);

  const [users, setUsers] = useState(MOCK_USERS);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const isLocatingRef = useRef(false);
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "error") => setToast({ message, type });

  const [trendData, setTrendData] = useState({
    cityTrend: [],
    districtTrend: [],
    currentCity: "",
    currentDistrict: "",
    zoomLevel: "city",
  });

  useEffect(() => {
    loadUsers().then((data) => {
      setUsers(data);
      setUsersLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const safeInit = () => {
      if (mapInstanceRef.current) return;
      initMap();
    };

    if (window.google?.maps) {
      safeInit();
      return;
    }

    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      window.initMap = safeInit;
      return;
    }

    window.initMap = safeInit;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap&loading=async`;
    script.async = true;
    document.head.appendChild(script);

    return () => {
      if (!mapInstanceRef.current) {
        window.initMap = () => {};
      }
    };
  }, []);

  function initMap() {
    if (mapInstanceRef.current) return;
    if (!mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 24.4686, lng: 40.6142 },
      zoom: 6,
      disableDefaultUI: true,
      styles: MAP_STYLES,
      gestureHandling: "greedy",
      clickableIcons: false,
      keyboardShortcuts: false,
    });

    mapInstanceRef.current = map;

    map.addListener("idle", () => {
      updateTrendFromMap(map);
    });

    setMapReady(true);
  }

  const usersRef = useRef(users);
  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  const updateTrendFromMap = useCallback((mapInstance) => {
    if (!mapInstance) return;
    if (isLocatingRef.current) return;
    const currentUsers = usersRef.current;
    const center = mapInstance.getCenter();
    const zoom = mapInstance.getZoom();
    const zoomLevel = getZoomLevel(zoom);

    let closestUser = null;
    let minDist = Infinity;
    currentUsers.forEach((u) => {
      const d = haversineKm(
        center.lat(),
        center.lng(),
        u.location.latitude,
        u.location.longitude,
      );
      if (d < minDist) {
        minDist = d;
        closestUser = u;
      }
    });

    const currentCity = closestUser?.location.city ?? "";
    const currentDistrict = closestUser?.location.district ?? "";
    const cityTrend = calcTrendByName(currentUsers, "city", currentCity, 10);
    const districtTrend = calcTrendByName(
      currentUsers,
      "district",
      currentDistrict,
      5,
    );

    setTrendData({
      cityTrend,
      districtTrend,
      currentCity,
      currentDistrict,
      zoomLevel,
    });
  }, []);

  useEffect(() => {
    if (mapReady && usersLoaded && mapInstanceRef.current) {
      updateTrendFromMap(mapInstanceRef.current);
    }
  }, [usersLoaded, mapReady, updateTrendFromMap]);

  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;

    markersRef.current.forEach((m) =>
      m.setMap ? m.setMap(null) : (m.map = null),
    );
    markersRef.current = [];

    users.forEach((user) => {
      const { latitude, longitude } = user.location;
      if (latitude == null || longitude == null) return;

      const container = document.createElement("div");
      container.style.cssText = `display:flex;flex-direction:column;align-items:center;cursor:pointer;filter:drop-shadow(0 3px 10px rgba(0,0,0,0.4));transition:transform 0.15s ease;`;
      container.onmouseenter = () =>
        (container.style.transform = "scale(1.12)");
      container.onmouseleave = () => (container.style.transform = "scale(1)");

      if (user.profile.hobbies.length > 0) {
        const hobbyDiv = document.createElement("div");
        hobbyDiv.style.cssText = `background:rgba(10,9,6,0.85);color:rgba(212,201,138,0.85);font-family:'Tajawal',sans-serif;font-size:10px;padding:2px 8px;border-radius:8px;margin-bottom:2px;white-space:nowrap;direction:rtl;border:1px solid rgba(212,201,138,0.18);`;
        hobbyDiv.textContent = user.profile.hobbies
          .slice(0, 2)
          .map(hobbyLabel)
          .join(" • ");
        container.appendChild(hobbyDiv);
      }

      const nameDiv = document.createElement("div");
      nameDiv.style.cssText = `background:rgba(10,9,6,0.9);color:rgba(212,201,138,0.95);font-family:'Tajawal',sans-serif;font-size:12px;font-weight:700;padding:3px 10px;border-radius:10px;margin-bottom:4px;white-space:nowrap;direction:rtl;border:1px solid rgba(212,201,138,0.12);`;
      nameDiv.textContent = user.profile.name ?? "مجهول";
      container.appendChild(nameDiv);

      const img = document.createElement("img");
      img.src = getAvatarUrl(user.profile.gender);
      img.style.cssText = `width:52px;height:52px;border-radius:50%;border:2.5px solid rgba(212,201,138,0.45);object-fit:cover;background:#1a180e;`;
      container.appendChild(img);
      container.onclick = () => setSelectedUser(user);

      const marker = new window.google.maps.Marker({
        map: mapInstanceRef.current,
        position: { lat: latitude, lng: longitude },
        icon: {
          url: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
          scaledSize: new window.google.maps.Size(1, 1),
        },
        title: user.profile.name ?? "",
      });

      const overlay = new window.google.maps.OverlayView();
      overlay.onAdd = function () {
        this.getPanes().overlayMouseTarget.appendChild(container);
      };
      overlay.draw = function () {
        const proj = this.getProjection();
        const pos = proj.fromLatLngToDivPixel(
          new window.google.maps.LatLng(latitude, longitude),
        );
        if (pos) {
          container.style.position = "absolute";
          container.style.left = `${pos.x - 26}px`;
          container.style.top = `${pos.y - 80}px`;
        }
      };
      overlay.onRemove = function () {
        container.parentNode?.removeChild(container);
      };
      overlay.setMap(mapInstanceRef.current);
      markersRef.current.push(overlay);
      marker.setMap(null);
    });
  }, [users, mapReady]);

  const [locating, setLocating] = useState(false);
  const handleLocate = () => {
    if (!navigator.geolocation) {
      showToast("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    setLocating(true);
    isLocatingRef.current = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapInstanceRef.current?.panTo({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });

        mapInstanceRef.current?.setZoom(16);

        setTimeout(() => {
          isLocatingRef.current = false;
        }, 800);

        setLocating(false);
      },
      (err) => {
        setLocating(false);
        isLocatingRef.current = false;
        showToast("فشل في تحديد الموقع");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleZoomIn = () =>
    mapInstanceRef.current?.setZoom(
      (mapInstanceRef.current.getZoom() ?? 12) + 1,
    );
  const handleZoomOut = () =>
    mapInstanceRef.current?.setZoom(
      (mapInstanceRef.current.getZoom() ?? 12) - 1,
    );

  const btnStyle = {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "rgba(10,9,6,0.88)",
    border: "1px solid rgba(212,201,138,0.2)",
    color: "rgba(212,201,138,0.8)",
    fontSize: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
    transition: "background 0.15s ease",
    fontFamily: "'Tajawal', sans-serif",
    fontWeight: 700,
    fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

      {!mapReady && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#f6f4ef",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Tajawal', sans-serif",
            color: "rgba(87,79,30,0.7)",
            fontSize: 15,
            gap: 10,
            fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              border: "2px solid rgba(212,201,138,0.3)",
              borderTop: "2px solid rgba(212,201,138,0.9)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
            }}
          />
          جاري تحميل الخريطة...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      <TrendBox
        cityTrend={trendData.cityTrend}
        districtTrend={trendData.districtTrend}
        currentCity={trendData.currentCity}
        currentDistrict={trendData.currentDistrict}
        zoomLevel={trendData.zoomLevel}
      />

      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 10,
          fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
        }}
      >
        <button
          onClick={handleLocate}
          title="موقعي"
          style={{ ...btnStyle, opacity: locating ? 0.6 : 1 }}
          disabled={locating}
        >
          {locating ? (
            <div
              style={{
                width: 18,
                height: 18,
                border: "2px solid rgba(212,201,138,0.2)",
                borderTop: "2px solid rgba(212,201,138,0.85)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
              }}
            />
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              width="20"
              height="20"
              stroke="rgba(212,201,138,0.85)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
          )}
        </button>
        <button onClick={handleZoomIn} title="تكبير" style={btnStyle}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            width="18"
            height="18"
            stroke="rgba(212,201,138,0.85)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button onClick={handleZoomOut} title="تصغير" style={btnStyle}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            width="18"
            height="18"
            stroke="rgba(212,201,138,0.85)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {selectedUser && (
        <PopupCard user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
