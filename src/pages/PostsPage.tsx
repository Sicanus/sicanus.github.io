import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import DashedBorder from '../components/DashedBorder'
import PageTitle from '../components/PageTitle'
import { posts } from '../posts'
import { prefersReducedMotion } from '../motion'
import { beginCardTransition, consumeCardTransition, runCardTransition } from '../transition'
import { FLOWER_PATH } from '../flower'

const CARD_HEIGHT = 201
const CARD_GAP = 50
const MAX_PAGES = 5

/**
 * Rough plain-text excerpt of a markdown post. Long enough that the
 * CSS line-clamp (3 lines) actually truncates it and appends "…".
 */
const excerpt = (md: string) =>
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
  const listRef = useRef<HTMLDivElement>(null)
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
      const first = el.querySelector<HTMLElement>('.post-card')
      // offsetHeight is the layout height — unlike getBoundingClientRect()
      // it ignores the hover transform scale(1.01), so a hovered card can
      // never shrink the per-page count (which used to happen when the
      // visual overflow briefly showed a scrollbar and re-triggered this
      // measurement with the enlarged rect).
      const cardH = first ? first.offsetHeight : CARD_HEIGHT
      const per = Math.max(1, Math.floor((el.clientHeight - padV + gap) / (cardH + gap)))
      setPerPage((prev) => (prev === per ? prev : per))
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
    const card = listRef.current?.querySelector<HTMLElement>(`.post-card[data-slug="${t.slug}"]`)
    if (!card) return
    const to = card.getBoundingClientRect()
    // everything except the target post card fades out during the morph:
    // the other cards in the list and the pagination bar. The page title
    // stays visible and only cross-fades its text.
    const main = card.closest('.main')
    if (!main) return
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
  const goTo = (n: number) => {
    if (n === safePage) return
    setPage(n)
    if (prefersReducedMotion()) return
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
      <PageTitle>記事</PageTitle>

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
          <p className="posts__empty">空っぽなのだ……</p>
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
              {current ? (
                /* the current page is marked by a filled plum blossom —
                   the same "the flower shows where you are" language as
                   the nav's active state */
                <span className="page-btn__flower" aria-hidden="true">
                  <svg className="page-btn__flower-svg" viewBox="0 0 312.48 305">
                    <path d={FLOWER_PATH} fill="#ffffff" />
                  </svg>
                  <svg
                    className="page-btn__flower-svg"
                    style={{ position: 'relative', zIndex: 1 }}
                    viewBox="-17.4 -16.9 347.2 338.9"
                  >
                    <path
                      d={FLOWER_PATH}
                      fill="none"
                      stroke="#ffb5d6"
                      strokeWidth="0.187rem"
                      strokeDasharray="0.625rem 0.625rem"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </span>
              ) : (
                /* dash layer in figma: 55x55 at (6,6) */
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
              )}
              <span className="page-btn__label">{n}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
