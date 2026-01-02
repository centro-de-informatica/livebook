import type { V86, V86Image, Event as V86Event } from '../../types/v86';

/**
 * Opcoes para aguardar texto na tela VGA
 */
export interface WaitForScreenOptions {
  /** Timeout em milissegundos (0 = sem timeout) */
  timeout_msec?: number;
}

/**
 * Opcoes para execucao de comandos
 */
export interface ExecuteCommandOptions {
  /** Timeout em milissegundos */
  timeout?: number;
  /** Marcador de fim de comando */
  endMarker?: string;
}

/**
 * Informacoes de progresso de download
 */
export interface DownloadProgress {
  file_index: number;
  file_count: number;
  file_name: string;
  lengthComputable: boolean;
  total: number;
  loaded: number;
}

/**
 * Dados do evento screen-put-char
 * [row, col, char_code, bg_color, fg_color]
 */
export type ScreenPutCharData = [number, number, number, number, number];

/**
 * Dados do evento screen-set-size
 * [width, height, bpp]
 */
export type ScreenSetSizeData = [number, number, number];

/**
 * Listener tipado para eventos do emulador
 */
export type V86EventListener<T = unknown> = (data: T) => void;

/**
 * Utilitario dev-friendly para controle avancado da instancia V86
 * Prove metodos para comunicacao, ciclo de vida, filesystem e comandos
 *
 * @example
 * ```tsx
 * const controller = new V86Controller();
 * controller.attach(emulator);
 *
 * // Aguardar boot
 * await controller.waitForScreenText("login:");
 *
 * // Executar comando
 * const result = await controller.executeCommand("ls -la");
 *
 * // Capturar screenshot
 * controller.makeScreenshot();
 * ```
 */
export class V86Controller {
  private emulator: V86 | null = null;
  private serialBuffer: string = '';
  private serialListeners: Set<(data: string) => void> = new Set();
  private eventListeners: Map<V86Event, Set<(...args: unknown[]) => void>> = new Map();
  private serialByteListener: ((byte: number) => void) | null = null;

  constructor(emulator?: V86 | null) {
    if (emulator) {
      this.attach(emulator);
    }
  }

  /**
   * Anexa uma instancia V86 ao controller
   */
  attach(emulator: V86): void {
    this.emulator = emulator;
    this.setupSerialListener();
  }

  /**
   * Desanexa a instancia V86
   */
  detach(): void {
    // Remove serial byte listener
    if (this.serialByteListener && this.emulator) {
      this.emulator.remove_listener('serial0-output-byte', this.serialByteListener);
      this.serialByteListener = null;
    }

    // Remove todos os listeners registrados
    this.eventListeners.forEach((listeners, event) => {
      listeners.forEach((listener) => {
        this.emulator?.remove_listener(event, listener);
      });
    });
    this.eventListeners.clear();
    this.emulator = null;
    this.serialBuffer = '';
    this.serialListeners.clear();
  }

  /**
   * Retorna a instancia V86 atual
   */
  getEmulator(): V86 | null {
    return this.emulator;
  }

