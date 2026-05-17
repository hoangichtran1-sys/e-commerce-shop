import { Button } from "@/components/ui/button";
import { OrderStatus } from "@/generated/prisma/enums";

interface OrderSwitchProps {
    status: OrderStatus;
    orderId: string;
}

export const OrderSwitch = ({ status, orderId }: OrderSwitchProps) => {
    console.log(orderId);
    switch (status) {
        case "PAID":
            return (
                <div className="flex items-center gap-2">
                    <Button size="xs" onClick={() => {}} variant="outline">
                        <div className="flex items-center gap-x-2">
                            <div className="h-3 w-3 border bg-green-600" />
                            <span>Đóng gói</span>
                        </div>
                    </Button>
                    <Button variant="outline" onClick={() => {}}>
                        <div className="flex items-center gap-x-2">
                            <div className="h-3 w-3 border bg-red-600" />
                            <span>Huỷ đơn</span>
                        </div>
                    </Button>
                </div>
            );

        case "PROCESSING":
            return (
                <Button variant="outline" onClick={() => {}}>
                    <div className="flex items-center gap-x-2">
                        <div className="h-3 w-3 border bg-blue-600" />
                        <span>Giao hàng</span>
                    </div>
                </Button>
            );

        case "SHIPPED":
            return (
                <Button onClick={() => {}} className="bg-purple-600 hover:bg-purple-700">
                    <div className="flex items-center gap-x-2">
                        <div className="h-3 w-3 border bg-purple-600" />
                        <span>Đã nhận hàng</span>
                    </div>
                </Button>
            );

        default:
            return <p className="line-clamp-1 text-muted-foreground italic">No actions</p>;
    }
};
