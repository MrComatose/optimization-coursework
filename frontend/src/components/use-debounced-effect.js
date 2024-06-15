import { useEffect } from "react";

export const useDebouncedEffect = (fn, syncEffect, deps, delay = 300) => {
  useEffect(() => {
    syncEffect();
    let destructor;
    const timer = setTimeout(() => {
      destructor = fn();
    }, delay);

    return () => {
      if (destructor) {
        destructor();
      }
      clearTimeout(timer);
    };
  }, [delay, ...deps]);
};
