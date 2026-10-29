// Page-shaped skeletons. Each mirrors the real screen's containers, paddings and block sizes
// so content swaps in without anything moving. Used both as route (code-split) fallbacks
// and as first-paint states inside pages.
import React from "react";
import Bone, { SkeletonRegion } from "../ui/Bone";

// ---------------- Vehicle detail (/vehicles/:id) ----------------
export function VehicleDetailHeroSkeleton() {
  return (
    <div className="bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-6 sm:pb-8">
        <div className="flex items-center justify-between h-9">
          <Bone className="h-5 w-28 bg-white/10" />
          <Bone className="h-9 w-20 rounded-lg bg-white/10" />
        </div>
        <div className="mt-5 sm:mt-6 flex items-end justify-between gap-4">
          <div className="flex-1">
            <div className="flex gap-2 mb-2.5"><Bone className="h-6 w-40 rounded-md bg-white/10" /><Bone className="h-6 w-28 rounded-md bg-white/10" /></div>
            <Bone className="h-4 w-12 mb-2 bg-white/10" />
            <Bone className="h-8 sm:h-10 lg:h-12 w-3/4 max-w-lg bg-white/15" />
            <Bone className="h-4 w-56 mt-3 bg-white/10" />
          </div>
          <div className="hidden lg:block"><Bone className="h-3 w-24 ml-auto mb-2 bg-white/10" /><Bone className="h-10 w-40 bg-white/15" /></div>
        </div>
      </div>
    </div>
  );
}

export function GallerySkeleton() {
  return (
    <div className="bg-white rounded-xl ring-1 ring-gray-200/80 p-1.5 sm:p-2">
      <Bone className="aspect-[4/3] sm:aspect-[16/10] w-full rounded-lg" />
      <div className="pt-2 flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => <Bone key={i} className="w-20 sm:w-24 aspect-[4/3] rounded-md shrink-0" />)}
      </div>
    </div>
  );
}

export function SpecsSkeleton() {
  return (
    <div className="bg-white rounded-xl ring-1 ring-gray-200/80 p-4 sm:p-6">
      <Bone className="h-5 w-28" />
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg bg-gray-50 ring-1 ring-gray-100 p-3 sm:p-3.5"><Bone className="h-3 w-14" /><Bone className="h-4 w-20 mt-2" /></div>
        ))}
      </div>
    </div>
  );
}

export function VehicleDetailSkeleton() {
  return (
    <SkeletonRegion label="Loading vehicle" className="min-h-screen bg-[#f6f7f9] pb-28 lg:pb-0">
      <VehicleDetailHeroSkeleton />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px] gap-4 sm:gap-6 lg:gap-8 items-start">
          <div className="min-w-0 space-y-4 sm:space-y-6">
            <GallerySkeleton />
            <SpecsSkeleton />
          </div>
          <div className="hidden lg:block">
            <div className="bg-white rounded-xl ring-1 ring-gray-200/80 p-6 space-y-5">
              <Bone className="h-3 w-24" /><Bone className="h-9 w-40" /><Bone className="h-12 w-full rounded-lg" /><Bone className="h-24 w-full rounded-lg" /><Bone className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </SkeletonRegion>
  );
}

// Similar-vehicles card (marketplace/vehicleCard.jsx): 4:3 image + content block.
export function VehicleCardSkeleton() {
  return (
    <div aria-hidden="true" className="bg-white rounded-xl shadow-sm overflow-hidden">
      <Bone className="aspect-[4/3] w-full rounded-none" />
      <div className="p-4 space-y-2.5">
        <Bone className="h-5 w-3/4" />
        <Bone className="h-3.5 w-1/2" />
        <div className="grid grid-cols-2 gap-2 pt-1"><Bone className="h-3.5 w-20" /><Bone className="h-3.5 w-20" /></div>
        <Bone className="h-6 w-24 mt-2" />
      </div>
    </div>
  );
}

// ---------------- Marketplace (route fallback while its code loads) ----------------
export function MarketplacePageSkeleton() {
  return (
    <SkeletonRegion label="Loading marketplace" className="min-h-screen bg-gray-50">
      <div className="h-[60vh] sm:h-[50vh] md:h-[40vh] lg:h-96 bg-gradient-to-br from-red-600 via-red-700 to-red-800" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Bone className="h-14 w-full rounded-xl mb-6 bg-white shadow-sm" />
        <Bone className="h-4 w-56 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <Bone className="h-52 w-full rounded-none" />
              <div className="p-4 space-y-3"><Bone className="h-5 w-3/5" /><Bone className="h-3.5 w-2/5" /><Bone className="h-16 w-full" /><div className="flex justify-between"><Bone className="h-7 w-24" /><Bone className="h-9 w-28 rounded-lg" /></div></div>
            </div>
          ))}
        </div>
      </div>
    </SkeletonRegion>
  );
}

// ---------------- Generic content page ----------------
export function GenericPageSkeleton() {
  return (
    <SkeletonRegion className="min-h-screen bg-white">
      <div className="h-64 sm:h-80 bg-gray-900" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-4">
        <Bone className="h-8 w-2/3" />
        <Bone className="h-4 w-full" /><Bone className="h-4 w-11/12" /><Bone className="h-4 w-4/5" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">{[0, 1, 2].map((i) => <Bone key={i} className="h-40 rounded-xl" />)}</div>
      </div>
    </SkeletonRegion>
  );
}

// ---------------- Admin console (while the console's code loads) ----------------
export function AdminConsoleSkeleton() {
  return (
    <SkeletonRegion label="Loading admin console" className="min-h-screen bg-[#f6f7f9]">
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-60 bg-gray-100/80 border-r border-gray-200/80">
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-gray-200/80"><Bone className="w-7 h-7" /><div className="space-y-1.5"><Bone className="h-3 w-20" /><Bone className="h-2.5 w-24" /></div></div>
        <div className="px-2.5 py-3 space-y-1.5">{[0, 1, 2, 3, 4].map((i) => <Bone key={i} className="h-9 w-full rounded-lg" />)}</div>
      </aside>
      <div className="lg:hidden h-14 bg-white border-b border-gray-200" />
      <main className="lg:pl-60">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-7"><AdminPageSkeleton /></div>
      </main>
    </SkeletonRegion>
  );
}

// Admin page body: header, stat/tab strip, toolbar, table rows. Same paddings as the pages.
export function AdminPageSkeleton({ rows = 10 }) {
  return (
    <div aria-hidden="true">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div className="space-y-2"><Bone className="h-6 w-40" /><Bone className="h-3.5 w-56" /></div>
        <div className="hidden sm:flex gap-2"><Bone className="h-8 w-24 rounded-lg" /><Bone className="h-8 w-32 rounded-lg" /></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="px-4 pt-3 flex gap-4 border-b border-gray-200">{[0, 1, 2, 3].map((i) => <Bone key={i} className="h-4 w-20 mb-3" />)}</div>
        <div className="p-4 flex gap-2"><Bone className="h-9 w-72 rounded-lg" /><Bone className="h-9 w-36 rounded-lg hidden sm:block" /></div>
        <div className="border-t border-gray-100">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 h-14 border-b border-gray-100">
              <Bone className="h-4 w-4" /><Bone className="h-10 w-14 rounded-lg" /><div className="flex-1 space-y-1.5"><Bone className="h-3.5 w-48" /><Bone className="h-3 w-28" /></div>
              <Bone className="h-5 w-24 rounded-full hidden md:block" /><Bone className="h-3.5 w-16 hidden md:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
