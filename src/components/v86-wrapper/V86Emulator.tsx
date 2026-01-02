import { useEffect, useLayoutEffect, useRef, useCallback } from "react";
import type { V86 as V86Type, V86Options, V86Image } from "../../types/v86";
// Import the wasm file path from the v86 package for proper bundler resolution
import v86WasmUrl from "v86/build/v86.wasm?url";

// ============================================
// TIPOS E INTERFACES
// ============================================

export type V86ImagePreset = "alpine" | "buildroot" | "linux4";

/**
 * Configuracao de rede para o emulador
 */
export interface V86NetworkConfig {
  /** Tipo de dispositivo de rede */
  type?: "ne2k" | "virtio";
  /** URL do relay websocket */
  relay_url?: string;
  /** ID do dispositivo */
  id?: number;
  /** MAC do roteador */
  router_mac?: string;
  /** IP do roteador */
  router_ip?: string;
  /** IP da VM */
  vm_ip?: string;
  /** Habilitar masquerade */
  masquerade?: boolean;
  /** Metodo DNS */
  dns_method?: "static" | "doh";
  /** Servidor DoH */
  doh_server?: string;
  /** Proxy CORS */
  cors_proxy?: string;
  /** MTU */
  mtu?: number;
}

/**
 * Configuracao do filesystem 9p
 */
export interface V86FilesystemConfig {
  /** URL base dos arquivos */
  baseurl?: string;
  /** JSON do filesystem */
  basefs?: string;
  /** Handler customizado para requisicoes 9p */
  handle9p?: (reqbuf: Uint8Array, reply: (replybuf: Uint8Array) => void) => void;
  /** URL do proxy websocket */
  proxy_url?: string;
}

export interface V86EmulatorConfig {
  biosUrl?: string;
  vgaBiosUrl?: string;
  cdromUrl?: string;
  hdaUrl?: string;
  hdbUrl?: string;
  fdaUrl?: string;
  fdbUrl?: string;
  bzimageUrl?: string;
  initrdUrl?: string;
  cmdline?: string;
  memorySize?: number;
  vgaMemorySize?: number;
  autostart?: boolean;
  preset?: V86ImagePreset;
  /** Desabilitar speaker para evitar warning de AudioContext (padrao: true) */
  disableSpeaker?: boolean;
  /** Habilitar ACPI (experimental) */
  acpi?: boolean;
  /** Habilitar virtio console */
  virtioConsole?: boolean;
  /** Habilitar virtio balloon */
  virtioBalloon?: boolean;
  /** Configuracao de rede */
  network?: V86NetworkConfig;
  /** Configuracao do filesystem 9p */
  filesystem?: V86FilesystemConfig;
  /** URL do estado inicial */
  initialStateUrl?: string;
  /** Preservar MAC do state image */
  preserveMacFromState?: boolean;
  /** Boot order */
  bootOrder?: number;
  /** Desabilitar JIT */
  disableJit?: boolean;
  /** Buscar bzimage e initrd do filesystem */
  bzimageInitrdFromFilesystem?: boolean;
}

/**
 * Props do componente V86Emulator
 */
export interface V86EmulatorProps {
  config: V86EmulatorConfig;
  /** Chamado quando o emulador esta pronto para uso */
  onReady?: (emulator: V86Type) => void;
  /** Chamado quando o emulador comeca a executar */
  onStarted?: () => void;
  /** Chamado quando o emulador para */
  onStopped?: () => void;
  /** Chamado para cada byte de output serial */
  onSerialOutput?: (char: string) => void;
  /** Chamado para cada caractere na tela (modo texto) */
  onScreenPutChar?: (data: [number, number, number, number, number]) => void;
  /** Chamado quando o tamanho da tela muda */
  onScreenSetSize?: (data: [number, number, number]) => void;
  /** Chamado quando mouse e habilitado/desabilitado pelo guest */
  onMouseEnable?: (enabled: boolean) => void;
  /** Chamado em progresso de download */
  onDownloadProgress?: (progress: { file_name: string; loaded: number; total: number }) => void;
  /** Chamado em erro de download */
  onDownloadError?: (error: { file_name: string; error: Error }) => void;
}

// ============================================
// PRESETS
// ============================================

