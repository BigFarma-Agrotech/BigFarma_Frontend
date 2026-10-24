import { useState } from "react";
import { Search, ShoppingCart, Menu } from "lucide-react";
import Input from "../shared/Input";
import Avatar from "../../assets/images/JohnDoe-avatar.jpg";
import { useCart } from "../../hooks";
import Cookies from "js-cookie";
import {
  useUserProfile,
  getFirstName,
  getProfilePicture,
} from "@/hooks/useUserProfile";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NotificationBell from "./notification-bell";

export default function DashboardHeader({ onMenuClick }) {
  const role = Cookies.get("BIGFARMA_ROLE");
  const { getCartCount } = useCart();
  const { data: user } = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const searchTarget = role === "farmer" ? "/my-products" : "/marketplace";
  // Prefill with the current ?q= when the header mounts on the search page
  const [searchTerm, setSearchTerm] = useState(() =>
    location.pathname === searchTarget
      ? new URLSearchParams(location.search).get("q") || ""
      : ""
  );

  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    navigate(term ? `${searchTarget}?q=${encodeURIComponent(term)}` : searchTarget);
  };

  // "" until the user has entered their name in profile setup or settings
  const firstName = getFirstName(user);
  const cartCount = getCartCount();

  return (
    <header className="fixed left-0 right-0 top-0 z-30 h-16 border-b border-gray-200 bg-white sm:h-20 lg:left-64">
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            className="-ml-2 rounded-lg p-2 text-neutral hover:bg-gray-100 focus:outline-none lg:hidden"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden md:block">
            <h1 className="text-lg font-medium text-gray-900">
              {firstName ? `Hello, ${firstName}` : "Hello"}{" "}
              <span aria-hidden="true">👋</span>
            </h1>
            {role && (
              <p className="text-sm text-gray-600">
                {role === "farmer" ? "🌱 Farmer" : "🛒 Consumer"}
              </p>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-3 sm:gap-4">
          <form
            role="search"
            onSubmit={handleSearch}
            className="relative w-full min-w-0 max-w-xs"
          >
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            />
            <Input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label={role === "farmer" ? "Search my products" : "Search produce"}
              placeholder={role === "farmer" ? "Search products..." : "Search produce"}
              className="h-10 border bg-gray-50 py-0 pl-9 text-sm placeholder:text-grey-200 focus:bg-white sm:text-base"
            />
          </form>

          {role === "consumer" && (
            <Link
              to="/cart"
              className="relative shrink-0 p-1 focus:outline-none"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5 text-[#8e8e93]" />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          <NotificationBell role={role} />

          <div className="flex shrink-0 items-center gap-2">
            <img
              src={getProfilePicture(user) || Avatar}
              alt="Avatar"
              className="h-9 w-9 rounded-full bg-gray-100 object-cover sm:h-10 sm:w-10"
            />
            <div className="hidden lg:block">
              {firstName && (
                <span className="block text-sm font-bold text-gray-900">
                  {firstName}
                </span>
              )}
              {role && (
                <span className="text-xs capitalize text-gray-500">{role}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
