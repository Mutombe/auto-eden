import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { openCookieSettings } from "../../lib/consent";
import { HeroPattern } from "../ui/Pattern";
import { Cookie, Mail } from "../ui/icons";

const DOCS = [
  { to: "/terms", label: "Terms of Service" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/cookies", label: "Cookie Policy" },
];

/**
 * Shared shell for legal documents: title band, in-page contents (sticky on desktop),
 * readable column. `sections` is [{ id, title, body }].
 */
export default function LegalLayout({ title, intro, updated, sections }) {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    document.title = `${title} | Auto Eden`;
  }, [title]);

  // Deep links like /cookies#manage land on the section, otherwise start at the top.
  useEffect(() => {
    const el = hash && document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className="pacaembu-font bg-[#f6f7f9] min-h-screen">
      <header className="relative isolate overflow-hidden bg-gray-950 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_110%_at_88%_0%,rgba(220,38,38,0.3),transparent_62%)]" />
        <HeroPattern />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-10 sm:pb-14">
          <nav className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 mb-7 overflow-x-auto no-scrollbar" aria-label="Legal documents">
            {DOCS.map((d) => (
              <Link
                key={d.to}
                to={d.to}
                className={`shrink-0 h-9 inline-flex items-center px-3.5 rounded-lg text-sm transition-colors ${
                  pathname === d.to ? "bg-white text-gray-900 font-medium" : "bg-white/[0.06] ring-1 ring-white/10 text-white/75 hover:bg-white/10"
                }`}
              >
                {d.label}
              </Link>
            ))}
          </nav>
          <h1 className="text-[32px] sm:text-5xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-4 text-white/65 sm:text-lg max-w-2xl leading-relaxed">{intro}</p>
          <p className="mt-5 inline-flex items-center rounded-md bg-white/[0.06] ring-1 ring-white/10 px-2.5 py-1 text-[13px] text-white/60">Last updated {updated}</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 grid lg:grid-cols-[220px_minmax(0,1fr)] gap-8 lg:gap-12">
        <aside className="lg:sticky lg:top-24 self-start">
          <details className="lg:hidden bg-white rounded-xl ring-1 ring-gray-200 p-4">
            <summary className="font-medium text-gray-900 cursor-pointer">Contents</summary>
            <Contents sections={sections} />
          </details>
          <div className="hidden lg:block">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contents</p>
            <Contents sections={sections} />
            <div className="mt-6 rounded-xl bg-white ring-1 ring-gray-200 p-4">
              <p className="text-sm font-medium text-gray-900">Questions?</p>
              <a href={`mailto:${CONTACT.privacyEmail}`} className="mt-1 flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 break-all">
                <Mail size={15} className="shrink-0" /> {CONTACT.privacyEmail}
              </a>
              <button
                onClick={openCookieSettings}
                className="mt-3 w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-colors"
              >
                <Cookie size={16} /> Cookie settings
              </button>
            </div>
          </div>
        </aside>

        <article className="bg-white rounded-xl ring-1 ring-gray-200 p-5 sm:p-8 lg:p-10 min-w-0">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className={`scroll-mt-24 ${i ? "mt-10 pt-10 border-t border-gray-100" : ""}`}>
              <h2 className="flex items-baseline gap-3 text-xl font-semibold text-gray-900 mb-4">
                <span className="grid place-items-center min-w-7 h-7 px-1.5 rounded-md bg-red-50 text-red-600 text-sm tabular-nums">{i + 1}</span>
                {s.title}
              </h2>
              <div className="legal-body space-y-4 text-[15px] leading-relaxed text-gray-600">{s.body}</div>
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}

function Contents({ sections }) {
  return (
    <ol className="mt-3 lg:mt-0 space-y-1.5 text-sm">
      {sections.map((s, i) => (
        <li key={s.id}>
          <a href={`#${s.id}`} className="flex gap-2 text-gray-600 hover:text-red-600 transition-colors">
            <span className="text-gray-400 tabular-nums w-5 shrink-0">{i + 1}.</span>
            {s.title}
          </a>
        </li>
      ))}
    </ol>
  );
}

// Small building blocks so policy text stays readable in JSX.
export const List = ({ items }) => (
  <ul className="list-disc pl-5 space-y-2 marker:text-red-500">
    {items.map((it, i) => (
      <li key={i}>{it}</li>
    ))}
  </ul>
);

export const Term = ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>;

export const Table = ({ head, rows }) => (
  <div className="overflow-x-auto -mx-1 px-1">
    <table className="w-full min-w-[560px] text-sm border border-gray-200 rounded-lg overflow-hidden border-separate border-spacing-0">
      <thead className="bg-gray-50">
        <tr>
          {head.map((h) => (
            <th key={h} className="text-left font-semibold text-gray-700 px-3 py-2.5 border-b border-gray-200">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="align-top">
            {r.map((c, j) => (
              <td key={j} className={`px-3 py-2.5 text-gray-600 ${i < rows.length - 1 ? "border-b border-gray-100" : ""} ${j === 0 ? "font-mono text-[13px] text-gray-900 whitespace-nowrap" : ""}`}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const CONTACT = {
  privacyEmail: "privacy@autoeden.co.zw",
  email: "admin@autoeden.co.zw",
  phone: "+263 78 222 2032",
};
