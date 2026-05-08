"use client";

import { useId, useState } from "react";

import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface MultipleSelectProps {
    options: { label: string; value: string }[];
    selectedValues: string[];
    setSelectedValues: (values: string[]) => void;
    topic?: string;
}

export const MultipleSelect = ({
    options,
    selectedValues,
    setSelectedValues,
    topic = "option",
}: MultipleSelectProps) => {
    const id = useId();
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const toggleSelection = (value: string) => {
        const nextValues = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];

        setSelectedValues(nextValues);
    };

    const removeSelection = (value: string) => {
        const nextValues = selectedValues.filter((v) => v !== value);

        setSelectedValues(nextValues);
    };

    // Define maxShownItems before using visibleItems
    const maxShownItems = 2;
    const visibleItems = expanded
        ? selectedValues
        : selectedValues.slice(0, maxShownItems);
    const hiddenCount = selectedValues.length - visibleItems.length;

    return (
        <div className="w-full space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="h-auto min-h-8 w-full justify-between hover:bg-transparent"
                    >
                        <div className="flex flex-wrap items-center gap-1 pr-2.5">
                            {selectedValues.length > 0 ? (
                                <>
                                    {visibleItems.map((val) => {
                                        const option = options.find(
                                            (c) => c.value === val,
                                        );

                                        return option ? (
                                            <Badge
                                                key={val}
                                                variant="outline"
                                                className="rounded-sm"
                                            >
                                                {option.label}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-4"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeSelection(val);
                                                    }}
                                                    asChild
                                                >
                                                    <span>
                                                        <XIcon className="size-3" />
                                                    </span>
                                                </Button>
                                            </Badge>
                                        ) : null;
                                    })}
                                    {hiddenCount > 0 || expanded ? (
                                        <Badge
                                            variant="default"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExpanded((prev) => !prev);
                                            }}
                                            className="rounded-sm"
                                        >
                                            {expanded
                                                ? "Show Less"
                                                : `+${hiddenCount} more`}
                                        </Badge>
                                    ) : null}
                                </>
                            ) : (
                                <span className="text-muted-foreground">
                                    Select {topic}
                                </span>
                            )}
                        </div>
                        <ChevronsUpDownIcon
                            className="text-muted-foreground/80 shrink-0"
                            aria-hidden="true"
                        />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="min-w-(--anchor-width) w-auto p-0">
                    <Command>
                        <CommandInput placeholder={`Search ${topic}...`} />
                        <CommandList>
                            <CommandEmpty>No {topic} found.</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.value}
                                        onSelect={() =>
                                            toggleSelection(option.value)
                                        }
                                    >
                                        <span className="truncate">
                                            {option.label}
                                        </span>
                                        {selectedValues.includes(
                                            option.value,
                                        ) && (
                                            <CheckIcon
                                                size={16}
                                                className="ml-auto"
                                            />
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
};
