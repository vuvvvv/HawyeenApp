import { useState, useEffect } from "react";

// ملفات الصفحات
import SettingsPage from "./SettingsPage";
import MapPage from "./MapPage";
import ProfilePage from "./ProfilePage";

export default function PrintView({ onLogout }) {
  const [visible, setVisible] = useState(false);
  const [activeBtn, setActiveBtn] = useState("profile");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const renderPage = () => {
    switch (activeBtn) {
      case "settings":
        return <SettingsPage onLogout={onLogout} />;
      case "map":
        return <MapPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes pageIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .dock-btn {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease, transform 0.15s ease;
          position: relative;
          overflow: hidden;
        }

        .dock-btn:hover {
          background: rgba(212,201,138,0.12);
          transform: translateY(-4px) scale(1.08);
        }

        .dock-btn:active {
          transform: translateY(0) scale(0.95);
        }

        .dock-btn svg {
          width: 24px;
          height: 24px;
          stroke: rgba(212,201,138,0.5);
          transition: stroke 0.2s ease;
        }

        .dock-btn:hover svg {
          stroke: rgba(212,201,138,0.85);
        }

        .dock-btn.active svg {
          stroke: #d4c98a;
        }

        .dock-btn.active::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #d4c98a;
        }

        .tooltip {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          background: rgba(30,28,20,0.9);
          color: #d4c98a;
          font-family: 'Tajawal', sans-serif;
          font-size: 12px;
          font-weight: 500;
          padding: 5px 12px;
          border-radius: 8px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.18s ease;
          border: 1px solid rgba(123,114,71,0.3);
        }

        .dock-btn:hover .tooltip {
          opacity: 1;
        }

        .page-content {
          width: 100%;
          height: 100%;
          animation: pageIn 0.3s ease both;
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "16px",
          gap: 12,
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(123,114,71,0.12) 0%, transparent 70%)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.6s ease",
          animation: visible ? "fadeUp 0.7s ease both" : "none",
          fontFamily: "'Tajawal', sans-serif",
          boxSizing: "border-box",
        }}
        dir="rtl"
      >
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(123,114,71,0.25)",
            borderRadius: 24,
            width: "100%",
            flex: 1,
            minHeight: 0,
            backdropFilter: "blur(16px)",
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)",
            overflow: "hidden",
          }}
        >
          <div
            className="page-content"
            style={{
              display: activeBtn === "profile" ? "block" : "none",
              width: "100%",
              height: "100%",
            }}
          >
            <ProfilePage />
          </div>
          <div
            className="page-content"
            style={{
              display: activeBtn === "map" ? "block" : "none",
              width: "100%",
              height: "100%",
            }}
          >
            <MapPage />
          </div>
          <div
            className="page-content"
            style={{
              display: activeBtn === "settings" ? "block" : "none",
              width: "100%",
              height: "100%",
            }}
          >
            <SettingsPage onLogout={onLogout} />
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(123,114,71,0.3)",
            borderRadius: 999,
            padding: "10px 20px",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            backdropFilter: "blur(12px)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}
        >
          <button
            className={`dock-btn${activeBtn === "settings" ? " active" : ""}`}
            onClick={() => setActiveBtn("settings")}
          >
            <span className="tooltip">الإعدادات</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1.65 1.48V21a2 2 0 0 1-4 0v-.12A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 0 1 3.29 17l.06-.06A1.65 1.65 0 0 0 4 15a1.65 1.65 0 0 0-1.48-1.65H2a2 2 0 0 1 0-4h.12A1.65 1.65 0 0 0 4 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 0 1 6.44 3.29l.06.06A1.65 1.65 0 0 0 8 4a1.65 1.65 0 0 0 1.65-1.48V2a2 2 0 0 1 4 0v.12A1.65 1.65 0 0 0 15 4a1.65 1.65 0 0 0 1.82-.33l.06-.06A2 2 0 0 1 20.71 6.44l-.06.06A1.65 1.65 0 0 0 20 8a1.65 1.65 0 0 0 1.48 1.65H22a2 2 0 0 1 0 4h-.12A1.65 1.65 0 0 0 19.4 15z" />
            </svg>
          </button>

          <div
            style={{
              width: 1,
              height: 28,
              background: "rgba(123,114,71,0.35)",
              margin: "0 4px",
            }}
          />

          <button
            className={`dock-btn${activeBtn === "map" ? " active" : ""}`}
            onClick={() => setActiveBtn("map")}
          >
            <span className="tooltip">الخريطة</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
          </button>

          <div
            style={{
              width: 1,
              height: 28,
              background: "rgba(123,114,71,0.35)",
              margin: "0 4px",
            }}
          />

          <button
            className={`dock-btn${activeBtn === "profile" ? " active" : ""}`}
            onClick={() => setActiveBtn("profile")}
          >
            <span className="tooltip">الملف الشخصي</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
