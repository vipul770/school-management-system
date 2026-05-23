import { useEffect, useRef } from "react";

export function useInfiniteScroll(onReachEnd, options = {}) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current || typeof onReachEnd !== "function") return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          onReachEnd();
        }
      },
      {
        threshold: options.threshold ?? 0.2,
        rootMargin: options.rootMargin ?? "120px",
      }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [onReachEnd, options.rootMargin, options.threshold]);

  return sentinelRef;
}

export default useInfiniteScroll;
