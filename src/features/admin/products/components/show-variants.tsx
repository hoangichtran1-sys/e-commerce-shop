import { Variant } from "@/lib/generate-variants";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { VariantsTable } from "./variants-table";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/orpc-rq.client";
import { toast } from "sonner";

interface ShowVariantsProps {
    storeId: string;
    productId: string;
    productName: string;
    variants: Variant[];
}

export const ShowVariants = ({ storeId, productId, productName, variants }: ShowVariantsProps) => {
    const [updatedVariants, setUpdatedVariants] = useState<Variant[]>(variants);
    const isMobile = useIsMobile();

    const queryClient = useQueryClient();

    const updateVariants = useMutation(
        orpc.products.updateVariants.mutationOptions({
            onSuccess: () => {
                toast.success("Product variants updated");
                queryClient.invalidateQueries(orpc.products.getMany.queryOptions({ input: { storeId } }));
                queryClient.invalidateQueries(orpc.products.getOne.queryOptions({ input: { storeId, id: productId } }));
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" variant="ghost" title="Show all variants" type="button">
                    <EyeIcon />
                </Button>
            </SheetTrigger>
            <SheetContent
                side={isMobile ? "top" : "right"}
                className="data-[side=bottom]:max-h-[60vh] data-[side=top]:max-h-[60vh] md:min-w-200 w-auto"
            >
                <SheetHeader>
                    <SheetTitle>Variants({variants.length})</SheetTitle>
                    <SheetDescription>Show all variants with product &quot;{productName}&quot;</SheetDescription>
                </SheetHeader>
                <div className="no-scrollbar overflow-y-auto px-4">
                    <VariantsTable backupVariants={variants} variants={updatedVariants} onChange={setUpdatedVariants} productName={productName} />
                </div>
                <SheetFooter>
                    <Button
                        onClick={() => updateVariants.mutate({ productId, storeId, variants: updatedVariants })}
                        disabled={updateVariants.isPending}
                        type="button"
                    >
                        {updateVariants.isPending ? "Saving..." : "Save changes"}
                    </Button>
                    <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
