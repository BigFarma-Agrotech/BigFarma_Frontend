import History from "../wallet/History.jsx";

// Recent transactions come from the wallet dashboard endpoint
// (recent_transactions); there is no dedicated transactions endpoint yet.
const Transactions = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
        Transactions
      </h1>
      <History />
    </div>
  );
};

export default Transactions;
