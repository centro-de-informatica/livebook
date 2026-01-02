/**
 * useRough.ts
 * Custom hook for using rough.js with React
 * 
 * Responsibilities:
 * - Abstract rough.js instance creation
 * - Provide utility functions for drawing
 * - Manage canvas/svg state if necessary
 * 
 * This hook is kept simple and composable.
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import rough from 'roughjs';
import type { RoughCanvas } from 'roughjs/bin/canvas';
import type { RoughSVG } from 'roughjs/bin/svg';
import type { Options, Drawable } from 'roughjs/bin/core';

/**
 * All available fill styles in rough.js
 * From official source: https://github.com/rough-stuff/rough/blob/main/src/fillers/filler.ts
 */
export type FillStyle = 
  | 'hachure'      // Default - sketchy parallel lines
  | 'solid'        // Conventional fill
  | 'zigzag'       // Zig-zag lines
  | 'cross-hatch'  // Cross hatch lines (two hachure fills 90 degrees apart)
  | 'dots'         // Sketchy dots
  | 'dashed'       // Dashed hachure lines
  | 'zigzag-line'; // Individual lines in zig-zag fashion

/**
 * Extended options interface with proper fillStyle type
 */
export interface RoughOptions extends Omit<Options, 'fillStyle'> {
  fillStyle?: FillStyle;
}

export interface UseRoughCanvasReturn {
  rc: RoughCanvas | null;
  isReady: boolean;
  draw: (drawable: Drawable) => void;
  clear: () => void;
  line: (x1: number, y1: number, x2: number, y2: number, options?: RoughOptions) => Drawable | null;
  rectangle: (x: number, y: number, width: number, height: number, options?: RoughOptions) => Drawable | null;
  ellipse: (x: number, y: number, width: number, height: number, options?: RoughOptions) => Drawable | null;
  circle: (x: number, y: number, diameter: number, options?: RoughOptions) => Drawable | null;
  linearPath: (points: [number, number][], options?: RoughOptions) => Drawable | null;
  polygon: (points: [number, number][], options?: RoughOptions) => Drawable | null;
  arc: (x: number, y: number, width: number, height: number, start: number, stop: number, closed?: boolean, options?: RoughOptions) => Drawable | null;
  curve: (points: [number, number][], options?: RoughOptions) => Drawable | null;
  path: (d: string, options?: RoughOptions) => Drawable | null;
}

export interface UseRoughSvgReturn {
  rc: RoughSVG | null;
  isReady: boolean;
  clear: () => void;
  line: (x1: number, y1: number, x2: number, y2: number, options?: RoughOptions) => SVGGElement | null;
  rectangle: (x: number, y: number, width: number, height: number, options?: RoughOptions) => SVGGElement | null;
  ellipse: (x: number, y: number, width: number, height: number, options?: RoughOptions) => SVGGElement | null;
  circle: (x: number, y: number, diameter: number, options?: RoughOptions) => SVGGElement | null;
  linearPath: (points: [number, number][], options?: RoughOptions) => SVGGElement | null;
  polygon: (points: [number, number][], options?: RoughOptions) => SVGGElement | null;
  arc: (x: number, y: number, width: number, height: number, start: number, stop: number, closed?: boolean, options?: RoughOptions) => SVGGElement | null;
  curve: (points: [number, number][], options?: RoughOptions) => SVGGElement | null;
  path: (d: string, options?: RoughOptions) => SVGGElement | null;
}

/**
 * Hook for using rough.js with a Canvas element
 * 
 * @param canvasRef - React ref to the canvas element
 * @param defaultOptions - Default options for all drawings
 * 
 * @example
 * ```tsx
 * const canvasRef = useRef<HTMLCanvasElement>(null);
 * const { rc, isReady, rectangle, circle, clear } = useRoughCanvas(canvasRef);
 * 
 * useEffect(() => {
 *   if (isReady) {
 *     rectangle(10, 10, 100, 100, { fill: 'red' });
 *     circle(200, 60, 80, { fill: 'blue', fillStyle: 'cross-hatch' });
 *   }
 * }, [isReady]);
 * 
 * return <canvas ref={canvasRef} width={400} height={200} />;
 * ```
 */
