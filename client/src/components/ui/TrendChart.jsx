import React, { useLayoutEffect, useRef, useState } from 'react';

const PAD = { top: 12, right: 14, bottom: 22, left: 34 };

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

function niceMax(v) {
  if (v <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

/**
 * Single-series time chart with an area wash, recessive grid and a crosshair tooltip
 * (mouse + touch). points: [{ label, value, color?, detail? }] oldest -> newest.
 */
export function TrendChart({
  points,
  height = 150,
  min = 0,
  max,
  stroke = '#0F3B3F',
  fill = '#0F3B3F',
  formatValue = (v) => v,
  ariaLabel = 'Trend chart'
}) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const n = points.length;
  const top = max ?? niceMax(Math.max(...points.map((p) => p.value), 0) * 1.1);
  const span = top - min || 1;
  const innerW = Math.max(width - PAD.left - PAD.right, 1);
  const innerH = height - PAD.top - PAD.bottom;
  const xy = points.map((p, i) => ({
    ...p,
    x: PAD.left + (n === 1 ? innerW / 2 : (i * innerW) / (n - 1)),
    y: PAD.top + (1 - (p.value - min) / span) * innerH
  }));
  const line = xy.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
  const area = n > 1 ? `${line} L${xy[n - 1].x},${PAD.top + innerH} L${xy[0].x},${PAD.top + innerH} Z` : '';
  const ticks = [min, min + span / 2, top];
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(innerW / 56))));

  const pick = (clientX) => {
    const rect = ref.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let best = 0;
    xy.forEach((p, i) => {
      if (Math.abs(p.x - x) < Math.abs(xy[best].x - x)) best = i;
    });
    setHover(best);
  };

  const h = hover !== null ? xy[hover] : null;

  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      {width > 0 && n > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel}
          className="block overflow-visible touch-pan-y"
          onMouseMove={(e) => pick(e.clientX)}
          onMouseLeave={() => setHover(null)}
          onTouchStart={(e) => pick(e.touches[0].clientX)}
          onTouchMove={(e) => pick(e.touches[0].clientX)}
        >
          {ticks.map((t) => {
            const y = PAD.top + (1 - (t - min) / span) * innerH;
            return (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y} y2={y} stroke="#EEF2F4" strokeWidth="1" />
                <text x={PAD.left - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#8A9AA0" fontWeight="600">
                  {formatValue(Math.round(t * 10) / 10)}
                </text>
              </g>
            );
          })}
          {area && <path d={area} fill={fill} opacity="0.08" />}
          {n > 1 && <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
          {h && <line x1={h.x} x2={h.x} y1={PAD.top} y2={PAD.top + innerH} stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />}
          {xy.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hover === i ? 6 : 4.5}
              fill={p.color || stroke}
              stroke="#fff"
              strokeWidth="2"
            />
          ))}
          {xy.map((p, i) =>
            // Always try to label the newest point unless it would collide with the previous label.
            i % labelEvery === 0 || (i === n - 1 && (n - 1) % labelEvery >= labelEvery / 2) ? (
              <text key={`l${i}`} x={p.x} y={height - 6} textAnchor="middle" fontSize="9" fill="#8A9AA0" fontWeight="600">
                {p.label}
              </text>
            ) : null
          )}
        </svg>
      )}
      {h && (
        <div
          className="absolute z-20 pointer-events-none bg-[#0F2A2E] text-white text-[10px] rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap"
          style={{
            left: Math.min(Math.max(h.x, 70), width - 70),
            top: Math.max(h.y - 12, 0),
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="font-semibold opacity-80">{h.detailTitle || h.label}</div>
          <div className="text-[12px] font-bold">{formatValue(h.value)}</div>
          {h.detail && <div className="opacity-80">{h.detail}</div>}
        </div>
      )}
    </div>
  );
}
