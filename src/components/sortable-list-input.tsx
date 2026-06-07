"use client";

import * as React from "react";
import { GripVertical, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type SortableListItem = {
    name: string;
    isDeletable: boolean;
};

type SortableListInputProps = {
    value: SortableListItem[];
    onChange: (items: SortableListItem[]) => void;
};

function reorder<T>(list: T[], from: number, to: number) {
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
}

export function SortableListInput({ value, onChange }: SortableListInputProps) {
    const [draft, setDraft] = React.useState("");
    const [dragIndex, setDragIndex] = React.useState<number | null>(null);

    const handleAddItem = () => {
        if (!draft.trim()) return;
        onChange([...value, { name: draft.trim(), isDeletable: true }]);
        setDraft("");
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Add item"
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            handleAddItem();
                        }
                    }}
                />
                <Button type="button" onClick={handleAddItem}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-2">
                {value.map((item, index) => {
                    const canDelete = item.isDeletable !== false;

                    return (
                        <div
                            key={`${item}-${index}`}
                            className="flex items-center gap-2 rounded border p-2"
                            draggable
                            onDragStart={() => setDragIndex(index)}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={() => {
                                if (dragIndex === null || dragIndex === index) return;
                                onChange(reorder(value, dragIndex, index));
                                setDragIndex(null);
                            }}
                        >
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                            <span className="flex-1 text-sm">{item.name}</span>
                            <Button
                                title={!canDelete ? "Danh mục này đang có sản phẩm, không thể xóa" : undefined}
                                disabled={!canDelete}
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => onChange(value.filter((_, i) => i !== index))}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
