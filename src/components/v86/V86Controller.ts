import type { V86, V86Image, Event as V86Event } from "../../types/v86";

/**
 * Utilitário dev-friendly para controle avançado da instância V86
 * Provê métodos para comunicação, ciclo de vida, filesystem e comandos
 */
export class V86Controller {
  private emulator: V86 | null = null;
  private serialBuffer: string = "";
  private serialListeners: Set<(data: string) => void> = new Set();

  constructor(emulator?: V86 | null) {
    if (emulator) {
      this.attach(emulator);
    }
  }

  /**
   * Anexa uma instância V86 ao controller
   */
  attach(emulator: V86): void {
    this.emulator = emulator;
    this.setupSerialListener();
  }

  /**
   * Desanexa a instância V86
   */
  detach(): void {
    this.emulator = null;
    this.serialBuffer = "";
    this.serialListeners.clear();
  }

  /**
   * Retorna a instância V86 atual
   */
  getEmulator(): V86 | null {
    return this.emulator;
  }

  // ============================================
  // CICLO DE VIDA
  // ============================================

  /**
   * Inicia o emulador
   */
  run(): void {
    this.emulator?.run();
  }

  /**
   * Para o emulador
   */
  async stop(): Promise<void> {
    await this.emulator?.stop();
  }

  /**
   * Reinicia o emulador (força reboot)
   */
  restart(): void {
    this.emulator?.restart();
  }

  /**
   * Destroi o emulador e libera recursos
   */
  async destroy(): Promise<void> {
    await this.emulator?.destroy();
    this.detach();
  }

  /**
   * Verifica se o emulador está rodando
   */
  isRunning(): boolean {
    return this.emulator?.is_running() ?? false;
  }

  // ============================================
  // ESTADO (SAVE/RESTORE)
  // ============================================

  /**
   * Salva o estado atual do emulador
   */
  async saveState(): Promise<ArrayBuffer | undefined> {
    return this.emulator?.save_state();
  }

  /**
   * Restaura um estado salvo
   */
  async restoreState(state: ArrayBuffer): Promise<void> {
    await this.emulator?.restore_state(state);
  }

