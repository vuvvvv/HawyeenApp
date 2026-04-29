import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-webgl2";
import { useStateMachineInput } from "@rive-app/react-webgl2";
import mainUrl from "./mainpage.riv?url";
import loginUrl from "./loginpage.riv?url";
import PrintView from "./PrintView";
import { clearMapCache } from "./MapPage";
import { clearProfileCache } from "./ProfilePage";

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

let auth;
const API = import.meta.env.VITE_API_URL || "/api";

async function getAuth_() {
  if (auth) return auth;
  const res = await fetch(`${API}/auth/config`);
  const config = await res.json();
  const app = initializeApp(config);
  auth = getAuth(app);
  return auth;
}


const SPLASH_SM_IDLE = "idel";
const SPLASH_SM_MOVE = "move";
const MOBILE_BREAKPOINT = 768;
const LOGIN_MOBILE_ALIGNMENT = Alignment.Center;
const riveOpts = { useDevicePixelRatio: true };
const HINT_SHOWN_KEY = "splash_hint_shown";
const LOGIN_HINT_SHOWN_KEY = "login_hint_shown";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < MOBILE_BREAKPOINT,
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
}

function SplashView({ onContinue }) {
  const layout = useMemo(
    () => new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
    [],
  );

  const [started, setStarted] = useState(false);
  const [hint, setHint] = useState(null);
  const [hintFading, setHintFading] = useState(false);
  const timerRef = useRef(null);
  const continuedRef = useRef(false);
  const hint2TimerRef = useRef(null);

  const { rive, RiveComponent } = useRive(
    {
      src: mainUrl,
      artboard: "mainpage",
      stateMachines: SPLASH_SM_IDLE,
      autoplay: true,
      layout,
      onStop: (event) => {
        if (event?.data?.name === SPLASH_SM_MOVE) scheduleContinue();
      },
    },
    riveOpts,
  );

  const scheduleContinue = useCallback(() => {
    if (continuedRef.current) return;
    continuedRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    onContinue();
  }, [onContinue]);

  const dismissHint = useCallback((after) => {
    setHintFading(true);
    setTimeout(() => {
      setHintFading(false);
      setHint(null);
      after?.();
    }, 1200);
  }, []);

  useEffect(() => {
    const already = sessionStorage.getItem(HINT_SHOWN_KEY);
    if (already) return;
    sessionStorage.setItem(HINT_SHOWN_KEY, "1");

    setHint("scroll");

    hint2TimerRef.current = setTimeout(() => {
      dismissHint(() => {
        const t = setTimeout(() => setHint("touch"), 400);
        return () => clearTimeout(t);
      });
    }, 3500);

    return () => {
      if (hint2TimerRef.current) clearTimeout(hint2TimerRef.current);
    };
  }, [dismissHint]);

  const handlePointerMove = () => {
    if (hint) {
      if (hint2TimerRef.current) clearTimeout(hint2TimerRef.current);
      dismissHint();
    }

    if (continuedRef.current || started) return;
    if (rive) {
      try {
        rive.stop(SPLASH_SM_IDLE);
      } catch {}
      rive.play(SPLASH_SM_MOVE);
    }
    setStarted(true);
  };

  useEffect(() => {
    if (!started || continuedRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(scheduleContinue, 6000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [started, scheduleContinue]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hint2TimerRef.current) clearTimeout(hint2TimerRef.current);
    };
  }, []);

  const hintBaseStyle = {
    position: "fixed",
    bottom: "8vh",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#c9b97a",
    fontFamily: "'AlAbdali','Tajawal',sans-serif",
    fontSize: "clamp(13px, 3.5vw, 16px)",
    direction: "rtl",
    pointerEvents: "none",
    whiteSpace: "nowrap",
    zIndex: 10,
    animation: hintFading
      ? "hintFadeOut 1.2s ease forwards"
      : "hintFadeIn .5s ease both",
  };

  const pulseStyle = { animation: "hintPulse 1.8s ease-in-out infinite" };

  return (
    <div
      onPointerDown={handlePointerMove}
      style={{
        width: "100%",
        height: "100%",
        background: "#000",
        overflow: "hidden",
      }}
    >
      <RiveComponent />

      {hint === "scroll" && (
        <div style={hintBaseStyle}>
          <span style={pulseStyle}>↕</span>
          <span>مرر للدخول</span>
          <span style={pulseStyle}>↕</span>
        </div>
      )}

      {hint === "touch" && (
        <div style={hintBaseStyle}>
          <span style={{ ...pulseStyle, fontSize: "18px" }}>◎</span>
          <span>المس شاشة الكمبيوتر</span>
        </div>
      )}

      <style>{`
        @keyframes hintFadeIn  { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes hintFadeOut { from { opacity:1; } to { opacity:0; } }
        @keyframes hintPulse   { 0%,100%{ opacity:.45; } 50%{ opacity:1; } }
      `}</style>
    </div>
  );
}

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

