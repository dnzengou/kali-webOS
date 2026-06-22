import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Clock } from "lucide-react";

const DAYS_SHORT  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS      = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const EVENT_COLORS = [
  "#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#ec4899", "#06b6d4", "#f97316",
];

interface CalEvent {
  id:    number;
  title: string;
  time:  string; // "HH:MM" or ""
  color: string;
  date:  string; // "YYYY-MM-DD"
}

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const SEED: CalEvent[] = [
  { id: 1, title: "Team standup",    time: "09:00", color: "#3b82f6", date: isoDate(new Date().getFullYear(), new Date().getMonth(), 15) },
  { id: 2, title: "Security audit",  time: "14:00", color: "#ef4444", date: isoDate(new Date().getFullYear(), new Date().getMonth(), 15) },
  { id: 3, title: "Release v2.0",    time: "12:00", color: "#10b981", date: isoDate(new Date().getFullYear(), new Date().getMonth(), 20) },
];

function loadEvents(): CalEvent[] {
  try {
    const raw = localStorage.getItem("kali-calendar");
    return raw ? JSON.parse(raw) : SEED;
  } catch { return SEED; }
}
function saveEvents(events: CalEvent[]) {
  localStorage.setItem("kali-calendar", JSON.stringify(events));
}

export default function Calendar() {
  const today = new Date();
  const [view,   setView]   = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selDay, setSelDay] = useState<string>(isoDate(today.getFullYear(), today.getMonth(), today.getDate()));
  const [events, setEvents] = useState<CalEvent[]>(loadEvents);

  // Modal state
  const [modal,   setModal]   = useState(false);
  const [evTitle, setEvTitle] = useState("");
  const [evTime,  setEvTime]  = useState("");
  const [evColor, setEvColor] = useState(EVENT_COLORS[0]);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { saveEvents(events); }, [events]);
  useEffect(() => { if (modal) titleRef.current?.focus(); }, [modal]);

  const year  = view.getFullYear();
  const month = view.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days  = new Date(year, month + 1, 0).getDate();

  const evByDate = (date: string) => events.filter((e) => e.date === date);
  const selEvents = evByDate(selDay);

  const addEvent = () => {
    if (!evTitle.trim()) return;
    const ev: CalEvent = { id: Date.now(), title: evTitle.trim(), time: evTime, color: evColor, date: selDay };
    setEvents((p) => [...p, ev]);
    setEvTitle(""); setEvTime(""); setEvColor(EVENT_COLORS[0]);
    setModal(false);
  };

  const delEvent = (id: number) => setEvents((p) => p.filter((e) => e.id !== id));

  const todayIso = isoDate(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="h-full flex overflow-hidden" style={{ background: "#0a0a0e", color: "white" }}>

      {/* ── CALENDAR GRID ── */}
      <div className="flex-1 flex flex-col min-w-0 p-3">
        {/* Nav */}
        <div className="flex items-center mb-3">
          <button onClick={() => setView(new Date(year, month - 1, 1))}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all">
            <ChevronLeft size={16} />
          </button>
          <h3 className="flex-1 text-center text-[15px] font-semibold">{MONTHS[month]} {year}</h3>
          <button onClick={() => setView(new Date(year, month + 1, 1))}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => { setView(new Date(today.getFullYear(), today.getMonth(), 1)); setSelDay(todayIso); }}
            className="ml-2 text-[11px] px-2.5 py-1 rounded-full text-white/50 hover:text-white transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}>Today</button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS_SHORT.map((d, i) => (
            <div key={d} className={`text-center text-[10px] py-1 font-medium ${i === 0 || i === 6 ? "text-white/25" : "text-white/40"}`}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5 flex-1">
          {Array.from({ length: first }, (_, i) => <div key={`p${i}`} />)}
          {Array.from({ length: days }, (_, i) => {
            const d      = i + 1;
            const iso    = isoDate(year, month, d);
            const evs    = evByDate(iso);
            const isToday = iso === todayIso;
            const isSel   = iso === selDay;
            const isWknd  = (first + i) % 7 === 0 || (first + i) % 7 === 6;

            return (
              <button key={d} onClick={() => setSelDay(iso)}
                className="flex flex-col items-center rounded-xl transition-all pt-1.5 pb-1 px-0.5 group relative"
                style={{
                  background: isSel
                    ? "rgba(155,89,182,0.2)"
                    : "rgba(255,255,255,0.02)",
                  border: isToday
                    ? "1px solid rgba(155,89,182,0.6)"
                    : isSel
                    ? "1px solid rgba(155,89,182,0.35)"
                    : "1px solid transparent",
                  minHeight: 52,
                }}>
                <span className={`text-[12px] font-medium w-6 h-6 flex items-center justify-center rounded-full
                  ${isToday ? "bg-[#9b59b6] text-white" : isSel ? "text-[#c084fc]" : isWknd ? "text-white/30" : "text-white/70"}`}>
                  {d}
                </span>
                {/* Event dots / chips */}
                <div className="flex flex-wrap gap-0.5 mt-0.5 justify-center w-full px-0.5">
                  {evs.slice(0, 3).map((ev) => (
                    <div key={ev.id} className="rounded-sm text-[8px] px-1 truncate max-w-full"
                      style={{ background: ev.color + "33", color: ev.color, border: `1px solid ${ev.color}44` }}>
                      {evs.length <= 1 ? ev.title : "•"}
                    </div>
                  ))}
                  {evs.length > 3 && (
                    <span className="text-[8px] text-white/30">+{evs.length - 3}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SIDE PANEL ── */}
      <div className="w-[180px] shrink-0 flex flex-col border-l border-white/[0.06] p-3">
        {/* Selected date header */}
        <div className="mb-3">
          <p className="text-[10px] text-white/35 uppercase tracking-widest">
            {new Date(selDay + "T00:00:00").toLocaleDateString([], { weekday: "long" })}
          </p>
          <p className="text-[18px] font-semibold">
            {new Date(selDay + "T00:00:00").toLocaleDateString([], { month: "short", day: "numeric" })}
          </p>
        </div>

        {/* Add event button */}
        <button onClick={() => setModal(true)}
          className="flex items-center gap-1.5 w-full px-3 py-2 rounded-xl text-[12px] font-medium text-white/70 hover:text-white transition-all mb-3"
          style={{ background: "rgba(155,89,182,0.12)", border: "1px solid rgba(155,89,182,0.2)" }}>
          <Plus size={13} /> Add event
        </button>

        {/* Events for selected day */}
        <div className="flex-1 overflow-y-auto os-scrollbar space-y-1.5">
          {selEvents.length === 0 && (
            <p className="text-[11px] text-white/20 text-center mt-4">No events</p>
          )}
          {selEvents
            .slice()
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((ev) => (
              <div key={ev.id} className="rounded-xl px-2.5 py-2 group relative"
                style={{ background: ev.color + "18", border: `1px solid ${ev.color}30` }}>
                <div className="flex items-start justify-between gap-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate" style={{ color: ev.color }}>{ev.title}</p>
                    {ev.time && (
                      <p className="flex items-center gap-1 text-[10px] text-white/40 mt-0.5">
                        <Clock size={9} /> {ev.time}
                      </p>
                    )}
                  </div>
                  <button onClick={() => delEvent(ev.id)}
                    className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all shrink-0 mt-0.5">
                    <X size={11} />
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Upcoming today total */}
        {events.filter((e) => e.date === todayIso).length > 0 && selDay !== todayIso && (
          <div className="mt-2 pt-2 border-t border-white/[0.05]">
            <p className="text-[10px] text-white/30">
              {events.filter((e) => e.date === todayIso).length} event(s) today
            </p>
          </div>
        )}
      </div>

      {/* ── ADD EVENT MODAL ── */}
      {modal && (
        <div className="absolute inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }}>
          <div className="w-72 rounded-2xl p-5 shadow-2xl"
            style={{ background: "#141418", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-[14px]">New Event</h4>
              <button onClick={() => setModal(false)} className="text-white/30 hover:text-white/70"><X size={15} /></button>
            </div>

            <p className="text-[11px] text-white/40 mb-3">
              {new Date(selDay + "T00:00:00").toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
            </p>

            <input ref={titleRef} placeholder="Event title…" value={evTitle}
              onChange={(e) => setEvTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addEvent(); if (e.key === "Escape") setModal(false); }}
              className="w-full mb-3 px-3 py-2 rounded-xl text-[13px] text-white placeholder-white/25 outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />

            <div className="flex items-center gap-2 mb-3">
              <Clock size={13} className="text-white/40 shrink-0" />
              <input type="time" value={evTime} onChange={(e) => setEvTime(e.target.value)}
                className="flex-1 px-2 py-1.5 rounded-lg text-[12px] text-white/70 outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", colorScheme: "dark" }} />
            </div>

            {/* Color picker */}
            <div className="flex gap-1.5 mb-4 flex-wrap">
              {EVENT_COLORS.map((c) => (
                <button key={c} onClick={() => setEvColor(c)}
                  className="w-6 h-6 rounded-full transition-all hover:scale-110"
                  style={{ background: c, outline: evColor === c ? "2px solid white" : "none", outlineOffset: 2 }} />
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setModal(false)}
                className="flex-1 py-2 rounded-xl text-[12px] text-white/50 hover:text-white transition-all"
                style={{ background: "rgba(255,255,255,0.05)" }}>Cancel</button>
              <button onClick={addEvent}
                className="flex-1 py-2 rounded-xl text-[12px] font-semibold text-white transition-all active:scale-95"
                style={{ background: `linear-gradient(135deg, ${evColor}cc, ${evColor})`, boxShadow: `0 4px 16px ${evColor}44` }}>
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
