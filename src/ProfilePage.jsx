import { useState, useEffect } from "react";
import girlImg from "./assets/girl.svg";
import boyImg from "./assets/boy.svg";

let cachedProfile = null;
export function clearProfileCache() {
  cachedProfile = null;
}
const API = import.meta.env.VITE_API_URL ;
async function loadProfile() {
  if (cachedProfile) return cachedProfile;
  try {
    const res = await fetch(`${API}/user/me`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("failed");
    const data = await res.json();
    cachedProfile = data?.profile ?? null;
    return cachedProfile;
  } catch {
    
    cachedProfile = {
      name: "ابو عزوز",
      gender: "male",
      avatar: null,
      hobbies: ["القراءة", "السفر", "البرمجة", "التصوير"],
    };
    return cachedProfile;
  }
}

export default function ProfilePage() {

  const [profile, setProfile] = useState(cachedProfile);
  const [loading, setLoading] = useState(cachedProfile === null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    
    if (cachedProfile) {
      setProfile(cachedProfile);
      setLoading(false);
      return;
    }
   
    loadProfile().then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, []);

  const isMale = profile?.gender === "male";
  const avatarSrc = profile?.gender === "female" ? girlImg : boyImg;
  const genderIcon = isMale ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      width="14"
      height="14"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="14" r="5" />
      <line x1="14.5" y1="9.5" x2="20" y2="4" />
      <polyline points="16 4 20 4 20 8" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      width="14"
      height="14"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="5" />
      <line x1="12" y1="13" x2="12" y2="20" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );

  const genderColor = isMale
    ? "linear-gradient(135deg, #4a90d9, #2563b0)"
    : "linear-gradient(135deg, #d4607a, #a83258)";

  return (
    <>
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(212,201,138,0.35); }
          70%  { box-shadow: 0 0 0 10px rgba(212,201,138,0); }
          100% { box-shadow: 0 0 0 0 rgba(212,201,138,0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .profile-avatar { animation: pulse-ring 2.8s ease infinite; }
        .hobby-tag { transition: background 0.18s ease, transform 0.15s ease; }
        .hobby-tag:hover {
          background: rgba(212,201,138,0.18) !important;
          transform: translateY(-2px);
        }
        .profile-section { animation: fadeSlide 0.45s ease both; }
      `}</style>

      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflowY: "auto",
          padding: "20px 16px 16px",
          boxSizing: "border-box",
          fontFamily: "'Tajawal', sans-serif",
        }}
        dir="rtl"
      >
        <p
          className="profile-section"
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "rgba(212,201,138,0.55)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            margin: "0 0 16px",
            animationDelay: "0ms",
          }}
        >
          الملف الشخصي
        </p>

        {loading ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                border: "2px solid rgba(212,201,138,0.2)",
                borderTopColor: "rgba(212,201,138,0.8)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                padding: "4px 16px 19px",
              }}
            />
          </div>
        ) : (
          <>
            
            <div
              className="profile-section"
              style={{
                position: "relative",
                marginBottom: 14,
                animationDelay: "60ms",
                padding: "60px 16px 1px",
              }}
            >
              <div
                className="profile-avatar"
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: "50%",
                  border: "2px solid rgba(212,201,138,0.45)",
                  overflow: "hidden",
                  background: "rgba(212,201,138,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={
                    profile?.avatar && !imgError ? profile.avatar : avatarSrc
                  }
                  alt="avatar"
                  onError={() => setImgError(true)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: genderColor,
                  border: "2px solid rgba(10,9,6,0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {genderIcon}
              </div>
            </div>

            
            <p
              className="profile-section"
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#d4c98a",
                margin: "0 0 4px",
                animationDelay: "120ms",
                padding: "6px 16px 20px",
              }}
            >
              {profile?.name || "—"}
            </p>

            
            <p
              className="profile-section"
              style={{
                fontSize: 12,
                color: "rgba(212,201,138,0.4)",
                margin: "0 0 18px",
                animationDelay: "160ms",
              }}
            >
              {isMale ? "ذكر" : "أنثى"}
            </p>

       
            <div
              className="profile-section"
              style={{
                width: "60%",
                height: 1,
                background: "rgba(123,114,71,0.25)",
                marginBottom: 16,
                animationDelay: "180ms",
              }}
            />

           
            {profile?.hobbies?.length > 0 && (
              <div
                className="profile-section"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  animationDelay: "220ms",
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(212,201,138,0.4)",
                    letterSpacing: "0.1em",
                    margin: 0,
                  }}
                >
                  الهوايات
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    justifyContent: "center",
                  }}
                >
                  {profile.hobbies.map((h, i) => (
                    <span
                      key={i}
                      className="hobby-tag"
                      style={{
                        padding: "5px 14px",
                        borderRadius: 999,
                        border: "1px solid rgba(123,114,71,0.4)",
                        background: "rgba(212,201,138,0.07)",
                        color: "rgba(212,201,138,0.75)",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "default",
                      }}
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
