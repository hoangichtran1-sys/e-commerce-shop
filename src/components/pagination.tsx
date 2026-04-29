"use client";

import { Button } from "./ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

interface PaginationProps {
    page: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    disabled?: boolean;
    pageSizeOptions?: number[];
}

export const Pagination = ({
    page,
    totalPages,
    pageSize,
    onPageChange,
    onPageSizeChange,
    disabled,
    pageSizeOptions,
}: PaginationProps) => {
    return (
        <div className="flex items-center justify-end gap-x-4 w-full mt-8">
            <div className="flex items-center gap-x-4 text-sm text-muted-foreground">
                <span>
                    Page {page} of {totalPages || 1}
                </span>
                <div className="flex items-center gap-2">
                    <span>Show:</span>
                    <Select
                        value={String(pageSize)}
                        onValueChange={(v) => {
                            onPageSizeChange(Number(v));
                            onPageChange(1); // reset page khi đổi pageSize
                        }}
                        disabled={disabled}
                    >
                        <SelectTrigger className="h-8 w-20">
                            <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                            {pageSizeOptions?.map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    disabled={page === 1 || disabled}
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                >
                    Previous
                </Button>
                <Button
                    disabled={
                        page === totalPages || totalPages === 0 || disabled
                    }
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                >
                    Next
                </Button>
            </div>
        </div>
    );
};