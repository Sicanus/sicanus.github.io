/**
 * Exact dashed outline from the Figma file. The four insets are taken
 * verbatim from the dash layer's position/size within its parent
 * (e.g. name card dash sits at (13,11) sized 359x96 inside 384x117 →
 * left 13, top 11, right 12, bottom 10), so the stroke follows the Figma
 * geometry even when the insets are asymmetric.
 *
 * Values are rem strings so the stroke width, corner radius and gaps
 * scale below 1080p. Geometry is set via CSS styles (not attributes),
 * which supports calc() with rem units.
 */
interface DashedBorderProps {
  left: string
  top: string
  right: string
  bottom: string
  radius: string
  strokeWidth: string
  stroke: string
  dash: string
}

export default function DashedBorder({ left, top, right, bottom, radius, strokeWidth, stroke, dash }: DashedBorderProps) {
  const num = (v: string) => parseFloat(v)
  const sw = num(strokeWidth)
  const insetX = num(left) + sw / 2
  const insetY = num(top) + sw / 2
  const totalX = num(left) + num(right) + sw
  const totalY = num(top) + num(bottom) + sw

  return (
    <svg className="dashed-border" aria-hidden="true">
      <rect
        style={{
          x: `${insetX}rem`,
          y: `${insetY}rem`,
          width: `calc(100% - ${totalX}rem)`,
          height: `calc(100% - ${totalY}rem)`,
          rx: radius,
        }}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
    </svg>
  )
}
