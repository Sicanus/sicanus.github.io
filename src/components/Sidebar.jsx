import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import DashedBorder from './DashedBorder'
import { beginCardTransition } from '../transition'
import { SITE_NAME } from '../site'
import { prefersReducedMotion } from '../motion'
import { FLOWER_PATH } from '../flower'

// Touch devices have no hover — attaching the mouse handlers there only
// feeds synthesized events from long-press (which also opens the native
// link preview), churning the blossom animation. Hover spins exist only
// where a real hover does; touch devices get a one-shot spin on tap
// instead (rotating back when tapping anywhere else).
const CAN_HOVER = window.matchMedia('(hover: hover)').matches

/**
 * One nav button: Font Awesome icon, label and the plum blossom outline.
 * On mouse enter the blossom spins 36° and scales up; on leave it spins
 * back. The spin runs via the Web Animations API so the element is never
 * rebuilt (rebuilding between mousedown/mouseup would swallow the click).
 */
function NavItem({ item, row, col }) {
  const flowerRef = useRef(null)
  const linkRef = useRef(null)
  const [touched, setTouched] = useState(false)
  const prevTouched = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  // reading an article keeps the Posts button highlighted
  const isPostSlug = location.pathname.startsWith('/post/')

  const spin = (dir) => {
    const el = flowerRef.current
    if (!el) return
    el.getAnimations().forEach((a) => a.cancel())
    // rotate to 36° and hold it (half a petal-step, so the blossom rests
    // tilted instead of snapping back to the identical orientation);
    // scale up together — smooth, no late pop, no wiggle. Mouse leave
    // rotates and scales back.
    const [from, to] =
      dir === 'in'
        ? ['rotate(0deg) scale(1)', 'rotate(36deg) scale(1.06)']
        : ['rotate(36deg) scale(1.06)', 'rotate(0deg) scale(1)']
    if (prefersReducedMotion()) {
      el.animate([{ transform: to }], { duration: 0, fill: 'forwards' })
      return
    }
    el.animate([{ transform: from }, { transform: to }], {
      duration: 400,
      easing: 'ease-out',
      fill: 'forwards',
    })
  }

  // Touch devices: a tap on the button plays the spin once and holds it;
  // touching anything else — another nav button included — spins it back.
  // (prevTouched guards the initial mount so no spurious spin-back plays.)
  useEffect(() => {
    if (CAN_HOVER) return
    const outside = (e) => {
      if (!linkRef.current?.contains(e.target)) setTouched(false)
    }
    document.addEventListener('touchstart', outside, { passive: true })
    return () => document.removeEventListener('touchstart', outside)
  }, [])

  useEffect(() => {
    if (prevTouched.current === null) {
      prevTouched.current = touched
      return
    }
    if (prevTouched.current !== touched) spin(touched ? 'in' : 'out')
    prevTouched.current = touched
  }, [touched])

  const handleClick = (e) => {
    // clicking the button of the page we're already on: do nothing
    // (the fade-out would leave the page blank since the route doesn't
    // change)
    if (location.pathname === item.to) return
    // navigating from an article to the posts list plays the card morph
    if (item.to === '/posts' && isPostSlug) {
      const card = document.querySelector('.article-card')
      const slug = location.pathname.split('/post/')[1]
      if (card && slug) beginCardTransition(card.getBoundingClientRect(), slug)
      return // let the default navigation happen
    }
    // any other page switch: fade the main content out, then navigate
    e.preventDefault()
    if (prefersReducedMotion()) {
      navigate(item.to)
      return
    }
    const main = document.querySelector('.main')
    if (main) {
      main
        .animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 120,
          easing: 'ease-in',
          fill: 'forwards',
        })
        .onfinish = () => navigate(item.to)
    } else {
      navigate(item.to)
    }
  }

  return (
    <NavLink
      ref={linkRef}
      to={item.to}
      end={item.end}
      className={({ isActive }) => {
        const active = isActive || (item.to === '/posts' && isPostSlug)
        return `nav-item${active ? ' nav-item--active' : ''}`
      }}
      style={{
        gridRow: row,
        gridColumn: col,
      }}
      onMouseEnter={CAN_HOVER ? () => spin('in') : undefined}
      onMouseLeave={CAN_HOVER ? () => spin('out') : undefined}
      onClick={(e) => {
        if (!CAN_HOVER) setTouched(true)
        handleClick(e)
      }}
    >
      {({ isActive }) => (
        <>
          {/* the whole flower (white fill + dashed outline) rotates; the
              icon and label below stay horizontal */}
          <span className="nav-flower" ref={flowerRef} aria-hidden="true">
            {/* white flower fill — matches the clip shape exactly */}
            <svg className="nav-flower__svg" viewBox="0 0 312.48 305">
              <path d={FLOWER_PATH} fill="#ffffff" />
            </svg>
            {/* dashed outline — inset one ring from the flower edge */}
            <svg
              className="nav-flower__svg"
              style={{ position: 'relative', zIndex: 1 }}
              viewBox="-17.4 -16.9 347.2 338.9"
            >
              <path
                d={FLOWER_PATH}
                fill="none"
                stroke={isActive ? '#ffd02e' : '#9ecfff'}
                strokeWidth="0.187rem"
                strokeDasharray="16 16"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </span>
          <span className="nav-item__icon" aria-hidden="true">
            <i className={item.icon} />
          </span>
          <span className="nav-item__label">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

/**
 * Left panel: the blog name card and the navigation grid.
 * Mirrors the Figma design — a 2×3 grid of rounded buttons on the blue
 * background (buttons sit at rows 1-2, 2-2 and 3-1 of the grid), with the
 * name card on top. Shadows, dashes and strokes match blog.fig exactly.
 */
export default function Sidebar() {
  const navItems = [
    { to: '/', label: 'ホーム', icon: 'fa-solid fa-house', end: true },
    { to: '/posts', label: '記事', icon: 'fa-solid fa-book-open', end: false },
    { to: '/about', label: 'プロフ', icon: 'fa-solid fa-heart', end: false },
  ]

  // Grid cells as placed in the Figma (rows 1-2, 2-2, 3-1). The empty
  // cells were placeholders only — they are not rendered.
  const cells = [
    { item: navItems[0], row: 1, col: 1 },
    { item: navItems[1], row: 2, col: 2 },
    { item: navItems[2], row: 3, col: 1 },
  ]

  return (
    <aside className="sidebar">
      <div className="name-card">
        {/* dash layer in figma: 359x96 at (13,11) inside 384x117.
            radius = card pill radius (58.5) − 11px offset = 47.5, so the
            inner arc stays parallel to the card outline. rem values scale
            the stroke, radius and gap below 1080p. */}
        <DashedBorder
          left="0.812rem"
          top="0.687rem"
          right="0.750rem"
          bottom="0.625rem"
          radius="2.969rem"
          strokeWidth="0.187rem"
          stroke="#ffbad3"
          dash="0.625rem 0.625rem"
        />
        <span className="name-card__text">{SITE_NAME}</span>
      </div>

      <nav className="nav-grid" aria-label="Main navigation">
        {cells.map((cell) => (
          <NavItem
            key={cell.item.to}
            item={cell.item}
            row={cell.row}
            col={cell.col}
          />
        ))}
      </nav>
    </aside>
  )
}
