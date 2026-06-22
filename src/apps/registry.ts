import {
  Terminal, FolderOpen, Activity, Settings, Calculator,
  Calendar, FileText, StickyNote, CheckSquare, Clock,
  ScanLine, KeyRound, Hash, Code, Globe,
  Shield, Search, Lock, Fingerprint, Bug,
  Radio, BugPlay,
  Globe2, Mail, MessageSquare, FolderSync, Rss,
  Network, ShieldCheck, Magnet, FileText as FileTextIcon,
  Table, BookOpen, Palette, Users, Bookmark,
  Music, Video, Image, Camera, Mic,
  Monitor, Clapperboard, Smartphone, Braces, FileCode,
  Regex, BookMarked, GitBranch, Send, Pipette,
  Type, QrCode, GitCompare, Gamepad2, Puzzle,
  Grid3X3, Bomb, Swords, Trophy, BrainCircuit,
  Workflow, GitGraph, Sparkles, Cpu,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AppRegistryEntry {
  id: string;
  name: string;
  icon: LucideIcon;
  category: string;
  defaultWidth: number;
  defaultHeight: number;
  description: string;
}

export const APP_CATEGORIES = [
  "All", "System", "Security", "Internet", "Productivity", "Media", "DevTools", "Games", "Agent"
];

export const APP_REGISTRY: AppRegistryEntry[] = [
  // System
  { id: "terminal", name: "Terminal", icon: Terminal, category: "System", defaultWidth: 700, defaultHeight: 450, description: "Command line interface" },
  { id: "files", name: "Files", icon: FolderOpen, category: "System", defaultWidth: 800, defaultHeight: 500, description: "File manager" },
  { id: "monitor", name: "System Monitor", icon: Activity, category: "System", defaultWidth: 700, defaultHeight: 500, description: "Monitor CPU, RAM, and processes" },
  { id: "settings", name: "Settings", icon: Settings, category: "System", defaultWidth: 700, defaultHeight: 500, description: "System settings" },
  { id: "calc", name: "Calculator", icon: Calculator, category: "System", defaultWidth: 320, defaultHeight: 480, description: "Scientific calculator" },
  { id: "calendar", name: "Calendar", icon: Calendar, category: "System", defaultWidth: 400, defaultHeight: 450, description: "Calendar and events" },
  { id: "editor", name: "Text Editor", icon: FileText, category: "System", defaultWidth: 600, defaultHeight: 450, description: "Text editor" },
  { id: "notes", name: "Sticky Notes", icon: StickyNote, category: "System", defaultWidth: 250, defaultHeight: 280, description: "Quick notes" },
  { id: "todo", name: "To-Do List", icon: CheckSquare, category: "System", defaultWidth: 380, defaultHeight: 500, description: "Task management" },
  { id: "clock", name: "Clock", icon: Clock, category: "System", defaultWidth: 350, defaultHeight: 400, description: "Clock, alarms, timer" },

  // Security
  { id: "nmap", name: "Nmap Scanner", icon: ScanLine, category: "Security", defaultWidth: 700, defaultHeight: 450, description: "Port scanner" },
  { id: "passgen", name: "Password Gen", icon: KeyRound, category: "Security", defaultWidth: 450, defaultHeight: 350, description: "Password generator" },
  { id: "hashgen", name: "Hash Generator", icon: Hash, category: "Security", defaultWidth: 550, defaultHeight: 400, description: "MD5, SHA hash tool" },
  { id: "base64", name: "Base64 Tool", icon: Code, category: "Security", defaultWidth: 550, defaultHeight: 400, description: "Base64 encode/decode" },
  { id: "attackmap", name: "Attack Map", icon: Globe, category: "Security", defaultWidth: 800, defaultHeight: 550, description: "Cyber attack map" },
  { id: "sslscan", name: "SSL Scanner", icon: Shield, category: "Security", defaultWidth: 600, defaultHeight: 450, description: "SSL/TLS scanner" },
  { id: "whois", name: "WHOIS Lookup", icon: Search, category: "Security", defaultWidth: 600, defaultHeight: 450, description: "Domain WHOIS lookup" },
  { id: "dnslookup", name: "DNS Lookup", icon: Lock, category: "Security", defaultWidth: 550, defaultHeight: 400, description: "DNS record lookup" },
  { id: "maclookup", name: "MAC Lookup", icon: Fingerprint, category: "Security", defaultWidth: 450, defaultHeight: 300, description: "MAC address lookup" },
  { id: "cvelookup", name: "CVE Lookup", icon: Bug, category: "Security", defaultWidth: 650, defaultHeight: 500, description: "CVE database search" },
  { id: "subfinder", name: "Subdomain Finder", icon: Radio, category: "Security", defaultWidth: 600, defaultHeight: 450, description: "Subdomain enumeration" },
  { id: "xssscan", name: "XSS Scanner", icon: BugPlay, category: "Security", defaultWidth: 700, defaultHeight: 480, description: "XSS vulnerability scanner" },

  // Internet
  { id: "browser", name: "Web Browser", icon: Globe2, category: "Internet", defaultWidth: 900, defaultHeight: 600, description: "Web browser" },
  { id: "email", name: "Email Client", icon: Mail, category: "Internet", defaultWidth: 900, defaultHeight: 600, description: "Email client" },
  { id: "chat", name: "IRC Chat", icon: MessageSquare, category: "Internet", defaultWidth: 700, defaultHeight: 500, description: "IRC chat client" },
  { id: "ftp", name: "FTP Client", icon: FolderSync, category: "Internet", defaultWidth: 800, defaultHeight: 500, description: "FTP client" },
  { id: "rss", name: "RSS Reader", icon: Rss, category: "Internet", defaultWidth: 800, defaultHeight: 550, description: "RSS feed reader" },
  { id: "nettools", name: "Network Tools", icon: Network, category: "Internet", defaultWidth: 600, defaultHeight: 450, description: "Ping, traceroute" },
  { id: "vpn", name: "VPN Client", icon: ShieldCheck, category: "Internet", defaultWidth: 450, defaultHeight: 400, description: "VPN connection" },
  { id: "torrent", name: "Torrent Client", icon: Magnet, category: "Internet", defaultWidth: 800, defaultHeight: 500, description: "Torrent client" },

  // Productivity
  { id: "notesapp", name: "Notes", icon: FileTextIcon, category: "Productivity", defaultWidth: 500, defaultHeight: 450, description: "Rich text notes" },
  { id: "spreadsheet", name: "Spreadsheet", icon: Table, category: "Productivity", defaultWidth: 900, defaultHeight: 550, description: "Spreadsheet editor" },
  { id: "docviewer", name: "Document Viewer", icon: BookOpen, category: "Productivity", defaultWidth: 700, defaultHeight: 550, description: "PDF document viewer" },
  { id: "passmanager", name: "Password Manager", icon: Lock, category: "Productivity", defaultWidth: 550, defaultHeight: 450, description: "Password vault" },
  { id: "whiteboard", name: "Whiteboard", icon: Palette, category: "Productivity", defaultWidth: 800, defaultHeight: 600, description: "Drawing canvas" },
  { id: "contacts", name: "Contacts", icon: Users, category: "Productivity", defaultWidth: 550, defaultHeight: 500, description: "Contact manager" },
  { id: "bookmarks", name: "Bookmarks", icon: Bookmark, category: "Productivity", defaultWidth: 600, defaultHeight: 450, description: "Bookmark manager" },

  // Media
  { id: "music", name: "Music Player", icon: Music, category: "Media", defaultWidth: 400, defaultHeight: 550, description: "Music player" },
  { id: "video", name: "Video Player", icon: Video, category: "Media", defaultWidth: 640, defaultHeight: 400, description: "Video player" },
  { id: "images", name: "Image Viewer", icon: Image, category: "Media", defaultWidth: 700, defaultHeight: 500, description: "Image viewer" },
  { id: "photoedit", name: "Photo Editor", icon: Camera, category: "Media", defaultWidth: 900, defaultHeight: 600, description: "Photo editor" },
  { id: "recorder", name: "Voice Recorder", icon: Mic, category: "Media", defaultWidth: 400, defaultHeight: 300, description: "Audio recorder" },
  { id: "screenrec", name: "Screen Recorder", icon: Monitor, category: "Media", defaultWidth: 500, defaultHeight: 350, description: "Screen capture" },
  { id: "converter", name: "Media Converter", icon: Clapperboard, category: "Media", defaultWidth: 550, defaultHeight: 400, description: "Format converter" },
  { id: "camera", name: "Camera", icon: Smartphone, category: "Media", defaultWidth: 640, defaultHeight: 480, description: "Camera app" },

  // DevTools
  { id: "codeeditor", name: "Code Editor", icon: FileCode, category: "DevTools", defaultWidth: 800, defaultHeight: 600, description: "Code editor" },
  { id: "jsonfmt", name: "JSON Formatter", icon: Braces, category: "DevTools", defaultWidth: 700, defaultHeight: 500, description: "JSON formatter" },
  { id: "regex", name: "Regex Tester", icon: Regex, category: "DevTools", defaultWidth: 700, defaultHeight: 500, description: "Regular expression tester" },
  { id: "markdown", name: "Markdown", icon: BookMarked, category: "DevTools", defaultWidth: 800, defaultHeight: 600, description: "Markdown preview" },
  { id: "git", name: "Git Client", icon: GitBranch, category: "DevTools", defaultWidth: 900, defaultHeight: 600, description: "Git interface" },
  { id: "apitest", name: "API Tester", icon: Send, category: "DevTools", defaultWidth: 800, defaultHeight: 550, description: "API testing tool" },
  { id: "colorpick", name: "Color Picker", icon: Pipette, category: "DevTools", defaultWidth: 400, defaultHeight: 450, description: "Color picker" },
  { id: "ascii", name: "ASCII Art", icon: Type, category: "DevTools", defaultWidth: 600, defaultHeight: 450, description: "ASCII art generator" },
  { id: "qrcode", name: "QR Code", icon: QrCode, category: "DevTools", defaultWidth: 450, defaultHeight: 400, description: "QR code generator" },
  { id: "diff", name: "Diff Checker", icon: GitCompare, category: "DevTools", defaultWidth: 800, defaultHeight: 500, description: "Text diff tool" },

  // Games
  { id: "snake", name: "Snake", icon: Gamepad2, category: "Games", defaultWidth: 400, defaultHeight: 450, description: "Snake game" },
  { id: "tetris", name: "Tetris", icon: Puzzle, category: "Games", defaultWidth: 350, defaultHeight: 550, description: "Tetris blocks" },
  { id: "g2048", name: "2048", icon: Grid3X3, category: "Games", defaultWidth: 400, defaultHeight: 500, description: "2048 puzzle" },
  { id: "mines", name: "Minesweeper", icon: Bomb, category: "Games", defaultWidth: 400, defaultHeight: 450, description: "Minesweeper" },
  { id: "tictactoe", name: "Tic-Tac-Toe", icon: Grid3X3, category: "Games", defaultWidth: 400, defaultHeight: 450, description: "Tic-tac-toe" },
  { id: "chess", name: "Chess", icon: Swords, category: "Games", defaultWidth: 520, defaultHeight: 560, description: "Chess game" },
  { id: "pong", name: "Pong", icon: Trophy, category: "Games", defaultWidth: 600, defaultHeight: 400, description: "Pong classic" },
  { id: "sudoku", name: "Sudoku", icon: BrainCircuit, category: "Games", defaultWidth: 450, defaultHeight: 500, description: "Sudoku puzzle" },

  // Agent (AetherClaw)
  { id: "agentchat", name: "Agent Chat", icon: Sparkles, category: "Agent", defaultWidth: 700, defaultHeight: 550, description: "AetherClaw agent chat" },
  { id: "pipeline", name: "Pipeline", icon: Workflow, category: "Agent", defaultWidth: 800, defaultHeight: 550, description: "CI/CD agent pipeline" },
  { id: "cottrace", name: "CoT Trace", icon: GitGraph, category: "Agent", defaultWidth: 800, defaultHeight: 550, description: "Chain-of-thought trace" },
  { id: "agentmon", name: "Agent Monitor", icon: Cpu, category: "Agent", defaultWidth: 800, defaultHeight: 500, description: "Agent health monitor" },
];

export function getAppById(id: string): AppRegistryEntry | undefined {
  return APP_REGISTRY.find((app) => app.id === id);
}

export function getAppsByCategory(category: string): AppRegistryEntry[] {
  if (category === "All") return APP_REGISTRY;
  return APP_REGISTRY.filter((app) => app.category === category);
}
