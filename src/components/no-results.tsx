"use client";

import { type LucideIcon, RefreshCcwIcon, InboxIcon, PlusIcon } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "./ui/empty";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

interface NoResultsProps {
    icon?: LucideIcon;
    topic?: string;
    isAdmin?: boolean;
}

export const NoResults = ({ icon: Icon = InboxIcon, topic = "items", isAdmin = false }: NoResultsProps) => {
    const router = useRouter();

    return (
        <Empty className="h-full bg-background items-center">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Icon />
                </EmptyMedia>
                <EmptyTitle>No {topic}</EmptyTitle>
                <EmptyDescription className="max-w-xs text-pretty">
                    No {topic} have been created yet. Please refresh the page or come back later.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <div className="flex items-center gap-x-4">
                    <Button onClick={() => router.refresh()} variant="outline">
                        <RefreshCcwIcon />
                        Refresh
                    </Button>
                    {isAdmin && (
                        <Button onClick={() => router.push("/admin")} variant="secondary">
                            <PlusIcon />
                            Add {topic}
                        </Button>
                    )}
                </div>
            </EmptyContent>
        </Empty>
    );
};
