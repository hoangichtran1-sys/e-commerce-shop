import { AlertTriangleIcon } from "lucide-react";

interface ErrorViewProps {
    message: string;
}

export const ErrorView = ({ message }: ErrorViewProps) => {
    return (
        <div className="flex justify-center items-center h-72 flex-1 flex-col gap-y-4 bg-white/80">
            <AlertTriangleIcon className="size-6 text-destructive" />
            {!!message && <p className="text-sm text-muted-foreground">{message}</p>}
        </div>
    );
};
