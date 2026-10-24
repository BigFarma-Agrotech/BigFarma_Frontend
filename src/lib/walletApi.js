import { axios } from "../lib/axios";
import { endpoints } from "../components/config/endpoints";

// Expected (unverified) response shape of GET /wallet/dashboard:
// {
//   wallet: { balance, ledger_balance },
//   total_earnings,
//   total_withdrawals,
//   recent_transactions: [{ id, description | category, status, type, amount, created_at }]
// }
// The shared axios instance sets the base URL and Authorization header.
export const walletApi = async () => {
  try {
    const res = await axios.get(endpoints().wallet.dashboard);
    return res.data;
  } catch (error) {
    console.error("Wallet API error:", error.response || error.message);
    throw error;
  }
};

// Shared query config so every wallet widget reads the same cache entry.
export const walletDashboardQueryKey = ["walletDashboard"];

export const walletDashboardQuery = {
  queryKey: walletDashboardQueryKey,
  queryFn: walletApi,
  // Sales are credited on the server, so don't trust a long-cached balance
  staleTime: 30 * 1000,
  refetchOnWindowFocus: true,
};

/** Available balance as a number (0 when missing / unparseable). */
export const getWalletBalance = (walletData) => {
  const num = Number(walletData?.wallet?.balance ?? 0);
  return Number.isFinite(num) ? num : 0;
};

// eslint-disable-next-line no-unused-vars
export const requestWithdrawal = async ({ amount }) => {
  // TODO: wire to POST /wallet/withdraw once the backend endpoint exists
  throw new Error("Withdrawals are not available yet");
};
