// Type declarations for the v86 npm package
// This file provides types for the ESM module import

declare module "v86" {
  import type { V86 as V86Class, V86Options, V86Image, Event, LogLevel, BootOrder } from "./v86";
  
  export const V86: typeof V86Class;
  export default V86Class;
  export type { V86Options, V86Image, Event, LogLevel, BootOrder };
}
