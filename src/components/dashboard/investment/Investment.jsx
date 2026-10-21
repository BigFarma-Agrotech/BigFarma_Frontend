import { TrendingUp } from "lucide-react";

const Investment = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Investment</h1>
        <p className="text-sm text-gray-600">Grow your money by investing in farms</p>
      </div>
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-8 text-center sm:p-12">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle text-primary">
          <TrendingUp size={24} aria-hidden="true" />
        </span>
        <p className="text-lg font-semibold text-gray-900">Coming Soon</p>
      </div>
    </div>
  );
};

export default Investment;
