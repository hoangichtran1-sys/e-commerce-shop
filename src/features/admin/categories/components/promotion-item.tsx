import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/orpc-rq.client";
import { toast } from "sonner";
import {
    Item,
    ItemMedia,
    ItemContent,
    ItemTitle,
    ItemDescription,
    ItemActions,
} from "@/components/ui/item";
import { SupportIcon } from "@/components/support-icon";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Promotion } from "@/generated/prisma/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

interface PromotionItemProps {
    categoryId: string;
    item: Omit<Promotion, "minOrderValue" | "maxDiscountValue"> & {
        minOrderValue: number;
        maxDiscountValue: number | null;
    };
    storeId: string;
}

export const PromotionItem = ({ categoryId, item, storeId }: PromotionItemProps) => {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    const duration =
        item.startAt && item.endAt
            ? `${format(item.startAt, "MMMM do, yyyy")} - ${format(item.endAt, "MMMM do, yyyy")}`
            : "Unlimited";

    const disconnect = useMutation(
        orpc.categories.disconnect.mutationOptions({
            onSuccess: (data) => {
                toast.success(data.message);
                queryClient.invalidateQueries(
                    orpc.categories.getManyWithPromotion.queryOptions({
                        input: { storeId },
                    }),
                );
                queryClient.invalidateQueries(
                    orpc.promotions.getOne.queryOptions({
                        input: { storeId, id: item.id },
                    }),
                );
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const handleDisconnect = () => {
        disconnect.mutate(
            { storeId, categoryId, promotionId: item.id },
            {
                onSuccess: () => {
                    setIsOpen(false);
                },
            },
        );
    };

    return (
        <Item variant="outline" size="xs">
            <ItemMedia variant="icon">
                <SupportIcon supported={item.isActive} />
            </ItemMedia>
            <ItemContent>
                {item.type === "FIXED" && <ItemTitle>{formatPrice(item.value)}</ItemTitle>}
                {item.type === "PERCENT" && <ItemTitle>{item.value}%</ItemTitle>}
                <ItemDescription>
                    {item.name}({duration})
                </ItemDescription>
            </ItemContent>
            <ItemActions>
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            className="rounded-full"
                            aria-label="Disconnect"
                        >
                            <XIcon />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <div className="space-y-4">
                            <h4 className="font-semibold">Are you sure?</h4>
                            <p className="text-sm text-muted-foreground">
                                Action will disconnect this promotion
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button
                                    disabled={disconnect.isPending}
                                    onClick={() => setIsOpen(false)}
                                    size="sm"
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={disconnect.isPending}
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDisconnect}
                                >
                                    Confirm
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </ItemActions>
        </Item>
    );
};
