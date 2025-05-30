"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { ChartDataPoint } from "@/lib/types";
import { useTheme } from "next-themes";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface ErrorChartProps {
  data: ChartDataPoint[];
}

export function ErrorChart({ data }: ErrorChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  const textColor = isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)";
  
  const chartData = {
    datasets: [
      {
        label: "Error Count",
        data: data.map((point) => ({
          x: point.timestamp * 1000, // Convert to milliseconds for date-fns
          y: point.errorCount,
        })),
        borderColor: "hsl(var(--chart-1))",
        backgroundColor: "hsla(var(--chart-1), 0.5)",
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: "minute" as const,
          displayFormats: {
            minute: "HH:mm",
          },
        },
        title: {
          display: true,
          text: "Time",
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Error Count",
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: textColor,
        },
      },
      tooltip: {
        callbacks: {
          title: function (context: any) {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleTimeString();
          },
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}