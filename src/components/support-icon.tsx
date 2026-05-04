import { CheckIcon, XIcon } from "lucide-react";

export const SupportIcon = ({ supported }: { supported: boolean }) => (
    <div className="flex justify-center">
        {supported ? (
            <CheckIcon className="size-4 text-green-600 font-semibold" />
        ) : (
            <XIcon className="size-4 text-red-600 font-semibold" />
        )}
    </div>
);
