import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { capitalizeFirst } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

interface BreadcrumbHeaderProps {
    id: string;
    storeId: string;
    name: string;
    topic: string;
}

export const BreadcrumbHeader = ({
    id,
    storeId,
    name,
    topic,
}: BreadcrumbHeaderProps) => {
    return (
        <div className="flex items-center justify-between">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild className="font-medium text-xl">
                            <Link href={`/admin/${storeId}/${topic}`}>
                                {capitalizeFirst(topic)}
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-foreground text-xl font-medium [&>svg]:size-4">
                        <ChevronRightIcon />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                        <BreadcrumbLink
                            asChild
                            className="font-medium text-xl text-foreground"
                        >
                            <Link href={`/admin/${storeId}/${topic}/${id}`}>{name}</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
};
