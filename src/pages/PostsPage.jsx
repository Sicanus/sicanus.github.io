import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import DashedBorder from '../components/DashedBorder'
import PageTitle from '../components/PageTitle'
import { posts } from '../posts'
import { beginCardTransition, consumeCardTransition, runCardTransition } from '../transition'

const CARD_HEIGHT = 201
const CARD_GAP = 50
const MAX_PAGES = 5

/**
 * Rough plain-text excerpt of a markdown post. Long enough that the
 * CSS line-clamp (3 lines) actually truncates it and appends "…".
 */
const excerpt = (md) =>
  md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 600)

/**
 * Posts list from the Figma "Page 2" design: white post cards (5px pink
 * ring, dashed outline, hard shadow) stacked on the pink background, with
 * a round pagination bar at the bottom. The number of cards per page fits
 * the available height, and the page bar shows one button per page (up to
 * 5); only the current page button is filled.
 */
export default function PostsPage() {
  const visible = posts.filter((post) => !post.hidden)
  const listRef = useRef(null)
  const [perPage, setPerPage] = useState(3)
  const [page, setPage] = useState(1)

  // Fit as many cards as the list area can hold. The card height and gap
  // are measured from the DOM because they scale with the root font size
  // below 1080p (fixed px constants would miscount).
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const update = () => {
      // clientHeight includes the list's vertical padding, which the cards
      // can't use — subtract it before counting how many cards fit.
      const cs = getComputedStyle(el)
      const padV = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
      const gap = parseFloat(cs.gap) || CARD_GAP
      const first = el.querySelector('.post-card')
      const cardH = first ? first.getBoundingClientRect().height : CARD_HEIGHT
      const per = Math.max(1, Math.floor((el.clientHeight - padV + gap) / (cardH + gap)))
      setPerPage(per)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const pages = Math.min(MAX_PAGES, Math.max(1, Math.ceil(visible.length / perPage)))
  const safePage = Math.min(page, pages)
  const shown = visible.slice((safePage - 1) * perPage, safePage * perPage)

  // Coming back from an article: shrink the floating card from the article
  // card's rect down onto this page's matching post card.
  useLayoutEffect(() => {
    const t = consumeCardTransition()
    if (!t?.from || !t.slug) return
    const card = listRef.current?.querySelector(`.post-card[data-slug="${t.slug}"]`)
    if (!card) return
    const to = card.getBoundingClientRect()
    // everything except the target post card fades out during the morph:
    // the other cards in the list and the pagination bar. The page title
    // stays visible and only cross-fades its text.
    const main = card.closest('.main')
    const others = [...main.children].flatMap((el) => {
      if (el.classList.contains('page-title')) return []
      return el === card || el.contains(card)
        ? [...el.children].filter((c) => c !== card)
        : [el]
    })
    const title = main.querySelector('.page-title')
    if (title) {
      title.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 150,
        easing: 'ease-out',
        fill: 'forwards',
      })
    }
    runCardTransition(t.from, to, card, others, () => {
      card.style.opacity = ''
    })
  }, [])

  /** Switch page with a short fade/slide-in animation on the list. */
  const goTo = (n) => {
    if (n === safePage) return
    setPage(n)
    const el = listRef.current
    if (el) {
      el.getAnimations().forEach((a) => a.cancel())
      el.animate(
        [
          { opacity: 0, transform: 'translateY(10px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 300, easing: 'ease-out' }
      )
    }
  }

  return (
    <>
      <PageTitle>Posts</PageTitle>

      <div className="posts" ref={listRef}>
        {shown.length ? (
          shown.map((post) => (
            <Link
              key={post.slug}
              to={`/post/${post.slug}`}
              data-slug={post.slug}
              className="post-card"
              onClick={(e) => beginCardTransition(e.currentTarget.getBoundingClientRect(), post.slug)}
            >
              {/* dash layer in figma: 1083x183 at (12,9) inside 1106x201;
                  radius = 75.5 (card) − ~10px offset = 65.5, so the inner
                  arc stays parallel to the card outline */}
              <DashedBorder
                left="0.750rem"
                top="0.562rem"
                right="0.687rem"
                bottom="0.562rem"
                radius="4.094rem"
                strokeWidth="0.187rem"
                stroke="#ffbad3"
                dash="0.625rem 0.625rem"
              />
              <div className="post-card__header">
                <h2 className="post-card__title">{post.title}</h2>
                {post.date && <span className="post-card__date">{post.date}</span>}
              </div>
              <p className="post-card__text">{excerpt(post.content)}</p>
            </Link>
          ))
        ) : (
          <p className="posts__empty">Nothing here yet — check back soon!</p>
        )}
      </div>

      <nav className="page-bar" aria-label="Pagination">
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => {
          const current = n === safePage
          return (
            <button
              key={n}
              type="button"
              className={`page-btn${current ? ' page-btn--current' : ''}`}
              onClick={() => goTo(n)}
              aria-current={current ? 'page' : undefined}
            >
              {/* dash layer in figma: 55x55 at (6,6), current page 58x58 at (4,4) */}
              <DashedBorder
                left={current ? "0.250rem" : "0.375rem"}
                top={current ? "0.250rem" : "0.375rem"}
                right={current ? "0.312rem" : "0.375rem"}
                bottom={current ? "0.312rem" : "0.375rem"}
                radius="1.719rem"
                strokeWidth="0.187rem"
                stroke={current ? '#ffb5d6' : '#ffffff'}
                dash="0.625rem 0.625rem"
              />
              <span className="page-btn__label">{n}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
