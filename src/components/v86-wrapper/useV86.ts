import { useCallback } from "react";
import type { V86, V86Image } from "../../types/v86";

/**
 * Hook customizado para controlar uma instancia V86
 * 
 * Responsabilidades:
 * - Abstrair operacoes sobre a instancia v86
 * - Fornecer funcoes utilitarias para controle do emulador
 * - Manter a API simples e composavel
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [emulator, setEmulator] = useState<V86 | null>(null);
 *   const v86 = useV86(emulator);
 *   
 *   return (
 *     <>
 *       <V86Emulator
 *         config={{ preset: "buildroot" }}
 *         onReady={setEmulator}
 *       />
 *       <button onClick={v86.restart}>Restart</button>
 *     </>
 *   );
 * }
 * ```
 */
export function useV86(emulator: V86 | null) {
  // ============================================
  // CICLO DE VIDA
  // ============================================

  const run = useCallback(() => {
    emulator?.run();
  }, [emulator]);

  const stop = useCallback(async () => {
    await emulator?.stop();
  }, [emulator]);

  const restart = useCallback(() => {
    emulator?.restart();
  }, [emulator]);

  const isRunning = useCallback(() => {
    return emulator?.is_running() ?? false;
  }, [emulator]);

  // ============================================
  // SERIAL
  // ============================================

  const sendSerial = useCallback(
    (data: string) => {
      emulator?.serial0_send(data);
    },
    [emulator]
  );

  // ============================================
  // TECLADO
  // ============================================

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

  const sendKeys = useCallback(
    (codes: number[]) => {
      emulator?.keyboard_send_keys(codes);
    },
    [emulator]
  );

  const setKeyboardEnabled = useCallback(
    (enabled: boolean) => {
      emulator?.keyboard_set_enabled(enabled);
    },
    [emulator]
  );

  // ============================================
  // MOUSE
  // ============================================

  const setMouseEnabled = useCallback(
    (enabled: boolean) => {
      emulator?.mouse_set_enabled(enabled);
    },
    [emulator]
  );

  const lockMouse = useCallback(() => {
    emulator?.lock_mouse();
  }, [emulator]);

  // ============================================
  // ESTADO (SAVE/RESTORE)
  // ============================================

  const saveState = useCallback(async () => {
    return emulator?.save_state();
  }, [emulator]);

  const restoreState = useCallback(
    async (state: ArrayBuffer) => {
      await emulator?.restore_state(state);
    },
    [emulator]
  );

  // ============================================
  // FILESYSTEM
  // ============================================

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

  // ============================================
  // MEDIA (CD-ROM / DISQUETE)
  // ============================================

  const setCdrom = useCallback(
    async (image: V86Image) => {
      await emulator?.set_cdrom(image);
    },
    [emulator]
  );

  const ejectCdrom = useCallback(() => {
    emulator?.eject_cdrom();
  }, [emulator]);

  const setFloppy = useCallback(
    async (image: V86Image) => {
      await emulator?.set_fda(image);
    },
    [emulator]
  );

  const ejectFloppy = useCallback(() => {
    emulator?.eject_fda();
  }, [emulator]);

  // ============================================
  // TELA / DISPLAY
  // ============================================

  const makeScreenshot = useCallback(() => {
    return emulator?.screen_make_screenshot();
  }, [emulator]);

  const setScreenScale = useCallback(
    (sx: number, sy: number) => {
      emulator?.screen_set_scale(sx, sy);
    },
    [emulator]
  );

  const goFullscreen = useCallback(() => {
    emulator?.screen_go_fullscreen();
  }, [emulator]);

  // ============================================
  // ESTATISTICAS
  // ============================================

  const getInstructionCounter = useCallback(() => {
    return emulator?.get_instruction_counter() ?? 0;
  }, [emulator]);

  // ============================================
  // RETORNO
  // ============================================

  return {
    // Lifecycle
    run,
    stop,
    restart,
    isRunning,
    // Serial
    sendSerial,
    // Keyboard
    sendKeyboardText,
    sendScancodes,
    sendKeys,
    setKeyboardEnabled,
    // Mouse
    setMouseEnabled,
    lockMouse,
    // State
    saveState,
    restoreState,
    // Filesystem
    createFile,
    readFile,
    // Media
    setCdrom,
    ejectCdrom,
    setFloppy,
    ejectFloppy,
    // Screen
    makeScreenshot,
    setScreenScale,
    goFullscreen,
    // Stats
    getInstructionCounter,
  };
}

export default useV86;
