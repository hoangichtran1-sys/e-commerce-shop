"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "./ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from "./ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "./ui/separator";

interface ResponsiveModalProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    isSeparator?: boolean;
}

export function ResponsiveModal({
    title,
    description,
    children,
    isOpen,
    onClose,
    isSeparator = false,
}: ResponsiveModalProps) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <Drawer open={isOpen} onOpenChange={onClose}>
                <DrawerContent className="max-h-[90vh] flex flex-col">
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                        {description && (
                            <DrawerDescription>{description}</DrawerDescription>
                        )}
                    </DrawerHeader>
                    {isSeparator && <Separator />}
                    <div className="flex-1 overflow-y-auto p-4 pb-8">
                        {children}
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center">{title}</DialogTitle>
                    {description && (
                        <DialogDescription className="text-center">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>
                {isSeparator && <Separator />}
                {children}
            </DialogContent>
        </Dialog>
    );
}
