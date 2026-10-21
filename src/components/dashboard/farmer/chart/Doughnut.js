import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

/** @param {{ segments: { label: string, count: number, color: string }[] }} props */
const Chart = ({ segments = [] }) => {
  const colors = segments.map((s) => s.color);

  const data = {
    labels: segments.map((s) => s.label),
    datasets: [
      {
        label: "Orders",
        data: segments.map((s) => s.count),
        borderRadius: 0,
        borderWidth: 0,
        backgroundColor: colors,
        hoverBackgroundColor: colors,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "50%",
    plugins: {
      legend: {
        position: "bottom",
        align: "center",
        labels: {
          padding: 16,
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: "circle",
          color: "#111827",
          font: {
            weight: 600,
            size: 13,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${ctx.label}: ${ctx.parsed} order${ctx.parsed === 1 ? "" : "s"}`,
        },
      },
    },
  };

  return React.createElement(
    "div",
    { className: "relative h-72 w-full max-w-xs" },
    React.createElement(Doughnut, {
      data,
      options,
      "aria-label": "Orders by status",
      role: "img",
    })
  );
};

export default Chart;
