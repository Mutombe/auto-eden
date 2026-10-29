// src/pages/saved.jsx — cars saved for later on this device (signed in or not).
import React from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "../components/ui/icons";
import ListingCard from "../components/vehicles/ListingCard";
import Pattern from "../components/ui/Pattern";
import { PageHero } from "../components/site/PageKit";
import { clearSaved, useSaved } from "../lib/saved";

export default function SavedPage() {
  const saved = useSaved();

  return (
    <main className="pacaembu-font min-h-screen bg-[#f6f7f9]">
      <PageHero
        eyebrow="Saved"
        icon={Heart}
        title="Cars you've saved"
        subtitle="Tap the heart on any car to keep it here. Your list stays on this device, signed in or not."
        compact
      />

      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        {saved.length === 0 ? (
          <div className="relative isolate overflow-hidden rounded-xl bg-white ring-1 ring-gray-200 p-10 sm:p-14 text-center">
            <Pattern variant="grid" fade="radial" className="-z-10 text-gray-100" />
            <span className="grid place-items-center w-14 h-14 mx-auto rounded-xl bg-red-50 text-red-600"><Heart size={28} /></span>
            <h2 className="mt-5 text-xl font-semibold text-gray-900">Nothing saved yet</h2>
            <p className="mt-2 text-gray-600 max-w-sm mx-auto">Tap the heart on a car you like and it'll wait for you here.</p>
            <Link to="/marketplace" className="mt-6 inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold">
              Browse cars <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{saved.length}</span> {saved.length === 1 ? "car" : "cars"} saved
              </p>
              <button onClick={clearSaved} className="text-sm font-medium text-gray-500 hover:text-red-600">
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
              {saved.map((v) => <ListingCard key={v.id} vehicle={v} />)}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
