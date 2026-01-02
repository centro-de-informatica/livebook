/**
 * RoughBox.tsx
 * Custom component that draws a hand-drawn rectangle using rough.js
 * Uses the thin wrapper from src/components/handmade
 */

import { useRef, useEffect } from 'react';
import { useRoughCanvas, type RoughOptions } from '../rough-wrapper';

export interface RoughBoxProps {
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  fillStyle?: RoughOptions['fillStyle'];
}

export function RoughBox({
  width = 100,
  height = 100,
  fill,
  stroke = '#000',
  strokeWidth = 1,
  roughness = 1,
  fillStyle = 'hachure',
}: RoughBoxProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isReady, rectangle, clear } = useRoughCanvas(canvasRef);

  useEffect(() => {
    if (!isReady) return;

    clear();

    const padding = 4;
    rectangle(padding, padding, width - padding * 2, height - padding * 2, {
      fill,
      stroke,
      strokeWidth,
      roughness,
      fillStyle,
    });
  }, [isReady, width, height, fill, stroke, strokeWidth, roughness, fillStyle, rectangle, clear]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}
