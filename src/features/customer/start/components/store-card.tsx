import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { GetStores } from "../../types";
import Image from "next/image";
import Cookies from "js-cookie";
import { FlameIcon } from "lucide-react";

interface StoreCardProps {
    item: GetStores[number];
}

export const StoreCard = ({ item }: StoreCardProps) => {
    const router = useRouter();

    const handleSelectStore = () => {
        Cookies.set("storeSlug", item.slug);
        router.push(`/${item.slug}`);
    };

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
                                Shop Now
                            </Button>
                        </div>
                    </div>
                </div>

                {item.isFeatured && (
                    <div className="text-background-foreground bg-foreground/10 dark:bg-background/20 absolute inset-e-8 top-8 flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium backdrop-blur-xs">
                        <FlameIcon className="size-4" /> Trending
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
