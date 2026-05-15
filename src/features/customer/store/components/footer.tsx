import { Separator} from "@/components/ui/separator";

export const Footer = ({ storeName, className }: { storeName: string; className?: string }) => {
    return (
	<footer className={`${className}`}>
            <Separator />
            <p className="text-muted-foreground text-xs mt-6">Copyright © 2026 {storeName}, Inc. All rights reserved.</p>
        </footer>
    );
};
