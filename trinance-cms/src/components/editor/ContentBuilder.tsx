import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ContentBlock } from "@/types";
import { BLOCK_DEFS } from "@/lib/constants";
import { genId } from "@/lib/api";
import { BlockPreview } from "./BlockPreview";
import { BlockInspector } from "./BlockInspector";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";
import { GripVertical, Trash2, Copy, LayoutList, X } from "lucide-react";

export function ContentBuilder({
  blocks,
  onChange,
}: {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(blocks[0]?.id ?? null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addBlock = (type: ContentBlock["type"]) => {
    const def = BLOCK_DEFS.find((b) => b.type === type)!;
    const block: ContentBlock = { id: genId("blk"), type, data: structuredClone(def.defaultData) };
    onChange([...blocks, block]);
    setSelectedId(block.id);
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateBlock = (id: string) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const copy = { ...blocks[idx], id: genId("blk"), data: structuredClone(blocks[idx].data) };
    const next = [...blocks];
    next.splice(idx + 1, 0, copy);
    onChange(next);
  };

  const updateBlock = (id: string, data: Record<string, any>) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, data } : b)));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      onChange(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  const selected = blocks.find((b) => b.id === selectedId) ?? null;
  const groups = ["Basic", "Media", "Financial"] as const;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Section: Horizontal Add Blocks Panel */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-soft space-y-3">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Add Blocks</p>
        <div className="flex flex-wrap gap-4">
          {groups.map((g) => (
            <div key={g} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-2">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 px-1 border-r border-slate-200 mr-1 shrink-0">{g}</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {BLOCK_DEFS.filter((b) => b.group === g).map((b) => (
                  <button
                    key={b.type}
                    onClick={() => addBlock(b.type)}
                    className="group flex items-center gap-2 rounded-lg border border-slate-200/60 bg-card px-2.5 py-1.5 text-left transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-500 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      <b.icon className="size-3" />
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 transition-colors group-hover:text-primary whitespace-nowrap">{b.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: Split Canvas (Left) and Inspector (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Canvas */}
        <div className="min-h-[480px] max-h-[520px] overflow-y-auto rounded-xl border border-border bg-slate-50/60 p-5 shadow-inner no-scrollbar">
          {blocks.length === 0 ? (
            <EmptyState
              icon={LayoutList}
              title="Start building your newsletter"
              description="Add blocks from the horizontal panel above. Drag to reorder, click to edit."
            />
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3.5">
                  {blocks.map((block) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      selected={block.id === selectedId}
                      onSelect={() => setSelectedId(block.id)}
                      onRemove={() => removeBlock(block.id)}
                      onDuplicate={() => duplicateBlock(block.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Inspector */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-soft min-h-[480px] max-h-[520px] flex flex-col">
          {selected ? (
            <div className="space-y-4 flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">{selected.type.replace(/-/g, " ")} settings</p>
                <Button variant="ghost" size="icon-sm" className="hover:bg-accent" onClick={() => setSelectedId(null)}><X className="size-4" /></Button>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 no-scrollbar min-h-0">
                <BlockInspector block={selected} onChange={(data) => updateBlock(selected.id, data)} />
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-20 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-accent/40 text-primary mb-3">
                <LayoutList className="size-5" />
              </div>
              <p className="text-sm font-semibold text-slate-800">Select a block</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[180px]">Click any block inside the canvas to edit its contents.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SortableBlock({
  block,
  selected,
  onSelect,
  onRemove,
  onDuplicate,
}: {
  block: ContentBlock;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "group relative rounded-xl border bg-white p-4 shadow-soft transition-all duration-200 cursor-pointer",
        selected ? "border-primary ring-2 ring-primary/10 shadow-md" : "border-slate-200/80 hover:border-slate-350 hover:shadow-md",
        isDragging && "opacity-70 shadow-lg scale-[1.01]"
      )}
    >
      {/* Unified control header inside block card */}
      <div className="mb-3.5 flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
          >
            <GripVertical className="size-4" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{block.type.replace(/-/g, " ")}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            title="Duplicate block"
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <Copy className="size-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            title="Delete block"
            className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="px-1">
        <BlockPreview block={block} />
      </div>
    </div>
  );
}
