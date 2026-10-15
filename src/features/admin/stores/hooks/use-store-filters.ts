import { useQueryStates } from "nuqs";
import { storeFilters } from "../params";

export const useStoreFilters = () => {
    return useQueryStates(storeFilters);
};
