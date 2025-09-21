import React from 'react';

export const PillShape = (props: any) => {
  const { cx, cy, payload } = props;
  const rx = payload.rx ?? 80;
  const ry = payload.ry ?? 35;
  const fill = payload.color ?? '#64748B';
  const label = payload.label ?? payload.name ?? '';

  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} opacity={0.9} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="rgba(0,0,0,0.15)" />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontWeight={700}
        fontSize={14}
        fill="#0F172A"
      >
        {label}
      </text>
    </g>
  );
};