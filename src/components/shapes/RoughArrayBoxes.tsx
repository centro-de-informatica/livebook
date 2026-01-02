/**
 * RoughArrayBoxes.tsx
 * Custom component that draws an animated array of hand-drawn boxes using rough.js
 * Uses the thin wrapper from src/components/handmade
 */

import { useRef, useEffect, useState } from 'react';
import { useRoughCanvas } from '../rough-wrapper';

export interface RoughArrayBoxesProps {
  count?: number;
  boxWidth?: number;
  boxHeight?: number;
  gap?: number;
  interval?: number;
}

export function RoughArrayBoxes({
  count = 5,
  boxWidth = 60,
  boxHeight = 60,
  gap = 10,
  interval = 1000,
}: RoughArrayBoxesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isReady, rectangle, clear } = useRoughCanvas(canvasRef);
  const [activeIndex, setActiveIndex] = useState(0);

  const totalWidth = count * boxWidth + (count - 1) * gap + 20;
  const totalHeight = boxHeight + 20;

  // Animation cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, interval);

    return () => clearInterval(timer);
  }, [count, interval]);

  // Draw boxes
  useEffect(() => {
    if (!isReady) return;
    
    clear();
    
    for (let i = 0; i < count; i++) {
      const x = 10 + i * (boxWidth + gap);
      const y = 10;
      const isActive = i === activeIndex;
      
      rectangle(x, y, boxWidth, boxHeight, {
        roughness: 1.5,
        strokeWidth: isActive ? 2.5 : 1.5,
        stroke: isActive ? '#e17055' : '#636e72',
        fill: isActive ? 'rgba(225, 112, 85, 0.3)' : 'rgba(99, 110, 114, 0.1)',
        fillStyle: 'hachure',
      });
    }
  }, [isReady, count, boxWidth, boxHeight, gap, activeIndex, rectangle, clear]);

  return <canvas ref={canvasRef} width={totalWidth} height={totalHeight} />;
}
