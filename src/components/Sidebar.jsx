import { useRef } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import DashedBorder from './DashedBorder'
import { beginCardTransition } from '../transition'
import { SITE_NAME } from '../site'

/**
 * One nav button: Font Awesome icon, label and the dashed outline.
 * On mouse enter the dash spins one full turn clockwise; on leave it
 * spins one full turn back. The spin runs via the Web Animations API so
 * the element is never rebuilt (rebuilding between mousedown/mouseup
 * would swallow the click event).
 */
function NavItem({ item, row, col }) {
  const dashRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  // reading an article keeps the Posts button highlighted
  const isPostSlug = location.pathname.startsWith('/post/')

  const spin = (dir) => {
    const el = dashRef.current
    if (!el) return
    el.getAnimations().forEach((a) => a.cancel())
    el.animate(
      dir === 'in'
        ? [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }]
        : [{ transform: 'rotate(360deg)' }, { transform: 'rotate(0deg)' }],
      { duration: 400, easing: 'ease-out', fill: 'forwards' }
    )
  }

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
      to={item.to}
      end={item.end}
      className={({ isActive }) => {
        const active = isActive || (item.to === '/posts' && isPostSlug)
        return `nav-item${active ? ' nav-item--active' : ''}`
      }}
      style={{ gridRow: row, gridColumn: col }}
      onMouseEnter={() => spin('in')}
      onMouseLeave={() => spin('out')}
      onClick={handleClick}
    >
      {({ isActive }) => (
        <>
          {/* dash layer in figma: 169x169 at (11,11) inside 193x193;
              radius = 96.5 (card circle) − 12px offset = 84.5;
              turns highlight yellow when active (CSS --highlight) */}
          <span className="nav-dash" ref={dashRef}>
            <DashedBorder
              left="0.687rem"
              top="0.687rem"
              right="0.812rem"
              bottom="0.812rem"
              radius="5.281rem"
              strokeWidth="0.187rem"
              stroke="#9ecfff"
              dash="0.625rem 0.625rem"
            />
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
