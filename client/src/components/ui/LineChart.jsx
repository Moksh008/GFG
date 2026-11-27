import React, { useLayoutEffect, useRef, useState } from 'react';

const PAD_X = 12;
const PAD_Y = 10;
const MAX_LABELS = 8;

/** Tracks an element's rendered width so the SVG can use real pixel coordinates. */
function useWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

/**
 * Responsive SVG line chart that fills its container.
 * points: [{ label, value, color? }], plotted on [min, max]. Labels are thinned to avoid overlap.
 */
export function LineChart({ points, min = 0, max = 100, height = 80, stroke = '#1F2A2E', ghost = false, formatValue = (v) => v }) {
  const [ref, width] = useWidth();
  const span = max - min || 1;
  const n = points.length;
  const xy = points.map((p, i) => ({
    ...p,
    x: n === 1 ? width / 2 : PAD_X + (i * (width - 2 * PAD_X)) / (n - 1),
    y: PAD_Y + (1 - (p.value - min) / span) * (height - 2 * PAD_Y)
  }));
  const path = xy.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');
  const labelEvery = Math.max(1, Math.ceil(n / MAX_LABELS));

  return (
    <div ref={ref} className="w-full">
      {width > 0 && n > 0 && (
        <>
          <svg width={width} height={height} className="overflow-visible block">
            {ghost && <path d={path} transform="translate(0 8)" fill="none" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="3 3" />}
            <path d={path} fill="none" stroke={stroke} strokeWidth="1.5" />
            {xy.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={n > 20 ? 2.5 : 3.5} fill={p.color || stroke} stroke="white" strokeWidth="2">
                <title>{`${p.label}: ${formatValue(p.value)}`}</title>
              </circle>
            ))}
          </svg>
          <div className="relative h-4 text-[10px] text-[#8A9AA0] font-semibold">
            {xy.map((p, i) =>
              // Always try to label the last point, unless it would collide with the previous label.
              i % labelEvery === 0 || (i === n - 1 && (n - 1) % labelEvery >= labelEvery / 2) ? (
                <span key={i} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: p.x }}>
                  {p.label}
                </span>
              ) : null
            )}
          </div>
        </>
      )}
    </div>
  );
}
