// src/pages/news-article.jsx — one story from /core/articles/<id>/
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Calendar, Newspaper } from "../components/ui/icons";
import api from "../utils/api";
import { HeroPattern } from "../components/ui/Pattern";
import { NEWS_CATEGORIES, formatDate, getCategoryIcon } from "./new-page";

export default function NewsArticlePage() {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [state, setState] = useState("loading");

  useEffect(() => {
    let live = true;
    setState("loading");
    api
      .get(`/core/articles/${articleId}/`)
      .then(({ data }) => live && (setArticle(data), setState("ready")))
      .catch(() => live && setState("missing"));
    return () => (live = false);
  }, [articleId]);

  const paragraphs = (article?.content || "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <main className="pacaembu-font min-h-screen bg-[#f6f7f9]">
      {article && (
        <Helmet>
          <title>{article.meta_title || article.title} | Auto Eden News</title>
          <meta name="description" content={article.meta_description || article.excerpt} />
        </Helmet>
      )}
      <header className="relative isolate overflow-hidden bg-gray-950 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_110%_at_88%_0%,rgba(220,38,38,0.34),transparent_62%)]" />
        <HeroPattern />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-10 sm:pb-14">
          <Link to="/news" className="inline-flex items-center gap-1.5 -ml-2 px-2 py-1.5 rounded-lg text-sm text-white/65 hover:text-white hover:bg-white/10">
            <ArrowLeft size={16} /> All news
          </Link>
          {state === "loading" && (
            <div className="mt-6 space-y-3 animate-pulse"><div className="h-4 w-40 bg-white/10 rounded" /><div className="h-10 w-4/5 bg-white/15 rounded" /></div>
          )}
          {state === "missing" && <h1 className="mt-6 text-3xl font-semibold">Story not found</h1>}
          {article && (
            <>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/60">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] ring-1 ring-white/10 px-2 py-1 text-[12px] font-medium text-white/80">
                  {getCategoryIcon(article.category, "w-3.5 h-3.5 text-red-400")} {NEWS_CATEGORIES[article.category] || article.category}
                </span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(article.published_at)}</span>
              </div>
              <h1 className="mt-4 text-[30px] sm:text-5xl font-semibold tracking-tight leading-[1.1] text-balance">{article.title}</h1>
              {article.excerpt && <p className="mt-4 text-lg text-white/65">{article.excerpt}</p>}
            </>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {state === "missing" ? (
          <div className="rounded-xl bg-white ring-1 ring-gray-200 p-10 text-center">
            <Newspaper className="w-10 h-10 mx-auto text-gray-300" />
            <p className="mt-3 text-gray-600">This story may have been moved or unpublished.</p>
            <Link to="/news" className="mt-5 inline-flex h-11 items-center px-6 rounded-lg bg-gray-900 text-white font-medium">Back to news</Link>
          </div>
        ) : article ? (
          <article className="rounded-xl bg-white ring-1 ring-gray-200 overflow-hidden">
            {article.featured_image && <img src={article.featured_image} alt="" className="w-full aspect-[16/9] object-cover" />}
            <div className="p-6 sm:p-10 space-y-5 text-[17px] leading-[1.75] text-gray-700">
              {paragraphs.map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
              {article.author_name && <p className="pt-5 border-t border-gray-100 text-sm text-gray-500">By {article.author_name}</p>}
            </div>
          </article>
        ) : (
          <div className="rounded-xl bg-white ring-1 ring-gray-200 p-10 space-y-3 animate-pulse">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-3.5 bg-gray-100 rounded" />)}
          </div>
        )}
      </div>
    </main>
  );
}
