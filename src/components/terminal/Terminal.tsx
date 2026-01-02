import { useState, useEffect, useLayoutEffect, useRef, useCallback, type ReactNode, type CSSProperties } from "react";
import { V86Emulator, type V86EmulatorConfig, type V86ImagePreset, type V86NetworkConfig, type V86FilesystemConfig } from "../v86-wrapper/V86Emulator";
import { V86Controller, type WaitForScreenOptions, type ExecuteCommandOptions } from "../v86-wrapper/V86Controller";
import type { V86 } from "../../types/v86";

// ============================================
// TIPOS E INTERFACES
// ============================================

export type TerminalPreset = V86ImagePreset;

export interface TerminalNetworkConfig extends V86NetworkConfig {}

export interface TerminalFilesystemConfig extends V86FilesystemConfig {}

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
  
  // Boot options (quando nao usar preset)
  /** URL da imagem de CD-ROM */
  cdromUrl?: string;
  /** URL da imagem bzimage (kernel) */
  bzimageUrl?: string;
  /** URL da imagem initrd */
  initrdUrl?: string;
  /** URL da imagem de HD */
  hdaUrl?: string;
  /** URL da segunda imagem de HD */
  hdbUrl?: string;
  /** URL da imagem de disquete */
  fdaUrl?: string;
  /** Linha de comando do kernel */
  cmdline?: string;
  /** Estado inicial salvo */
  initialStateUrl?: string;
  /** Preservar MAC do state */
  preserveMacFromState?: boolean;

  // Recursos
  /** Tamanho da memoria em MB (padrao: 128) */
  memoryMB?: number;
  /** Tamanho da memoria VGA em MB (padrao: 8) */
  vgaMemoryMB?: number;

  // Comportamento
  /** Iniciar automaticamente (padrao: true) */
  autostart?: boolean;
  /** Habilitar teclado (padrao: true) */
  enableKeyboard?: boolean;
  /** Habilitar mouse (padrao: true) */
  enableMouse?: boolean;
  /** Habilitar ACPI */
  acpi?: boolean;
  /** Habilitar virtio console */
  virtioConsole?: boolean;
  /** Habilitar virtio balloon */
  virtioBalloon?: boolean;
  /** Desabilitar JIT */
  disableJit?: boolean;
  /** Buscar bzimage/initrd do filesystem */
  bzimageInitrdFromFilesystem?: boolean;

  // Networking
  /** Configuracao de rede */
  network?: TerminalNetworkConfig;

  // Display
  /** Configuracao visual */
  display?: TerminalDisplayConfig;

  // Filesystem 9p
  /** Configuracao do filesystem 9p */
  filesystem?: TerminalFilesystemConfig;

  // Paths personalizados (BIOS e imagens)
  /** Path da BIOS (padrao: /v86/bios/seabios.bin) */
  biosUrl?: string;
  /** Path da VGA BIOS (padrao: /v86/bios/vgabios.bin) */
  vgaBiosUrl?: string;
}

export interface TerminalCallbacks {
  /** Chamado quando o emulador esta pronto */
  onReady?: (controller: V86Controller) => void;
  /** Chamado quando o emulador inicia */
  onStarted?: () => void;
  /** Chamado quando o emulador para */
  onStopped?: () => void;
  /** Chamado a cada caractere de saida serial */
  onSerialOutput?: (char: string) => void;
  /** Chamado a cada caractere na tela (modo texto) */
  onScreenChar?: (data: [number, number, number, number, number]) => void;
  /** Chamado quando o tamanho da tela muda [cols, rows, ???] */
  onScreenSetSize?: (data: [number, number, number]) => void;
  /** Chamado quando o mouse e habilitado pelo guest */
  onMouseEnable?: (enabled: boolean) => void;
  /** Chamado durante downloads */
  onDownloadProgress?: (progress: { file_name: string; loaded: number; total: number }) => void;
  /** Chamado em caso de erro de download */
  onDownloadError?: (error: { file_name: string; error: Error }) => void;
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
  initrdUrl,
  hdaUrl,
  hdbUrl,
  fdaUrl,
  cmdline,
  initialStateUrl,
  preserveMacFromState,
  memoryMB = 128,
  vgaMemoryMB = 8,
  autostart = true,
  enableKeyboard = true,
  enableMouse = true,
  acpi,
  virtioConsole,
  virtioBalloon,
  disableJit,
  bzimageInitrdFromFilesystem,
  network,
  filesystem,
  display = {},
  biosUrl,
  vgaBiosUrl,

