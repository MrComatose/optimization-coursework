import { CategoryScale, Chart as ChartJS, LineElement, LinearScale, PointElement, Title, Tooltip } from "chart.js";
import React from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(Tooltip, Title, LineElement, CategoryScale, LinearScale, PointElement);

export const LineChart = ({ dataPoints }) => {
  const data = {
    labels: dataPoints.map((point) => point.averageElapsedMilliseconds),
    datasets: [
      {
        label: "Sum over Time",
        data: dataPoints.map((point) => point.averageSum),
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const point = dataPoints[context.dataIndex];
            return [
              `Key: ${point.groupKey}`,
              `Average Sum : ${point.averageSum}`,
              `Average Elapsed Milliseconds: ${point.averageElapsedMilliseconds}`,
              `Mutation Count: ${point.mutationCount}`,
              `Mutation Probability: ${point.mutationProbability}`,
              `Evaluation Count: ${point.evaluationCount}`,
              `Population Size: ${point.populationSize}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Час виконання алгоритма в мілісекундах",
        },
      },
      y: {
        title: {
          display: true,
          text: "Середнє значення цільової функції",
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export const SimpleDuoLineChart = ({ geneticData, greedyData, x, y }) => {
  const data = {
    labels: greedyData.map((point) => point[x.key]),
    datasets: [
      {
        label: `Генетичний алгоритм - ${y.label}`,
        data: geneticData.map((point) => point[y.key]),
        fill: true,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.1,
      },
      {
        label: `Жадібний алгоритм - ${y.label}`,
        data: greedyData.map((point) => point[y.key]),
        fill: true,
        borderColor: "rgba(75,192,3,1)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: x.label,
        },
      },
      y: {
        title: {
          display: true,
          text: y.label,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export const SimpleLineChart = ({ points, x, y }) => {
  const data = {
    labels: points.map((point) => point[x.key]),
    datasets: [
      {
        label: `Генетичний алгоритм - ${y.label}`,
        data: points.map((point) => point[y.key]),
        fill: true,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: x.label,
        },
      },
      y: {
        title: {
          display: true,
          text: y.label,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};
