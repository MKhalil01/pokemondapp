// components/RadarChart.tsx
import React from 'react';

interface RadarChartProps {
  stats: { [key: string]: number };
}

const RadarChart: React.FC<RadarChartProps> = ({ stats }) => {
  // For simplicity, we render a basic radar chart using an SVG polygon.
  const statEntries = Object.entries(stats);
  const numStats = statEntries.length;
  const angleSlice = (2 * Math.PI) / numStats;
  const radius = 50; // radius of the radar chart

  const points = statEntries
    .map(([stat, value], i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const normalizedValue = Math.min(value, 100) / 100;
      const x = radius + radius * normalizedValue * Math.cos(angle);
      const y = radius + radius * normalizedValue * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={radius * 2} height={radius * 2} className="mx-auto">
      <polygon points={points} fill="rgba(255,0,0,0.3)" stroke="red" strokeWidth="2" />
      {statEntries.map(([stat, value], i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const x = radius + radius * Math.cos(angle);
        const y = radius + radius * Math.sin(angle);
        return (
          <text
            key={stat}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="10"
            fill="black"
          >
            {stat}
          </text>
        );
      })}
    </svg>
  );
};

export default RadarChart;
