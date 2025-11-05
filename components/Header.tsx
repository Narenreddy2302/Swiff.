"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-tesla-white/95 backdrop-blur-sm border-b border-tesla-light-gray/20">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight hover:text-tesla-red transition-colors">
          Swiff
        </Link>
        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors ${
              isActive("/dashboard")
                ? "text-tesla-red"
                : "text-tesla-black hover:text-tesla-gray"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/groups"
            className={`text-sm font-medium transition-colors ${
              isActive("/groups")
                ? "text-tesla-red"
                : "text-tesla-black hover:text-tesla-gray"
            }`}
          >
            Groups
          </Link>
          <Link
            href="/activity"
            className={`text-sm font-medium transition-colors ${
              isActive("/activity")
                ? "text-tesla-red"
                : "text-tesla-black hover:text-tesla-gray"
            }`}
          >
            Activity
          </Link>
          <button className="px-6 py-2 bg-tesla-black text-tesla-white text-sm font-medium rounded-md hover:bg-tesla-gray transition-colors">
            Account
          </button>
        </div>
      </nav>
    </header>
  );
}