const IMAGE_PRESETS: Record<V86ImagePreset, Partial<V86EmulatorConfig>> = {
  alpine: {
    cdromUrl: "/v86/images/alpine-virt-3.19.9-x86.iso",
    bzimageUrl: "",
    cmdline: "",
  },
  buildroot: {
    cdromUrl: "",
    bzimageUrl: "/v86/images/buildroot-bzimage68.bin",
    cmdline: "tsc=reliable mitigations=off random.trust_cpu=on",
  },
  linux4: {
    cdromUrl: "/v86/images/linux4.iso",
    bzimageUrl: "",
    cmdline: "",
  },
};

const DEFAULT_CONFIG: Omit<Required<V86EmulatorConfig>, "preset" | "network" | "filesystem"> & { network?: V86NetworkConfig; filesystem?: V86FilesystemConfig } = {
  biosUrl: "/v86/bios/seabios.bin",
  vgaBiosUrl: "/v86/bios/vgabios.bin",
  cdromUrl: "/v86/images/alpine-virt-3.19.9-x86.iso",
  hdaUrl: "",
  hdbUrl: "",
  fdaUrl: "",
  fdbUrl: "",
  bzimageUrl: "",
  initrdUrl: "",
  cmdline: "",
  memorySize: 128 * 1024 * 1024,
  vgaMemorySize: 8 * 1024 * 1024,
  autostart: true,
  disableSpeaker: true,
  acpi: false,
  virtioConsole: false,
  virtioBalloon: false,
  initialStateUrl: "",
  preserveMacFromState: false,
  bootOrder: 0,
  disableJit: false,
  bzimageInitrdFromFilesystem: false,
};

// Lazy load V86 from npm package (only in browser)
let V86Constructor: typeof V86Type | null = null;

async function loadV86(): Promise<typeof V86Type> {
  if (V86Constructor) {
    return V86Constructor;
  }
  
  // Dynamic import of the ESM module from v86 npm package
  const v86Module = await import("v86");
  V86Constructor = v86Module.V86;
  return v86Module.V86;
}

// ============================================
// COMPONENTE
// ============================================

/**
 * Componente React que encapsula o emulador v86
 * Thin wrapper para facilitar o uso do v86 no React/Astro
 * 
 * @example
 * ```tsx
 * <V86Emulator
 *   config={{ preset: "buildroot" }}
 *   onReady={(emulator) => console.log("Pronto!")}
 *   onSerialOutput={(char) => console.log(char)}
 * />
 * ```
 */
