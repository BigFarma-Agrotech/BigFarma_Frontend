import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

// Canvas colours must be raw values: primary, secondary and a one-off orange
const COLORS = ["#016130", "#ffa725", "#ff8400"];
const LABELS = ["Vegetables", "Livestock", "Grain"];
const SM_QUERY = "(min-width: 640px)";

const useIsSmUp = () => {
  const [isSmUp, setIsSmUp] = useState(
    () => typeof window !== "undefined" && window.matchMedia(SM_QUERY).matches
  );

  useEffect(() => {
    const media = window.matchMedia(SM_QUERY);
    const handleChange = (event) => setIsSmUp(event.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return isSmUp;
};

const Chart = () => {
  const isSmUp = useIsSmUp();
  const chartData = [50, 30, 20];

  const data = {
    labels: LABELS,
    datasets: [
      {
        label: "Dataset",
        data: chartData,
        borderRadius: 10,
        backgroundColor: COLORS,
        hoverBackgroundColor: COLORS,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "80%",
    maintainAspectRatio: false,
    plugins: {
      legend: {
        // Legend sits under the ring on phones so the chart keeps its width
        position: isSmUp ? "right" : "bottom",
        align: "center",
        labels: {
          padding: isSmUp ? 20 : 12,
          boxWidth: 30,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            weight: 500,
          },
        },
      },
    },
  };

  return React.createElement(
    "div",
    { className: "relative h-64 w-full sm:h-72" },
    React.createElement(Doughnut, { data, options })
  );
};

export default Chart;
