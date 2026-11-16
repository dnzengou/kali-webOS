import { Lock, LogIn } from "lucide-react";
import { useOsStore } from "@/store/useOsStore";

/**
 * Banner shown at the top of auth-required apps when the user is a guest.
 * Keeps the app's UI usable in read-only mode and surfaces a one-click
 * sign-in path instead of failing silently.
 */
interface GuestBannerProps {
  /** Short noun naming what signing in unlocks, e.g. "agent runs" or "your saved files". */
  featureName: string;
}

export default function GuestBanner({ featureName }: GuestBannerProps) {
  const isGuest   = useOsStore((s) => s.isGuest);
  const setLocked = useOsStore((s) => s.setLocked);

  if (!isGuest) return null;

  return (
    <div className="shrink-0 flex items-center gap-2.5 px-4 py-2 text-[11px] border-b border-amber-500/20 bg-amber-500/10 text-amber-200/90">
      <Lock size={12} className="shrink-0 text-amber-300/80" />
      <span className="flex-1">
        You're signed in as a guest. {featureName} are disabled until you sign in.
      </span>
      <button
        className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 transition-all border border-amber-500/30"
        onClick={() => setLocked(true)}
      >
        <LogIn size={11} />
        Sign in
      </button>
    </div>
  );
}
