import { useState, useEffect } from "react";
import { Search, ShoppingCart, Bell, Menu } from "lucide-react";
import Input from "../shared/Input";
import Avatar from "../../assets/images/JohnDoe-avatar.jpg";
import { useCart } from "../../hooks";
import Cookies from "js-cookie";
import { endpoints } from "../config/endpoints";
import { axios } from "../../lib/axios";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function DashboardHeader({ onMenuClick }) {
  const role = Cookies.get("BIGFARMA_ROLE");
  const { getCartCount } = useCart();
  const [profile, setProfile] = useState(null);
  const token = Cookies.get("BIGFARMA_ACCESS_TOKEN");
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

  useEffect(() => {
    const fetchProfile = async () => {
      const url =
        role === "farmer"
          ? endpoints().users.get_farmer_profile
          : role === "consumer"
            ? endpoints().users.get_consumer_profile
            : null;

      if (!token || !url) {
        setProfile(null);
        return;
      }

      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      }
    };
    fetchProfile();
  }, [role, token]);

  const firstName =
    profile?.full_name?.split(" ")[0] || profile?.first_name || "User";
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
              Hello, {firstName} <span aria-hidden="true">👋</span>
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

          <button
            type="button"
            className="relative shrink-0 p-1 focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-[#8e8e93]" />
            <span
              className={`absolute right-1 top-1 h-2 w-2 rounded-full ${
                role === "farmer" ? "bg-secondary" : "bg-primary-light"
              }`}
            ></span>
          </button>

          <div className="flex shrink-0 items-center gap-2">
            <img
              src={profile?.profile_picture || Avatar}
              alt="Avatar"
              className="h-9 w-9 rounded-full bg-gray-100 object-cover sm:h-10 sm:w-10"
            />
            <div className="hidden lg:block">
              <span className="block text-sm font-bold text-gray-900">
                {firstName}
              </span>
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
