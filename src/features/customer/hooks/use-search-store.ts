import { useQueryStates } from "nuqs";
import { storeSearchParams } from "../params";

export const useSearchStore = () => {
    return useQueryStates(storeSearchParams);
};
