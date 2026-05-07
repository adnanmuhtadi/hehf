export const preserveScrollPosition = () => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const top = window.scrollY;
  const left = window.scrollX;
  let frameCount = 0;

  const restore = () => {
    window.scrollTo({ top, left, behavior: "instant" as ScrollBehavior });
    frameCount += 1;

    if (frameCount < 3) {
      requestAnimationFrame(restore);
    }
  };

  return () => requestAnimationFrame(restore);
};