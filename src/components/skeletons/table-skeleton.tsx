import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "../ui/separator";
import { Container } from "../container";

export const TableSkeleton = ({ cols, isSelect = false }: { cols: number; isSelect?: boolean }) => {
    return (
        <Container>
            <div className="max-w-full flex flex-col gap-y-2 mt-6">
                <Skeleton className="w-36 h-6" />
                <Skeleton className="w-48 h-4" />
            </div>
            <Separator className="mb-2 mt-2" />
            <div className="max-w-full">
                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-x-4">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                </div>
                <div className="flex max-w-full flex-col gap-4">
                    {Array.from({ length: 9 }).map((_, index1) => (
                        <div key={`row-${index1}`}>
                            <div className="flex gap-20">
                                {isSelect && <Skeleton className="h-6 w-6 rounded-md" />}
                                {Array.from({ length: cols }).map((_, index2) => (
                                    <Skeleton key={`col-${index2}`} className="h-6 w-30" />
                                ))}
                                {index1 !== 0 && <Skeleton className="h-4 w-2 rounded-md" />}
                            </div>
                            {index1 === 0 && <Separator className="mb-2 mt-2" />}
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
};
