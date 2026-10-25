/** Butir embun pada permukaan dingin. */
export function Droplets({ points }: { points: [number, number, number][] }) {
  return (
    <g>
      {points.map(([x, y, r], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y + r * 0.35} rx={r} ry={r * 1.15} fill="#000" opacity="0.12" />
          <ellipse cx={x} cy={y} rx={r} ry={r * 1.15} fill="#fff" opacity="0.32" />
          <circle cx={x - r * 0.35} cy={y - r * 0.4} r={r * 0.35} fill="#fff" opacity="0.95" />
        </g>
      ))}
    </g>
  );
}
