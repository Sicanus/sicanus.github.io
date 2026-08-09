/**
 * Page header from the Figma: blue fill, 5px white outside stroke and a
 * hard drop shadow (4,4) at 30% #f883ae. The Figma effect projects the
 * shadow of the whole rendered glyph (fill + stroke), so the shadow is
 * visible as a ~4px ring just outside the white stroke. Recreated with
 * three layers: shadow (pink stroke, offset 4,4) → stroke → fill.
 */
export default function PageTitle({ children }) {
  return (
    <h1 className="page-title">
      <span className="page-title__shadow" aria-hidden="true">
        {children}
      </span>
      <span className="page-title__stroke" aria-hidden="true">
        {children}
      </span>
      <span className="page-title__text">{children}</span>
    </h1>
  )
}
