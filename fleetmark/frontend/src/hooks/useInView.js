import { useEffect, useRef, useState } from "react";

/**
 * Fix 1b — useInView hook for scroll-triggered reveals.
 * Returns [ref, isVisible]. Attach ref to the element.
 * Once it enters the viewport, isVisible becomes true (and stays true).
 */
export default function useInView(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el); // once visible, stop observing
        }
      },
      { threshold: options.threshold ?? 0.15, rootMargin: options.rootMargin ?? "0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return [ref, isVisible];
}
