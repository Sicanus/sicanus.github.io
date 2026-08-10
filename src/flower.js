/**
 * Plum blossom outline — a clean single path drawn in Illustrator
 * (flower.svg). Kept verbatim and normalized via SVG transforms at the
 * call site:
 *
 *   transform={`translate(50,50) scale(${FLOWER_SCALE}) translate(${-FLOWER_CX},${-FLOWER_CY})`}
 *
 * with a 100x100 viewBox (dash) or objectBoundingBox units (clip).
 */
export const FLOWER_PATH =
  'M308.07,110.81c-10.96-33.75-42.32-55.15-76-55.04C221.77,23.71,191.73,0.5,156.24,0.5c-35.48,0-65.53,23.21-75.83,55.27c-33.67-0.12-65.03,21.29-76,55.04c-10.96,33.75,1.82,69.5,29.13,89.2c-10.52,31.99,0.15,68.43,28.86,89.29c28.71,20.86,66.66,19.74,93.83-0.15c27.17,19.89,65.13,21,93.83,0.15c28.71-20.86,39.37-57.3,28.86-89.29C306.24,180.31,319.03,144.55,308.07,110.81z'

// flower center and petal-tip radius in the source coordinate system
export const FLOWER_CX = 156.24
export const FLOWER_CY = 152.5
export const FLOWER_RADIUS = 156.24

/** scale so the flower's petal tips reach the 0/1 edges (diameter 1) */
export const FLOWER_SCALE = 0.5 / FLOWER_RADIUS
