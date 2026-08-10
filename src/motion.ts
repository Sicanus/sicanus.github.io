/** Reduced-motion gate for all JS animations (spins, morphs, fades).
 *  Call once per animation; when true, skip to the final state. */
export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
