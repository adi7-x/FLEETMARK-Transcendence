import { useEffect, useState } from "react";

/**
 * Fix 1d — useCountUp hook for animating stat numbers.
 * Animates from 0 to `target` over `duration` ms with ease-out.
 */
export default function useCountUp(target, duration = 600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const numTarget = Number(target);
    if (!numTarget || isNaN(numTarget)) {
      setValue(target); // non-numeric, just set it
      return;
    }

    let startTime = null;
    let raf;

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3); // cubic ease-out
    }

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOut(progress);

      setValue(Math.round(easedProgress * numTarget));

      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
