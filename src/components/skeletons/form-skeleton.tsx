import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "../ui/separator";
import { Container } from "../container";

export const FormSkeleton = () => {
    return (
        <Container>
            <div className="max-w-full flex items-center justify-between mt-6">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-8 w-12" />
            </div>
            <Separator className="mb-2 mt-2" />
            <div className="max-w-full">
                <div className="grid md:grid-cols-2 grid-cols-1 gap-8">
                    <div className="col-span-2 flex max-w-full items-center justify-between gap-6">
                        <div className="flex flex-1 flex-col gap-3">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-8 w-[40%]" />
                        </div>
                        <div className="flex flex-1 flex-col gap-3">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-[40%]" />
                        </div>
                    </div>
                    <div className="col-span-2 flex max-w-full items-center justify-between gap-6">
                        <div className="flex flex-1 flex-col gap-3">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-8 w-[40%]" />
                        </div>
                        <div className="flex flex-1 flex-col gap-3">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-[40%]" />
                        </div>
                    </div>
                    <div className="col-span-2 flex max-w-full items-center justify-between gap-6">
                        <div className="flex flex-1 flex-col gap-3">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="aspect-video w-full" />
                        </div>
                        <div className="flex flex-1 flex-col gap-3">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    </div>
                    <div className="col-span-2">
                        <Skeleton className="h-16 w-full" />
                    </div>
                    <Skeleton className="h-8 md:w-24 w-full mt-4" />
                </div>
            </div>
        </Container>
    );
};
