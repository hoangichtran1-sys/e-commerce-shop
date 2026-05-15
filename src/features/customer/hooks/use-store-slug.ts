import { useParams } from "next/navigation";

export const useStoreSlug = () => {
    const params = useParams();
    return params.storeSlug as string;
}