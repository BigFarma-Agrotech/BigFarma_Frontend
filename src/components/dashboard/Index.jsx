import { useState } from "react";
import Cookies from "js-cookie";
import { useQuery } from "@tanstack/react-query";
import Charts from "./farmer/chart/Index.jsx";
import DoughnutChart from "./consumer/chart/Index.jsx";
import { QuickLinks, RecentOrders } from "./consumer/components/";
import { PendingOrders } from "./farmer/components/index.js";
import ConsumerStatistics from "./consumer/statistics/Index.jsx";
import FarmerStatistics from "./farmer/statistics/Index.jsx";
import FarmerProfileSetup from "./farmer/profile-setup/Index.jsx";
import ConsumerProfileSetup from "./consumer/consumerProfile/Index.jsx";
import LoaderSpinner from "../shared/Loader.jsx";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useFarmerOrder } from "@/hooks/useFarmerOrder";
import { useFarmerProducts } from "@/hooks/useFarmerProducts";
import { useConsumerOrders, useConsumerOrderStats } from "@/components/queries/consumer/order";
import { walletDashboardQuery } from "@/lib/walletApi";

// Start the dashboard's own requests together with the profile request instead
// of after it (each round trip to the backend takes a second or two). The
// widgets below read the same cached queries.
const useDashboardData = (isFarmer) => {
  useFarmerOrder({}, { enabled: isFarmer });
  useFarmerProducts({ enabled: isFarmer });
  useQuery({ ...walletDashboardQuery, enabled: isFarmer });
  useConsumerOrders({}, { enabled: !isFarmer });
  useConsumerOrderStats({ enabled: !isFarmer });
};

const Dashboard = () => {
  const role = Cookies.get("BIGFARMA_ROLE");
  const isFarmer = role === "farmer";
  const { data: user, isLoading } = useUserProfile();
  useDashboardData(isFarmer);
  // Set when the setup flow finishes, so the dashboard shows straight away
  // instead of waiting for the profile to refetch
  const [setupFinished, setSetupFinished] = useState(false);

  // Setup is done once the role's profile has a name. A failed profile request
  // counts as not done, so the user can still go through setup.
  const profileComplete =
    setupFinished ||
    Boolean(
      isFarmer
        ? user?.farmer_profile?.full_name
        : user?.consumer_profile?.first_name
    );

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoaderSpinner />
      </div>
    );
  }

  if (!profileComplete) {
    return isFarmer ? (
      <FarmerProfileSetup onComplete={() => setSetupFinished(true)} />
    ) : (
      <ConsumerProfileSetup onComplete={() => setSetupFinished(true)} />
    );
  }

  return (
    <div className="space-y-6">
      {isFarmer ? <FarmerStatistics /> : <ConsumerStatistics />}

      <div className={`grid grid-cols-1 gap-6 ${isFarmer ? "" : "xl:grid-cols-3"}`}>
        <div className="min-w-0 space-y-6 xl:col-span-2">
          {isFarmer ? <Charts /> : <DoughnutChart />}
          <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">
              {isFarmer ? "Pending Orders" : "Recent Orders"}
            </h2>
            {isFarmer ? <PendingOrders /> : <RecentOrders />}
          </section>
        </div>
        {!isFarmer && <QuickLinks />}
      </div>
    </div>
  );
};

export default Dashboard;
