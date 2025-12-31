// Terminal - Componente dev-friendly para emulação x86 com v86
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
  type TerminalPreset,
  type TerminalOverlayProps,
  type TerminalControlsProps,
} from "./Terminal";

// Re-export V86Controller for advanced usage
export { V86Controller } from "../v86/V86Controller";
