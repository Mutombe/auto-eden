import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { openCookieSettings } from "../../lib/consent";

const DOCS = [
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
    <div className="pacaembu-font bg-gray-50 min-h-screen">
      <header className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10 sm:pb-14">
          <nav className="flex flex-wrap gap-2 mb-6" aria-label="Legal documents">
            {DOCS.map((d) => (
              <Link
                key={d.to}
                to={d.to}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  pathname === d.to ? "bg-white text-gray-900 font-medium" : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                {d.label}
              </Link>
            ))}
          </nav>
          <h1 className="text-3xl sm:text-4xl font-medium">{title}</h1>
          <p className="mt-3 text-white/70 max-w-2xl leading-relaxed">{intro}</p>
          <p className="mt-4 text-sm text-white/50">Last updated: {updated}</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 grid lg:grid-cols-[220px_minmax(0,1fr)] gap-8 lg:gap-12">
        <aside className="lg:sticky lg:top-24 self-start">
          <details className="lg:hidden bg-white rounded-xl border border-gray-200 p-4" >
            <summary className="font-medium text-gray-900 cursor-pointer">Contents</summary>
            <Contents sections={sections} />
          </details>
          <div className="hidden lg:block">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contents</p>
            <Contents sections={sections} />
            <button
              onClick={openCookieSettings}
              className="mt-6 w-full px-4 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-colors"
            >
              Cookie settings
            </button>
          </div>
        </aside>

        <article className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-8 lg:p-10 min-w-0">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className={`scroll-mt-24 ${i ? "mt-10 pt-10 border-t border-gray-100" : ""}`}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <span className="text-red-600 mr-2 tabular-nums">{i + 1}.</span>
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
    <table className="w-full min-w-[560px] text-sm border border-gray-200 rounded-xl overflow-hidden border-separate border-spacing-0">
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
