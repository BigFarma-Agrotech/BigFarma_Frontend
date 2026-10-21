import { useState, useEffect, useContext } from "react";
import { cn } from "@/lib/utils";
import { clearSession, getAccessToken, getRole } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { FocusContext } from "@/context/FocusContext";
import brandLogo from "../../assets/images/brand-logo.png";
import { axios } from "../../lib/axios";
import { endpoints } from "../config/endpoints";
import { Skeleton } from "../shared";

import {
  LayoutDashboard,
  Store,
  Users,
  ShoppingBag,
  TrendingUp,
  Settings,
  LogOut,
  ShoppingCart,
  X,
  Wallet,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const ROLE_NAV = {
  farmer: [
    { name: "My Products", icon: ShoppingCart, path: "/my-products" },
    { name: "Orders", icon: ShoppingBag, path: "/farmer-orders" },
    { name: "Marketplace", icon: TrendingUp, path: "/marketplace" },
    { name: "Wallet", icon: Wallet, path: "/wallet" },
  ],
  consumer: [
    { name: "Marketplace", icon: Store, path: "/marketplace" },
    { name: "Group Buy", icon: Users, path: "/group-buy" },
    { name: "My Orders", icon: ShoppingBag, path: "/orders" },
    { name: "Investment", icon: TrendingUp, path: "/investment" },
  ],
};

export default function DashboardSidebar({ isOpen, onClose }) {
  const [role, setRole] = useState(getRole);
  const { setRole: setFocusRole } = useContext(FocusContext);
  const navigate = useNavigate();
  const location = useLocation();
  const token = getAccessToken();

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await axios.get(endpoints().users.profile, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data?.category) setRole(response.data.category);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchRole();
  }, [token]);

  const navigationItems = role
    ? [
        { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
        ...(ROLE_NAV[role] || []),
        { name: "Settings", icon: Settings, path: "/settings" },
      ]
    : [];

  const handleLogout = () => {
    clearSession();
    setFocusRole(null);
    queryClient.clear();
    onClose?.();
    navigate("/sign-in", { replace: true });
  };

  const isPathActive = (itemPath) => location.pathname.startsWith(itemPath);

  const itemClass = (active) =>
    cn(
      "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
      active
        ? "border-green-200 bg-primary-subtle text-primary"
        : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900",
    );

  const nav = (
    <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
      {role === null
        ? Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))
        : navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={itemClass(isPathActive(item.path))}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
      <button type="button" onClick={handleLogout} className={itemClass(false)}>
        <LogOut className="h-5 w-5 shrink-0" />
        Logout
      </button>
    </nav>
  );

  const logo = (
    <Link to="/dashboard" onClick={onClose}>
      <img src={brandLogo} alt="BigFarma" className="h-10 w-auto object-contain" />
    </Link>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white">
        <div className="flex h-20 shrink-0 items-center px-6">{logo}</div>
        {nav}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!isOpen}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-6 sm:h-20">
          {logo}
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 rounded-lg p-2 text-neutral hover:bg-gray-100 focus:outline-none"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {nav}
      </aside>
    </>
  );
}
