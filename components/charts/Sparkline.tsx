"use client";

import { useId } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  className?: string;
  ariaLabel?: string;
}

/**
 * Tiny inline SVG sparkline. No dependencies, scales to any width.
 *
 * - Uses `preserveAspectRatio="none"` so the path stretches to fill the
 *   container while the stroke width stays in viewBox units.
 * - When `data` is empty or constant, renders a flat line at the bottom.
 */
export default function Sparkline({
  data,
  width = 120,
  height = 36,
  stroke = "#6366f1",
  fill = "rgba(99,102,241,0.15)",
  className = "",
  ariaLabel,
}: SparklineProps) {
  const uid = useId().replace(/:/g, "");
  const values = data.length > 0 ? data : [0, 0];
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = values.length > 1 ? width / (values.length - 1) : width;

  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      role="img"
      aria-label={ariaLabel || "Trend chart"}
      className={className}
    >
      <defs>
        <linearGradient id={`spark-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-${uid})`} />
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {last && (
        <circle
          cx={last[0]}
          cy={last[1]}
          r={2.5}
          fill={stroke}
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
