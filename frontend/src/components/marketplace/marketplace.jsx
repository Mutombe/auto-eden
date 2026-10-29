import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMarketplace, MARKETPLACE_PAGE_SIZE } from "../../lib/publicApi";
import { useProgressiveReveal } from "../../lib/progressive";
import Bone from "../ui/Bone";
import ListingCard, { ListingCardSkeleton } from "../vehicles/ListingCard";
import {
  ArrowUpDown,
  BadgeCheck,
  Car,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "../ui/icons";
import useTracking from "../../hooks/useTracking";
import { HeroPattern } from "../ui/Pattern";

// Filters live in the URL (/marketplace?make=Toyota&page=2), so links are shareable and
// coming back from a vehicle page restores the exact view.
const FILTER_KEYS = ["search", "make", "year", "bodyType", "fuelType", "transmission", "minPrice", "maxPrice", "sort", "page"];

const POPULAR_MAKES = ["Toyota", "Honda", "Nissan", "Mazda", "Mercedes", "BMW", "Ford", "Volkswagen"];
const BODY_TYPES = ["Sedan", "SUV", "Hatchback", "Pickup", "Coupe", "Van"];
const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric"];
const TRANSMISSIONS = ["Automatic", "Manual"];
const SORTS = [
  { value: "", label: "Newest first" },
  { value: "priceLowHigh", label: "Price: low to high" },
  { value: "priceHighLow", label: "Price: high to low" },
];
const PRICE_BANDS = [
  { label: "Under $5k", min: "", max: "5000" },
  { label: "$5k – $10k", min: "5000", max: "10000" },
  { label: "$10k – $20k", min: "10000", max: "20000" },
  { label: "$20k+", min: "20000", max: "" },
];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR - 1994 }, (_, i) => String(THIS_YEAR - i));

const FILTER_LABELS = { make: "Make", year: "Year", bodyType: "Body", fuelType: "Fuel", transmission: "Gearbox" };

function useFilters() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || ""])), [params]);

  // Any change other than paging goes back to page 1.
  const update = (patch, { keepPage = false } = {}) => {
    const next = { ...filters, ...patch };
    if (!keepPage && !("page" in patch)) next.page = "";
    if (next.page === "1") next.page = "";
    setParams(Object.fromEntries(Object.entries(next).filter(([, v]) => v !== "" && v != null)), { replace: true });
  };
  const clear = () => setParams({}, { replace: true });
  return { filters, update, clear };
}

