import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, BadgeCheck, Car, ClipboardList, DollarSign, FileText, Gavel, ImageOff, ShieldCheck, Users } from "../../ui/icons";
import { resources } from "../lib/adminApi";
import { keys, patchRows, useOptimisticMutation } from "../lib/optimistic";
import { formatMoney, timeAgo } from "../lib/useTableState";
import { Button, Card, cx, PageHeader, Pill, Skeleton, StatCard, Thumb, VEHICLE_STATES } from "../ui/primitives";
import { QUOTE_STATUS } from "./QuotesPage";
import { vehicleLabel } from "./vehicles/useVehicleMutations";

function Panel({ title, action, children, className }) {
  return (
    <Card className={cx("flex flex-col", className)}>
      <div className="flex items-center justify-between px-4 h-12 border-b border-gray-100">
        <h3 className="text-[13.5px] font-semibold text-gray-900">{title}</h3>
        {action}
      </div>
      <div className="flex-1">{children}</div>
    </Card>
  );
}

// Panel skeletons mirror each panel's rows (same paddings, thumb/icon sizes, row count).
const QueueSkeleton = () => (
  <div className="divide-y divide-gray-100" aria-hidden="true">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-4 py-2.5">
        <Skeleton className="w-14 h-10 rounded-md" />
        <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-48" /><Skeleton className="h-3 w-64 max-w-full" /></div>
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>
    ))}
  </div>
);
const QuotesSkeleton = () => (
  <div className="divide-y divide-gray-100" aria-hidden="true">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-4 py-2.5">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-36" /><Skeleton className="h-3 w-56 max-w-full" /></div>
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="hidden sm:block h-3 w-14" />
      </div>
    ))}
  </div>
);
const BreakdownSkeleton = () => (
  <div className="p-4 space-y-3.5" aria-hidden="true">
    {[0, 1, 2, 3].map((i) => (
      <div key={i}>
        <div className="flex justify-between mb-1.5"><Skeleton className="h-3.5 w-28" /><Skeleton className="h-3.5 w-6" /></div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    ))}
    <div className="grid grid-cols-2 gap-2 pt-2"><Skeleton className="h-[60px] rounded-lg" /><Skeleton className="h-[60px] rounded-lg" /></div>
  </div>
);
const TopSkeleton = () => (
  <div className="divide-y divide-gray-100" aria-hidden="true">
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-center gap-3 px-4 py-2.5"><Skeleton className="h-3.5 w-4" /><Skeleton className="h-3.5 flex-1" /><Skeleton className="h-3.5 w-6" /></div>
    ))}
  </div>
);