export function V86Emulator({
  config,
  onReady,
  onStarted,
  onStopped,
  onSerialOutput,
  onScreenPutChar,
  onScreenSetSize,
  onMouseEnable,
  onDownloadProgress,
  onDownloadError,
}: V86EmulatorProps) {
  const emulatorRef = useRef<V86Type | null>(null);
  const screenContainerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const isMountedRef = useRef(true);

  // Refs para armazenar listeners (para remocao no cleanup)
  const listenersRef = useRef<Map<string, Function>>(new Map());

  // Refs para callbacks (evita stale closures)
  const onReadyRef = useRef(onReady);
  const onStartedRef = useRef(onStarted);
  const onStoppedRef = useRef(onStopped);
  const onSerialOutputRef = useRef(onSerialOutput);
  const onScreenPutCharRef = useRef(onScreenPutChar);
  const onScreenSetSizeRef = useRef(onScreenSetSize);
  const onMouseEnableRef = useRef(onMouseEnable);
  const onDownloadProgressRef = useRef(onDownloadProgress);
  const onDownloadErrorRef = useRef(onDownloadError);

  // Atualiza refs ANTES de qualquer render (useLayoutEffect)
  // Isso garante que as refs estejam atualizadas antes dos effects filhos rodarem
  useLayoutEffect(() => {
    onReadyRef.current = onReady;
    onStartedRef.current = onStarted;
    onStoppedRef.current = onStopped;
    onSerialOutputRef.current = onSerialOutput;
    onScreenPutCharRef.current = onScreenPutChar;
    onScreenSetSizeRef.current = onScreenSetSize;
    onMouseEnableRef.current = onMouseEnable;
    onDownloadProgressRef.current = onDownloadProgress;
    onDownloadErrorRef.current = onDownloadError;
  });

  const presetConfig = config.preset ? IMAGE_PRESETS[config.preset] : {};
  
  // Filtra propriedades undefined para evitar sobrescrever defaults
  const filteredConfig = Object.fromEntries(
    Object.entries(config).filter(([_, v]) => v !== undefined)
  ) as Partial<V86EmulatorConfig>;
  
  const mergedConfig = { ...DEFAULT_CONFIG, ...presetConfig, ...filteredConfig };

  const initializeEmulator = useCallback(async () => {
    if (isInitializedRef.current || !screenContainerRef.current) {
      return;
    }

    isInitializedRef.current = true;

    try {
      const V86 = await loadV86();

      const options: V86Options = {
        wasm_path: v86WasmUrl,
        memory_size: mergedConfig.memorySize,
        vga_memory_size: mergedConfig.vgaMemorySize,
        screen_container: screenContainerRef.current,
        bios: { url: mergedConfig.biosUrl } as V86Image,
        vga_bios: { url: mergedConfig.vgaBiosUrl } as V86Image,
        autostart: mergedConfig.autostart,
        disable_speaker: mergedConfig.disableSpeaker,
        acpi: mergedConfig.acpi,
        virtio_console: mergedConfig.virtioConsole,
        virtio_balloon: mergedConfig.virtioBalloon,
        disable_jit: mergedConfig.disableJit,
        bzimage_initrd_from_filesystem: mergedConfig.bzimageInitrdFromFilesystem,
      };

      // Boot order
      if (mergedConfig.bootOrder) {
        options.boot_order = mergedConfig.bootOrder;
      }

      // Bzimage boot
      if (mergedConfig.bzimageUrl) {
        options.bzimage = { url: mergedConfig.bzimageUrl } as V86Image;
        if (mergedConfig.cmdline) {
          options.cmdline = mergedConfig.cmdline;
        }
        // Filesystem vazio para 9p funcionar com bzimage
        if (!mergedConfig.filesystem) {
          options.filesystem = {};
        }
      } else if (mergedConfig.cdromUrl) {
        options.cdrom = { url: mergedConfig.cdromUrl } as V86Image;
      }

      // Initrd
      if (mergedConfig.initrdUrl) {
        options.initrd = { url: mergedConfig.initrdUrl } as V86Image;
      }

      // Hard disks
      if (mergedConfig.hdaUrl) {
        options.hda = { url: mergedConfig.hdaUrl } as V86Image;
      }
      if (mergedConfig.hdbUrl) {
        options.hdb = { url: mergedConfig.hdbUrl } as V86Image;
      }

      // Floppies
      if (mergedConfig.fdaUrl) {
        options.fda = { url: mergedConfig.fdaUrl } as V86Image;
      }
      if (mergedConfig.fdbUrl) {
        options.fdb = { url: mergedConfig.fdbUrl } as V86Image;
      }

      // Initial state
      if (mergedConfig.initialStateUrl) {
        options.initial_state = { url: mergedConfig.initialStateUrl } as V86Image;
        options.preserve_mac_from_state_image = mergedConfig.preserveMacFromState;
      }

      // Filesystem
      if (mergedConfig.filesystem) {
        options.filesystem = {
          baseurl: mergedConfig.filesystem.baseurl,
          basefs: mergedConfig.filesystem.basefs,
          handle9p: mergedConfig.filesystem.handle9p,
          proxy_url: mergedConfig.filesystem.proxy_url,
        };
      }

      // Network
      if (mergedConfig.network) {
        options.net_device = {
          type: mergedConfig.network.type,
          relay_url: mergedConfig.network.relay_url,
          id: mergedConfig.network.id,
          router_mac: mergedConfig.network.router_mac,
          router_ip: mergedConfig.network.router_ip,
          vm_ip: mergedConfig.network.vm_ip,
          masquerade: mergedConfig.network.masquerade,
          dns_method: mergedConfig.network.dns_method,
          doh_server: mergedConfig.network.doh_server,
          cors_proxy: mergedConfig.network.cors_proxy,
          mtu: mergedConfig.network.mtu,
        };
      }

      const emulator = new V86(options);
      
      // Verificar se o componente ainda esta montado (React Strict Mode pode desmontar durante init)
      if (!isMountedRef.current) {
        emulator.destroy().catch(() => {});
        return;
      }
      
      emulatorRef.current = emulator;
      
      // Limpa listeners anteriores
      listenersRef.current.clear();

      // Helper para adicionar listener com rastreamento
      const addTrackedListener = (event: string, listener: Function) => {
        emulator.add_listener(event as Parameters<typeof emulator.add_listener>[0], listener);
        listenersRef.current.set(event, listener);
      };

      // Event: emulator-ready
      addTrackedListener("emulator-ready", () => {
        if (isMountedRef.current) {
          onReadyRef.current?.(emulator);
        }
      });

      // Event: emulator-started
      addTrackedListener("emulator-started", () => {
        if (isMountedRef.current) {
          onStartedRef.current?.();
        }
      });

      // Event: emulator-stopped
      addTrackedListener("emulator-stopped", () => {
        if (isMountedRef.current) {
          onStoppedRef.current?.();
        }
      });

      // Event: serial output (serial0-output-byte conforme v86.d.ts)
      addTrackedListener("serial0-output-byte", (byte: number) => {
        if (isMountedRef.current) {
          const char = String.fromCharCode(byte);
          onSerialOutputRef.current?.(char);
        }
      });

      // Event: screen-put-char (conforme v86.d.ts)
      addTrackedListener("screen-put-char", (data: [number, number, number, number, number]) => {
        if (isMountedRef.current) {
          onScreenPutCharRef.current?.(data);
        }
      });

      // Event: screen-set-size (conforme v86.d.ts)
      addTrackedListener("screen-set-size", (data: [number, number, number]) => {
        if (isMountedRef.current) {
          onScreenSetSizeRef.current?.(data);
        }
      });

      // Event: mouse-enable (conforme v86.d.ts)
      addTrackedListener("mouse-enable", (enabled: boolean) => {
        if (isMountedRef.current) {
          onMouseEnableRef.current?.(enabled);
        }
      });

      // Event: download-progress (conforme v86.d.ts)
      addTrackedListener("download-progress", (data: { file_name: string; loaded: number; total: number }) => {
        if (isMountedRef.current) {
          onDownloadProgressRef.current?.(data);
        }
      });

      // Event: download-error (conforme v86.d.ts)
      addTrackedListener("download-error", (data: { file_name: string; error: Error }) => {
        if (isMountedRef.current) {
          onDownloadErrorRef.current?.(data);
        }
      });

    } catch (error) {
      console.error("Failed to initialize V86 emulator:", error);
      isInitializedRef.current = false;
    }
  }, [
    mergedConfig.biosUrl,
    mergedConfig.vgaBiosUrl,
    mergedConfig.cdromUrl,
    mergedConfig.hdaUrl,
    mergedConfig.hdbUrl,
    mergedConfig.fdaUrl,
    mergedConfig.fdbUrl,
    mergedConfig.bzimageUrl,
    mergedConfig.initrdUrl,
    mergedConfig.cmdline,
    mergedConfig.memorySize,
    mergedConfig.vgaMemorySize,
    mergedConfig.autostart,
    mergedConfig.acpi,
    mergedConfig.virtioConsole,
    mergedConfig.virtioBalloon,
    mergedConfig.disableJit,
    mergedConfig.initialStateUrl,
    mergedConfig.preserveMacFromState,
    mergedConfig.bootOrder,
    mergedConfig.bzimageInitrdFromFilesystem,
    // Callbacks usam refs, nao precisam estar nas deps
  ]);

  useEffect(() => {
    isMountedRef.current = true;
    initializeEmulator();

    return () => {
      isMountedRef.current = false;
      const emulator = emulatorRef.current;
      if (emulator) {
        // Remove todos os listeners rastreados antes de destruir
        listenersRef.current.forEach((listener, event) => {
          try {
            emulator.remove_listener(
              event as Parameters<typeof emulator.remove_listener>[0],
              listener
            );
          } catch {
            // Ignorar erros na remocao de listeners
          }
        });
        listenersRef.current.clear();
        
        emulatorRef.current = null;
        isInitializedRef.current = false;
        // Usar try/catch para evitar erro se o emulador ainda nao estiver totalmente inicializado
        try {
          emulator.destroy().catch(() => {});
        } catch {
          // Ignorar erros no destroy
        }
      }
    };
  }, [initializeEmulator]);

  return (
    <div 
      ref={screenContainerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
      }}
    >
      <div style={{ whiteSpace: "pre", font: "14px monospace", lineHeight: "14px" }}></div>
      <canvas style={{ display: "block" }}></canvas>
    </div>
  );
}

// ============================================
// EXPORTS
// ============================================

export default V86Emulator;
