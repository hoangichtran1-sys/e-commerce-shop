import { Button } from "@/components/ui/button";
import { OrderStatus } from "@/generated/prisma/enums";
import { orpc } from "@/orpc/orpc-rq.client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface OrderSwitchProps {
    status: OrderStatus;
    orderId: string;
}

export const OrderSwitch = ({ status, orderId }: OrderSwitchProps) => {
    const queryClient = useQueryClient();

    const switchStatus = useMutation(
        orpc.orders.switchStatus.mutationOptions({
            onSuccess: (data) => {
                toast.success("Order status updated");
                queryClient.invalidateQueries(orpc.orders.getOne.queryOptions({ input: { storeId: data.storeId, orderCode: data.orderCode } }));
                queryClient.invalidateQueries(orpc.orders.getMany.queryOptions({ input: { storeId: data.storeId } }));
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    switch (status) {
        case "PAID":
            return (
                <div className="flex items-center gap-2">
                    <Button size="xs" onClick={() => switchStatus.mutate({ orderId, status: "PROCESSING" })} variant="outline">
                        <div className="flex items-center gap-x-2">
                            <div className="h-3 w-3 border bg-green-600" />
                            <span>Đóng gói</span>
                        </div>
                    </Button>
                    <Button variant="outline" onClick={() => switchStatus.mutate({ orderId, status: "CANCELLED" })}>
                        <div className="flex items-center gap-x-2">
                            <div className="h-3 w-3 border bg-red-600" />
                            <span>Huỷ đơn</span>
                        </div>
                    </Button>
                </div>
            );

        case "PROCESSING":
            return (
                <Button variant="outline" onClick={() => switchStatus.mutate({ orderId, status: "SHIPPED" })}>
                    <div className="flex items-center gap-x-2 max-w-50%">
                        <div className="h-3 w-3 border bg-blue-600" />
                        <span>Giao hàng</span>
                    </div>
                </Button>
            );

        case "SHIPPED":
            return (
                <Button onClick={() => switchStatus.mutate({ orderId, status: "DELIVERED" })} variant="outline">
                    <div className="flex items-center gap-x-2 max-w-50%">
                        <div className="h-3 w-3 border bg-purple-600" />
                        <span>Đã nhận hàng</span>
                    </div>
                </Button>
            );

        default:
            return <p className="line-clamp-1 text-muted-foreground italic">No actions</p>;
    }
};
