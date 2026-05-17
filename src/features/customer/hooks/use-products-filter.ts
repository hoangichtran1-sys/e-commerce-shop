import { useQueryStates } from "nuqs";
import { productsFilterParams } from "../params";

export const useProductsFilter = () => {
    return useQueryStates(productsFilterParams);
};