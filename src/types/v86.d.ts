declare global {
  interface Window {
    V86: typeof V86;
  }
}

export type V86Image =
  | {
      url: string;
      async?: boolean;
      size?: number;
      use_parts?: boolean;
      fixed_chunk_size?: number;
    }
  | { buffer: ArrayBuffer };

export type V86Event =
  | "9p-attach"
  | "9p-read-end"
  | "9p-read-start"
  | "9p-write-end"
  | "download-error"
  | "download-progress"
  | "emulator-loaded"
  | "emulator-ready"
  | "emulator-started"
  | "emulator-stopped"
  | "eth-receive-end"
  | "eth-transmit-end"
  | "ide-read-end"
  | "ide-read-start"
  | "ide-write-end"
  | "mouse-enable"
  | "net0-send"
  | "screen-put-char"
  | "screen-set-size"
  | "serial0-output-byte"
  | "virtio-console0-output-bytes";

export interface V86Options {
  wasm_path?: string;
  memory_size?: number;
  vga_memory_size?: number;
  autostart?: boolean;
  disable_keyboard?: boolean;
  disable_mouse?: boolean;
  disable_speaker?: boolean;
  bios?: V86Image;
  vga_bios?: V86Image;
  hda?: V86Image;
  hdb?: V86Image;
  fda?: V86Image;
  fdb?: V86Image;
  cdrom?: V86Image;
  bzimage?: V86Image;
  cmdline?: string;
  initrd?: V86Image;
  bzimage_initrd_from_filesystem?: boolean;
  multiboot?: V86Image;
  initial_state?: V86Image;
  preserve_mac_from_state_image?: boolean;
  filesystem?: {
    baseurl?: string;
    basefs?: string;
    handle9p?: (reqbuf: Uint8Array, reply: (replybuf: Uint8Array) => void) => void;
    proxy_url?: string;
  };
  serial_container?: HTMLTextAreaElement;
  serial_container_xtermjs?: HTMLElement;
  screen_container?: HTMLElement | null;
  acpi?: boolean;
  log_level?: number;
  boot_order?: number;
  fastboot?: boolean;
  virtio_balloon?: boolean;
  virtio_console?: boolean;
  cpuid_level?: number;
  disable_jit?: boolean;
  network_relay_url?: string;
  net_device?: {
    type?: "ne2k" | "virtio";
    relay_url?: string;
    id?: number;
    router_mac?: string;
    router_ip?: string;
    vm_ip?: string;
    masquerade?: boolean;
    dns_method?: "static" | "doh";
    doh_server?: string;
    cors_proxy?: string;
    mtu?: number;
  };
}

export declare class V86 {
  constructor(options: V86Options);
  run(): void;
  stop(): Promise<void>;
  destroy(): Promise<void>;
  restart(): void;
  add_listener(event: V86Event, listener: Function): void;
  remove_listener(event: V86Event, listener: Function): void;
  restore_state(state: ArrayBuffer): Promise<void>;
  save_state(): Promise<ArrayBuffer>;
  get_instruction_counter(): number;
  is_running(): boolean;
  set_fda(image: V86Image): Promise<void>;
  eject_fda(): void;
  set_cdrom(image: V86Image): Promise<void>;
  eject_cdrom(): void;
  keyboard_send_scancodes(codes: number[]): void;
  keyboard_send_keys(codes: number[]): void;
  keyboard_send_text(text: string): void;
  screen_make_screenshot(): HTMLElement;
  serial0_send(data: string): void;
  serial_send_bytes(serial: number, data: Uint8Array): void;
  create_file(file: string, data: Uint8Array): Promise<void>;
  read_file(file: string): Promise<Uint8Array>;
  read_memory(offset: number, length: number): Uint8Array;
  write_memory(blob: Uint8Array | number[], offset: number): void;
}

export default V86;
