import { CheckCircle, XCircleIcon } from "lucide-react";

export const SupportIcon = ({ supported }: { supported: boolean }) => (
    <div className="flex justify-center">
        {supported ? (
            <CheckCircle className="size-4 text-emerald-600 font-semibold" />
        ) : (
            <XCircleIcon className="size-4 text-rose-600 font-semibold" />
        )}
    </div>
);
