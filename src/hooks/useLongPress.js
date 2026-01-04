// src/hooks/useLongPress.js
import { useRef, useEffect } from "react";

/**
 * Generic long-press hook
 * usage:
 *   const bind = useLongPress(() => setOpen(true), { threshold: 700 });
 *   <img {...bind} />
 */
export function useLongPress(onLongPress, { threshold = 700 } = {}) {
  const timerRef = useRef(null);
  const targetRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = () => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onLongPress?.();
    }, threshold);
  };

  const stop = () => clearTimer();

  return {
    ref: (el) => {
      targetRef.current = el;
    },
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchEnd: stop,
    onContextMenu: (e) => e.preventDefault(),
  };
}

/**
 * Binds long-press to any `.brand-logo` found on the page.
 * Call this once per page (we do this inside TeamPage too).
 */
export function useBrandLogoLongPress(onLongPress, { threshold = 700 } = {}) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".brand-logo"));
    if (!els.length) return;

    const timers = new Map();

    const start = (el) => () => {
      const t = setTimeout(onLongPress, threshold);
      timers.set(el, t);
    };
    const stop = (el) => () => {
      const t = timers.get(el);
      if (t) {
        clearTimeout(t);
        timers.delete(el);
      }
    };

    els.forEach((el) => {
      el.addEventListener("mousedown", start(el));
      el.addEventListener("touchstart", start(el), { passive: true });
      el.addEventListener("mouseup", stop(el));
      el.addEventListener("mouseleave", stop(el));
      el.addEventListener("touchend", stop(el));
      el.addEventListener("contextmenu", (e) => e.preventDefault());
    });

    return () => {
      els.forEach((el) => {
        el.replaceWith(el.cloneNode(true)); // quick remove listeners
      });
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, [onLongPress, threshold]);
}
