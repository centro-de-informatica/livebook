/**
 * RoughLine.tsx
 * Custom component that draws a hand-drawn line using rough.js
 * Uses the thin wrapper from src/components/handmade
 */

import { useRef, useEffect } from 'react';
import { useRoughCanvas, type RoughOptions } from '../rough-wrapper';

export interface RoughLineProps {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
}

export function RoughLine({
  x1 = 0,
  y1 = 0,
  x2 = 100,
  y2 = 0,
  stroke = '#000',
  strokeWidth = 1,
  roughness = 1,
}: RoughLineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isReady, line, clear } = useRoughCanvas(canvasRef);

  const padding = 10;
  const width = Math.abs(x2 - x1) + padding * 2;
  const height = Math.abs(y2 - y1) + padding * 2;

  useEffect(() => {
    if (!isReady) return;
    
    clear();
    
    const offsetX = padding - Math.min(x1, x2);
    const offsetY = padding - Math.min(y1, y2);
    
    line(x1 + offsetX, y1 + offsetY, x2 + offsetX, y2 + offsetY, {
      stroke,
      strokeWidth,
      roughness,
    });
  }, [isReady, x1, y1, x2, y2, stroke, strokeWidth, roughness, line, clear]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}
