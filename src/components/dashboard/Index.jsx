import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Charts from "./farmer/chart/Index.jsx";
import DoughnutChart from "./consumer/chart/Index.jsx";
import { QuickLinks, RecentOrders } from "./consumer/components/";
import { PendingOrders } from "./farmer/components/index.js";
import ConsumerStatistics from "./consumer/statistics/Index.jsx";
import FarmerStatistics from "./farmer/statistics/Index.jsx";
import FarmerProfileSetup from "./farmer/profile-setup/Index.jsx";
import ConsumerProfileSetup from "./consumer/consumerProfile/Index.jsx";
import { endpoints } from "../config/endpoints";
import { axios } from "../../lib/axios";
import LoaderSpinner from "../shared/Loader.jsx";

const Dashboard = () => {
  const role = Cookies.get("BIGFARMA_ROLE");
  const token = Cookies.get("BIGFARMA_ACCESS_TOKEN");
  const [profileComplete, setProfileComplete] = useState(null);
  const [loading, setLoading] = useState(true);
  const isFarmer = role === "farmer";

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (token) {
        try {
          if (role === "farmer") {
            const response = await axios.get(endpoints().users.get_farmer_profile, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            setProfileComplete(Boolean(response.data?.full_name));
          } else if (role === "consumer") {
            const response = await axios.get(endpoints().users.get_consumer_profile, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            setProfileComplete(Boolean(response.data?.first_name));
          }
        } catch (error) {
          console.error("Error checking profile completion:", error);
          setProfileComplete(false);
        }
      } else {
        setProfileComplete(false);
      }
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    };
    checkProfileCompletion();
  }, [role, token]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoaderSpinner />
      </div>
    );
  }

  if (!profileComplete) {
    return isFarmer ? (
      <FarmerProfileSetup onComplete={() => setProfileComplete(true)} />
    ) : (
      <ConsumerProfileSetup onComplete={() => setProfileComplete(true)} />
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
