import { useEffect, useRef, useCallback } from "react";
import type { V86 as V86Type, V86Options, V86Image } from "../../types/v86";
// Import the wasm file path from the v86 package for proper bundler resolution
import v86WasmUrl from "v86/build/v86.wasm?url";

export type V86ImagePreset = "alpine" | "buildroot" | "linux4";

export interface V86EmulatorConfig {
  biosUrl?: string;
  vgaBiosUrl?: string;
  cdromUrl?: string;
  hdaUrl?: string;
  bzimageUrl?: string;
  cmdline?: string;
  memorySize?: number;
  vgaMemorySize?: number;
  autostart?: boolean;
  preset?: V86ImagePreset;
}

export interface V86EmulatorProps {
  config: V86EmulatorConfig;
  onReady?: (emulator: V86Type) => void;
  onStarted?: () => void;
  onStopped?: () => void;
  onSerialOutput?: (char: string) => void;
  onScreenPutChar?: (data: [number, number, number, number, number]) => void;
}

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

const DEFAULT_CONFIG: Omit<Required<V86EmulatorConfig>, "preset"> = {
  biosUrl: "/v86/bios/seabios.bin",
  vgaBiosUrl: "/v86/bios/vgabios.bin",
  cdromUrl: "/v86/images/alpine-virt-3.19.9-x86.iso",
  hdaUrl: "",
  bzimageUrl: "",
  cmdline: "",
  memorySize: 128 * 1024 * 1024,
  vgaMemorySize: 8 * 1024 * 1024,
  autostart: true,
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

export function V86Emulator({
  config,
  onReady,
  onStarted,
  onStopped,
  onSerialOutput,
  onScreenPutChar,
}: V86EmulatorProps) {
  const emulatorRef = useRef<V86Type | null>(null);
  const screenContainerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

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
      };

      if (mergedConfig.bzimageUrl) {
        options.bzimage = { url: mergedConfig.bzimageUrl } as V86Image;
        if (mergedConfig.cmdline) {
          options.cmdline = mergedConfig.cmdline;
        }
        options.filesystem = {};
      } else if (mergedConfig.cdromUrl) {
        options.cdrom = { url: mergedConfig.cdromUrl } as V86Image;
      }

      if (mergedConfig.hdaUrl) {
        options.hda = { url: mergedConfig.hdaUrl } as V86Image;
      }

      const emulator = new V86(options);
      emulatorRef.current = emulator;

      emulator.add_listener("emulator-ready", () => {
        onReady?.(emulator);
      });

      emulator.add_listener("emulator-started", () => {
        onStarted?.();
      });

      emulator.add_listener("emulator-stopped", () => {
        onStopped?.();
      });

      if (onSerialOutput) {
        emulator.add_listener("serial0-output-byte", (byte: number) => {
          const char = String.fromCharCode(byte);
          onSerialOutput(char);
        });
      }

      if (onScreenPutChar) {
        emulator.add_listener(
          "screen-put-char",
          (data: [number, number, number, number, number]) => {
            onScreenPutChar(data);
          }
        );
      }
    } catch (error) {
      console.error("Failed to initialize V86 emulator:", error);
      isInitializedRef.current = false;
    }
  }, [
    mergedConfig.biosUrl,
    mergedConfig.vgaBiosUrl,
    mergedConfig.cdromUrl,
    mergedConfig.hdaUrl,
    mergedConfig.bzimageUrl,
    mergedConfig.cmdline,
    mergedConfig.memorySize,
    mergedConfig.vgaMemorySize,
    mergedConfig.autostart,
    onReady,
    onStarted,
    onStopped,
    onSerialOutput,
    onScreenPutChar,
  ]);

  useEffect(() => {
    initializeEmulator();

    return () => {
      if (emulatorRef.current) {
        emulatorRef.current.destroy();
        emulatorRef.current = null;
        isInitializedRef.current = false;
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

export function useV86(emulator: V86Type | null) {
  const run = useCallback(() => {
    emulator?.run();
  }, [emulator]);

  const stop = useCallback(async () => {
    await emulator?.stop();
  }, [emulator]);

  const restart = useCallback(() => {
    emulator?.restart();
  }, [emulator]);

  const sendSerial = useCallback(
    (data: string) => {
      emulator?.serial0_send(data);
    },
    [emulator]
  );

  const sendKeyboardText = useCallback(
    (text: string) => {
      emulator?.keyboard_send_text(text);
    },
    [emulator]
  );

  const sendScancodes = useCallback(
    (codes: number[]) => {
      emulator?.keyboard_send_scancodes(codes);
    },
    [emulator]
  );

  const saveState = useCallback(async () => {
    return emulator?.save_state();
  }, [emulator]);

  const restoreState = useCallback(
    async (state: ArrayBuffer) => {
      await emulator?.restore_state(state);
    },
    [emulator]
  );

  const createFile = useCallback(
    async (path: string, data: Uint8Array) => {
      await emulator?.create_file(path, data);
    },
    [emulator]
  );

  const readFile = useCallback(
    async (path: string) => {
      return emulator?.read_file(path);
    },
    [emulator]
  );

  const setCdrom = useCallback(
    async (image: V86Image) => {
      await emulator?.set_cdrom(image);
    },
    [emulator]
  );

  const ejectCdrom = useCallback(() => {
    emulator?.eject_cdrom();
  }, [emulator]);

  const isRunning = useCallback(() => {
    return emulator?.is_running() ?? false;
  }, [emulator]);

  return {
    run,
    stop,
    restart,
    sendSerial,
    sendKeyboardText,
    sendScancodes,
    saveState,
    restoreState,
    createFile,
    readFile,
    setCdrom,
    ejectCdrom,
    isRunning,
  };
}

export default V86Emulator;
