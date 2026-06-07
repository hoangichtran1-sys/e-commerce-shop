import { useQueryStates } from "nuqs";
import { reviewsFilterParams } from "../params";

export const useReviewsFilter = () => {
    return useQueryStates(reviewsFilterParams);
};
