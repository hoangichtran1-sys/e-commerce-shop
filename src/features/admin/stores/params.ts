import { parseAsStringLiteral, parseAsString, createLoader } from "nuqs/server";

export const storeFilters = {
    timePeriod: parseAsStringLiteral(["1_YEAR", "6_MONTH"]).withDefault("6_MONTH").withOptions({ clearOnDefault: true }),
    categoryParent: parseAsString.withOptions({ clearOnDefault: true }),
};

export const loaderStoreFilters = createLoader(storeFilters);
