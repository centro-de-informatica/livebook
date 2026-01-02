/**
 * RoughArrow.tsx
 * Custom component that draws a hand-drawn arrow using rough.js
 * Uses the thin wrapper from src/components/handmade
 */

import { useRef, useEffect } from 'react';
import { useRoughCanvas, type RoughOptions } from '../rough-wrapper';

export interface RoughArrowProps {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  arrowSize?: number;
}

export function RoughArrow({
  x1 = 0,
  y1 = 0,
  x2 = 100,
  y2 = 0,
  stroke = '#000',
  strokeWidth = 1,
  roughness = 1,
  arrowSize = 10,
}: RoughArrowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isReady, line, clear } = useRoughCanvas(canvasRef);

  const padding = arrowSize + 10;
  const width = Math.abs(x2 - x1) + padding * 2;
  const height = Math.max(Math.abs(y2 - y1), arrowSize * 2) + padding * 2;

  useEffect(() => {
    if (!isReady) return;
    
    clear();
    
    const offsetX = padding - Math.min(x1, x2);
    const offsetY = padding - Math.min(y1, y2) + (height / 2 - padding);
    
    const startX = x1 + offsetX;
    const startY = y1 + offsetY;
    const endX = x2 + offsetX;
    const endY = y2 + offsetY;
    
    // Main line
    line(startX, startY, endX, endY, {
      stroke,
      strokeWidth,
      roughness,
    });
    
    // Calculate arrow head angle
    const angle = Math.atan2(endY - startY, endX - startX);
    const arrowAngle = Math.PI / 6;
    
    // Arrow head lines
    line(
      endX,
      endY,
      endX - arrowSize * Math.cos(angle - arrowAngle),
      endY - arrowSize * Math.sin(angle - arrowAngle),
      { stroke, strokeWidth, roughness }
    );
    
    line(
      endX,
      endY,
      endX - arrowSize * Math.cos(angle + arrowAngle),
      endY - arrowSize * Math.sin(angle + arrowAngle),
      { stroke, strokeWidth, roughness }
    );
  }, [isReady, x1, y1, x2, y2, height, stroke, strokeWidth, roughness, arrowSize, line, clear]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}
