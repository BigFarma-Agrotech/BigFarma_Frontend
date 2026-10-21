import Chart from "./Doughnut";

const DoughnutChart = () => {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
        Investment Portfolio
      </h2>
      <div className="mt-4 w-full">
        <Chart />
      </div>
    </section>
  );
};

export default DoughnutChart;
