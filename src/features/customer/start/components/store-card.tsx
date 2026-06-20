import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { GetStores } from "../../types";
import Image from "next/image";
import Cookies from "js-cookie";
import { SparklesIcon, TrophyIcon } from "lucide-react";
import { STORE_PRODUCT_SOLD_BREAKPOINT } from "@/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface StoreCardProps {
    item: GetStores[number];
    totalSoldProduct: number;
}

export const StoreCardSkeleton = () => {
    return (
        <Card className="relative size-full border overflow-hidden py-4 pointer-events-none">
            <CardContent className="px-4">
                <div className="relative size-full overflow-hidden rounded-md">
                    <Skeleton className="aspect-video w-full bg-accent" />
                </div>
                <div className="from-background/90 via-background/30 absolute inset-0 bg-linear-to-t to-transparent" />

                <div className="text-background-foreground absolute inset-0 flex flex-col justify-end p-8">
                    <div className="relative z-10 max-w-md flex flex-col gap-4">
                        <Skeleton className="h-12 w-40" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="pt-2 rounded-full h-12 w-36" />
                    </div>
                </div>

                <div className="absolute inset-e-8 top-8 rounded-full px-3 py-1 backdrop-blur-xs">
                    <Skeleton className="h-6 w-20 bg-muted-foreground" />
                </div>
            </CardContent>
        </Card>
    );
};

export const StoreCard = ({ item, totalSoldProduct }: StoreCardProps) => {
    const router = useRouter();

    const handleSelectStore = () => {
        Cookies.set("storeSlug", item.slug);
        router.push(`/${item.slug}`);
    };

    const isBestSeller = totalSoldProduct > 0 ? (item.productSold / totalSoldProduct) * 100 >= STORE_PRODUCT_SOLD_BREAKPOINT : false;

    return (
        <Card className="relative size-full border overflow-hidden py-4">
            <CardContent className="px-4">
                <div className="relative size-full overflow-hidden rounded-md">
                    <Image
                        width={200}
                        height={200}
                        loading="eager"
                        src={item.thumbnail || "/placeholder.png"}
                        alt={item.name}
                        className="h-125 w-full object-cover"
                    />
                </div>
                <div className="from-background/90 via-background/30 absolute inset-0 bg-linear-to-t to-transparent" />

                <div className="text-background-foreground absolute inset-0 flex flex-col justify-end p-8">
                    <div className="relative z-10 max-w-md flex flex-col gap-4">
                        <h2 className="text-4xl font-bold">{item.name}</h2>
                        <p className="text-background-foreground/80 text-lg">
                            {item.description || "Discover the latest in style and comfort with our premium collection."}
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <Button onClick={handleSelectStore} size="lg" className="h-10 px-8 cursor-pointer rounded-full">
                                Go to Shop
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="text-background-foreground bg-foreground/10 dark:bg-background/20 absolute inset-e-8 top-8 flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium backdrop-blur-xs">
                    {isBestSeller ? (
                        <div className="flex items-center gap-x-1">
                            <TrophyIcon className="size-4" /> Best Seller
                        </div>
                    ) : item.isFeatured ? (
                        <div className="flex items-center gap-x-1">
                            <SparklesIcon className="size-4" /> Featured
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
};
