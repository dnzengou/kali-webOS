import { useState, useRef, useEffect, useCallback } from "react";

/** A terminal "line" is an array of colored spans */
type Span = { text: string; color?: string; bold?: boolean };
type Line = Span[];

const PROMPT: Span[] = [
  { text: "root", color: "#c084fc", bold: true },
  { text: "@", color: "#666" },
  { text: "kali-os", color: "#22c55e" },
  { text: ":", color: "#666" },
  { text: "~", color: "#60a5fa" },
  { text: "# ", color: "#888" },
];

function plain(text: string, color = "rgba(255,255,255,0.82)"): Line {
  return [{ text, color }];
}
function err(text: string): Line {
  return [{ text, color: "#f87171" }];
}
function success(text: string): Line {
  return [{ text, color: "#4ade80" }];
}

const FILES = ["Desktop/", "Documents/", "Downloads/", "Music/", "Pictures/", "Videos/", "secret.txt", "exploit.py", ".bashrc", ".ssh/"];

const COMMANDS: Record<string, (args: string[], addLines: (l: Line[]) => void) => Line[] | void> = {
  help: () => [
    plain("┌─ Kali WebOS Terminal — Available Commands ─────────────────┐", "#9b59b6"),
    plain("│  help       Show this help                                  │", "#9b59b6"),
    plain("│  neofetch   System information                              │", "#9b59b6"),
    plain("│  nmap       Port scanner (simulated)                        │", "#9b59b6"),
    plain("│  ping       Ping a host                                     │", "#9b59b6"),
    plain("│  traceroute Trace route to host                             │", "#9b59b6"),
    plain("│  hydra      Brute-force tool (simulated)                    │", "#9b59b6"),
    plain("│  sqlmap     SQL injection scanner (simulated)               │", "#9b59b6"),
    plain("│  curl       HTTP request tool                               │", "#9b59b6"),
    plain("│  whoami     Current user                                    │", "#9b59b6"),
    plain("│  id         User and group IDs                              │", "#9b59b6"),
    plain("│  uname      Kernel info                                     │", "#9b59b6"),
    plain("│  ls         List files                                      │", "#9b59b6"),
    plain("│  cat        Show file content                               │", "#9b59b6"),
    plain("│  pwd        Current path                                    │", "#9b59b6"),
    plain("│  echo       Print text                                      │", "#9b59b6"),
    plain("│  date       Current date/time                               │", "#9b59b6"),
    plain("│  ifconfig   Network interfaces                              │", "#9b59b6"),
    plain("│  history    Command history                                 │", "#9b59b6"),
    plain("│  clear      Clear terminal                                  │", "#9b59b6"),
    plain("└──────────────────────────────────────────────────────────────┘", "#9b59b6"),
  ],

  neofetch: () => [
    [
      { text: "         ##########          ", color: "#9b59b6", bold: true },
      { text: "OS", color: "#60a5fa", bold: true }, { text: ":     Kali WebOS 2.0", color: "#ccc" },
    ],
    [
      { text: "       ##############        ", color: "#9b59b6", bold: true },
      { text: "Kernel", color: "#60a5fa", bold: true }, { text: ": 6.6.0-kali-web", color: "#ccc" },
    ],
    [
      { text: "     ################        ", color: "#9b59b6", bold: true },
      { text: "Host", color: "#60a5fa", bold: true }, { text: ":   kali-os", color: "#ccc" },
    ],
    [
      { text: "    ######  ##########       ", color: "#9b59b6", bold: true },
      { text: "DE", color: "#60a5fa", bold: true }, { text: ":     AetherClaw v2", color: "#ccc" },
    ],
    [
      { text: "    #####    #########       ", color: "#9b59b6", bold: true },
      { text: "Shell", color: "#60a5fa", bold: true }, { text: ":  ksh 2.0", color: "#ccc" },
    ],
    [
      { text: "    #####    #########       ", color: "#9b59b6", bold: true },
      { text: "Term", color: "#60a5fa", bold: true }, { text: ":   KaliTerm", color: "#ccc" },
    ],
    [
      { text: "     ###    ##########       ", color: "#9b59b6", bold: true },
      { text: "CPU", color: "#60a5fa", bold: true }, { text: ":    Intel Xeon × 32", color: "#ccc" },
    ],
    [
      { text: "      ######  #######        ", color: "#9b59b6", bold: true },
      { text: "RAM", color: "#60a5fa", bold: true }, { text: ":    128 GB", color: "#ccc" },
    ],
    plain(""),
  ],

  nmap: (args) => {
    const target = args[0] || "localhost";
    const ports = [
      { port: "22/tcp",   state: "open",   svc: "ssh",        col: "#4ade80" },
      { port: "80/tcp",   state: "open",   svc: "http",       col: "#4ade80" },
      { port: "443/tcp",  state: "open",   svc: "https",      col: "#4ade80" },
      { port: "3306/tcp", state: "closed", svc: "mysql",      col: "#f87171" },
      { port: "5432/tcp", state: "closed", svc: "postgresql", col: "#f87171" },
      { port: "8080/tcp", state: "open",   svc: "http-proxy", col: "#4ade80" },
      { port: "6379/tcp", state: "open",   svc: "redis",      col: "#4ade80" },
    ];
    return [
      plain(`Starting Nmap 7.94 ( https://nmap.org ) on ${target}`, "#60a5fa"),
      [{ text: "PORT       STATE    SERVICE", color: "#888" }],
      ...ports.map((p) => [
        { text: p.port.padEnd(11), color: "#ccc" },
        { text: p.state.padEnd(9), color: p.col },
        { text: p.svc, color: "#60a5fa" },
      ] as Span[]),
      success(`Nmap done: 1 IP address (1 host up) scanned`),
    ];
  },

  ping: (args) => {
    const host = args[0] || "8.8.8.8";
    return [
      plain(`PING ${host} (${host}): 56 bytes of data`),
      plain(`64 bytes from ${host}: icmp_seq=0 ttl=117 time=12.3 ms`, "#4ade80"),
      plain(`64 bytes from ${host}: icmp_seq=1 ttl=117 time=11.8 ms`, "#4ade80"),
      plain(`64 bytes from ${host}: icmp_seq=2 ttl=117 time=13.1 ms`, "#4ade80"),
      plain(`--- ${host} ping statistics ---`, "#888"),
      plain(`3 packets transmitted, 3 received, 0% packet loss`),
      plain(`round-trip min/avg/max = 11.8/12.4/13.1 ms`),
    ];
  },

  traceroute: (args) => {
    const host = args[0] || "google.com";
    return [
      plain(`traceroute to ${host}, 30 hops max, 60 byte packets`),
      plain(` 1  _gateway (192.168.1.1)  0.412 ms  0.389 ms`, "#4ade80"),
      plain(` 2  10.0.0.1 (10.0.0.1)    5.231 ms  5.418 ms`, "#4ade80"),
      plain(` 3  * * *                    (timeout)`, "#f87171"),
      plain(` 4  142.250.1.1             12.441 ms`, "#4ade80"),
      plain(` 5  ${host}               18.223 ms`, "#4ade80"),
    ];
  },

  hydra: (args) => {
    const host = args[0] || "192.168.1.1";
    return [
      plain(`Hydra v9.4 starting against ${host}`, "#60a5fa"),
      plain("[DATA] attacking ssh://"+host+":22/"),
      plain("[22][ssh] host: "+host+"  login: admin  password: admin123", "#facc15"),
      success("1 of 1 target successfully completed, 1 valid password found"),
    ];
  },

  sqlmap: (args) => {
    const url = args[0] || "http://target.com/index.php?id=1";
    return [
      plain(`sqlmap v1.7 — testing ${url}`, "#60a5fa"),
      plain("[INFO] testing MySQL..."),
      plain("[INFO] parameter 'id' appears to be injectable", "#facc15"),
      success("[INFO] retrieved database: 'users', tables: accounts, passwords"),
    ];
  },

  curl: (args) => {
    const url = args[0] || "https://httpbin.org/get";
    return [
      plain(`  % Total    % Received  Xferd  Average  Speed`, "#888"),
      plain(`  0     0    0     0    0     0      0      0`, "#888"),
      plain(`{`, "#4ade80"),
      plain(`  "url": "${url}",`, "#4ade80"),
      plain(`  "headers": { "User-Agent": "curl/8.4.0" }`, "#4ade80"),
      plain(`}`, "#4ade80"),
    ];
  },

  whoami: () => [plain("root", "#c084fc")],

  id: () => [plain("uid=0(root) gid=0(root) groups=0(root)", "#c084fc")],

  uname: (args) => {
    const a = args[0];
    if (a === "-a") return [plain("Linux kali-os 6.6.0-kali-web #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux")];
    return [plain("Linux")];
  },

  ls: (args) => {
    const long = args.includes("-l") || args.includes("-la") || args.includes("-al");
    if (long) return [
      plain("total 64"),
      [{ text: "drwxr-xr-x", color: "#60a5fa" }, { text: " 2 root root 4096 " }, { text: "Desktop/",   color: "#60a5fa" }],
      [{ text: "drwxr-xr-x", color: "#60a5fa" }, { text: " 2 root root 4096 " }, { text: "Documents/", color: "#60a5fa" }],
      [{ text: "drwxr-xr-x", color: "#60a5fa" }, { text: " 2 root root 4096 " }, { text: "Downloads/", color: "#60a5fa" }],
      [{ text: "-rw-r--r--", color: "#ccc"    }, { text: " 1 root root  512 " }, { text: "secret.txt" }],
      [{ text: "-rwxr-xr-x", color: "#4ade80" }, { text: " 1 root root 2048 " }, { text: "exploit.py", color: "#4ade80" }],
    ];
    return [[
      { text: "Desktop/",   color: "#60a5fa" }, { text: "  " },
      { text: "Documents/", color: "#60a5fa" }, { text: "  " },
      { text: "Downloads/", color: "#60a5fa" }, { text: "  " },
      { text: "Music/",     color: "#60a5fa" }, { text: "  " },
      { text: "secret.txt", color: "#ccc"    }, { text: "  " },
      { text: "exploit.py", color: "#4ade80" },
    ]];
  },

  cat: (args) => {
    const f = args[0];
    if (!f) return [err("cat: missing operand")];
    if (f === "secret.txt") return [
      plain("╔══════════════════════════════════╗", "#f87171"),
      plain("║  TOP SECRET — DO NOT SHARE       ║", "#f87171"),
      plain("╠══════════════════════════════════╣", "#f87171"),
      plain("║  Flag: K4L1{w3b_0s_1337_2026}    ║", "#facc15"),
      plain("╚══════════════════════════════════╝", "#f87171"),
    ];
    if (f === "exploit.py") return [
      plain("#!/usr/bin/env python3",                "#888"),
      plain("# CVE-2024-1337 Remote Code Execution", "#888"),
      plain("import socket, struct",                 "#c084fc"),
      plain('TARGET = "192.168.1.1"',               "#4ade80"),
      plain("def exploit():",                        "#60a5fa"),
      plain('    print("Pwned!")',                   "#facc15"),
      plain("exploit()",                             "#60a5fa"),
    ];
    if (f === ".bashrc") return [
      plain("export PS1='\\[\\033[01;31m\\]root@kali\\[\\033[0m\\]:# '"),
      plain("alias ll='ls -la'"),
      plain("alias update='apt update && apt upgrade -y'"),
    ];
    return [err(`cat: ${f}: No such file or directory`)];
  },

  pwd: () => [plain("/root", "#60a5fa")],

  echo: (args) => [plain(args.join(" "))],

  date: () => [plain(new Date().toString(), "#4ade80")],

  ifconfig: () => [
    [{ text: "eth0", color: "#60a5fa", bold: true }, { text: ": flags=4163 <UP,BROADCAST,RUNNING>", color: "#888" }],
    plain("        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255"),
    plain("        inet6 fe80::1  prefixlen 64  scopeid 0x20<link>"),
    plain("        RX packets 99999  bytes 104857600 (100.0 MB)"),
    plain("        TX packets 88888  bytes  83886080  (80.0 MB)"),
    plain(""),
    [{ text: "lo", color: "#60a5fa", bold: true }, { text: ":     flags=73  <UP,LOOPBACK,RUNNING>", color: "#888" }],
    plain("        inet 127.0.0.1  netmask 255.0.0.0"),
  ],
};