function LoginView({
  onLoginSuccess,
  onGuestSuccess,
  initialSM = "main",
  onBack,
}) {
  const isMobile = useIsMobile();
  const [showForm, setShowForm] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [riveReady, setRiveReady] = useState(false);
  const loginSuccessCalledRef = useRef(false);
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "error") => setToast({ message, type });

  const [loginHint, setLoginHint] = useState(false);
  const [loginHintFading, setLoginHintFading] = useState(false);

  useEffect(() => {
    const already = sessionStorage.getItem(LOGIN_HINT_SHOWN_KEY);
    if (already) return;
    sessionStorage.setItem(LOGIN_HINT_SHOWN_KEY, "1");
    setLoginHint(true);
  }, []);

  const dismissLoginHint = useCallback(() => {
    if (!loginHint) return;
    setLoginHintFading(true);
    setTimeout(() => {
      setLoginHint(false);
      setLoginHintFading(false);
    }, 400);
  }, [loginHint]);

  const layout = useMemo(
    () =>
      new Layout({
        fit: Fit.Cover,
        alignment: isMobile ? LOGIN_MOBILE_ALIGNMENT : Alignment.Center,
      }),
    [isMobile],
  );

  const { rive, RiveComponent } = useRive(
    {
      src: loginUrl,
      artboard: "loginpage",
      stateMachines: initialSM,
      autoplay: true,
      layout,
      onStateChange: () => setRiveReady(true),
      onStop: (event) => {
        if (event?.data?.name === "Boolean 6") {
          if (!loginSuccessCalledRef.current) {
            loginSuccessCalledRef.current = true;
            onLoginSuccess();
          }
        }
      },
    },
    riveOpts,
  );

  const successBool = useRef(null);
  const intervalRef = useRef(null);
  const guestCalledRef = useRef(false);

  useEffect(() => {
    if (!rive) return;
    const inputs = rive.stateMachineInputs("main");
    if (!inputs) return;

    const successInput = inputs.find((i) => i.name === "Boolean 6");
    if (successInput) successBool.current = successInput;

    const guestInput = inputs.find((i) => i.name === "Boolean 2");
    const loginBool = inputs.find((i) => i.name === "Boolean 3");

    if (loginBool) {
      const check = () => {
        setShowForm(loginBool.value);

        if (
          successBool.current?.value === true &&
          !loginSuccessCalledRef.current
        ) {
          loginSuccessCalledRef.current = true;
          clearInterval(intervalRef.current);
          clearMapCache();
          clearProfileCache();
          onLoginSuccess();
        }

        if (guestInput?.value === true && !guestCalledRef.current) {
          guestCalledRef.current = true;
          clearInterval(intervalRef.current);
          clearMapCache();
          clearProfileCache();
          onGuestSuccess();
        }
      };

      check();
      intervalRef.current = setInterval(check, 50);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [rive]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showToast("الرجاء تعبئة جميع الحقول", "warn");
      return;
    }

    try {
      const authInstance = await getAuth_();
      const userCred = await signInWithEmailAndPassword(
        authInstance,
        email,
        password,
      );
      const token = await userCred.user.getIdToken();

      const res = await fetch(`${API}/auth/session`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) throw new Error(data?.message || "Session failed");

      if (successBool.current) successBool.current.value = true;
      setFadeOut(true);
      setTimeout(() => setShowForm(false), 800);
    } catch (err) {
      showToast("بيانات غير صحيحة، حاول مجدداً");
    }
  };

  return (
    <div
      onPointerDown={dismissLoginHint}
      style={{
        width: "100%",
        height: "100%",
        background: "#000",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div
        style={{
          opacity: riveReady ? 1 : 0,
          transition: "opacity 0.2s ease",
          width: "100%",
          height: "100%",
          fontFamily: "'AlAbdali', 'Tajawal', sans-serif",
        }}
      >
        <RiveComponent />
      </div>

      {loginHint && (
        <div
          style={{
            position: "fixed",
            bottom: "8vh",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#c9b97a",
            fontFamily: "'AlAbdali','Tajawal',sans-serif",
            fontSize: "clamp(13px, 3.5vw, 16px)",
            direction: "rtl",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 10,
            animation: loginHintFading
              ? "hintFadeOut 1.2s ease forwards"
              : "hintFadeIn .5s ease both",
          }}
        >
          <span
            style={{
              animation: "hintPulse 1.8s ease-in-out infinite",
              fontSize: "18px",
            }}
          >
            ◎
          </span>
          <span>المس شاشة الكمبيوتر</span>
          <style>{`
            @keyframes hintFadeIn  { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
            @keyframes hintFadeOut { from { opacity:1; } to { opacity:0; } }
            @keyframes hintPulse   { 0%,100%{ opacity:.45; } 50%{ opacity:1; } }
          `}</style>
        </div>
      )}

      {showForm && (
        <div
          style={{
            position: "fixed",
            top: "55%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? "10px" : "30px",
            width: isMobile ? "85%" : "260px",
            opacity: fadeOut ? 0 : 1,
            transition: "opacity 0.5s ease",
          }}
        >
          <h2
            style={{
              color: "#7B7247",
              textAlign: "center",
              marginBottom: "10px",
            }}
          >
            تسجيل الدخول
          </h2>
          <input
            type="email"
            placeholder="الايميل"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: isMobile ? "10px" : "12px",
              borderRadius: "10px",
              border: "1px solid #7B7247",
              background: "transparent",
              color: "#7B7247",
              outline: "none",
              fontSize: isMobile ? "14px" : "16px",
            }}
          />
          <input
            type="password"
            placeholder="الباسورد"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: isMobile ? "10px" : "12px",
              borderRadius: "10px",
              border: "1px solid #7B7247",
              background: "transparent",
              color: "#7B7247",
              outline: "none",
              fontSize: isMobile ? "14px" : "16px",
            }}
          />
          <button
            onClick={handleLogin}
            style={{
              padding: isMobile ? "10px" : "12px",
              borderRadius: "25px",
              border: "none",
              background: "#7B7247",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: isMobile ? "14px" : "16px",
            }}
          >
            دخول
          </button>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0px",
              alignItems: "center",
            }}
          >
            <p
              style={{
                textAlign: "center",
                color: "#7B7247",
                fontSize: isMobile ? "12px" : "14px",
                margin: 0,
              }}
            >
              ما عندك حساب؟{" "}
              <a
                href="https://play.google.com/store/apps/details?id=com.abdulaziz.hobbies&pli=1"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#7B7247",
                  fontWeight: "bold",
                  textDecoration: "underline",
                }}
              >
                اضغط هنا
              </a>
            </p>
            <button
              onClick={onBack}
              style={{
                background: "transparent",
                border: "none",
                color: "#7B7247",
                cursor: "pointer",
                fontSize: isMobile ? "12px" : "14px",
                padding: 0,
                fontWeight: "bold",
                textDecoration: "underline",
              }}
            >
              العودة للصفحة السابقة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RiveBackground() {
  const layout = useMemo(
    () => new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
    [],
  );
  const { RiveComponent } = useRive(
    {
      src: loginUrl,
      artboard: "loginpage",
      stateMachines: "list",
      autoplay: true,
      layout,
    },
    riveOpts,
  );
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
      <RiveComponent />
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState(null);
  const goLoginScreen = useCallback(() => setScreen("login"), []);

  const goBack = useCallback(() => {
    setLoginKey((k) => k + 1);
  }, []);
  const [loginKey, setLoginKey] = useState(0);
  const [isGuest, setIsGuest] = useState(false);

  const goLoginSuccessAsGuest = useCallback(() => {
    setIsGuest(true);
    setScreen("print");
  }, []);
  const goLoginSuccess = useCallback(() => {
    setIsGuest(false);
    setScreen("print");
  }, []);

  const logout = async () => {
    if (!isGuest) {
      try {
        await fetch(`${API}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch (err) {}
    }
    clearMapCache();
    clearProfileCache();
    setLoginKey((k) => k + 1);
    setScreen("login");
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API}/auth/session`, {
          credentials: "include",
        });
        if (res.ok) {
          setScreen("print");
        } else {
          setScreen("splash");
        }
      } catch {
        setScreen("splash");
      }
    };
    checkSession();
  }, []);

  if (screen === null) {
    return (
      <div style={{ width: "100vw", height: "100svh", background: "#000" }} />
    );
  }

  return (
    <div style={{ width: "100vw", height: "100svh", overflow: "hidden" }}>
      {screen === "splash" && <SplashView onContinue={goLoginScreen} />}
      {screen === "login" && (
        <LoginView
          key={loginKey}
          onLoginSuccess={goLoginSuccess}
          onGuestSuccess={goLoginSuccessAsGuest}
          onBack={goBack}
        />
      )}
      {screen === "print" && (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <RiveBackground />
          <PrintView onLogout={logout} />
        </div>
      )}
    </div>
  );
}
