import type { Newsletter } from "@/types";
import { BlockPreview } from "./BlockPreview";
import { userById } from "@/data/seed";
import { TEMPLATE_NAME } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Clock, Lock } from "lucide-react";

/** Renders the full newsletter as it would appear on the Trinance website. */
export function NewsletterPreview({ newsletter }: { newsletter: Newsletter }) {
  const author = userById(newsletter.authorId);
  return (
    <article className="mx-auto max-w-2xl bg-white px-6 py-8 text-slate-900 sm:px-10 sm:py-12">
      {/* Masthead */}
      <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-indigo-600 text-sm font-bold text-white">T</div>
          <span className="text-sm font-bold text-slate-900">Trinance</span>
        </div>
        <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">{TEMPLATE_NAME[newsletter.template]}</span>
      </div>

      {newsletter.visibility !== "free" && (
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
          <Lock className="size-3" /> {newsletter.visibility.charAt(0).toUpperCase() + newsletter.visibility.slice(1)} subscribers
        </div>
      )}

      <header className="mb-6 space-y-3">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900">
          {newsletter.title || "Untitled newsletter"}
        </h1>
        {newsletter.subtitle && <p className="text-lg text-slate-500">{newsletter.subtitle}</p>}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-sm text-slate-500">
          {author && (
            <span className="flex items-center gap-1.5">
              <span className="flex size-6 items-center justify-center rounded-full text-[10px] font-semibold text-white" style={{ background: author.avatarColor }}>
                {author.name.split(" ").map((n) => n[0]).join("")}
              </span>
              {author.name}
            </span>
          )}
          <span>·</span>
          <span>{formatDate(newsletter.publishDate ?? newsletter.updatedAt)}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock className="size-3.5" /> {newsletter.readingTime} min read</span>
        </div>
      </header>

      {newsletter.coverImage ? (
        <img src={newsletter.coverImage} alt="" className="mb-8 aspect-[16/7] w-full rounded-xl object-cover" />
      ) : (
        <div className="mb-8 flex aspect-[16/7] w-full items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-slate-100 text-4xl">
          {TEMPLATE_NAME[newsletter.template] ? "📊" : ""}
        </div>
      )}

      <div className="space-y-6">
        {newsletter.blocks.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">Content blocks will appear here as you add them.</p>
        ) : (
          newsletter.blocks.map((block) => <BlockPreview key={block.id} block={block} />)
        )}
      </div>

      <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
        <p>You're receiving this because you subscribed to Trinance.</p>
        <p className="mt-1">© 2026 Trinance · Unsubscribe · Manage preferences</p>
      </footer>
    </article>
  );
}
