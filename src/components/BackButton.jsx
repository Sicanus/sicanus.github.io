import { useRef } from 'react'
import { Link } from 'react-router-dom'
import DashedBorder from './DashedBorder'
import { beginCardTransition } from '../transition'

/**
 * Back-to-posts button styled like an unselected page number button:
 * transparent circle, white dashed ring, no shadow. On hover the dashed
 * ring spins gently (45°); on leave it spins back (Web Animations API).
 * Clicking records the article card rect so the posts page can play the
 * shrink-back transition.
 */
export default function BackButton({ slug }) {
  const dashRef = useRef(null)

  const spin = (dir) => {
    const el = dashRef.current
    if (!el) return
    el.getAnimations().forEach((a) => a.cancel())
    el.animate(
      dir === 'in'
        ? [{ transform: 'rotate(0deg)' }, { transform: 'rotate(45deg)' }]
        : [{ transform: 'rotate(45deg)' }, { transform: 'rotate(0deg)' }],
      { duration: 400, easing: 'ease-out', fill: 'forwards' }
    )
  }

  const handleClick = () => {
    if (slug) {
      const card = document.querySelector('.article-card')
      if (card) beginCardTransition(card.getBoundingClientRect(), slug)
    }
  }

  return (
    <Link
      to="/posts"
      className="back-btn"
      aria-label="Back to posts"
      onMouseEnter={() => spin('in')}
      onMouseLeave={() => spin('out')}
      onClick={handleClick}
    >
      {/* dash like the idle pagination buttons: 55x55 at (6,6), r 27.5 */}
      <span className="back-btn__dash" ref={dashRef}>
        <DashedBorder
          left="0.375rem"
          top="0.375rem"
          right="0.375rem"
          bottom="0.375rem"
          radius="1.719rem"
          strokeWidth="0.187rem"
          stroke="#ffffff"
          dash="0.625rem 0.625rem"
        />
      </span>
      <i className="fa-solid fa-angle-left" />
    </Link>
  )
}
