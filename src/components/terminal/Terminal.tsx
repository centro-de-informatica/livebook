import { useState, useEffect, useRef, useCallback, type ReactNode, type CSSProperties } from "react";
import { V86Emulator, type V86EmulatorConfig, type V86ImagePreset } from "../v86/V86Emulator";
import { V86Controller } from "../v86/V86Controller";
import type { V86 } from "../../types/v86";

// ============================================
// TIPOS E INTERFACES
// ============================================

export type TerminalPreset = V86ImagePreset;

export interface TerminalNetworkConfig {
  /** Tipo de dispositivo de rede */
  type?: "ne2k" | "virtio";
  /** URL do relay websocket para networking */
  relayUrl?: string;
  /** Usar fetch para networking (padrão: true quando não há relayUrl) */
  useFetch?: boolean;
}

export interface TerminalDisplayConfig {
  /** Largura do container */
  width?: string | number;
  /** Altura do container */
  height?: string | number;
  /** Cor de fundo do terminal */
  backgroundColor?: string;
  /** Cor do texto */
  textColor?: string;
  /** Fonte do terminal */
  fontFamily?: string;
  /** Tamanho da fonte */
  fontSize?: string | number;
  /** Escala da tela (padrão: 1) */
  scale?: number;
  /** Mostrar borda */
  showBorder?: boolean;
  /** Border radius */
  borderRadius?: string | number;
}

export interface TerminalConfig {
  /** Preset de imagem (alpine, buildroot, linux4) */
  preset?: TerminalPreset;
  
  // Boot options (quando não usar preset)
  /** URL da imagem de CD-ROM */
  cdromUrl?: string;
  /** URL da imagem bzimage (kernel) */
  bzimageUrl?: string;
  /** URL da imagem de HD */
  hdaUrl?: string;
  /** Linha de comando do kernel */
  cmdline?: string;
  /** Estado inicial salvo */
  initialStateUrl?: string;

  // Recursos
  /** Tamanho da memória em MB (padrão: 128) */
  memoryMB?: number;
  /** Tamanho da memória VGA em MB (padrão: 8) */
  vgaMemoryMB?: number;

  // Comportamento
  /** Iniciar automaticamente (padrão: true) */
  autostart?: boolean;
  /** Habilitar teclado (padrão: true) */
  enableKeyboard?: boolean;
  /** Habilitar mouse (padrão: true) */
  enableMouse?: boolean;
  /** Habilitar ACPI */
  acpi?: boolean;

  // Networking
  /** Configuração de rede */
  network?: TerminalNetworkConfig;

  // Display
  /** Configuração visual */
  display?: TerminalDisplayConfig;

  // Filesystem 9p
  /** URL base do filesystem 9p */
  filesystemBaseUrl?: string;
  /** JSON do filesystem 9p */
  filesystemBasefs?: string;

  // Paths personalizados (BIOS e imagens)
  /** Path da BIOS (padrão: /v86/bios/seabios.bin) */
  biosUrl?: string;
  /** Path da VGA BIOS (padrão: /v86/bios/vgabios.bin) */
  vgaBiosUrl?: string;
}

export interface TerminalCallbacks {
  /** Chamado quando o emulador está pronto */
  onReady?: (controller: V86Controller) => void;
  /** Chamado quando o emulador inicia */
  onStarted?: () => void;
  /** Chamado quando o emulador para */
  onStopped?: () => void;
  /** Chamado a cada caractere de saída serial */
  onSerialOutput?: (char: string) => void;
  /** Chamado a cada caractere na tela (modo texto) */
  onScreenChar?: (data: [number, number, number, number, number]) => void;
  /** Chamado em caso de erro */
  onError?: (error: Error) => void;
}

export interface TerminalProps extends TerminalConfig, TerminalCallbacks {
  /** Classe CSS adicional */
  className?: string;
  /** Estilo inline adicional */
  style?: CSSProperties;
  /** Conteúdo filho (overlay) */
  children?: ReactNode;
  /** ID do elemento */
  id?: string;
}

// ============================================
// CONSTANTES E DEFAULTS
// ============================================

