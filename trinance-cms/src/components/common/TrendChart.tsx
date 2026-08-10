import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import { formatCompact } from "@/lib/utils";

const AXIS = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };

function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-pop">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-muted-foreground">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold text-foreground">{formatter ? formatter(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function AreaTrend({
  data,
  dataKey,
  xKey = "label",
  color = "hsl(var(--primary))",
  name,
  formatter,
  height = 260,
}: {
  data: any[];
  dataKey: string;
  xKey?: string;
  color?: string;
  name?: string;
  formatter?: (v: number) => string;
  height?: number;
}) {
  const id = `grad-${dataKey}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} axisLine={false} tickLine={false} minTickGap={24} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => formatCompact(Number(v))} />
        <Tooltip content={<ChartTooltip formatter={formatter} />} />
        <Area type="monotone" dataKey={dataKey} name={name ?? dataKey} stroke={color} strokeWidth={2.5} fill={`url(#${id})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarTrend({
  data,
  dataKey,
  xKey = "label",
  color = "hsl(var(--primary))",
  name,
  formatter,
  height = 260,
}: {
  data: any[];
  dataKey: string;
  xKey?: string;
  color?: string;
  name?: string;
  formatter?: (v: number) => string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} axisLine={false} tickLine={false} minTickGap={24} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => formatCompact(Number(v))} />
        <Tooltip cursor={{ fill: "hsl(var(--secondary))" }} content={<ChartTooltip formatter={formatter} />} />
        <Bar dataKey={dataKey} name={name ?? dataKey} fill={color} radius={[5, 5, 0, 0]} maxBarSize={38} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineTrend({
  data,
  series,
  xKey = "label",
  formatter,
  height = 260,
}: {
  data: any[];
  series: { key: string; color: string; name: string }[];
  xKey?: string;
  formatter?: (v: number) => string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} axisLine={false} tickLine={false} minTickGap={24} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => formatCompact(Number(v))} />
        <Tooltip content={<ChartTooltip formatter={formatter} />} />
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2.5} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