  /**
   * Verifica se o controller esta anexado a um emulador
   */
  isAttached(): boolean {
    return this.emulator !== null;
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
   * Reinicia o emulador (forca reboot)
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
   * Verifica se o emulador esta rodando
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
   * Alias para restoreState (melhor DX)
   */
  async loadState(state: ArrayBuffer): Promise<void> {
    return this.restoreState(state);
  }

  /**
   * Salva o estado em um arquivo para download (apenas browser)
   */
  async downloadState(filename = 'v86state.bin'): Promise<void> {
    const state = await this.saveState();
    if (state && typeof window !== 'undefined') {
      const blob = new Blob([state]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Carrega estado de um arquivo
   */
  async loadStateFromFile(file: File): Promise<void> {
    const buffer = await file.arrayBuffer();
    await this.restoreState(buffer);
  }

  /**
   * Carrega estado de uma URL
   */
  async loadStateFromUrl(url: string): Promise<void> {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    await this.restoreState(buffer);
  }

  // ============================================
  // COMUNICACAO SERIAL
  // ============================================

  private setupSerialListener(): void {
    // Remove listener anterior se existir
    if (this.serialByteListener && this.emulator) {
      this.emulator.remove_listener('serial0-output-byte', this.serialByteListener);
    }

    // Cria novo listener e armazena referencia para cleanup
    this.serialByteListener = (byte: number) => {
      const char = String.fromCharCode(byte);
      this.serialBuffer += char;
      this.serialListeners.forEach((listener) => listener(char));
    };

    this.emulator?.add_listener('serial0-output-byte', this.serialByteListener);
  }

  /**
   * Envia string para o terminal serial
   */
  sendSerial(data: string): void {
    this.emulator?.serial0_send(data);
  }

  /**
   * Envia bytes para uma porta serial especifica
   */
  sendSerialBytes(serial: number, data: Uint8Array): void {
    this.emulator?.serial_send_bytes(serial, data);
  }

  /**
   * Adiciona listener para output serial
   * @returns Funcao para remover o listener
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
    this.serialBuffer = '';
  }

  /**
   * Aguarda ate que um texto apareca no output serial
   * @param expected Texto ou regex a aguardar
   * @param options Opcoes de timeout
   * @returns O texto capturado que deu match
   */
  async waitForSerialOutput(
    expected: string | RegExp,
    options: WaitForScreenOptions = {}
  ): Promise<string> {
    const { timeout_msec = 30000 } = options;

    return new Promise((resolve, reject) => {
      let buffer = '';
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        this.serialListeners.delete(listener);
      };

      const checkMatch = () => {
        if (typeof expected === 'string') {
          if (buffer.includes(expected)) {
            cleanup();
            resolve(buffer);
          }
        } else {
          const match = buffer.match(expected);
          if (match) {
            cleanup();
            resolve(match[0]);
          }
        }
      };

      const listener = (char: string) => {
        buffer += char;
        checkMatch();
      };

      if (timeout_msec > 0) {
        timeoutId = setTimeout(() => {
          cleanup();
          reject(new Error(`Timeout waiting for serial output: ${expected}`));
        }, timeout_msec);
      }

      this.serialListeners.add(listener);
      // Verifica se ja tem match no buffer existente
      buffer = this.serialBuffer;
      checkMatch();
    });
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
   * Obtem o conteudo da tela em modo texto (array de linhas)
   * Nota: Esta funcionalidade requer acesso interno ao emulador.
   * Para uso em producao, considere capturar eventos screen-put-char.
   */
  getTextScreen(): string[] {
    // Acesso interno - nao faz parte da API publica do v86
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adapter = (this.emulator as any)?.screen_adapter;
    if (adapter && typeof adapter.get_text_screen === 'function') {
      return adapter.get_text_screen();
    }
    return [];
  }

  /**
   * Obtem o conteudo da tela como string unica
   * Conveniente para buscas e exibicao
   */
  getScreenText(): string {
    return this.getTextScreen().join('\n');
  }

  /**
   * Aguarda ate que um texto apareca na tela VGA
   * Implementacao baseada na API oficial do v86
   *
   * @param expected Texto, regex ou array de textos/regex a aguardar
   * @param options Opcoes de timeout
   * @returns true se encontrou, false se timeout
   *
   * @example
   * ```ts
   * // Aguardar prompt de login
   * await controller.waitForScreenText("login:");
   *
   * // Aguardar com regex
   * await controller.waitForScreenText(/root@.*:/);
   *
   * // Aguardar multiplos textos (qualquer um)
   * await controller.waitForScreenText(["login:", "Password:"], { timeout_msec: 60000 });
   * ```
   */
  async waitForScreenText(
    expected: string | RegExp | (string | RegExp)[],
    options: WaitForScreenOptions = {}
  ): Promise<boolean> {
    const { timeout_msec = 30000 } = options;
    const patterns = Array.isArray(expected) ? expected : [expected];

    return new Promise((resolve) => {
      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (intervalId) clearInterval(intervalId);
      };

      const checkScreen = () => {
        const screenText = this.getScreenText();
        for (const pattern of patterns) {
          if (typeof pattern === 'string') {
            if (screenText.includes(pattern)) {
              cleanup();
              resolve(true);
              return;
            }
          } else {
            if (pattern.test(screenText)) {
              cleanup();
              resolve(true);
              return;
            }
          }
        }
      };

      // Verifica imediatamente
      checkScreen();

      // Polling a cada 100ms
      const intervalId = setInterval(checkScreen, 100);

      // Timeout
      const timeoutId =
        timeout_msec > 0
          ? setTimeout(() => {
            cleanup();
            resolve(false);
          }, timeout_msec)
          : undefined;
    });
  }

  // ============================================
  // FILESYSTEM (9P)
  // ============================================

  /**
   * Cria/escreve um arquivo no filesystem 9p
   */
  async createFile(path: string, data: Uint8Array | string): Promise<void> {
    const content = typeof data === 'string' ? new TextEncoder().encode(data) : data;
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
      const result = await this.executeCommand(
        `test -e "${path}" && echo "exists" || echo "not_exists"`
      );
      return result.includes('exists') && !result.includes('not_exists');
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
  async listFiles(path: string = '/'): Promise<string[]> {
    try {
      const result = await this.executeCommand(`ls -1 "${path}"`);
      return result.trim().split('\n').filter(Boolean);
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
  // EXECUCAO DE COMANDOS
  // ============================================

  /**
   * Executa um comando no shell e retorna o output
   * Usa serial para comunicacao
   *
   * @param command Comando a executar
   * @param options Opcoes de execucao
   * @returns Output do comando
   *
   * @example
   * ```ts
   * // Comando simples
   * const files = await controller.executeCommand("ls -la");
   *
   * // Com timeout customizado
   * const result = await controller.executeCommand("make build", { timeout: 60000 });
   * ```
   */
  async executeCommand(command: string, options: ExecuteCommandOptions = {}): Promise<string> {
    const { timeout = 30000, endMarker = '___V86_CMD_DONE___' } = options;

    return new Promise((resolve, reject) => {
      let output = '';

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
            .replace(new RegExp(`echo ${endMarker}[\\r\\n]*`), '')
            .replace(endMarker, '')
            .trim();
          resolve(cleanOutput);
        }
      };

      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error(`Command timeout after ${timeout}ms: ${command}`));
      }, timeout);

      this.serialListeners.add(listener);

      // Envia comando seguido de echo do marker
      this.sendSerial(`${command}; echo ${endMarker}\n`);
    });
  }

  /**
   * Executa multiplos comandos em sequencia
   */
  async executeCommands(commands: string[], options?: ExecuteCommandOptions): Promise<string[]> {
    const results: string[] = [];
    for (const cmd of commands) {
      results.push(await this.executeCommand(cmd, options));
    }
    return results;
  }

  /**
   * Executa comando e aguarda output especifico
   * Util para comandos interativos
   */
  async executeAndWait(
    command: string,
    waitFor: string | RegExp,
    options: WaitForScreenOptions = {}
  ): Promise<string> {
    this.sendSerial(command + '\n');
    return this.waitForSerialOutput(waitFor, options);
  }

  // ============================================
  // EVENTOS
  // ============================================

  /**
   * Adiciona listener de evento
   * @param event Nome do evento
   * @param callback Funcao de callback
   */
  addListener(event: V86Event, callback: (...args: unknown[]) => void): void {
    this.emulator?.add_listener(event, callback);
    // Rastreia o listener para cleanup
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  /**
   * Remove listener de evento
   */
  removeListener(event: V86Event, callback: (...args: unknown[]) => void): void {
    this.emulator?.remove_listener(event, callback);
    this.eventListeners.get(event)?.delete(callback);
  }

  /**
   * Adiciona listener tipado para eventos especificos
   */
  on<T = unknown>(event: V86Event, callback: V86EventListener<T>): () => void {
    const wrappedCallback = callback as (...args: unknown[]) => void;
    this.addListener(event, wrappedCallback);
    return () => this.removeListener(event, wrappedCallback);
  }

  /**
   * Aguarda evento "emulator-ready"
   * Chamado quando o emulador terminou de carregar e esta pronto
   */
  async waitForReady(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.emulator) {
        resolve();
        return;
      }

      const listener = () => {
        this.emulator?.remove_listener('emulator-ready', listener);
        resolve();
      };

      this.emulator.add_listener('emulator-ready', listener);
    });
  }

  /**
   * Aguarda evento "emulator-started"
   * Chamado quando o emulador comeca a executar
   */
  async waitForStarted(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.emulator) {
        resolve();
        return;
      }

      const listener = () => {
        this.emulator?.remove_listener('emulator-started', listener);
        resolve();
      };

      this.emulator.add_listener('emulator-started', listener);
    });
  }

  /**
   * Aguarda evento "emulator-stopped"
   */
  async waitForStopped(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.emulator) {
        resolve();
        return;
      }

      const listener = () => {
        this.emulator?.remove_listener('emulator-stopped', listener);
        resolve();
      };

      this.emulator.add_listener('emulator-stopped', listener);
    });
  }

  /**
   * Adiciona listener para progresso de download
   */
  onDownloadProgress(callback: V86EventListener<DownloadProgress>): () => void {
    return this.on('download-progress', callback);
  }

  /**
   * Adiciona listener para eventos de tela
   */
  onScreenPutChar(callback: V86EventListener<ScreenPutCharData>): () => void {
    return this.on('screen-put-char', callback);
  }

  /**
   * Adiciona listener para mudanca de tamanho de tela
   */
  onScreenSetSize(callback: V86EventListener<ScreenSetSizeData>): () => void {
    return this.on('screen-set-size', callback);
  }

  /**
   * Adiciona listener para quando mouse e habilitado/desabilitado
   */
  onMouseEnable(callback: V86EventListener<boolean>): () => void {
    return this.on('mouse-enable', callback);
  }

  /**
   * Adiciona listener para eventos 9p
   */
  on9pAttach(callback: V86EventListener<void>): () => void {
    return this.on('9p-attach', callback);
  }

  /**
   * Adiciona listener para inicio de leitura 9p
   * @param callback Recebe [filename]
   */
  on9pReadStart(callback: V86EventListener<[string]>): () => void {
    return this.on('9p-read-start', callback);
  }

  /**
   * Adiciona listener para fim de leitura 9p
   * @param callback Recebe [filename, bytes]
   */
  on9pReadEnd(callback: V86EventListener<[string, number]>): () => void {
    return this.on('9p-read-end', callback);
  }

  // ============================================
  // MEMORIA (API interna - nao documentada oficialmente)
  // ============================================

  /**
   * Le dados da memoria
   * NOTA: Este metodo usa API interna do v86 nao documentada em v86.d.ts.
   * Pode mudar ou ser removido em versoes futuras.
   */
  readMemory(offset: number, length: number): Uint8Array | undefined {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.emulator as any)?.read_memory?.(offset, length);
  }

  /**
   * Escreve dados na memoria
   * NOTA: Este metodo usa API interna do v86 nao documentada em v86.d.ts.
   * Pode mudar ou ser removido em versoes futuras.
   */
  writeMemory(data: Uint8Array | number[], offset: number): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.emulator as any)?.write_memory?.(data, offset);
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Retorna contador de instrucoes
   */
  getInstructionCounter(): number {
    return this.emulator?.get_instruction_counter() ?? 0;
  }

  // ============================================
  // NETWORK (API interna para algumas funcoes)
  // ============================================

  /**
   * Envia pacote de rede (se networking estiver habilitado)
   * NOTA: Este metodo usa API interna do v86 (bus.send) nao documentada.
   */
  sendNetworkPacket(packet: Uint8Array): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.emulator as any)?.bus?.send?.('net0-receive', packet);
  }

  /**
   * Adiciona listener para pacotes de rede enviados
   * Evento "net0-send" conforme v86.d.ts
   */
  onNetworkSend(callback: V86EventListener<Uint8Array>): () => void {
    return this.on('net0-send', callback);
  }

  // ============================================
  // VIRTIO CONSOLE
  // ============================================

  /**
   * Adiciona listener para output do virtio console
   * Evento "virtio-console0-output-bytes" conforme v86.d.ts
   */
  onVirtioConsoleOutput(callback: V86EventListener<Uint8Array>): () => void {
    return this.on('virtio-console0-output-bytes', callback);
  }
}

/**
 * Hook React para usar o V86Controller
 * @deprecated Use new V86Controller() diretamente
 */
export function useV86Controller(emulator: V86 | null): V86Controller {
  const controller = new V86Controller();

  if (emulator) {
    controller.attach(emulator);
  }

  return controller;
}

export default V86Controller;
