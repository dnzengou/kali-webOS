import { lazy, Suspense } from "react";
import type { AppRegistryEntry } from "./registry";
import { AppErrorBoundary, AppLoadingShimmer } from "@/components/os/AppErrorBoundary";

const TerminalApp = lazy(() => import("./Terminal"));
const FilesApp = lazy(() => import("./Files"));
const MonitorApp = lazy(() => import("./Monitor"));
const SettingsApp = lazy(() => import("./Settings"));
const CalculatorApp = lazy(() => import("./Calculator"));
const CalendarApp = lazy(() => import("./Calendar"));
const EditorApp = lazy(() => import("./Editor"));
const StickyNotesApp = lazy(() => import("./StickyNotes"));
const TodoApp = lazy(() => import("./Todo"));
const ClockApp = lazy(() => import("./Clock"));

const NmapApp = lazy(() => import("./security/Nmap"));
const PassGenApp = lazy(() => import("./security/PassGen"));
const HashGenApp = lazy(() => import("./security/HashGen"));
const Base64App = lazy(() => import("./security/Base64"));
const AttackMapApp = lazy(() => import("./security/AttackMap"));
const SSLScanApp = lazy(() => import("./security/SSLScan"));
const WhoisApp = lazy(() => import("./security/Whois"));
const DnsLookupApp = lazy(() => import("./security/DnsLookup"));
const MacLookupApp = lazy(() => import("./security/MacLookup"));
const CveLookupApp = lazy(() => import("./security/CveLookup"));
const SubFinderApp = lazy(() => import("./security/SubFinder"));
const XssScanApp = lazy(() => import("./security/XssScan"));

const BrowserApp = lazy(() => import("./internet/Browser"));
const EmailApp = lazy(() => import("./internet/Email"));
const ChatApp = lazy(() => import("./internet/Chat"));
const FtpApp = lazy(() => import("./internet/Ftp"));
const RssApp = lazy(() => import("./internet/Rss"));
const NetToolsApp = lazy(() => import("./internet/NetTools"));
const VpnApp = lazy(() => import("./internet/Vpn"));
const TorrentApp = lazy(() => import("./internet/Torrent"));

const NotesApp = lazy(() => import("./productivity/Notes"));
const SpreadsheetApp = lazy(() => import("./productivity/Spreadsheet"));
const DocViewerApp = lazy(() => import("./productivity/DocViewer"));
const PassManagerApp = lazy(() => import("./productivity/PassManager"));
const WhiteboardApp = lazy(() => import("./productivity/Whiteboard"));
const ContactsApp = lazy(() => import("./productivity/Contacts"));
const BookmarksApp = lazy(() => import("./productivity/Bookmarks"));

const MusicApp = lazy(() => import("./media/Music"));
const VideoApp = lazy(() => import("./media/Video"));
const ImageViewerApp = lazy(() => import("./media/ImageViewer"));
const PhotoEditorApp = lazy(() => import("./media/PhotoEditor"));
const RecorderApp = lazy(() => import("./media/Recorder"));
const ScreenRecApp = lazy(() => import("./media/ScreenRec"));
const ConverterApp = lazy(() => import("./media/Converter"));
const CameraApp = lazy(() => import("./media/Camera"));

const CodeEditorApp = lazy(() => import("./dev/CodeEditor"));
const JsonFmtApp = lazy(() => import("./dev/JsonFmt"));
const RegexApp = lazy(() => import("./dev/Regex"));
const MarkdownApp = lazy(() => import("./dev/Markdown"));
const GitApp = lazy(() => import("./dev/Git"));
const ApiTestApp = lazy(() => import("./dev/ApiTest"));
const ColorPickApp = lazy(() => import("./dev/ColorPick"));
const AsciiApp = lazy(() => import("./dev/Ascii"));
const QrCodeApp = lazy(() => import("./dev/QrCode"));
const DiffApp = lazy(() => import("./dev/Diff"));

const SnakeApp = lazy(() => import("./games/Snake"));
const TetrisApp = lazy(() => import("./games/Tetris"));
const G2048App = lazy(() => import("./games/G2048"));
const MinesApp = lazy(() => import("./games/Mines"));
const TicTacToeApp = lazy(() => import("./games/TicTacToe"));
const ChessApp = lazy(() => import("./games/Chess"));
const PongApp = lazy(() => import("./games/Pong"));
const SudokuApp = lazy(() => import("./games/Sudoku"));

const AutoClawDemoApp = lazy(() => import("./agent/AutoClawDemo"));
const AgentChatApp = lazy(() => import("./agent/AgentChat"));
const PipelineApp = lazy(() => import("./agent/Pipeline"));
const CoTTraceApp = lazy(() => import("./agent/CoTTrace"));
const AgentMonApp = lazy(() => import("./agent/AgentMon"));

const APP_COMPONENTS: Record<string, React.FC> = {
  terminal: TerminalApp,
  files: FilesApp,
  monitor: MonitorApp,
  settings: SettingsApp,
  calc: CalculatorApp,
  calendar: CalendarApp,
  editor: EditorApp,
  notes: StickyNotesApp,
  todo: TodoApp,
  clock: ClockApp,
  nmap: NmapApp,
  passgen: PassGenApp,
  hashgen: HashGenApp,
  base64: Base64App,
  attackmap: AttackMapApp,
  sslscan: SSLScanApp,
  whois: WhoisApp,
  dnslookup: DnsLookupApp,
  maclookup: MacLookupApp,
  cvelookup: CveLookupApp,
  subfinder: SubFinderApp,
  xssscan: XssScanApp,
  browser: BrowserApp,
  email: EmailApp,
  chat: ChatApp,
  ftp: FtpApp,
  rss: RssApp,
  nettools: NetToolsApp,
  vpn: VpnApp,
  torrent: TorrentApp,
  notesapp: NotesApp,
  spreadsheet: SpreadsheetApp,
  docviewer: DocViewerApp,
  passmanager: PassManagerApp,
  whiteboard: WhiteboardApp,
  contacts: ContactsApp,
  bookmarks: BookmarksApp,
  music: MusicApp,
  video: VideoApp,
  images: ImageViewerApp,
  photoedit: PhotoEditorApp,
  recorder: RecorderApp,
  screenrec: ScreenRecApp,
  converter: ConverterApp,
  camera: CameraApp,
  codeeditor: CodeEditorApp,
  jsonfmt: JsonFmtApp,
  regex: RegexApp,
  markdown: MarkdownApp,
  git: GitApp,
  apitest: ApiTestApp,
  colorpick: ColorPickApp,
  ascii: AsciiApp,
  qrcode: QrCodeApp,
  diff: DiffApp,
  snake: SnakeApp,
  tetris: TetrisApp,
  g2048: G2048App,
  mines: MinesApp,
  tictactoe: TicTacToeApp,
  chess: ChessApp,
  pong: PongApp,
  sudoku: SudokuApp,
  autoclaw: AutoClawDemoApp,
  agentchat: AgentChatApp,
  pipeline: PipelineApp,
  cottrace: CoTTraceApp,
  agentmon: AgentMonApp,
};

interface AppRendererProps {
  app: AppRegistryEntry;
}

export default function AppRenderer({ app }: AppRendererProps) {
  const Component = APP_COMPONENTS[app.id];
  if (!Component) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-white/40 select-none">
        <div className="text-4xl">🚧</div>
        <p className="text-[13px]">{app.name} — coming soon</p>
      </div>
    );
  }
  return (
    <AppErrorBoundary appName={app.name}>
      <Suspense fallback={<AppLoadingShimmer />}>
        <Component />
      </Suspense>
    </AppErrorBoundary>
  );
}