const DEFAULT_DISPLAY: Required<TerminalDisplayConfig> = {
  width: "100%",
  height: "400px",
  backgroundColor: "#000",
  textColor: "#fff",
  fontFamily: "monospace",
  fontSize: 14,
  scale: 1,
  showBorder: true,
  borderRadius: 4,
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * Terminal - Componente React para emulação x86 com v86
 * 
 * @example
 * // Uso simples com preset
 * <Terminal preset="alpine" onReady={(ctrl) => console.log("Pronto!", ctrl)} />
 * 
 * @example
 * // Configuração customizada
 * <Terminal
 *   cdromUrl="/images/custom.iso"
 *   memoryMB={256}
 *   display={{ height: 600, scale: 1.5 }}
 *   onSerialOutput={(char) => console.log(char)}
 * />
 * 
 * @example
 * // Com networking
 * <Terminal
 *   preset="buildroot"
 *   network={{ type: "virtio", useFetch: true }}
 * />
 */
export function Terminal({
  // Config
  preset,
  cdromUrl,
  bzimageUrl,
  hdaUrl,
  cmdline,
  memoryMB = 128,
  vgaMemoryMB = 8,
  autostart = true,
  enableKeyboard = true,
  enableMouse = true,
  display = {},
  biosUrl,
  vgaBiosUrl,

  // Callbacks
  onReady,
  onStarted,
  onStopped,
  onSerialOutput,
  onScreenChar,
  onError,

  // React props
  className,
  style,
  children,
  id,
}: TerminalProps) {
  const [controller] = useState(() => new V86Controller());
  const [error, setError] = useState<Error | null>(null);

  // Merge display config com defaults
  const displayConfig = { ...DEFAULT_DISPLAY, ...display };

  // Converter config para V86EmulatorConfig (filtrando undefined)
  const v86Config: V86EmulatorConfig = Object.fromEntries(
    Object.entries({
      preset,
      cdromUrl,
      bzimageUrl,
      hdaUrl,
      cmdline,
      memorySize: memoryMB * 1024 * 1024,
      vgaMemorySize: vgaMemoryMB * 1024 * 1024,
      autostart,
      biosUrl,
      vgaBiosUrl,
    }).filter(([_, v]) => v !== undefined)
  ) as V86EmulatorConfig;

  // Handler quando o emulador está pronto
  const handleReady = useCallback((emulator: V86) => {
    try {
      controller.attach(emulator);
      
      // Aplicar configurações
      if (!enableKeyboard) {
        controller.setKeyboardEnabled(false);
      }
      if (!enableMouse) {
        controller.setMouseEnabled(false);
      }
      if (displayConfig.scale !== 1) {
        controller.setScreenScale(displayConfig.scale, displayConfig.scale);
      }

      onReady?.(controller);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    }
  }, [controller, enableKeyboard, enableMouse, displayConfig.scale, onReady, onError]);

  // Handler de output serial
  const handleSerialOutput = useCallback((char: string) => {
    onSerialOutput?.(char);
  }, [onSerialOutput]);

  // Cleanup
  useEffect(() => {
    return () => {
      controller.destroy().catch(console.error);
    };
  }, [controller]);

  // Estilos do container
  const containerStyle: CSSProperties = {
    width: displayConfig.width,
    height: displayConfig.height,
    backgroundColor: displayConfig.backgroundColor,
    color: displayConfig.textColor,
    fontFamily: displayConfig.fontFamily,
    fontSize: typeof displayConfig.fontSize === "number" 
      ? `${displayConfig.fontSize}px` 
      : displayConfig.fontSize,
    border: displayConfig.showBorder ? "1px solid #333" : "none",
    borderRadius: typeof displayConfig.borderRadius === "number"
      ? `${displayConfig.borderRadius}px`
      : displayConfig.borderRadius,
    overflow: "hidden",
    position: "relative",
    ...style,
  };

  if (error) {
    return (
      <div id={id} className={className} style={{ ...containerStyle, padding: 20 }}>
        <div style={{ color: "#ff6b6b" }}>
          <strong>Erro ao inicializar terminal:</strong>
          <pre style={{ marginTop: 10, fontSize: 12 }}>{error.message}</pre>
        </div>
      </div>
    );
  }

  return (
    <div id={id} className={className} style={containerStyle}>
      <V86Emulator
        config={v86Config}
        onReady={handleReady}
        onStarted={onStarted}
        onStopped={onStopped}
        onSerialOutput={handleSerialOutput}
        onScreenPutChar={onScreenChar}
      />
      {children}
    </div>
  );
}

// ============================================
// HOOKS UTILITÁRIOS
// ============================================

/**
 * Hook para controlar o terminal programaticamente
 * 
 * @example
 * const { controller, isReady, sendCommand } = useTerminal();
 * 
 * // Usar em onReady do Terminal
 * <Terminal onReady={(ctrl) => controller.current = ctrl} />
 * 
 * // Depois usar
 * await sendCommand("ls -la");
 */
export function useTerminal() {
  const controllerRef = useRef<V86Controller | null>(null);
  const [isReady, setIsReady] = useState(false);

  const handleReady = useCallback((controller: V86Controller) => {
    controllerRef.current = controller;
    setIsReady(true);
  }, []);

  const sendCommand = useCallback(async (command: string, options?: { timeout?: number }) => {
    if (!controllerRef.current) {
      throw new Error("Terminal not ready");
    }
    return controllerRef.current.executeCommand(command, options);
  }, []);

  const sendText = useCallback((text: string) => {
    controllerRef.current?.sendSerial(text);
  }, []);

  const sendKeyboardText = useCallback((text: string) => {
    controllerRef.current?.sendKeyboardText(text);
  }, []);

  return {
    controller: controllerRef,
    isReady,
    handleReady,
    sendCommand,
    sendText,
    sendKeyboardText,
  };
}

/**
 * Hook para capturar output serial
 * 
 * @example
 * const { output, clear } = useSerialOutput();
 * <Terminal onSerialOutput={(char) => append(char)} />
 */
export function useSerialOutput(maxLength = 10000) {
  const [output, setOutput] = useState("");

  const append = useCallback((char: string) => {
    setOutput(prev => {
      const newOutput = prev + char;
      if (newOutput.length > maxLength) {
        return newOutput.slice(-maxLength);
      }
      return newOutput;
    });
  }, [maxLength]);

  const clear = useCallback(() => {
    setOutput("");
  }, []);

  return { output, append, clear };
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

export interface TerminalOverlayProps {
  children: ReactNode;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  style?: CSSProperties;
}

/**
 * Overlay para adicionar elementos sobre o terminal
 * 
 * @example
 * <Terminal>
 *   <TerminalOverlay position="top-right">
 *     <button onClick={() => controller.restart()}>Restart</button>
 *   </TerminalOverlay>
 * </Terminal>
 */
export function TerminalOverlay({ children, position = "top-right", style }: TerminalOverlayProps) {
  const positionStyles: Record<string, CSSProperties> = {
    "top-left": { top: 10, left: 10 },
    "top-right": { top: 10, right: 10 },
    "bottom-left": { bottom: 10, left: 10 },
    "bottom-right": { bottom: 10, right: 10 },
    "center": { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  };

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 10,
        ...positionStyles[position],
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export interface TerminalControlsProps {
  controller: V86Controller | null;
  showRestart?: boolean;
  showFullscreen?: boolean;
  showScreenshot?: boolean;
  showSaveState?: boolean;
  style?: CSSProperties;
}

/**
 * Controles básicos para o terminal
 * 
 * @example
 * const { controller, handleReady } = useTerminal();
 * 
 * <Terminal onReady={handleReady}>
 *   <TerminalOverlay position="top-right">
 *     <TerminalControls controller={controller.current} />
 *   </TerminalOverlay>
 * </Terminal>
 */
export function TerminalControls({
  controller,
  showRestart = true,
  showFullscreen = true,
  showScreenshot = true,
  showSaveState = true,
  style,
}: TerminalControlsProps) {
  const buttonStyle: CSSProperties = {
    padding: "4px 8px",
    marginLeft: 4,
    backgroundColor: "#333",
    color: "#fff",
    border: "1px solid #555",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12,
  };

  const handleSaveState = async () => {
    if (controller) {
      await controller.downloadState(`v86-state-${Date.now()}.bin`);
    }
  };

  return (
    <div style={{ display: "flex", gap: 4, ...style }}>
      {showRestart && (
        <button style={buttonStyle} onClick={() => controller?.restart()} title="Restart">
          🔄
        </button>
      )}
      {showFullscreen && (
        <button style={buttonStyle} onClick={() => controller?.goFullscreen()} title="Fullscreen">
          ⛶
        </button>
      )}
      {showScreenshot && (
        <button style={buttonStyle} onClick={() => controller?.makeScreenshot()} title="Screenshot">
          📷
        </button>
      )}
      {showSaveState && (
        <button style={buttonStyle} onClick={handleSaveState} title="Save State">
          💾
        </button>
      )}
    </div>
  );
}

// ============================================
// PRESETS PRONTOS
// ============================================

/**
 * Terminal Alpine Linux pré-configurado
 */
export function AlpineTerminal(props: Omit<TerminalProps, "preset">) {
  return <Terminal {...props} preset="alpine" />;
}

/**
 * Terminal Buildroot (BusyBox) pré-configurado - boot mais rápido
 */
export function BuildrootTerminal(props: Omit<TerminalProps, "preset">) {
  return <Terminal {...props} preset="buildroot" />;
}

/**
 * Terminal Linux4 pré-configurado - menor tamanho
 */
export function Linux4Terminal(props: Omit<TerminalProps, "preset">) {
  return <Terminal {...props} preset="linux4" />;
}

// Export default
export default Terminal;
