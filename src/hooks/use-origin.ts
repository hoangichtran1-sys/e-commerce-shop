import { useMountedState } from "react-use";

export const useOrigin = () => {
    const isMounted = useMountedState();

    const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "";

    if (!isMounted) {
        return "";
    }

    return origin;
}