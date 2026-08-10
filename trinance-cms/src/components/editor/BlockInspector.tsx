import { useState, useEffect } from "react";
import type { ContentBlock } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs">{label}</Label>
    {children}
  </div>
);

export function BlockInspector({
  block,
  onChange,
}: {
  block: ContentBlock;
  onChange: (data: Record<string, any>) => void;
}) {
  const d = block.data;
  const set = (patch: Record<string, any>) => onChange({ ...d, ...patch });


  switch (block.type) {
    case "heading":
      return (
        <div className="space-y-3">
          <Field label="Heading text"><Input value={d.text} onChange={(e) => set({ text: e.target.value })} /></Field>
          <Field label="Level">
            <Select value={String(d.level)} onValueChange={(v) => set({ level: Number(v) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">H1 — Large</SelectItem>
                <SelectItem value="2">H2 — Medium</SelectItem>
                <SelectItem value="3">H3 — Small</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      );
    case "paragraph":
      return <Field label="Text"><Textarea rows={5} value={d.text} onChange={(e) => set({ text: e.target.value })} /></Field>;
    case "quote":
      return (
        <div className="space-y-3">
          <Field label="Quote"><Textarea rows={3} value={d.text} onChange={(e) => set({ text: e.target.value })} /></Field>
          <Field label="Attribution"><Input value={d.cite} onChange={(e) => set({ cite: e.target.value })} /></Field>
        </div>
      );
    case "divider":
      return <p className="text-sm text-muted-foreground">A horizontal divider. No settings needed.</p>;
    case "callout":
      return (
        <div className="space-y-3">
          <Field label="Tone">
            <Select value={d.tone} onValueChange={(v) => set({ tone: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="danger">Danger</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Title"><Input value={d.title} onChange={(e) => set({ title: e.target.value })} /></Field>
          <Field label="Body"><Textarea rows={3} value={d.text} onChange={(e) => set({ text: e.target.value })} /></Field>
        </div>
      );
    case "image":
      return (
        <div className="space-y-3">
          <Field label="Image URL"><Input placeholder="https://…" value={d.url} onChange={(e) => set({ url: e.target.value })} /></Field>
          <Field label="Caption"><Input value={d.caption} onChange={(e) => set({ caption: e.target.value })} /></Field>
        </div>
      );
    case "cta-button":
      return (
        <div className="space-y-3">
          <Field label="Button label"><Input value={d.label} onChange={(e) => set({ label: e.target.value })} /></Field>
          <Field label="Link URL"><Input value={d.url} onChange={(e) => set({ url: e.target.value })} /></Field>
        </div>
      );
    case "number-highlight":
      return (
        <div className="space-y-3">
          <Field label="Value"><Input value={d.value} onChange={(e) => set({ value: e.target.value })} /></Field>
          <Field label="Label"><Input value={d.label} onChange={(e) => set({ label: e.target.value })} /></Field>
          <Field label="Trend">
            <Select value={d.trend} onValueChange={(v) => set({ trend: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="up">Up (green)</SelectItem>
                <SelectItem value="down">Down (red)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      );
    case "table":
      return (
        <div className="space-y-3">
          <Field label="Headers (comma separated)">
            <TableHeadersInput value={d.headers ?? []} onChange={(headers) => set({ headers })} />
          </Field>
          <Field label="Rows (one per line, cells comma separated)">
            <TableRowsInput value={d.rows ?? []} onChange={(rows) => set({ rows })} />
          </Field>
        </div>
      );
    case "chart":
      return (
        <div className="space-y-3">
          <Field label="Chart title"><Input value={d.title} onChange={(e) => set({ title: e.target.value })} /></Field>
          <Field label="Data points (comma separated)">
            <ChartSeriesInput value={d.series ?? []} onChange={(series) => set({ series })} />
          </Field>
        </div>
      );
    case "stocks-to-watch":
      return <ListEditor items={d.items ?? []} fields={["ticker", "note", "change"]} onChange={(items) => set({ items })} />;
    case "market-summary":
      return <ListEditor items={d.indices ?? []} fields={["name", "value", "change"]} onChange={(indices) => set({ indices })} label="index" />;
    case "economic-calendar":
      return <ListEditor items={d.events ?? []} fields={["time", "label", "impact"]} onChange={(events) => set({ events })} label="event" />;
    default:
      return null;
  }
}

function ListEditor({
  items,
  fields,
  onChange,
  label = "item",
}: {
  items: any[];
  fields: string[];
  onChange: (items: any[]) => void;
  label?: string;
}) {
  const update = (i: number, key: string, val: string) => {
    const next = items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it));
    onChange(next);
  };
  const add = () => onChange([...items, Object.fromEntries(fields.map((f) => [f, ""]))]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{label} {i + 1}</span>
            <Button variant="ghost" size="icon-sm" onClick={() => remove(i)}><Trash2 className="size-3.5" /></Button>
          </div>
          {fields.map((f) => (
            <Input key={f} placeholder={f} value={it[f] ?? ""} onChange={(e) => update(i, f, e.target.value)} className="h-8 text-sm" />
          ))}
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full" onClick={add}>
        <Plus className="size-4" /> Add {label}
      </Button>
    </div>
  );
}

function ChartSeriesInput({ value, onChange }: { value: number[]; onChange: (val: number[]) => void }) {
  const [text, setText] = useState(() => value.join(", "));

  useEffect(() => {
    const currentTextFromValue = value.join(", ");
    const parsedNumbers = text.split(",").map((s) => Number(s.trim())).filter((n) => !isNaN(n));
    const valuesMatch = value.length === parsedNumbers.length && value.every((v, i) => v === parsedNumbers[i]);
    if (!valuesMatch) {
      setText(currentTextFromValue);
    }
  }, [value]);

  const handleChange = (newVal: string) => {
    setText(newVal);
    const parsed = newVal
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map(Number)
      .filter((n) => !isNaN(n));
    onChange(parsed);
  };

  return <Input value={text} onChange={(e) => handleChange(e.target.value)} placeholder="e.g. 10, 20, 15, 30" />;
}

function TableHeadersInput({ value, onChange }: { value: string[]; onChange: (val: string[]) => void }) {
  const [text, setText] = useState(() => value.join(", "));

  useEffect(() => {
    const currentText = value.join(", ");
    const parsed = text.split(",").map((s) => s.trim());
    const match = value.length === parsed.length && value.every((v, i) => v === parsed[i]);
    if (!match) {
      setText(currentText);
    }
  }, [value]);

  const handleChange = (newVal: string) => {
    setText(newVal);
    const parsed = newVal.split(",").map((s) => s.trim());
    onChange(parsed);
  };

  return <Input value={text} onChange={(e) => handleChange(e.target.value)} placeholder="e.g. Header 1, Header 2" />;
}

function TableRowsInput({ value, onChange }: { value: string[][]; onChange: (val: string[][]) => void }) {
  const serialize = (rows: string[][]) => rows.map((r) => r.join(", ")).join("\n");
  const [text, setText] = useState(() => serialize(value));

  useEffect(() => {
    const currentText = serialize(value);
    const parsed = text.split("\n").map((line) => line.split(",").map((s) => s.trim()));
    const match = value.length === parsed.length && value.every((row, rIdx) => 
      row.length === parsed[rIdx]?.length && row.every((val, cIdx) => val === parsed[rIdx][cIdx])
    );
    if (!match) {
      setText(currentText);
    }
  }, [value]);

  const handleChange = (newVal: string) => {
    setText(newVal);
    const parsed = newVal.split("\n").map((line) => line.split(",").map((s) => s.trim()));
    onChange(parsed);
  };

  return <Textarea rows={4} value={text} onChange={(e) => handleChange(e.target.value)} placeholder="Row 1 Cell 1, Row 1 Cell 2&#10;Row 2 Cell 1, Row 2 Cell 2" />;
}
