import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const formatNaira = (value) => `₦${Number(value || 0).toLocaleString()}`;

/** @param {{ labels: string[], values: number[] }} props */
const LineChart = ({ labels = [], values = [] }) => {
  const data = {
    labels,
    datasets: [
      {
        label: "Revenue",
        data: values,
        borderColor: "#016130",
        backgroundColor: "#016130",
        fill: false,
        tension: 0.4,
        pointStyle: "circle",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `Revenue: ${formatNaira(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#111827",
          font: {
            weight: 600,
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          maxTicksLimit: 6,
          color: "#111827",
          font: {
            weight: 600,
            size: 12,
          },
          callback: (value) => formatNaira(value),
        },
      },
    },
  };

  return React.createElement(
    "div",
    { className: "relative h-64 w-full sm:h-72" },
    React.createElement(Line, {
      data,
      options,
      "aria-label": "Revenue by month",
      role: "img",
    })
  );
};

export default LineChart;