export function useRoughCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  defaultOptions?: RoughOptions
): UseRoughCanvasReturn {
  const rcRef = useRef<RoughCanvas | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setIsReady(false);
      return;
    }

    rcRef.current = rough.canvas(canvas, defaultOptions ? { options: defaultOptions } : undefined);
    setIsReady(true);

    return () => {
      rcRef.current = null;
      setIsReady(false);
    };
  }, [canvasRef, defaultOptions]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [canvasRef]);

  const draw = useCallback((drawable: Drawable) => {
    rcRef.current?.draw(drawable);
  }, []);

  const line = useCallback((x1: number, y1: number, x2: number, y2: number, options?: RoughOptions) => {
    return rcRef.current?.line(x1, y1, x2, y2, options) ?? null;
  }, []);

  const rectangle = useCallback((x: number, y: number, width: number, height: number, options?: RoughOptions) => {
    return rcRef.current?.rectangle(x, y, width, height, options) ?? null;
  }, []);

  const ellipse = useCallback((x: number, y: number, width: number, height: number, options?: RoughOptions) => {
    return rcRef.current?.ellipse(x, y, width, height, options) ?? null;
  }, []);

  const circle = useCallback((x: number, y: number, diameter: number, options?: RoughOptions) => {
    return rcRef.current?.circle(x, y, diameter, options) ?? null;
  }, []);

  const linearPath = useCallback((points: [number, number][], options?: RoughOptions) => {
    return rcRef.current?.linearPath(points, options) ?? null;
  }, []);

  const polygon = useCallback((points: [number, number][], options?: RoughOptions) => {
    return rcRef.current?.polygon(points, options) ?? null;
  }, []);

  const arc = useCallback((x: number, y: number, width: number, height: number, start: number, stop: number, closed = false, options?: RoughOptions) => {
    return rcRef.current?.arc(x, y, width, height, start, stop, closed, options) ?? null;
  }, []);

  const curve = useCallback((points: [number, number][], options?: RoughOptions) => {
    return rcRef.current?.curve(points, options) ?? null;
  }, []);

  const path = useCallback((d: string, options?: RoughOptions) => {
    return rcRef.current?.path(d, options) ?? null;
  }, []);

  return {
    rc: rcRef.current,
    isReady,
    draw,
    clear,
    line,
    rectangle,
    ellipse,
    circle,
    linearPath,
    polygon,
    arc,
    curve,
    path,
  };
}

/**
 * Hook for using rough.js with an SVG element
 * 
 * @param svgRef - React ref to the SVG element
 * @param defaultOptions - Default options for all drawings
 * 
 * @example
 * ```tsx
 * const svgRef = useRef<SVGSVGElement>(null);
 * const { rc, isReady, rectangle, circle, clear } = useRoughSvg(svgRef);
 * 
 * useEffect(() => {
 *   const svg = svgRef.current;
 *   if (isReady && svg) {
 *     const rect = rectangle(10, 10, 100, 100, { fill: 'red' });
 *     const circ = circle(200, 60, 80, { fill: 'blue', fillStyle: 'dots' });
 *     if (rect) svg.appendChild(rect);
 *     if (circ) svg.appendChild(circ);
 *   }
 * }, [isReady]);
 * 
 * return <svg ref={svgRef} width={400} height={200} />;
 * ```
 */
export function useRoughSvg(
  svgRef: React.RefObject<SVGSVGElement | null>,
  defaultOptions?: RoughOptions
): UseRoughSvgReturn {
  const rcRef = useRef<RoughSVG | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) {
      setIsReady(false);
      return;
    }

    rcRef.current = rough.svg(svg, defaultOptions ? { options: defaultOptions } : undefined);
    setIsReady(true);

    return () => {
      rcRef.current = null;
      setIsReady(false);
    };
  }, [svgRef, defaultOptions]);

  const clear = useCallback(() => {
    const svg = svgRef.current;
    if (svg) {
      // Remove only rough.js generated elements (g elements)
      const roughElements = svg.querySelectorAll(':scope > g');
      roughElements.forEach(el => el.remove());
    }
  }, [svgRef]);

  const line = useCallback((x1: number, y1: number, x2: number, y2: number, options?: RoughOptions) => {
    return rcRef.current?.line(x1, y1, x2, y2, options) ?? null;
  }, []);

  const rectangle = useCallback((x: number, y: number, width: number, height: number, options?: RoughOptions) => {
    return rcRef.current?.rectangle(x, y, width, height, options) ?? null;
  }, []);

  const ellipse = useCallback((x: number, y: number, width: number, height: number, options?: RoughOptions) => {
    return rcRef.current?.ellipse(x, y, width, height, options) ?? null;
  }, []);

  const circle = useCallback((x: number, y: number, diameter: number, options?: RoughOptions) => {
    return rcRef.current?.circle(x, y, diameter, options) ?? null;
  }, []);

  const linearPath = useCallback((points: [number, number][], options?: RoughOptions) => {
    return rcRef.current?.linearPath(points, options) ?? null;
  }, []);

  const polygon = useCallback((points: [number, number][], options?: RoughOptions) => {
    return rcRef.current?.polygon(points, options) ?? null;
  }, []);

  const arc = useCallback((x: number, y: number, width: number, height: number, start: number, stop: number, closed = false, options?: RoughOptions) => {
    return rcRef.current?.arc(x, y, width, height, start, stop, closed, options) ?? null;
  }, []);

  const curve = useCallback((points: [number, number][], options?: RoughOptions) => {
    return rcRef.current?.curve(points, options) ?? null;
  }, []);

  const path = useCallback((d: string, options?: RoughOptions) => {
    return rcRef.current?.path(d, options) ?? null;
  }, []);

  return {
    rc: rcRef.current,
    isReady,
    clear,
    line,
    rectangle,
    ellipse,
    circle,
    linearPath,
    polygon,
    arc,
    curve,
    path,
  };
}
