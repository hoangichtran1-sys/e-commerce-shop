import { useQueryStates } from "nuqs";
import { paginationOrders } from "../params";

export const usePaginationOrders = () => {
    return useQueryStates(paginationOrders);
};