const CMD_NAMES = Object.keys(COMMANDS);

export default function Terminal() {
  const [lines,    setLines]    = useState<{ prompt: boolean; spans: Span[]; cmdText?: string }[]>([
    { prompt: false, spans: [{ text: "Kali WebOS Terminal v2.0", color: "#9b59b6", bold: true }] },
    { prompt: false, spans: [{ text: "Type ", color: "#888" }, { text: "help", color: "#c084fc" }, { text: " for available commands. ↑/↓ for history, Tab to complete.", color: "#888" }] },
    { prompt: false, spans: [] },
  ]);
  const [input,    setInput]    = useState("");
  const [hist,     setHist]     = useState<string[]>([]);
  const [histIdx,  setHistIdx]  = useState(-1);
  const scrollRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  const addLines = useCallback((newLines: Line[]) => {
    setLines((prev) => [
      ...prev,
      ...newLines.map((spans) => ({ prompt: false, spans })),
    ]);
  }, []);

  const execute = useCallback((cmdStr: string) => {
    const trimmed = cmdStr.trim();

    // Echo prompt + command
    setLines((prev) => [
      ...prev,
      { prompt: true, spans: [...PROMPT, { text: trimmed, color: "rgba(255,255,255,0.88)" }], cmdText: trimmed },
    ]);

    if (!trimmed) return;

    if (trimmed === "clear") { setLines([]); return; }

    const [cmd, ...args] = trimmed.split(/\s+/);
    const handler = COMMANDS[cmd];
    if (handler) {
      const result = handler(args, addLines);
      if (result) {
        setLines((prev) => [
          ...prev,
          ...result.map((spans) => ({ prompt: false, spans })),
          { prompt: false, spans: [] },
        ]);
      } else {
        setLines((prev) => [...prev, { prompt: false, spans: [] }]);
      }
    } else if (trimmed === "history") {
      setLines((prev) => [
        ...prev,
        ...hist.map((h, i) => ({ prompt: false, spans: [{ text: `  ${String(i + 1).padStart(3)}  ${h}`, color: "#888" }] })),
        { prompt: false, spans: [] },
      ]);
    } else {
      setLines((prev) => [
        ...prev,
        { prompt: false, spans: [{ text: `bash: ${cmd}: command not found`, color: "#f87171" }] },
        { prompt: false, spans: [{ text: `Try `, color: "#888" }, { text: "help", color: "#c084fc" }, { text: " for a list of commands.", color: "#888" }] },
        { prompt: false, spans: [] },
      ]);
    }
  }, [addLines, hist]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const cmd = input;
      execute(cmd);
      if (cmd.trim()) setHist((h) => [...h.slice(-49), cmd.trim()]);
      setHistIdx(-1);
      setInput("");
      return;
    }

    // History navigation
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const ni = Math.min(histIdx + 1, hist.length - 1);
      setHistIdx(ni);
      setInput(hist[hist.length - 1 - ni] ?? "");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const ni = Math.max(histIdx - 1, -1);
      setHistIdx(ni);
      setInput(ni === -1 ? "" : hist[hist.length - 1 - ni] ?? "");
      return;
    }

    // Tab completion
    if (e.key === "Tab") {
      e.preventDefault();
      const parts = input.split(/\s+/);
      if (parts.length === 1) {
        const partial = parts[0];
        const matches = CMD_NAMES.filter((c) => c.startsWith(partial));
        if (matches.length === 1) { setInput(matches[0] + " "); }
        else if (matches.length > 1) {
          addLines([[{ text: matches.join("  "), color: "#60a5fa" }]]);
        }
      } else {
        // Complete filenames
        const partial = parts[parts.length - 1];
        const matches = FILES.filter((f) => f.startsWith(partial));
        if (matches.length === 1) {
          parts[parts.length - 1] = matches[0];
          setInput(parts.join(" "));
        }
      }
    }

    // Ctrl+C
    if (e.key === "c" && e.ctrlKey) {
      setLines((prev) => [...prev, { prompt: true, spans: [...PROMPT, { text: input, color: "rgba(255,255,255,0.5)" }, { text: "^C", color: "#f87171" }] }]);
      setInput("");
      setHistIdx(-1);
    }

    // Ctrl+L = clear
    if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div
      className="h-full flex flex-col terminal-text text-[13px] select-text"
      style={{ background: "#0c0c0f" }}
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 pt-3 pb-1 space-y-[1px]">
        {lines.map((line, li) => (
          <div key={li} className="flex flex-wrap leading-[1.6]">
            {line.prompt && PROMPT.map((s, si) => (
              <span key={si} style={{ color: s.color, fontWeight: s.bold ? "600" : undefined }}>{s.text}</span>
            ))}
            {line.spans.map((s, si) => (
              <span key={si} style={{ color: s.color ?? "rgba(255,255,255,0.82)", fontWeight: s.bold ? "600" : undefined }}>
                {s.text}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Input row */}
      <div className="flex items-center px-3 pb-3 pt-1 shrink-0 border-t border-white/[0.05]">
        {PROMPT.map((s, i) => (
          <span key={i} style={{ color: s.color, fontWeight: s.bold ? "600" : undefined, whiteSpace: "pre" }}>
            {s.text}
          </span>
        ))}
        <input
          ref={inputRef}
          className="flex-1 bg-transparent text-white/88 outline-none caret-[#9b59b6] terminal-text"
          style={{ fontSize: "13px" }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
        />
      </div>
    </div>
  );
}
