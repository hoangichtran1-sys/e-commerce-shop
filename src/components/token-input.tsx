"use client";

import * as React from "react";
import { BrushCleaningIcon, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "./ui/input-group";

type TokenInputProps = {
    value: string[];
    onChange: (tokens: string[]) => void;
    placeholder?: string;
};

export function TokenInput({ value, onChange, placeholder }: TokenInputProps) {
    const [draft, setDraft] = React.useState("");

    const addToken = (raw: string) => {
        const next = raw.trim();
        if (!next || value.includes(next)) return;
        onChange([...value, next]);
    };

    const removeToken = (token: string) => {
        onChange(value.filter((item) => item !== token));
    };

    const removeAllToken = () => {
        onChange([]);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addToken(draft);
            setDraft("");
        }

        if (event.key === "Backspace" && !draft && value.length > 0) {
            removeToken(value[value.length - 1]);
        }
    };

    return (
        <div className="space-y-2 w-full">
            <InputGroup className="flex flex-wrap items-center gap-2 p-2 min-h-12 h-auto border rounded-md w-full focus-within:ring-2 focus-within:ring-ring">
                {value.map((token) => (
                    <Badge key={token} variant="secondary" className="gap-1 py-1 px-2 shrink-0">
                        {token}
                        <button type="button" onClick={() => removeToken(token)} aria-label={`Remove ${token}`}>
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
                <InputGroupAddon align="inline-end" className="ml-auto">
                    <InputGroupButton aria-label="Clear" title="Clear" size="icon-xs" onClick={removeAllToken} variant="ghost">
                        <BrushCleaningIcon />
                    </InputGroupButton>
                </InputGroupAddon>
                <InputGroupInput
                    className="flex-1 min-w-30 h-8 border-0 shadow-none focus-visible:ring-0 p-0 bg-transparent"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                        if (draft.trim()) {
                            addToken(draft);
                            setDraft("");
                        }
                    }}
                    placeholder={placeholder}
                />
            </InputGroup>
        </div>
    );
}