  /**
   * Salva o estado em um arquivo para download (apenas browser)
   */
  async downloadState(filename = "v86state.bin"): Promise<void> {
    const state = await this.saveState();
    if (state && typeof window !== "undefined") {
      const blob = new Blob([state]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  // ============================================
  // COMUNICAÇÃO SERIAL
  // ============================================

  private setupSerialListener(): void {
    this.emulator?.add_listener("serial0-output-byte", (byte: number) => {
      const char = String.fromCharCode(byte);
      this.serialBuffer += char;
      this.serialListeners.forEach(listener => listener(char));
    });
  }

  /**
   * Envia string para o terminal serial
   */
  sendSerial(data: string): void {
    this.emulator?.serial0_send(data);
  }

  /**
   * Envia bytes para uma porta serial específica
   */
  sendSerialBytes(serial: number, data: Uint8Array): void {
    this.emulator?.serial_send_bytes(serial, data);
  }

  /**
   * Adiciona listener para output serial
   */
  onSerialOutput(listener: (char: string) => void): () => void {
    this.serialListeners.add(listener);
    return () => this.serialListeners.delete(listener);
  }

  /**
   * Retorna o buffer serial acumulado
   */
  getSerialBuffer(): string {
    return this.serialBuffer;
  }

  /**
   * Limpa o buffer serial
   */
  clearSerialBuffer(): void {
    this.serialBuffer = "";
  }

  // ============================================
  // TECLADO
  // ============================================

  /**
   * Envia texto via teclado (assume layout US)
   */
  sendKeyboardText(text: string): void {
    this.emulator?.keyboard_send_text(text);
  }

  /**
   * Envia scancodes do teclado
   * @see http://stanislavs.org/helppc/make_codes.html
   */
  sendScancodes(codes: number[]): void {
    this.emulator?.keyboard_send_scancodes(codes);
  }

  /**
   * Envia teclas traduzidas
   */
  sendKeys(codes: number[]): void {
    this.emulator?.keyboard_send_keys(codes);
  }

  /**
   * Habilita/desabilita eventos de teclado
   */
  setKeyboardEnabled(enabled: boolean): void {
    this.emulator?.keyboard_set_enabled(enabled);
  }

  // ============================================
  // MOUSE
  // ============================================

  /**
   * Habilita/desabilita eventos de mouse
   */
  setMouseEnabled(enabled: boolean): void {
    this.emulator?.mouse_set_enabled(enabled);
  }

  /**
   * Bloqueia o cursor do mouse (apenas browser)
   */
  lockMouse(): void {
    this.emulator?.lock_mouse();
  }

  // ============================================
  // TELA / DISPLAY
  // ============================================

  /**
   * Captura screenshot (apenas browser)
   */
  makeScreenshot(): HTMLElement | null {
    return this.emulator?.screen_make_screenshot() ?? null;
  }

  /**
   * Define escala da tela
   */
  setScreenScale(scaleX: number, scaleY: number): void {
    this.emulator?.screen_set_scale(scaleX, scaleY);
  }

  /**
   * Modo fullscreen (apenas browser)
   */
  goFullscreen(): void {
    this.emulator?.screen_go_fullscreen();
  }

  /**
   * Obtém o conteúdo da tela em modo texto (array de linhas)
   * Útil para automação e testes
   */
  getTextScreen(): string[] {
    // @ts-ignore - screen_adapter existe mas não está tipado
    return this.emulator?.screen_adapter?.get_text_screen() ?? [];
  }

  /**
   * Aguarda até que um texto apareça na tela
   */
  async waitForScreenText(expected: string | RegExp | string[], options?: { timeout_msec?: number }): Promise<boolean> {
    // @ts-ignore - método existe mas não está totalmente tipado
    return this.emulator?.wait_until_vga_screen_contains(expected, options) ?? false;
  }

  // ============================================
  // FILESYSTEM (9P)
  // ============================================

  /**
   * Cria/escreve um arquivo no filesystem 9p
   */
  async createFile(path: string, data: Uint8Array | string): Promise<void> {
    const content = typeof data === "string" 
      ? new TextEncoder().encode(data) 
      : data;
    await this.emulator?.create_file(path, content);
  }

  /**
   * Lê um arquivo do filesystem 9p
   */
  async readFile(path: string): Promise<Uint8Array | undefined> {
    return this.emulator?.read_file(path);
  }

  /**
   * Lê um arquivo como texto
   */
  async readFileAsText(path: string): Promise<string | undefined> {
    const data = await this.readFile(path);
    if (data) {
      return new TextDecoder().decode(data);
    }
    return undefined;
  }

  /**
   * Verifica se um arquivo existe (via execução de comando)
   * Requer que o sistema esteja pronto
   */
  async fileExists(path: string): Promise<boolean> {
    try {
      const result = await this.executeCommand(`test -e "${path}" && echo "exists" || echo "not_exists"`);
      return result.includes("exists") && !result.includes("not_exists");
    } catch {
      return false;
    }
  }

  /**
   * Remove um arquivo (via execução de comando)
   * Requer que o sistema esteja pronto
   */
  async deleteFile(path: string): Promise<boolean> {
    try {
      await this.executeCommand(`rm -f "${path}"`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Lista arquivos em um diretório (via execução de comando)
   */
  async listFiles(path: string = "/"): Promise<string[]> {
    try {
      const result = await this.executeCommand(`ls -1 "${path}"`);
      return result.trim().split("\n").filter(Boolean);
    } catch {
      return [];
    }
  }

  // ============================================
  // CD-ROM / FLOPPY
  // ============================================

  /**
   * Insere imagem de CD-ROM
   */
  async setCdrom(image: V86Image): Promise<void> {
    await this.emulator?.set_cdrom(image);
  }

  /**
   * Ejeta CD-ROM
   */
  ejectCdrom(): void {
    this.emulator?.eject_cdrom();
  }

  /**
   * Insere imagem de disquete
   */
  async setFloppy(image: V86Image): Promise<void> {
    await this.emulator?.set_fda(image);
  }

  /**
   * Ejeta disquete
   */
  ejectFloppy(): void {
    this.emulator?.eject_fda();
  }

  // ============================================
  // EXECUÇÃO DE COMANDOS
  // ============================================

  /**
   * Executa um comando no shell e retorna o output
   * Usa serial para comunicação
   * 
   * @param command Comando a executar
   * @param options Opções de execução
   * @returns Output do comando
   */
  async executeCommand(
    command: string, 
    options: { 
      timeout?: number;
      endMarker?: string;
    } = {}
  ): Promise<string> {
    const { timeout = 30000, endMarker = "___V86_CMD_DONE___" } = options;

    return new Promise((resolve, reject) => {
      let output = "";
      let timeoutId: ReturnType<typeof setTimeout>;

      const cleanup = () => {
        clearTimeout(timeoutId);
        this.serialListeners.delete(listener);
      };

      const listener = (char: string) => {
        output += char;
        if (output.includes(endMarker)) {
          cleanup();
          // Remove o marker e o comando echo do output
          const cleanOutput = output
            .replace(new RegExp(`echo ${endMarker}[\\r\\n]*`), "")
            .replace(endMarker, "")
            .trim();
          resolve(cleanOutput);
        }
      };

      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error(`Command timeout after ${timeout}ms: ${command}`));
      }, timeout);

      this.serialListeners.add(listener);
      
      // Envia comando seguido de echo do marker
      this.sendSerial(`${command}; echo ${endMarker}\n`);
    });
  }

  /**
   * Executa múltiplos comandos em sequência
   */
  async executeCommands(commands: string[], options?: { timeout?: number }): Promise<string[]> {
    const results: string[] = [];
    for (const cmd of commands) {
      results.push(await this.executeCommand(cmd, options));
    }
    return results;
  }

  // ============================================
  // EVENTOS
  // ============================================

  /**
   * Adiciona listener de evento
   */
  addListener(event: V86Event, callback: Function): void {
    this.emulator?.add_listener(event, callback);
  }

  /**
   * Remove listener de evento
   */
  removeListener(event: V86Event, callback: Function): void {
    this.emulator?.remove_listener(event, callback);
  }

  /**
   * Aguarda evento "emulator-ready"
   */
  async waitForReady(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.emulator) {
        resolve();
        return;
      }

      const listener = () => {
        this.emulator?.remove_listener("emulator-ready", listener);
        resolve();
      };

      this.emulator.add_listener("emulator-ready", listener);
    });
  }

  /**
   * Aguarda evento "emulator-started"
   */
  async waitForStarted(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.emulator) {
        resolve();
        return;
      }

      const listener = () => {
        this.emulator?.remove_listener("emulator-started", listener);
        resolve();
      };

      this.emulator.add_listener("emulator-started", listener);
    });
  }

  // ============================================
  // MEMÓRIA
  // ============================================

  /**
   * Lê dados da memória
   */
  readMemory(offset: number, length: number): Uint8Array | undefined {
    // @ts-ignore - método existe mas não está tipado
    return this.emulator?.read_memory?.(offset, length);
  }

  /**
   * Escreve dados na memória
   */
  writeMemory(data: Uint8Array | number[], offset: number): void {
    // @ts-ignore - método existe mas não está tipado
    this.emulator?.write_memory?.(data, offset);
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Retorna contador de instruções
   */
  getInstructionCounter(): number {
    return this.emulator?.get_instruction_counter() ?? 0;
  }
}

/**
 * Hook React para usar o V86Controller
 */
export function useV86Controller(emulator: V86 | null): V86Controller {
  const controller = new V86Controller();
  
  if (emulator) {
    controller.attach(emulator);
  }
  
  return controller;
}

export default V86Controller;
