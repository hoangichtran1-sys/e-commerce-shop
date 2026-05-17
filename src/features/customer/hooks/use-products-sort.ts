import { useQueryStates } from "nuqs";
import { productsSortParams } from "../params";

export const useProductsSort = () => {
    return useQueryStates(productsSortParams);
};