export default function MarketplacePage() {
  useTracking(window.location.pathname);
  const { filters, update, clear } = useFilters();
  const [sheetOpen, setSheetOpen] = useState(false);

  // The search box is local so typing feels instant; the URL (and the query) follow after a pause.
  const [searchText, setSearchText] = useState(filters.search);
  useEffect(() => setSearchText(filters.search), [filters.search]);
  useEffect(() => {
    if (searchText === filters.search) return;
    const t = setTimeout(() => update({ search: searchText.trim() }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const page = Number(filters.page) || 1;
  const query = useMarketplace({
    page,
    page_size: MARKETPLACE_PAGE_SIZE,
    searchTerm: filters.search,
    make: filters.make,
    year: filters.year,
    bodyType: filters.bodyType,
    fuelType: filters.fuelType,
    transmission: filters.transmission,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sortBy: filters.sort,
  });
  const vehicles = query.data?.results || [];
  const total = query.data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(total / MARKETPLACE_PAGE_SIZE));
  // Skeletons only on a genuine first paint; afterwards the previous results stay visible.
  const isLoading = query.isLoading;
  const isRefreshing = query.isFetching && query.isPlaceholderData;
  const revealed = useProgressiveReveal(vehicles.length, !isLoading);

  const goToPage = (p) => {
    update({ page: String(p) }, { keepPage: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const active = [
    filters.search && { key: "search", label: `“${filters.search}”` },
    ...Object.keys(FILTER_LABELS).filter((k) => filters[k]).map((k) => ({ key: k, label: filters[k] })),
    (filters.minPrice || filters.maxPrice) && { key: "price", label: priceLabel(filters.minPrice, filters.maxPrice) },
  ].filter(Boolean);
  const removeFilter = (key) => {
    if (key === "price") update({ minPrice: "", maxPrice: "" });
    else if (key === "search") { setSearchText(""); update({ search: "" }); }
    else update({ [key]: "" });
  };

  const from = total === 0 ? 0 : (page - 1) * MARKETPLACE_PAGE_SIZE + 1;
  const to = Math.min(page * MARKETPLACE_PAGE_SIZE, total);

  return (
    <div className="pacaembu-font min-h-screen bg-[#f6f7f9]">
      {/* Header */}
      <header className="relative bg-gray-950 text-white overflow-hidden isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_85%_0%,rgba(220,38,38,0.35),transparent_60%),radial-gradient(50%_80%_at_0%_100%,rgba(220,38,38,0.12),transparent_60%)]" />
        <HeroPattern />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-6 sm:pb-10">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-red-400">
            <BadgeCheck className="w-4 h-4" />
            Verified marketplace
          </span>
          <h1 className="mt-2 text-[28px] leading-tight sm:text-4xl lg:text-5xl font-medium">Find your next car</h1>
          <p className="mt-2 text-white/60 text-sm sm:text-base">
            {isLoading ? "Loading vehicles…" : `${total.toLocaleString()} ${total === 1 ? "vehicle" : "vehicles"} inspected and ready to buy`}
          </p>

          {/* Search */}
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              update({ search: searchText.trim() });
            }}
            className="mt-5 sm:mt-7 flex items-center gap-2 bg-white rounded-xl p-1.5 max-w-3xl shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]"
          >
            <Search className="w-5 h-5 text-gray-400 ml-2.5 shrink-0" />
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search make, model or keyword"
              aria-label="Search vehicles"
              className="flex-1 min-w-0 h-10 sm:h-11 bg-transparent text-gray-900 placeholder-gray-400 text-[15px] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {searchText && (
              <button type="button" onClick={() => removeFilter("search")} aria-label="Clear search" className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            )}
            <button type="submit" className="h-10 sm:h-11 px-4 sm:px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">
              Search
            </button>
          </form>

          {/* Popular makes: one scrollable row on phones */}
          <div className="mt-4 -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto scrollbar-hide">
            {POPULAR_MAKES.map((m) => {
              const on = filters.make.toLowerCase() === m.toLowerCase();
              return (
                <button
                  key={m}
                  onClick={() => update({ make: on ? "" : m })}
                  aria-pressed={on}
                  className={`shrink-0 h-8 px-3.5 rounded-full text-[13px] font-medium transition-colors ${
                    on ? "bg-white text-gray-900" : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 lg:grid lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-8">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 bg-white rounded-xl ring-1 ring-gray-200/70 p-5 max-h-[calc(100vh-7rem)] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Filters</h2>
              {active.length > 0 && (
                <button onClick={() => { setSearchText(""); clear(); }} className="text-sm text-red-600 hover:text-red-700 font-medium">
                  Clear all
                </button>
              )}
            </div>
            <FilterPanel filters={filters} update={update} />
          </div>
        </aside>

        <main className="min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
            <div className="text-sm text-gray-600 min-w-0">
              {isLoading ? (
                <Bone className="h-4 w-40" />
              ) : (
                <span className="truncate block">
                  {total === 0 ? "No vehicles" : (
                    <>
                      <span className="hidden sm:inline">Showing </span>
                      <span className="font-semibold text-gray-900 tabular-nums">{from}–{to}</span> of{" "}
                      <span className="font-semibold text-gray-900 tabular-nums">{total.toLocaleString()}</span>
                    </>
                  )}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSheetOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white ring-1 ring-gray-200 text-sm font-medium text-gray-800"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {active.length > 0 && (
                  <span className="grid place-items-center min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-semibold">{active.length}</span>
                )}
              </button>
              <label className="relative inline-flex items-center">
                <span className="sr-only">Sort by</span>
                <ArrowUpDown className="absolute left-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
                <select
                  value={filters.sort}
                  onChange={(e) => update({ sort: e.target.value })}
                  className="appearance-none h-9 pl-8 pr-8 rounded-lg bg-white ring-1 ring-gray-200 border-0 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
              </label>
            </div>
          </div>

          {/* Active filters */}
          {active.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              {active.map((f) => (
                <button
                  key={f.key}
                  onClick={() => removeFilter(f.key)}
                  className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1.5 rounded-full bg-gray-900 text-white text-[12.5px] font-medium hover:bg-gray-700 transition-colors"
                >
                  {f.label}
                  <X className="w-3.5 h-3.5 opacity-70" />
                </button>
              ))}
              <button onClick={() => { setSearchText(""); clear(); }} className="h-7 px-2 text-[12.5px] font-medium text-gray-500 hover:text-gray-900">
                Clear all
              </button>
            </div>
          )}

          {/* Results */}
          <div className="relative">
            <div className={`absolute -top-2 left-0 right-0 h-0.5 overflow-hidden rounded transition-opacity ${isRefreshing ? "opacity-100" : "opacity-0"}`}>
              <div className="h-full w-1/3 bg-red-500 animate-[tableProgress_1s_ease-in-out_infinite]" />
            </div>

            {query.isError && !query.data ? (
              <EmptyState
                title="Couldn't load vehicles"
                body="Check your connection and try again."
                action={
                  <button onClick={() => query.refetch()} className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium">
                    <RefreshCw className="w-4 h-4" />
                    Try again
                  </button>
                }
              />
            ) : !isLoading && vehicles.length === 0 ? (
              <EmptyState
                title="No vehicles match"
                body="Try removing a filter or searching for something broader."
                action={
                  active.length > 0 && (
                    <button onClick={() => { setSearchText(""); clear(); }} className="h-10 px-5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium">
                      Clear all filters
                    </button>
                  )
                }
              />
            ) : (
              <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-5 transition-opacity duration-200 ${isRefreshing ? "opacity-60" : ""}`}>
                {isLoading
                  ? Array.from({ length: MARKETPLACE_PAGE_SIZE }).map((_, i) => <ListingCardSkeleton key={i} />)
                  : vehicles.map((v, i) =>
                      i < revealed ? <ListingCard key={v.id} vehicle={v} priority={i < 4} /> : <ListingCardSkeleton key={`sk-${v.id}`} />
                    )}
              </div>
            )}
          </div>

          {!isLoading && totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={goToPage} />}
        </main>
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <div className="lg:hidden fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Filters">
            <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheetOpen(false)} />
            <motion.div
              className="absolute inset-x-0 bottom-0 max-h-[88svh] flex flex-col bg-white rounded-t-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                <button onClick={() => setSheetOpen(false)} aria-label="Close filters" className="p-1.5 -mr-1.5 rounded-md text-gray-500 hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <FilterPanel filters={filters} update={update} />
              </div>
              <div className="flex gap-2 px-5 py-3 border-t border-gray-100 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <button onClick={() => { setSearchText(""); clear(); }} className="h-11 px-4 rounded-lg ring-1 ring-gray-200 text-sm font-medium text-gray-700">
                  Clear
                </button>
                <button onClick={() => setSheetOpen(false)} className="flex-1 h-11 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium">
                  {query.isFetching ? "Updating…" : `Show ${total.toLocaleString()} ${total === 1 ? "vehicle" : "vehicles"}`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function priceLabel(min, max) {
  const k = (v) => `$${Number(v) >= 1000 ? `${Number(v) / 1000}k` : v}`;
  if (min && max) return `${k(min)} – ${k(max)}`;
  return min ? `${k(min)}+` : `Under ${k(max)}`;
}

function FilterPanel({ filters, update }) {
  // Price inputs are local and commit on blur/Enter, so the grid doesn't refetch per keystroke.
  const [price, setPrice] = useState({ min: filters.minPrice, max: filters.maxPrice });
  useEffect(() => setPrice({ min: filters.minPrice, max: filters.maxPrice }), [filters.minPrice, filters.maxPrice]);
  const commitPrice = () => {
    if (price.min !== filters.minPrice || price.max !== filters.maxPrice) update({ minPrice: price.min, maxPrice: price.max });
  };

  return (
    <div className="space-y-6">
      <Group title="Price (USD)">
        <div className="grid grid-cols-2 gap-2">
          {[["min", "Min"], ["max", "Max"]].map(([k, label]) => (
            <label key={k} className="relative">
              <span className="sr-only">{label} price</span>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                placeholder={label}
                value={price[k]}
                onChange={(e) => setPrice((p) => ({ ...p, [k]: e.target.value }))}
                onBlur={commitPrice}
                onKeyDown={(e) => e.key === "Enter" && commitPrice()}
                className="w-full h-10 pl-6 pr-2 rounded-lg ring-1 ring-gray-200 border-0 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </label>
          ))}
        </div>
        <Chips
          options={PRICE_BANDS.map((b) => b.label)}
          value={PRICE_BANDS.find((b) => b.min === filters.minPrice && b.max === filters.maxPrice)?.label || ""}
          onChange={(label) => {
            const b = PRICE_BANDS.find((x) => x.label === label);
            update(b ? { minPrice: b.min, maxPrice: b.max } : { minPrice: "", maxPrice: "" });
          }}
        />
      </Group>

      <Group title="Make">
        <input
          list="marketplace-makes"
          placeholder="Any make"
          defaultValue={filters.make}
          key={filters.make}
          onBlur={(e) => e.target.value.trim() !== filters.make && update({ make: e.target.value.trim() })}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className="w-full h-10 px-3 rounded-lg ring-1 ring-gray-200 border-0 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <datalist id="marketplace-makes">
          {POPULAR_MAKES.map((m) => <option key={m} value={m} />)}
        </datalist>
      </Group>

      <Group title="Year">
        <div className="relative">
          <select
            value={filters.year}
            onChange={(e) => update({ year: e.target.value })}
            className="appearance-none w-full h-10 pl-3 pr-8 rounded-lg ring-1 ring-gray-200 border-0 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Any year</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </Group>

      <Group title="Body type">
        <Chips options={BODY_TYPES} value={filters.bodyType} onChange={(v) => update({ bodyType: v })} />
      </Group>
      <Group title="Fuel">
        <Chips options={FUEL_TYPES} value={filters.fuelType} onChange={(v) => update({ fuelType: v })} />
      </Group>
      <Group title="Gearbox">
        <Chips options={TRANSMISSIONS} value={filters.transmission} onChange={(v) => update({ transmission: v })} />
      </Group>
    </div>
  );
}

const Group = ({ title, children }) => (
  <fieldset className="space-y-2.5">
    <legend className="text-[12px] font-semibold uppercase tracking-wider text-gray-500 mb-2.5">{title}</legend>
    {children}
  </fieldset>
);

// Single-choice chips; tapping the selected one clears it.
const Chips = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map((o) => {
      const on = value.toLowerCase() === o.toLowerCase();
      return (
        <button
          key={o}
          type="button"
          aria-pressed={on}
          onClick={() => onChange(on ? "" : o)}
          className={`h-8 px-3 rounded-full text-[13px] font-medium transition-colors ${
            on ? "bg-gray-900 text-white" : "bg-gray-50 ring-1 ring-gray-200 text-gray-700 hover:bg-gray-100"
          }`}
        >
          {o}
        </button>
      );
    })}
  </div>
);

const EmptyState = ({ title, body, action }) => (
  <div className="bg-white rounded-xl ring-1 ring-gray-200/70 px-6 py-14 text-center">
    <div className="inline-grid place-items-center w-14 h-14 rounded-full bg-red-50 text-red-600 mb-4">
      <Car className="w-7 h-7" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <p className="text-gray-500 mt-1 mb-6 text-sm">{body}</p>
    {action}
  </div>
);

function Pagination({ page, totalPages, onChange }) {
  // 1 … 4 5 6 … 12
  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  const btn = "grid place-items-center h-10 min-w-10 px-3 rounded-lg text-sm font-medium transition-colors";
  return (
    <nav className="mt-8 sm:mt-10 flex items-center justify-between sm:justify-center gap-2" aria-label="Pagination">
      <button onClick={() => onChange(page - 1)} disabled={page === 1} className={`${btn} gap-1 bg-white ring-1 ring-gray-200 text-gray-800 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none flex`}>
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>
      <span className="sm:hidden text-sm text-gray-600 tabular-nums">
        Page <span className="font-semibold text-gray-900">{page}</span> of {totalPages}
      </span>
      <div className="hidden sm:flex items-center gap-1.5">
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-1 text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`${btn} tabular-nums ${p === page ? "bg-gray-900 text-white" : "bg-white ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50"}`}
            >
              {p}
            </button>
          )
        )}
      </div>
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className={`${btn} gap-1 bg-white ring-1 ring-gray-200 text-gray-800 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none flex`}>
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
