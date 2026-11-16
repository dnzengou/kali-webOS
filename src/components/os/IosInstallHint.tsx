import { useEffect, useState } from "react";
import { Share, X } from "lucide-react";

const DISMISS_KEY = "kali-webos:ios-install-dismissed";

/**
 * One-time install hint for iOS Safari.
 *
 * Why: the Chromium `beforeinstallprompt` event doesn't fire on iOS
 * Safari, so the top-bar Install-App pill is invisible there. iOS users
 * install a PWA via Share → "Add to Home Screen" — but have to discover
 * that themselves. This component surfaces the two taps once, then
 * remembers the dismissal in localStorage.
 *
 * Suppressed when:
 *  - user is not on iOS Safari
 *  - app is already running standalone (already installed)
 *  - user has dismissed the hint before
 */
function isIosSafari(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
  if (!ios) return false;
  // Safari only — not Chrome iOS (CriOS) or Firefox iOS (FxiOS); they handle install differently.
  const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return safari;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const navMatch = (navigator as unknown as { standalone?: boolean }).standalone === true;
  const media   = window.matchMedia?.("(display-mode: standalone)")?.matches === true;
  return navMatch || media;
}

export default function IosInstallHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isIosSafari()) return;
    if (isStandalone()) return;
    let dismissed = false;
    try { dismissed = localStorage.getItem(DISMISS_KEY) === "1"; } catch { /* storage blocked */ }
    if (dismissed) return;
    // Delay appearance a few seconds so it doesn't crowd first-paint.
    const t = setTimeout(() => setShow(true), 3500);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* storage blocked */ }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[10001] w-[min(88vw,360px)] animate-in slide-in-from-bottom-4 fade-in duration-300"
      role="dialog"
      aria-labelledby="ios-install-title"
    >
      <div
        className="rounded-2xl p-4 pr-10 relative"
        style={{
          background: "rgba(22,22,22,0.96)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(155,89,182,0.3)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(155,89,182,0.15)",
        }}
      >
        <div id="ios-install-title" className="text-[13px] font-semibold text-white/90 mb-1">
          Install Kali WebOS on your device
        </div>
        <div className="text-[12px] text-white/60 leading-relaxed">
          Tap <Share size={12} className="inline align-text-top text-blue-400" />
          {" "}in Safari's share menu → <span className="text-white/80">Add to Home Screen</span>
          {" "}for a full-screen, app-like experience.
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss install hint"
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
