import { Link } from "react-router-dom";

const quickLinks = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "Start New Investment", href: "/investment" },
  { label: "Track Order", href: "/orders" },
  { label: "Join Group Buy", href: "/group-buy" },
];

const activeGroupBuys = [
  {
    id: 1,
    label: "Bisi Farm: 1 Bag of Rice",
    status: "Processing",
    className: "bg-secondary-light text-secondary-dark",
  },
  {
    id: 2,
    label: "Simi Farm: 1 Bag of Tomatoes",
    status: "Completed",
    className: "bg-primary-subtle text-primary",
  },
];

const QuickLinks = () => {
  return (
    <aside className="space-y-6">
      <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Quick Links</h2>
        <ul className="mt-4 space-y-1">
          {quickLinks.map(({ href, label }) => (
            <li key={label}>
              <Link
                to={href}
                className="block rounded-lg px-3 py-3 font-medium text-primary transition-colors hover:bg-primary-subtle hover:text-primary-dark"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Active Group Buys</h2>
        <ul className="mt-4 divide-y divide-gray-200">
          {activeGroupBuys.map(({ id, label, status, className }) => (
            <li
              key={id}
              className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm font-medium text-gray-900"
            >
              <span className="min-w-0 break-words">{label}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
                {status}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
};

export default QuickLinks;
