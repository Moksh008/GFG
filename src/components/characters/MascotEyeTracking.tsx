import React, { useEffect, useRef, useState } from 'react';

export interface EyeTrackingOffsets {
  pupilX: number;
  pupilY: number;
  tiltRotate: number;
  tiltX: number;
  tiltY: number;
}

export function useMascotEyeTracking(containerRef: React.RefObject<HTMLElement | null>, maxPupilOffset = 7) {
  const [offsets, setOffsets] = useState<EyeTrackingOffsets>({
    pupilX: 0,
    pupilY: 0,
    tiltRotate: 0,
    tiltX: 0,
    tiltY: 0,
  });

  const target = useRef({ x: 0, y: 0, rot: 0 });
  const current = useRef({ x: 0, y: 0, rot: 0 });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (window.innerWidth / 2)));
      const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (window.innerHeight / 2)));

      target.current = {
        x: normX * maxPupilOffset,
        y: normY * (maxPupilOffset * 0.85),
        rot: normX * 5,
      };
    };

    const handlePointerLeave = () => {
      target.current = { x: 0, y: 0, rot: 0 };
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);

    let animId: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      current.current.x = lerp(current.current.x, target.current.x, 0.12);
      current.current.y = lerp(current.current.y, target.current.y, 0.12);
      current.current.rot = lerp(current.current.rot, target.current.rot, 0.08);

      setOffsets({
        pupilX: current.current.x,
        pupilY: current.current.y,
        tiltRotate: current.current.rot,
        tiltX: current.current.x * 1.4,
        tiltY: current.current.y * 1.0,
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      cancelAnimationFrame(animId);
    };
  }, [containerRef, maxPupilOffset]);

  return offsets;
}

export const MascotEyeTracking: React.FC<{
  children: (offsets: EyeTrackingOffsets) => React.ReactNode;
}> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const offsets = useMascotEyeTracking(ref);

  return <div ref={ref} className="inline-block">{children(offsets)}</div>;
};

export default MascotEyeTracking;