  // Callbacks
  onReady,
  onStarted,
  onStopped,
  onSerialOutput,
  onScreenChar,
  onScreenSetSize,
  onMouseEnable,
  onDownloadProgress,
  onDownloadError,
  onError,

  // React props
  className,
  style,
  children,
  id,
}: TerminalProps) {
  const [controller] = useState(() => new V86Controller());
  const [error, setError] = useState<Error | null>(null);

  // Refs para callbacks (evita stale closures)
  // Inicializadas com os valores atuais das props
  const onReadyRef = useRef(onReady);
  const onStartedRef = useRef(onStarted);
  const onStoppedRef = useRef(onStopped);
  const onSerialOutputRef = useRef(onSerialOutput);
  const onScreenCharRef = useRef(onScreenChar);
  const onScreenSetSizeRef = useRef(onScreenSetSize);
  const onMouseEnableRef = useRef(onMouseEnable);
  const onDownloadProgressRef = useRef(onDownloadProgress);
  const onDownloadErrorRef = useRef(onDownloadError);
  const onErrorRef = useRef(onError);

  // Atualiza refs ANTES de qualquer render (useLayoutEffect)
  // Isso garante que as refs estejam atualizadas antes dos effects filhos rodarem
  useLayoutEffect(() => {
    onReadyRef.current = onReady;
    onStartedRef.current = onStarted;
    onStoppedRef.current = onStopped;
    onSerialOutputRef.current = onSerialOutput;
    onScreenCharRef.current = onScreenChar;
    onScreenSetSizeRef.current = onScreenSetSize;
    onMouseEnableRef.current = onMouseEnable;
    onDownloadProgressRef.current = onDownloadProgress;
    onDownloadErrorRef.current = onDownloadError;
    onErrorRef.current = onError;
  });

  // Merge display config com defaults
  const displayConfig = { ...DEFAULT_DISPLAY, ...display };

  // Converter config para V86EmulatorConfig (filtrando undefined)
  const v86Config: V86EmulatorConfig = Object.fromEntries(
    Object.entries({
      preset,
      cdromUrl,
      bzimageUrl,
      initrdUrl,
      hdaUrl,
      hdbUrl,
      fdaUrl,
      cmdline,
      initialStateUrl,
      preserveMacFromState,
      memorySize: memoryMB * 1024 * 1024,
      vgaMemorySize: vgaMemoryMB * 1024 * 1024,
      autostart,
      acpi,
      virtioConsole,
      virtioBalloon,
      disableJit,
      bzimageInitrdFromFilesystem,
      network,
      filesystem,
      biosUrl,
      vgaBiosUrl,
    }).filter(([_, v]) => v !== undefined)
  ) as V86EmulatorConfig;

  // Handler quando o emulador esta pronto
  const handleReady = useCallback((emulator: V86) => {
    try {
      controller.attach(emulator);
      
      // Aplicar configuracoes
      if (!enableKeyboard) {
        controller.setKeyboardEnabled(false);
      }
      if (!enableMouse) {
        controller.setMouseEnabled(false);
      }
      if (displayConfig.scale !== 1) {
        controller.setScreenScale(displayConfig.scale, displayConfig.scale);
      }

      onReadyRef.current?.(controller);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onErrorRef.current?.(error);
    }
  }, [controller, enableKeyboard, enableMouse, displayConfig.scale]);

  // Handler de started
  const handleStarted = useCallback(() => {
    onStartedRef.current?.();
  }, []);

  // Handler de stopped
  const handleStopped = useCallback(() => {
    onStoppedRef.current?.();
  }, []);

  // Handler de screen char
  const handleScreenChar = useCallback((data: [number, number, number, number, number]) => {
    onScreenCharRef.current?.(data);
  }, []);

  // Handler de output serial
  const handleSerialOutput = useCallback((char: string) => {
    onSerialOutputRef.current?.(char);
  }, []);

  // Handler de tamanho de tela
  const handleScreenSetSize = useCallback((data: [number, number, number]) => {
    onScreenSetSizeRef.current?.(data);
  }, []);

  // Handler de habilitacao do mouse
  const handleMouseEnable = useCallback((enabled: boolean) => {
    onMouseEnableRef.current?.(enabled);
  }, []);

  // Handler de progresso de download
  const handleDownloadProgress = useCallback((progress: { file_name: string; loaded: number; total: number }) => {
    onDownloadProgressRef.current?.(progress);
  }, []);

  // Handler de erro de download
  const handleDownloadError = useCallback((error: { file_name: string; error: Error }) => {
    onDownloadErrorRef.current?.(error);
  }, []);

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
        onStarted={handleStarted}
        onStopped={handleStopped}
        onSerialOutput={handleSerialOutput}
        onScreenPutChar={handleScreenChar}
        onScreenSetSize={handleScreenSetSize}
        onMouseEnable={handleMouseEnable}
        onDownloadProgress={handleDownloadProgress}
        onDownloadError={handleDownloadError}
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
  const [isRunning, setIsRunning] = useState(false);

  const handleReady = useCallback((controller: V86Controller) => {
    controllerRef.current = controller;
    setIsReady(true);
    setIsRunning(controller.isRunning());
  }, []);

  const sendCommand = useCallback(async (command: string, options?: ExecuteCommandOptions) => {
    if (!controllerRef.current) {
      throw new Error("Terminal not ready");
    }
    return controllerRef.current.executeCommand(command, options);
  }, []);

  const executeAndWait = useCallback(async (
    command: string,
    waitFor: string | RegExp,
    options?: WaitForScreenOptions
  ) => {
    if (!controllerRef.current) {
      throw new Error("Terminal not ready");
    }
    return controllerRef.current.executeAndWait(command, waitFor, options);
  }, []);

  const sendText = useCallback((text: string) => {
    controllerRef.current?.sendSerial(text);
  }, []);

  const sendKeyboardText = useCallback((text: string) => {
    controllerRef.current?.sendKeyboardText(text);
  }, []);

  const sendKeys = useCallback((keys: number[]) => {
    controllerRef.current?.sendKeys(keys);
  }, []);

  const waitForScreenText = useCallback(async (
    text: string | RegExp,
    options?: WaitForScreenOptions
  ) => {
    if (!controllerRef.current) {
      throw new Error("Terminal not ready");
    }
    return controllerRef.current.waitForScreenText(text, options);
  }, []);

  const waitForSerialOutput = useCallback(async (
    expected: string | RegExp,
    options?: WaitForScreenOptions
  ) => {
    if (!controllerRef.current) {
      throw new Error("Terminal not ready");
    }
    return controllerRef.current.waitForSerialOutput(expected, options);
  }, []);

  const getScreenText = useCallback(() => {
    return controllerRef.current?.getScreenText() ?? "";
  }, []);

  const saveState = useCallback(async () => {
    if (!controllerRef.current) {
      throw new Error("Terminal not ready");
    }
    return controllerRef.current.saveState();
  }, []);

  const loadState = useCallback(async (state: ArrayBuffer) => {
    if (!controllerRef.current) {
      throw new Error("Terminal not ready");
    }
    return controllerRef.current.loadState(state);
  }, []);

  const restart = useCallback(async () => {
    if (!controllerRef.current) {
      throw new Error("Terminal not ready");
    }
    controllerRef.current.restart();
    setIsRunning(true);
  }, []);

  const stop = useCallback(async () => {
    if (!controllerRef.current) {
      throw new Error("Terminal not ready");
    }
    await controllerRef.current.stop();
    setIsRunning(false);
  }, []);

  const run = useCallback(async () => {
    if (!controllerRef.current) {
      throw new Error("Terminal not ready");
    }
    controllerRef.current.run();
    setIsRunning(true);
  }, []);

  const goFullscreen = useCallback(() => {
    controllerRef.current?.goFullscreen();
  }, []);

  const makeScreenshot = useCallback(() => {
    return controllerRef.current?.makeScreenshot() ?? null;
  }, []);

  return {
    controller: controllerRef,
    isReady,
    isRunning,
    handleReady,
    // Execution
    sendCommand,
    executeAndWait,
    sendText,
    sendKeyboardText,
    sendKeys,
    // Waiting
    waitForScreenText,
    waitForSerialOutput,
    // Screen
    getScreenText,
    goFullscreen,
    makeScreenshot,
    // State
    saveState,
    loadState,
    // Control
    restart,
    stop,
    run,
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