export default function OverviewPage() {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const stats = useQuery({ queryKey: ["admin", "stats", "dashboard"], queryFn: resources.stats.dashboard });
  const summary = useQuery({ queryKey: keys.summary("vehicles"), queryFn: resources.vehicles.summary });
  const pendingParams = { page: 1, page_size: 6, verification_state: "pending", ordering: "-created_at" };
  const pending = useQuery({ queryKey: keys.list("vehicles", pendingParams), queryFn: () => resources.vehicles.list(pendingParams) });
  const quotesParams = { page: 1, page_size: 6, ordering: "-created_at" };
  const quotes = useQuery({ queryKey: keys.list("quotes", quotesParams), queryFn: () => resources.quotes.list(quotesParams) });

  const verify = useOptimisticMutation({
    resource: "vehicles",
    mutationFn: ({ id }) => resources.vehicles.verify(id, { is_physically_verified: true }),
    apply: (qc, { id }) => patchRows(qc, "vehicles", [id], { verification_state: "physical", __pending: true }),
    success: (v) => `${vehicleLabel(v)} is live`,
    failure: "Verification failed",
  });

  const s = stats.data;
  const sum = summary.data;
  const total = sum?.total || 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader title={`${greeting}, ${user?.username || "admin"}`} subtitle="Here's what needs your attention today.">
        <Button icon={ClipboardList} onClick={() => navigate("/admin/vehicles?tab=pending")}>Review queue</Button>
        <Button variant="primary" icon={Car} onClick={() => navigate("/admin/vehicles")}>Manage vehicles</Button>
      </PageHeader>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        <StatCard label="Live on marketplace" icon={BadgeCheck} tone="green" value={sum?.physical ?? "—"} sub={sum ? `of ${sum.total} total vehicles` : null} loading={summary.isLoading} onClick={() => navigate("/admin/vehicles?tab=physical")} />
        <StatCard label="Awaiting review" icon={ShieldCheck} tone="amber" value={sum?.pending ?? "—"} sub={s ? `${s.vehicles.new_this_week} new this week` : null} loading={summary.isLoading} onClick={() => navigate("/admin/vehicles?tab=pending")} />
        <StatCard label="Bids" icon={Gavel} tone="blue" value={s?.bids.total ?? "—"} sub={s ? `${formatMoney(s.bids.total_value)} total value` : null} loading={stats.isLoading} onClick={() => navigate("/admin/bids")} />
        <StatCard label="Users" icon={Users} tone="violet" value={s?.users.total ?? "—"} sub={s ? `${s.users.new_this_month} joined this month` : null} loading={stats.isLoading} onClick={() => navigate("/admin/users")} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Panel
          className="xl:col-span-2"
          title={`Review queue${sum ? ` · ${sum.pending}` : ""}`}
          action={<Button variant="ghost" size="xs" onClick={() => navigate("/admin/vehicles?tab=pending")}>View all <ArrowRight className="w-3.5 h-3.5" /></Button>}
        >
          {pending.isLoading ? (
            <QueueSkeleton />
          ) : (pending.data?.results || []).length === 0 ? (
            <div className="p-8 text-center text-[13px] text-gray-500">Nothing waiting — every listing has been reviewed.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pending.data.results.map((v) => (
                <div key={v.id} className={cx("flex items-center gap-3 px-4 py-2.5 transition-opacity", v.__pending && "opacity-50")}>
                  <Thumb src={v.images?.[0]?.image} className="w-14 h-10 rounded-md ring-1 ring-black/5" />
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="text-[13.5px] font-semibold truncate">{vehicleLabel(v)}</div>
                    <div className="text-[12px] text-gray-500 truncate">
                      {formatMoney(v.listing_type === "instant_sale" ? v.proposed_price : v.price)} · {v.owner?.username} · {timeAgo(v.created_at)}
                    </div>
                  </div>
                  {(v.images || []).length === 0 && <Pill tone="red" dot={false}>No photos</Pill>}
                  {v.verification_state === "pending" ? (
                    <Button size="xs" icon={BadgeCheck} onClick={() => verify.mutate({ id: v.id })}>Approve</Button>
                  ) : (
                    <Pill tone="green">Approved</Pill>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Inventory breakdown">
          {summary.isLoading ? (
            <BreakdownSkeleton />
          ) : (
            <div className="p-4 space-y-3.5">
              {[
                ["physical", sum.physical],
                ["digital", sum.digital],
                ["pending", sum.pending],
                ["rejected", sum.rejected],
              ].map(([key, n]) => (
                <button key={key} onClick={() => navigate(`/admin/vehicles?tab=${key}`)} className="block w-full text-left group">
                  <div className="flex items-center justify-between text-[13px] mb-1">
                    <span className="text-gray-700 group-hover:text-gray-900">{VEHICLE_STATES[key].label}</span>
                    <span className="font-semibold tabular-nums">{n}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={cx("h-full rounded-full", { physical: "bg-emerald-500", digital: "bg-sky-500", pending: "bg-amber-500", rejected: "bg-red-500" }[key])}
                      style={{ width: `${total ? Math.max(2, (n / total) * 100) : 0}%` }}
                    />
                  </div>
                </button>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button onClick={() => navigate("/admin/vehicles?tab=hidden")} className="rounded-lg bg-gray-50 hover:bg-gray-100 p-3 text-left">
                  <div className="text-[12px] text-gray-500">Hidden</div>
                  <div className="text-lg font-semibold tabular-nums">{sum.hidden}</div>
                </button>
                <button onClick={() => navigate("/admin/vehicles?tab=no_photos")} className={cx("rounded-lg p-3 text-left", sum.no_images ? "bg-red-50 hover:bg-red-100" : "bg-gray-50 hover:bg-gray-100")}>
                  <div className={cx("text-[12px] flex items-center gap-1", sum.no_images ? "text-red-600" : "text-gray-500")}><ImageOff className="w-3.5 h-3.5" /> No photos</div>
                  <div className={cx("text-lg font-semibold tabular-nums", sum.no_images && "text-red-700")}>{sum.no_images}</div>
                </button>
              </div>
            </div>
          )}
        </Panel>

        <Panel
          className="xl:col-span-2"
          title="Latest quote requests"
          action={<Button variant="ghost" size="xs" onClick={() => navigate("/admin/quotes")}>View all <ArrowRight className="w-3.5 h-3.5" /></Button>}
        >
          {quotes.isLoading ? (
            <QuotesSkeleton />
          ) : (quotes.data?.results || []).length === 0 ? (
            <div className="p-8 text-center text-[13px] text-gray-500">No quote requests yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {quotes.data.results.map((q) => (
                <button key={q.id} onClick={() => navigate("/admin/quotes")} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-gray-500" /></div>
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="text-[13.5px] font-medium truncate">{q.full_name}</div>
                    <div className="text-[12px] text-gray-500 truncate">{q.vehicle ? `${q.vehicle.year} ${q.vehicle.make} ${q.vehicle.model}` : "—"} · {[q.city, q.country].filter(Boolean).join(", ")}</div>
                  </div>
                  <Pill tone={QUOTE_STATUS[q.status]?.tone}>{QUOTE_STATUS[q.status]?.label}</Pill>
                  <span className="hidden sm:block text-[12px] text-gray-400 w-16 text-right">{timeAgo(q.created_at)}</span>
                </button>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Most viewed (30 days)">
          {stats.isLoading ? (
            <TopSkeleton />
          ) : (s?.traffic.top_vehicles || []).length === 0 ? (
            <div className="p-6 text-[13px] text-gray-500">
              No view data yet. {s ? <span className="block mt-1">{s.traffic.marketplace_visits} marketplace visits this month.</span> : null}
            </div>
          ) : (
            <ol className="divide-y divide-gray-100">
              {s.traffic.top_vehicles.map((t, i) => (
                <li key={t.vehicle__id} className="flex items-center gap-3 px-4 py-2.5 text-[13px]">
                  <span className="w-5 text-gray-400 tabular-nums">{i + 1}</span>
                  <span className="flex-1 truncate">{t.vehicle__year} {t.vehicle__make} {t.vehicle__model}</span>
                  <span className="font-semibold tabular-nums">{t.view_count}</span>
                </li>
              ))}
            </ol>
          )}
          {s && (
            <div className="grid grid-cols-2 gap-2 p-4 pt-0">
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="text-[12px] text-gray-500 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Accepted bids</div>
                <div className="text-lg font-semibold tabular-nums">{s.bids.accepted}</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="text-[12px] text-gray-500">Instant-sale offers</div>
                <div className="text-lg font-semibold tabular-nums">{s.vehicles.instant_sale}</div>
              </div>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
