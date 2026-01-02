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

import { useCallback, useEffect, useState } from 'react';
import rough from 'roughjs';
import type { RoughCanvas } from 'roughjs/bin/canvas';
import type { RoughSVG } from 'roughjs/bin/svg';
import type { Options, Drawable } from 'roughjs/bin/core';

/**
 * All available fill styles in rough.js
 * From official source: https://github.com/rough-stuff/rough/blob/main/src/fillers/filler.ts
 */
export type FillStyle =
  | 'hachure' // Default - sketchy parallel lines
  | 'solid' // Conventional fill
  | 'zigzag' // Zig-zag lines
  | 'cross-hatch' // Cross hatch lines (two hachure fills 90 degrees apart)
  | 'dots' // Sketchy dots
  | 'dashed' // Dashed hachure lines
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
  rectangle: (
    x: number,
    y: number,
    width: number,
    height: number,
    options?: RoughOptions
  ) => Drawable | null;
  ellipse: (
    x: number,
    y: number,
    width: number,
    height: number,
    options?: RoughOptions
  ) => Drawable | null;
  circle: (x: number, y: number, diameter: number, options?: RoughOptions) => Drawable | null;
  linearPath: (points: [number, number][], options?: RoughOptions) => Drawable | null;
  polygon: (points: [number, number][], options?: RoughOptions) => Drawable | null;
  arc: (
    x: number,
    y: number,
    width: number,
    height: number,
    start: number,
    stop: number,
    closed?: boolean,
    options?: RoughOptions
  ) => Drawable | null;
  curve: (points: [number, number][], options?: RoughOptions) => Drawable | null;
  path: (d: string, options?: RoughOptions) => Drawable | null;
}

export interface UseRoughSvgReturn {
  rc: RoughSVG | null;
  isReady: boolean;
  clear: () => void;
  line: (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    options?: RoughOptions
  ) => SVGGElement | null;
  rectangle: (
    x: number,
    y: number,
    width: number,
    height: number,
    options?: RoughOptions
  ) => SVGGElement | null;
  ellipse: (
    x: number,
    y: number,
    width: number,
    height: number,
    options?: RoughOptions
  ) => SVGGElement | null;
  circle: (x: number, y: number, diameter: number, options?: RoughOptions) => SVGGElement | null;
  linearPath: (points: [number, number][], options?: RoughOptions) => SVGGElement | null;
  polygon: (points: [number, number][], options?: RoughOptions) => SVGGElement | null;
  arc: (
    x: number,
    y: number,
    width: number,
    height: number,
    start: number,
    stop: number,
    closed?: boolean,
    options?: RoughOptions
  ) => SVGGElement | null;
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
  const [rc, setRc] = useState<RoughCanvas | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const instance = rough.canvas(canvas, defaultOptions ? { options: defaultOptions } : undefined);
    setRc(instance);
    setIsReady(true);

    return () => {
      setRc(null);
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

  const draw = useCallback(
    (drawable: Drawable) => {
      rc?.draw(drawable);
    },
    [rc]
  );

  const line = useCallback(
    (x1: number, y1: number, x2: number, y2: number, options?: RoughOptions) => {
      return rc?.line(x1, y1, x2, y2, options) ?? null;
    },
    [rc]
  );

  const rectangle = useCallback(
    (x: number, y: number, width: number, height: number, options?: RoughOptions) => {
      return rc?.rectangle(x, y, width, height, options) ?? null;
    },
    [rc]
  );

  const ellipse = useCallback(
    (x: number, y: number, width: number, height: number, options?: RoughOptions) => {
      return rc?.ellipse(x, y, width, height, options) ?? null;
    },
    [rc]
  );

  const circle = useCallback(
    (x: number, y: number, diameter: number, options?: RoughOptions) => {
      return rc?.circle(x, y, diameter, options) ?? null;
    },
    [rc]
  );

  const linearPath = useCallback(
    (points: [number, number][], options?: RoughOptions) => {
      return rc?.linearPath(points, options) ?? null;
    },
    [rc]
  );

  const polygon = useCallback(
    (points: [number, number][], options?: RoughOptions) => {
      return rc?.polygon(points, options) ?? null;
    },
    [rc]
  );

  const arc = useCallback(
    (
      x: number,
      y: number,
      width: number,
      height: number,
      start: number,
      stop: number,
      closed = false,
      options?: RoughOptions
    ) => {
      return rc?.arc(x, y, width, height, start, stop, closed, options) ?? null;
    },
    [rc]
  );

  const curve = useCallback(
    (points: [number, number][], options?: RoughOptions) => {
      return rc?.curve(points, options) ?? null;
    },
    [rc]
  );

  const path = useCallback(
    (d: string, options?: RoughOptions) => {
      return rc?.path(d, options) ?? null;
    },
    [rc]
  );

  return {
    rc,
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
  const [rc, setRc] = useState<RoughSVG | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) {
      return;
    }

    const instance = rough.svg(svg, defaultOptions ? { options: defaultOptions } : undefined);
    setRc(instance);
    setIsReady(true);

    return () => {
      setRc(null);
      setIsReady(false);
    };
  }, [svgRef, defaultOptions]);

  const clear = useCallback(() => {
    const svg = svgRef.current;
    if (svg) {
      // Remove only rough.js generated elements (g elements)
      const roughElements = svg.querySelectorAll(':scope > g');
      roughElements.forEach((el) => el.remove());
    }
  }, [svgRef]);

  const line = useCallback(
    (x1: number, y1: number, x2: number, y2: number, options?: RoughOptions) => {
      return rc?.line(x1, y1, x2, y2, options) ?? null;
    },
    [rc]
  );

  const rectangle = useCallback(
    (x: number, y: number, width: number, height: number, options?: RoughOptions) => {
      return rc?.rectangle(x, y, width, height, options) ?? null;
    },
    [rc]
  );

  const ellipse = useCallback(
    (x: number, y: number, width: number, height: number, options?: RoughOptions) => {
      return rc?.ellipse(x, y, width, height, options) ?? null;
    },
    [rc]
  );

  const circle = useCallback(
    (x: number, y: number, diameter: number, options?: RoughOptions) => {
      return rc?.circle(x, y, diameter, options) ?? null;
    },
    [rc]
  );

  const linearPath = useCallback(
    (points: [number, number][], options?: RoughOptions) => {
      return rc?.linearPath(points, options) ?? null;
    },
    [rc]
  );

  const polygon = useCallback(
    (points: [number, number][], options?: RoughOptions) => {
      return rc?.polygon(points, options) ?? null;
    },
    [rc]
  );

  const arc = useCallback(
    (
      x: number,
      y: number,
      width: number,
      height: number,
      start: number,
      stop: number,
      closed = false,
      options?: RoughOptions
    ) => {
      return rc?.arc(x, y, width, height, start, stop, closed, options) ?? null;
    },
    [rc]
  );

  const curve = useCallback(
    (points: [number, number][], options?: RoughOptions) => {
      return rc?.curve(points, options) ?? null;
    },
    [rc]
  );

  const path = useCallback(
    (d: string, options?: RoughOptions) => {
      return rc?.path(d, options) ?? null;
    },
    [rc]
  );

  return {
    rc,
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
