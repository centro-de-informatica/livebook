// Terminal - Componente dev-friendly para emulacao x86 com v86
export {
  // Componente principal
  Terminal,
  Terminal as default,
  
  // Componentes auxiliares
  TerminalOverlay,
  TerminalControls,
  
  // Presets
  AlpineTerminal,
  BuildrootTerminal,
  Linux4Terminal,
  
  // Hooks
  useTerminal,
  useSerialOutput,
  
  // Types
  type TerminalProps,
  type TerminalConfig,
  type TerminalCallbacks,
  type TerminalDisplayConfig,
  type TerminalNetworkConfig,
  type TerminalFilesystemConfig,
  type TerminalPreset,
  type TerminalOverlayProps,
  type TerminalControlsProps,
} from "./Terminal";

// Demo component (use em .astro com client:only="react")
export { TerminalDemo } from "./TerminalDemo";

// Re-export V86Controller e tipos para DX
export {
  V86Controller,
  type WaitForScreenOptions,
  type ExecuteCommandOptions,
  type DownloadProgress,
} from "../v86/V86Controller";

// Re-export v86 types
export type { V86, V86Options, V86Image, Event as V86Event } from "../../types/v86";
