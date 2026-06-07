"use client";

import { Badge } from "@/components/ui/badge";
import { ResponsiveModal } from "@/components/responsive-modal";
import {
    Stepper,
    StepperContent,
    StepperIndicator,
    StepperItem,
    StepperNav,
    StepperPanel,
    StepperSeparator,
    StepperTitle,
    StepperTrigger,
} from "@/components/ui/stepper";
import { CheckCircle2Icon, CreditCardIcon, PackageCheckIcon, TruckIcon } from "lucide-react";
import { OrderStatus } from "@/generated/prisma/enums";
import { useMemo } from "react";
import { format } from "date-fns";

const steps = [
    {
        title: "Paid",
        value: OrderStatus.PAID,
        icon: <CreditCardIcon className="size-4" />,
    },
    {
        title: "Processing",
        value: OrderStatus.PROCESSING,
        icon: <PackageCheckIcon className="size-4" />,
    },
    {
        title: "Shipped",
        value: OrderStatus.SHIPPED,
        icon: <TruckIcon className="size-4" />,
    },
    {
        title: "Delivered",
        value: OrderStatus.DELIVERED,
        icon: <CheckCircle2Icon className="size-4" />,
    },
];

interface TrackOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    status?: OrderStatus;
    updatedAt: Date;
}

export const TrackOrderModal = ({ isOpen, onClose, status, updatedAt }: TrackOrderModalProps) => {
    const currentValue = useMemo(() => {
        switch (status) {
            case "PAID":
                return 1;
            case "PROCESSING":
                return 2;
            case "SHIPPED":
                return 3;
            case "DELIVERED":
                return 4;
        }
    }, [status]);

    return (
        <ResponsiveModal title="Track order status" isOpen={isOpen} onClose={onClose} isSeparator={true}>
            <Stepper defaultValue={currentValue} className="w-full max-w-2xl space-y-8">
                <StepperNav className="gap-3">
                    {steps.map((step, index) => (
                        <StepperItem key={index} step={index + 1} className="relative flex-1 items-start">
                            <StepperTrigger className="flex grow flex-col items-start justify-center gap-2.5" asChild>
                                <StepperIndicator className="data-[state=inactive]:border-border data-[state=inactive]:text-muted-foreground data-[state=completed]:bg-emerald-500 size-8 border-2 data-[state=completed]:text-white data-[state=inactive]:bg-secondary">
                                    {step.icon}
                                </StepperIndicator>
                                <div className="flex flex-col items-start gap-1">
                                    <StepperTitle className="group-data-[state=inactive]/step:text-muted-foreground text-start text-sm font-medium">
                                        {step.title}
                                    </StepperTitle>
                                </div>
                            </StepperTrigger>
                            {steps.length > index + 1 && (
                                <StepperSeparator className="group-data-[state=completed]/step:bg-emerald-500 absolute inset-x-0 inset-s-9 top-4 m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-1.5rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none" />
                            )}
                        </StepperItem>
                    ))}
                </StepperNav>
                <StepperPanel className="text-sm">
                    {steps.map((step, index) => (
                        <StepperContent key={index} value={index + 1} className="flex items-center justify-center gap-x-2">
                            <Badge variant={step.value}>
                                {step.title}
                            </Badge>
                            <span>on {format(updatedAt, "MMMM do, yyyy")}</span>
                        </StepperContent>
                    ))}
                </StepperPanel>
            </Stepper>
        </ResponsiveModal>
    );
};
