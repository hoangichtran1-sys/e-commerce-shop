import {
    parseAsString,
    parseAsFloat,
    parseAsStringLiteral,
    createLoader,
} from "nuqs/server";
import { sortValues } from "./types";

export const productsFilterParams = {
    sizeId: parseAsString.withOptions({ clearOnDefault: true }),
    colorId: parseAsString.withOptions({ clearOnDefault: true }),
    minPrice: parseAsFloat.withOptions({ clearOnDefault: true }),
    maxPrice: parseAsFloat.withOptions({ clearOnDefault: true }),
    search: parseAsFloat.withOptions({ clearOnDefault: true }),
};

export const loaderProductsFilterParams = createLoader(productsFilterParams);

export const productsSortParams = {
    sort: parseAsStringLiteral(sortValues)
        .withDefault("newest")
        .withOptions({ clearOnDefault: true }),
};

export const loaderProductsSortParams = createLoader(productsSortParams);
