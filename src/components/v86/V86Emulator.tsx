import { useEffect, useRef, useCallback } from "react";
import type { V86, V86Options, V86Event, V86Image } from "../../types/v86";

export type V86ImagePreset = "alpine" | "buildroot" | "linux4";

export interface V86EmulatorConfig {
  wasmPath?: string;
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
  onReady?: (emulator: V86) => void;
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
  wasmPath: "/v86/v86.wasm",
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

const V86_SCRIPT_URL = "/v86/libv86.js";

function loadV86Script(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.V86) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(
      `script[src="${V86_SCRIPT_URL}"]`
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () =>
        reject(new Error("Failed to load v86 script"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = V86_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load v86 script"));
    document.head.appendChild(script);
  });
}

export function V86Emulator({
  config,
  onReady,
  onStarted,
  onStopped,
  onSerialOutput,
  onScreenPutChar,
}: V86EmulatorProps) {
  const emulatorRef = useRef<V86 | null>(null);
  const screenContainerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  const presetConfig = config.preset ? IMAGE_PRESETS[config.preset] : {};
  const mergedConfig = { ...DEFAULT_CONFIG, ...presetConfig, ...config };

  const initializeEmulator = useCallback(async () => {
    if (isInitializedRef.current || !screenContainerRef.current) {
      return;
    }

    isInitializedRef.current = true;

    try {
      await loadV86Script();

      const V86Constructor = window.V86;
      if (!V86Constructor) {
        throw new Error("V86 not available on window");
      }

      const options: V86Options = {
        wasm_path: mergedConfig.wasmPath,
        memory_size: mergedConfig.memorySize,
        vga_memory_size: mergedConfig.vgaMemorySize,
        screen_container: screenContainerRef.current,
        bios: { url: mergedConfig.biosUrl },
        vga_bios: { url: mergedConfig.vgaBiosUrl },
        autostart: mergedConfig.autostart,
      };

      if (mergedConfig.bzimageUrl) {
        options.bzimage = { url: mergedConfig.bzimageUrl };
        if (mergedConfig.cmdline) {
          options.cmdline = mergedConfig.cmdline;
        }
        options.filesystem = {};
      } else if (mergedConfig.cdromUrl) {
        options.cdrom = { url: mergedConfig.cdromUrl };
      }

      if (mergedConfig.hdaUrl) {
        options.hda = { url: mergedConfig.hdaUrl };
      }

      const emulator = new V86Constructor(options);
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
    mergedConfig.wasmPath,
    mergedConfig.biosUrl,
    mergedConfig.vgaBiosUrl,
    mergedConfig.cdromUrl,
    mergedConfig.hdaUrl,    mergedConfig.bzimageUrl,
    mergedConfig.cmdline,    mergedConfig.memorySize,
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
    <div ref={screenContainerRef}>
      <div style={{ whiteSpace: "pre", font: "14px monospace", lineHeight: "14px" }}></div>
      <canvas style={{ display: "none" }}></canvas>
    </div>
  );
}

export function useV86(emulator: V86 | null) {
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
