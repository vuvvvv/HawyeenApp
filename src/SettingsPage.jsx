export default function SettingsPage({ onLogout }) {
  const menuItems = [
    { icon: "🔔", label: "التنبيهات", hasToggle: true },
    { icon: "🌐", label: "اختيار اللغة" },
    { icon: "🗺️", label: "تخصيص الخريطة" },
    { icon: "🎨", label: "تخصيص الألوان" },
    { icon: "👤", label: "تخصيص الملف الشخصي" },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "clamp(20px, 5vw, 40px) clamp(16px, 4vw, 20px)",
        boxSizing: "border-box",
        color: "#d4c98a",
        fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
      }}
    >
      
      <p
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "rgba(212,201,138,0.55)",
          letterSpacing: "0.12em",
          margin: "0 0 24px",
          textAlign: "center",
        }}
      >
        الإعدادات
      </p>

      
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {menuItems.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 4px",
              borderBottom: "1px solid rgba(212,201,138,0.08)",
              opacity: 0.45,
              direction: "rtl",
            }}
          >
            
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <div>
                <span
                  style={{
                    fontSize: "clamp(13px, 3.5vw, 15px)",
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    opacity: 0.6,
                    marginRight: 8,
                    color: "#d4c98a",
                  }}
                >
                  (قريباً)
                </span>
              </div>
            </div>

            
            {item.hasToggle ? (
              <div
                style={{
                  width: 42,
                  height: 24,
                  borderRadius: 12,
                  background: "rgba(212,201,138,0.2)",
                  border: "1px solid rgba(212,201,138,0.3)",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "rgba(212,201,138,0.4)",
                    position: "absolute",
                    top: 2,
                    right: 2,
                  }}
                />
              </div>
            ) : (
              <span style={{ fontSize: 16, opacity: 0.5 }}>‹</span>
            )}
          </div>
        ))}
      </div>

      {/* مساحة فارغة */}
      <div style={{ flexGrow: 1 }} />

      {/* زر تسجيل الخروج - بدون حواف */}
      <button
        onClick={onLogout}
        style={{
          marginLeft: "auto",
          marginBottom: "clamp(20px, 4vw, 30px)",
          padding: "clamp(8px, 2vw, 10px) clamp(18px, 4vw, 25px)",
          border: "none", // ✅ بدون حواف
          background: "transparent",
          color: "#d4c98a",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "clamp(13px, 3.5vw, 15px)",
          fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
          display: "flex",
          alignItems: "center",
          gap: 8,
          direction: "rtl",
          opacity: 0.85,
        }}
        onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseOut={(e) => (e.currentTarget.style.opacity = "0.85")}
      >
      
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#d4c98a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        تسجيل الخروج
      </button>

      
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontSize: "clamp(14px, 3.5vw, 16px)",
            fontWeight: 600,
            margin: 0,
          }}
        >
          هاويين
        </p>
        <p
          style={{
            fontSize: "clamp(14px, 3.5vw, 16px)",
            fontWeight: 600,
            margin: 0,
            opacity: 0.7,
          }}
        >
          الاصدار الاول
        </p>
        <p
          style={{
            fontSize: "clamp(10px, 2.5vw, 12px)",
            opacity: 0.5,
            margin: "5px 0 0",
          }}
        >
          صنع من المدينة المنورة بالحب  ❤️
        </p>
      </div>
    </div>
  );
}
