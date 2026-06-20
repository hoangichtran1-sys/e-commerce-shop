import { useQueryStates } from "nuqs";
import { paginationProducts } from "../params";

export const usePaginationProducts = () => {
    return useQueryStates(paginationProducts);
};
