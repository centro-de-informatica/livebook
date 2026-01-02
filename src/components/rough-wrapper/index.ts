/**
 * handmade/index.ts
 * Exports for hand-drawn rough.js components
 * 
 * Core Components (thin wrappers as per AGENTS.md):
 * - RoughCanvas: Canvas-based rough.js wrapper
 * - RoughSvg: SVG-based rough.js wrapper
 * 
 * Hooks:
 * - useRoughCanvas: Hook for canvas-based rough.js
 * - useRoughSvg: Hook for SVG-based rough.js
 */

// Core thin wrappers
export { RoughCanvas } from './RoughCanvas';
export type { RoughCanvasProps, RoughCanvasHandle } from './RoughCanvas';

export { RoughSvg } from './RoughSvg';
export type { RoughSvgProps, RoughSvgHandle } from './RoughSvg';

// Custom hooks
export { useRoughCanvas, useRoughSvg } from './useRough';
export type { 
  UseRoughCanvasReturn, 
  UseRoughSvgReturn, 
  RoughOptions,
  FillStyle 
} from './useRough';

