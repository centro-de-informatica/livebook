/**
 * RoughEllipse.tsx
 * Custom component that draws a hand-drawn ellipse using rough.js
 * Uses the thin wrapper from src/components/handmade
 */

import { useRef, useEffect } from 'react';
import { useRoughCanvas, type RoughOptions } from '../rough-wrapper';

export interface RoughEllipseProps {
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  fillStyle?: RoughOptions['fillStyle'];
}

export function RoughEllipse({
  width = 140,
  height = 100,
  fill,
  stroke = '#000',
  strokeWidth = 1,
  roughness = 1,
  fillStyle = 'hachure',
}: RoughEllipseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isReady, ellipse, clear } = useRoughCanvas(canvasRef);

  const canvasWidth = width + 8;
  const canvasHeight = height + 8;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  useEffect(() => {
    if (!isReady) return;

    clear();

    ellipse(centerX, centerY, width, height, {
      fill,
      stroke,
      strokeWidth,
      roughness,
      fillStyle,
    });
  }, [
    isReady,
    width,
    height,
    centerX,
    centerY,
    fill,
    stroke,
    strokeWidth,
    roughness,
    fillStyle,
    ellipse,
    clear,
  ]);

  return <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />;
}
