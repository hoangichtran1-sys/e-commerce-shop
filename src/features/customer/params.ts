import { parseAsString, parseAsFloat, parseAsStringLiteral, createLoader, parseAsArrayOf } from "nuqs/server";
import { featuresValue, reviewsFilter, sortValues } from "./types";

export const productsFilterParams = {
    sizes: parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true }),
    colors: parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true }),
    features: parseAsArrayOf(parseAsStringLiteral(featuresValue)).withDefault([]).withOptions({ clearOnDefault: true }),
    subcategorySlugs: parseAsArrayOf(parseAsString).withDefault([]).withOptions({ clearOnDefault: true }),
    minPrice: parseAsFloat.withOptions({ clearOnDefault: true }),
    maxPrice: parseAsFloat.withOptions({ clearOnDefault: true }),
    search: parseAsString.withOptions({ clearOnDefault: true }),
};

export const loaderProductsFilterParams = createLoader(productsFilterParams);

export const productsSortParams = {
    sort: parseAsStringLiteral(sortValues).withDefault("newest").withOptions({ clearOnDefault: true }),
};

export const loaderProductsSortParams = createLoader(productsSortParams);

export const reviewsFilterParams = {
    rating: parseAsStringLiteral(reviewsFilter).withDefault("all").withOptions({ clearOnDefault: true, shallow: true }),
};

export const loaderReviewsFilterParams = createLoader(reviewsFilterParams);
