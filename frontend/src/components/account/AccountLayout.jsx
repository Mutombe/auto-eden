import React, { useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Avatar, cx } from "../admin/ui/primitives";
import { Car, Gavel, Handshake, Heart, LayoutDashboard, User } from "../ui/icons";
import { ME, prefetchMine, useMine, useProfile } from "../../lib/accountApi";
import { whenIdle } from "../../lib/progressive";
import Pattern from "../ui/Pattern";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

export const displayName = (profile, user) =>
  [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || profile?.username || user?.username || "there";

/**
 * Shell for /dashboard and /profile: dark header (the navbar sits over it), a sticky tab strip
 * that scrolls sideways on phones, and the page body. Tabs carry live counts.
 */
export default function AccountLayout({ subtitle, actions, children }) {
  const qc = useQueryClient();
  const user = useSelector((s) => s.auth.user);
  const { data: profile } = useProfile();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const tab = pathname === "/profile" ? "profile" : params.get("tab") || "overview";

  const vehicles = useMine(ME.vehicles);
  const offers = useMine(ME.offers);
  const bids = useMine(ME.bids);
  const searches = useMine(ME.searches);

  useEffect(() => whenIdle(() => prefetchMine(qc)), [qc]);

  const pendingOffers = offers.rows.filter((o) => o.status === "pending").length;
  const TABS = [
    { id: "overview", to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "listings", to: "/dashboard?tab=listings", label: "My listings", icon: Car, count: vehicles.data && vehicles.rows.length },
    { id: "offers", to: "/dashboard?tab=offers", label: "Offers received", icon: Handshake, count: offers.data && pendingOffers, alert: pendingOffers > 0 },
    { id: "bids", to: "/dashboard?tab=bids", label: "My offers", icon: Gavel, count: bids.data && bids.rows.length },
    { id: "searches", to: "/dashboard?tab=searches", label: "Saved searches", icon: Heart, count: searches.data && searches.rows.length },
    { id: "profile", to: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="pacaembu-font min-h-screen bg-[#f6f7f9]">
      <header className="relative bg-gray-950 text-white overflow-hidden isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_85%_0%,rgba(220,38,38,0.32),transparent_60%)]" />
        <Pattern variant="circuit" fade="right" className="-z-10 text-white/[0.08]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-6 sm:pb-8 flex items-center gap-4">
          <div className="rounded-full ring-2 ring-white/15 shrink-0">
            <Avatar name={profile?.username || user?.username || "?"} src={profile?.profile_picture || undefined} size={52} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white/55">{greeting()}</p>
            <h1 className="text-[22px] sm:text-3xl font-medium truncate">{displayName(profile, user)}</h1>
            {subtitle && <p className="text-sm text-white/55 mt-0.5 truncate">{subtitle}</p>}
          </div>
          {actions && <div className="hidden sm:flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      </header>

      <nav className="sticky top-14 sm:top-16 z-40 bg-white/95 backdrop-blur border-b border-gray-200" aria-label="Account sections">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <Link
                key={t.id}
                to={t.to}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "relative flex items-center gap-2 px-3 h-12 text-[13.5px] font-medium whitespace-nowrap transition-colors",
                  active ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
                )}
              >
                <t.icon className={cx("w-[18px] h-[18px]", active ? "text-red-600" : "text-gray-400")} />
                {t.label}
                {typeof t.count === "number" && t.count > 0 && (
                  <span
                    className={cx(
                      "min-w-5 h-5 px-1.5 rounded-md text-[11px] font-semibold tabular-nums grid place-items-center",
                      t.alert ? "bg-red-600 text-white" : active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {t.count}
                  </span>
                )}
                {active && <span className="absolute left-2 right-2 bottom-0 h-0.5 rounded-full bg-red-600" />}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-24">
        {actions && <div className="sm:hidden flex gap-2 mb-4 [&>*]:flex-1 [&>*]:justify-center">{actions}</div>}
        {children}
      </main>
    </div>
  );
}

// ---------- small shared bits ----------
export const ago = (iso) => {
  if (!iso) return "";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [u, n] of units) {
    const v = Math.floor(s / n);
    if (v >= 1) return `${v} ${u}${v > 1 ? "s" : ""} ago`;
  }
  return "just now";
};

export function SectionHeader({ title, description, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
    </div>
  );
}

