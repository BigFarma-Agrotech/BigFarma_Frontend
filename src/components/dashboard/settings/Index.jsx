import { useState } from "react";
import { cn } from "@/lib/utils";
import ResetBioData from "./AccountSettings";
import ChangePassword from "./ChangePassword";
import DeleteAccount from "./DeleteAccount";

const sidebar = [
  {
    title: "Account Settings",
    description: "Details about your personal information",
    path: "edit-profile",
  },
  {
    title: "Password & Security",
    description: "Change your password anytime",
    path: "change-password",
  },
  {
    title: "Delete your account",
    description: "Find how you can delete your account",
    path: "delete-account",
  },
];

const AccountSettings = () => {
  const [path, setPath] = useState("edit-profile");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your profile, password and account.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <nav
          role="tablist"
          aria-label="Settings sections"
          className="scroll-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:w-72 lg:shrink-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {sidebar.map((item) => {
            const isActive = item.path === path;
            return (
              <button
                key={item.path}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setPath(item.path)}
                className={cn(
                  "shrink-0 rounded-xl border bg-white px-4 py-3 text-left transition-colors lg:w-full lg:p-4",
                  isActive
                    ? "border-primary ring-1 ring-primary"
                    : "border-gray-200 hover:border-primary"
                )}
              >
                <span
                  className={cn(
                    "block whitespace-nowrap text-sm font-semibold lg:text-base",
                    isActive ? "text-primary" : "text-gray-900"
                  )}
                >
                  {item.title}
                </span>
                <span className="mt-0.5 hidden text-sm text-gray-500 lg:block">
                  {item.description}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1">
          <div className="w-full max-w-2xl">
            {path === "edit-profile" && <ResetBioData />}
            {path === "change-password" && <ChangePassword />}
            {path === "delete-account" && <DeleteAccount />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
