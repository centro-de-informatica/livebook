/**
 * RoughCanvas.tsx
 * Thin wrapper for rough.js canvas integration with React
 * Manages canvas lifecycle and provides rough.js context
 * 
 * Responsibilities:
 * - Create and manage the rough canvas instance
 * - Bind canvas to React ref
 * - Clean up resources on unmount
 * - Expose rough instance for external use via ref or callback
 * 
 * This component does NOT implement specific drawing logic.
 * Drawing logic should be delegated to parent components or custom hooks.
 */

import { useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import rough from 'roughjs';
import type { RoughCanvas as RoughCanvasType } from 'roughjs/bin/canvas';
import type { Options } from 'roughjs/bin/core';

export interface RoughCanvasProps {
  width?: number;
  height?: number;
  options?: Options;
  onReady?: (rc: RoughCanvasType, canvas: HTMLCanvasElement) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface RoughCanvasHandle {
  getRoughCanvas: () => RoughCanvasType | null;
  getCanvas: () => HTMLCanvasElement | null;
  getContext: () => CanvasRenderingContext2D | null;
  clear: () => void;
  redraw: () => void;
}

/**
 * RoughCanvas component - thin wrapper over rough.js canvas
 * 
 * Usage:
 * ```tsx
 * <RoughCanvas 
 *   width={400} 
 *   height={300}
 *   onReady={(rc, canvas) => {
 *     rc.rectangle(10, 10, 100, 100);
 *   }}
 * />
 * ```
 * 
 * Or with ref:
 * ```tsx
 * const canvasRef = useRef<RoughCanvasHandle>(null);
 * 
 * useEffect(() => {
 *   const rc = canvasRef.current?.getRoughCanvas();
 *   if (rc) {
 *     rc.circle(50, 50, 80, { fill: 'red' });
 *   }
 * }, []);
 * 
 * <RoughCanvas ref={canvasRef} width={400} height={300} />
 * ```
 */
export const RoughCanvas = forwardRef<RoughCanvasHandle, RoughCanvasProps>(
  ({ width = 300, height = 200, options, onReady, className, style }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rcRef = useRef<RoughCanvasType | null>(null);
    const onReadyRef = useRef(onReady);
    
    // Keep onReady ref updated without causing re-renders
    onReadyRef.current = onReady;

    const clear = useCallback(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    }, []);

    const initRoughCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Create rough.js canvas instance
      const rc = rough.canvas(canvas, options ? { options } : undefined);
      rcRef.current = rc;

      // Notify parent that canvas is ready
      if (onReadyRef.current) {
        onReadyRef.current(rc, canvas);
      }
    }, [options]);

    useImperativeHandle(ref, () => ({
      getRoughCanvas: () => rcRef.current,
      getCanvas: () => canvasRef.current,
      getContext: () => canvasRef.current?.getContext('2d') ?? null,
      clear,
      redraw: () => {
        clear();
        initRoughCanvas();
      },
    }), [clear, initRoughCanvas]);

    // Initialize rough canvas on mount and when options change
    useEffect(() => {
      initRoughCanvas();
      
      // Cleanup: nullify reference on unmount
      return () => {
        rcRef.current = null;
      };
    }, [initRoughCanvas]);

    // Re-initialize when dimensions change
    useEffect(() => {
      if (rcRef.current) {
        clear();
        initRoughCanvas();
      }
    }, [width, height, clear, initRoughCanvas]);

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={className}
        style={style}
      />
    );
  }
);

RoughCanvas.displayName = 'RoughCanvas';
