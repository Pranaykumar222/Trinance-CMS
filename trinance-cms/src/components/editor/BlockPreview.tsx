import type { ContentBlock } from "@/types";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Megaphone, AlertTriangle, Info, ImageIcon, ArrowUpRight } from "lucide-react";

const toneMap: Record<string, { bg: string; icon: React.ReactNode; text: string }> = {
  info: { bg: "border-primary/20 bg-primary/5", icon: <Info className="size-4 text-primary" />, text: "text-primary" },
  warning: { bg: "border-warning/30 bg-warning/10", icon: <Megaphone className="size-4 text-warning" />, text: "text-warning" },
  danger: { bg: "border-destructive/30 bg-destructive/10", icon: <AlertTriangle className="size-4 text-destructive" />, text: "text-destructive" },
};

/** Renders a single content block as it appears on the published website. */
export function BlockPreview({ block }: { block: ContentBlock }) {
  const d = block.data;
  switch (block.type) {
    case "heading": {
      const size = d.level === 3 ? "text-lg" : d.level === 1 ? "text-3xl" : "text-2xl";
      return <h2 className={cn("font-bold tracking-tight text-slate-900", size)}>{d.text}</h2>;
    }
    case "paragraph":
      return <p className="leading-relaxed text-slate-700">{d.text}</p>;
    case "quote":
      return (
        <blockquote className="border-l-4 border-indigo-500 bg-slate-50 py-3 pl-5 pr-4">
          <p className="text-lg font-medium italic text-slate-800">“{d.text}”</p>
          {d.cite && <footer className="mt-2 text-sm text-slate-500">— {d.cite}</footer>}
        </blockquote>
      );
    case "divider":
      return <hr className="border-slate-200" />;
    case "callout": {
      const t = toneMap[d.tone] ?? toneMap.info;
      return (
        <div className={cn("flex gap-3 rounded-xl border p-4", t.bg)}>
          <div className="mt-0.5">{t.icon}</div>
          <div>
            {d.title && <p className={cn("text-sm font-semibold", t.text)}>{d.title}</p>}
            <p className="text-sm text-slate-700">{d.text}</p>
          </div>
        </div>
      );
    }
    case "image":
      return (
        <figure className="space-y-2">
          <div className="flex aspect-[16/8] items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-slate-400">
            {d.url ? <img src={d.url} alt={d.caption} className="h-full w-full object-cover" /> : <ImageIcon className="size-8" />}
          </div>
          {d.caption && <figcaption className="text-center text-xs text-slate-400">{d.caption}</figcaption>}
        </figure>
      );
    case "cta-button":
      return (
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white">
            {d.label} <ArrowUpRight className="size-4" />
          </span>
        </div>
      );
    case "number-highlight": {
      const up = d.trend !== "down";
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
          <p className={cn("flex items-center justify-center gap-1 text-4xl font-bold", up ? "text-emerald-600" : "text-rose-600")}>
            {up ? <TrendingUp className="size-7" /> : <TrendingDown className="size-7" />}
            {d.value}
          </p>
          <p className="mt-1 text-sm text-slate-500">{d.label}</p>
        </div>
      );
    }
    case "table":
      return (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>{(d.headers ?? []).map((h: string, i: number) => <th key={i} className="px-4 py-2 text-left font-semibold text-slate-600">{h}</th>)}</tr>
            </thead>
            <tbody>
              {(d.rows ?? []).map((row: string[], i: number) => (
                <tr key={i} className="border-t border-slate-100">
                  {row.map((cell, j) => <td key={j} className="px-4 py-2 text-slate-700">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "chart": {
      const series: number[] = d.series ?? [];
      const max = Math.max(...series, 1);
      const min = Math.min(...series, 0);
      const pts = series.map((v, i) => `${(i / (series.length - 1)) * 100},${40 - ((v - min) / (max - min || 1)) * 36}`).join(" ");
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          {d.title && <p className="mb-2 text-sm font-semibold text-slate-700">{d.title}</p>}
          <svg viewBox="0 0 100 40" className="h-28 w-full" preserveAspectRatio="none">
            <polyline points={pts} fill="none" stroke="#4f46e5" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      );
    }
    case "stocks-to-watch":
      return (
        <div className="rounded-xl border border-slate-200 bg-white">
          <p className="border-b border-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700">Stocks to watch</p>
          {(d.items ?? []).map((s: any, i: number) => (
            <div key={i} className="flex items-center justify-between border-b border-slate-50 px-4 py-2.5 last:border-0">
              <div>
                <p className="text-sm font-semibold text-slate-800">{s.ticker}</p>
                <p className="text-xs text-slate-500">{s.note}</p>
              </div>
              <span className={cn("text-sm font-semibold", String(s.change).startsWith("-") ? "text-rose-600" : "text-emerald-600")}>{s.change}</span>
            </div>
          ))}
        </div>
      );
    case "market-summary":
      return (
        <div className="grid grid-cols-3 gap-2">
          {(d.indices ?? []).map((idx: any, i: number) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 text-center">
              <p className="text-xs text-slate-500">{idx.name}</p>
              <p className="mt-0.5 text-base font-bold text-slate-900">{idx.value}</p>
              <p className={cn("text-xs font-semibold", String(idx.change).startsWith("-") ? "text-rose-600" : "text-emerald-600")}>{idx.change}</p>
            </div>
          ))}
        </div>
      );
    case "economic-calendar":
      return (
        <div className="rounded-xl border border-slate-200 bg-white">
          <p className="border-b border-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700">Economic calendar</p>
          {(d.events ?? []).map((e: any, i: number) => (
            <div key={i} className="flex items-center gap-3 border-b border-slate-50 px-4 py-2.5 last:border-0">
              <span className="w-16 text-xs font-medium text-slate-500">{e.time}</span>
              <span className="flex-1 text-sm text-slate-700">{e.label}</span>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", e.impact === "high" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700")}>{e.impact}</span>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}
