/**
 * RoughSvg.tsx
 * Thin wrapper for rough.js SVG integration with React
 * Manages SVG lifecycle and provides rough.js context
 * 
 * Responsibilities:
 * - Create and manage the rough SVG instance
 * - Bind SVG to React ref
 * - Clean up resources on unmount
 * - Expose rough instance for external use via ref or callback
 * 
 * This component does NOT implement specific drawing logic.
 * Drawing logic should be delegated to parent components or custom hooks.
 */

import { useRef, useEffect, forwardRef, useImperativeHandle, useCallback, type ReactNode } from 'react';
import rough from 'roughjs';
import type { RoughSVG as RoughSVGType } from 'roughjs/bin/svg';
import type { Options } from 'roughjs/bin/core';

export interface RoughSvgProps {
  width?: number;
  height?: number;
  viewBox?: string;
  options?: Options;
  onReady?: (rc: RoughSVGType, svg: SVGSVGElement) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

export interface RoughSvgHandle {
  getRoughSvg: () => RoughSVGType | null;
  getSvg: () => SVGSVGElement | null;
  clear: () => void;
  redraw: () => void;
}

/**
 * RoughSvg component - thin wrapper over rough.js SVG
 * 
 * Usage:
 * ```tsx
 * <RoughSvg 
 *   width={400} 
 *   height={300}
 *   onReady={(rc, svg) => {
 *     const rect = rc.rectangle(10, 10, 100, 100);
 *     svg.appendChild(rect);
 *   }}
 * />
 * ```
 * 
 * Or with ref:
 * ```tsx
 * const svgRef = useRef<RoughSvgHandle>(null);
 * 
 * useEffect(() => {
 *   const rc = svgRef.current?.getRoughSvg();
 *   const svg = svgRef.current?.getSvg();
 *   if (rc && svg) {
 *     const circle = rc.circle(50, 50, 80, { fill: 'red' });
 *     svg.appendChild(circle);
 *   }
 * }, []);
 * 
 * <RoughSvg ref={svgRef} width={400} height={300} />
 * ```
 */
export const RoughSvg = forwardRef<RoughSvgHandle, RoughSvgProps>(
  ({ width = 300, height = 200, viewBox, options, onReady, className, style, children }, ref) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const rcRef = useRef<RoughSVGType | null>(null);
    const onReadyRef = useRef(onReady);
    
    // Keep onReady ref updated without causing re-renders
    onReadyRef.current = onReady;

    const clear = useCallback(() => {
      const svg = svgRef.current;
      if (svg) {
        // Remove only rough.js generated elements (g elements), preserve children
        const roughElements = svg.querySelectorAll(':scope > g');
        roughElements.forEach(el => el.remove());
      }
    }, []);

    const initRoughSvg = useCallback(() => {
      const svg = svgRef.current;
      if (!svg) return;

      // Create rough.js SVG instance
      const rc = rough.svg(svg, options ? { options } : undefined);
      rcRef.current = rc;

      // Notify parent that SVG is ready
      if (onReadyRef.current) {
        onReadyRef.current(rc, svg);
      }
    }, [options]);

    useImperativeHandle(ref, () => ({
      getRoughSvg: () => rcRef.current,
      getSvg: () => svgRef.current,
      clear,
      redraw: () => {
        clear();
        initRoughSvg();
      },
    }), [clear, initRoughSvg]);

    // Initialize rough SVG on mount and when options change
    useEffect(() => {
      initRoughSvg();
      
      // Cleanup: nullify reference on unmount
      return () => {
        rcRef.current = null;
      };
    }, [initRoughSvg]);

    // Re-initialize when dimensions change
    useEffect(() => {
      if (rcRef.current) {
        clear();
        initRoughSvg();
      }
    }, [width, height, clear, initRoughSvg]);

    return (
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={viewBox}
        className={className}
        style={style}
      >
        {children}
      </svg>
    );
  }
);

RoughSvg.displayName = 'RoughSvg';
