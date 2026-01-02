/**
 * RoughCircle.tsx
 * Custom component that draws a hand-drawn circle using rough.js
 * Uses the thin wrapper from src/components/handmade
 */

import { useRef, useEffect } from 'react';
import { useRoughCanvas, type RoughOptions } from '../rough-wrapper';

export interface RoughCircleProps {
  diameter?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  fillStyle?: RoughOptions['fillStyle'];
}

export function RoughCircle({
  diameter = 100,
  fill,
  stroke = '#000',
  strokeWidth = 1,
  roughness = 1,
  fillStyle = 'hachure',
}: RoughCircleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isReady, circle, clear } = useRoughCanvas(canvasRef);

  const size = diameter + 8;
  const center = size / 2;

  useEffect(() => {
    if (!isReady) return;
    
    clear();
    
    circle(center, center, diameter, {
      fill,
      stroke,
      strokeWidth,
      roughness,
      fillStyle,
    });
  }, [isReady, diameter, center, fill, stroke, strokeWidth, roughness, fillStyle, circle, clear]);

  return <canvas ref={canvasRef} width={size} height={size} />;
}
