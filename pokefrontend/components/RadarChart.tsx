// components/RadarChart.tsx
import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  stats: { [key: string]: number };
}

const RadarChart = ({ stats }: RadarChartProps) => {
  return (
    <div className="w-full h-full relative">
      <Radar
        data={{
          labels: ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'],
          datasets: [{
            data: [
              stats.hp,
              stats.attack,
              stats.defense,
              stats.spAttack,
              stats.spDefense,
              stats.speed
            ],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          }]
        }}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            r: {
              angleLines: {
                display: true
              },
              suggestedMin: 0,
              suggestedMax: 100
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }}
      />
    </div>
  );
};

export default RadarChart;
