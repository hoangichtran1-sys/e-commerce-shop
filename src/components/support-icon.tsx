import { CheckIcon, XIcon } from "lucide-react";

export const SupportIcon = ({ supported }: { supported: boolean }) => (
    <div className="flex justify-center">
        {supported ? (
            <CheckIcon className="size-4 text-emerald-600 font-semibold" />
        ) : (
            <XIcon className="size-4 text-rose-600 font-semibold" />
        )}
    </div>
);
