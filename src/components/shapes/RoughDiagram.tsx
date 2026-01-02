/**
 * RoughDiagram.tsx
 * Custom component that draws a hand-drawn diagram using rough.js
 * Uses the thin wrapper from src/components/handmade
 */

import { useRef, useEffect } from 'react';
import { useRoughCanvas } from '../rough-wrapper';

export interface RoughDiagramProps {
  width?: number;
  height?: number;
}

export function RoughDiagram({ width = 400, height = 200 }: RoughDiagramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isReady, rectangle, circle, line, clear } = useRoughCanvas(canvasRef);

  useEffect(() => {
    if (!isReady) return;

    clear();

    const options = { roughness: 1.2, strokeWidth: 1.5 };

    // Left box
    rectangle(30, 60, 80, 80, {
      ...options,
      fill: 'rgba(100, 150, 255, 0.3)',
      stroke: '#0984e3',
    });

    // Center circle
    circle(width / 2, height / 2, 60, {
      ...options,
      fill: 'rgba(255, 200, 100, 0.3)',
      stroke: '#e17055',
    });

    // Right box
    rectangle(width - 110, 60, 80, 80, {
      ...options,
      fill: 'rgba(100, 255, 150, 0.3)',
      stroke: '#00b894',
    });

    // Connecting lines
    line(110, 100, width / 2 - 35, 100, {
      ...options,
      stroke: '#636e72',
    });

    line(width / 2 + 35, 100, width - 110, 100, {
      ...options,
      stroke: '#636e72',
    });

    // Arrow heads (left to center)
    const arrowSize = 8;
    line(width / 2 - 35, 100, width / 2 - 35 - arrowSize, 100 - arrowSize, {
      ...options,
      stroke: '#636e72',
    });
    line(width / 2 - 35, 100, width / 2 - 35 - arrowSize, 100 + arrowSize, {
      ...options,
      stroke: '#636e72',
    });

    // Arrow heads (center to right)
    line(width - 110, 100, width - 110 - arrowSize, 100 - arrowSize, {
      ...options,
      stroke: '#636e72',
    });
    line(width - 110, 100, width - 110 - arrowSize, 100 + arrowSize, {
      ...options,
      stroke: '#636e72',
    });
  }, [isReady, width, height, rectangle, circle, line, clear]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}
