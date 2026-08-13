import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Navigate, Outlet, Routes, Route, useLocation, useParams } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import bgBlue from './assets/bg_blue.svg'
import bgPink from './assets/bg_pink.svg'
import { prefersReducedMotion } from './motion'
import HomePage from './pages/HomePage'
import PostPage from './pages/PostPage'
import PostsPage from './pages/PostsPage'
import { LocaleProvider } from './i18n'
import { isLocale, localeFromPath } from './i18n/locales'

/**
 * Below 1080p the root font size shrinks, scaling every rem-based UI
 * element (text, buttons, cards, spacing) proportionally while the
 * proportional layout itself keeps flowing. Touch devices keep 16px.
 */
function useUiScale() {
  useEffect(() => {
    const apply = () => {
      const scale = window.innerWidth <= 960
        ? 1
        : Math.min(1, window.innerHeight / 1080)
      document.documentElement.style.fontSize = `${(scale * 16).toFixed(3)}px`
    }
    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [])
}

/**
 * The first path segment is the locale. An un-prefixed deep link (e.g.
 * #/posts) would be consumed as the locale parameter — validate it and
 * render the localized 404 instead of a page in a bogus locale.
 */
function LocaleGate() {
  const { locale } = useParams()
  if (!isLocale(locale)) return <PostPage slug="nonexistent" />
  return <Outlet />
}

// On touch devices, an upward swipe hides the blue sidebar region; a
// downward swipe at the top restores it. Gesture direction is used
// instead of scrollTop so the hide state doesn't oscillate when the
// content stops overflowing after the sidebar collapses.
function useHideSidebarOnScroll() {
  useEffect(() => {
    if (!window.matchMedia('(pointer: coarse)').matches) return
    const main = document.querySelector('.main')
    const app = document.querySelector('.app')
    if (!main || !app) return
    let startY: number | null = null
    let startInScrollableMd = false
    const onTouchStart = (e: Event) => {
      if (!(e instanceof TouchEvent)) return
      startY = e.touches[0].clientY
      // the whole gesture is classified by its starting point: swipes
      // that begin inside the scrollable markdown card scroll it instead
      // of toggling the blue region
      const t = e.touches[0]
      const md = document.querySelector('.markdown')
      if (md) {
        const r = md.getBoundingClientRect()
        const inside =
          t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom
        startInScrollableMd = inside && md.scrollHeight > md.clientHeight
      }
    }
    const onTouchMove = (e: Event) => {
      if (startY === null || !(e instanceof TouchEvent)) return
      const dy = e.touches[0].clientY - startY
      if (startInScrollableMd) {
        // inside a scrollable markdown card: an upward swipe hides the
        // blue region, a downward swipe (keep reading) changes nothing
        if (dy < -12) app.classList.add('hide-sidebar')
      } else if (dy < -12) {
        app.classList.add('hide-sidebar')
      } else if (dy > 12 && main.scrollTop <= 0) {
        app.classList.remove('hide-sidebar')
      }
      startY = e.touches[0].clientY
    }
    main.addEventListener('touchstart', onTouchStart, { passive: true })
    main.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      main.removeEventListener('touchstart', onTouchStart)
      main.removeEventListener('touchmove', onTouchMove)
    }
  }, [])
}

/**
 * The background artwork pops in as its two SVGs decode, so it is hidden
 * until both are ready and then drawn in with a fast left-to-right sweep
 * (see the `.bg-wrap.bg-ready` animation in styles.css). Until then the
 * panels stay transparent and the page is blank.
 *
 * Returns `true` once the sweep has finished (or immediately under
 * reduced motion, where the artwork just appears as it loads). The other
 * first-load entrance animations — the sidebar bloom and the main fade —
 * wait for that moment so the page introduces itself in order: background
 * draws in first, then the sidebar blooms, then the page content fades in.
 */
function useBgReveal() {
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    // `.bg-ready` both applies the artwork (styles.css) and starts the
    // sweep, so it is only added after both SVGs are fetched and
    // decoded — the artwork's first paint is the sweep. Under reduced
    // motion the artwork is applied the same way but appears without
    // the sweep as soon as it is decoded.
    Promise.allSettled([bgBlue, bgPink].map((src) => {
      const img = new Image()
      img.src = src
      return img.decode()
    })).then(() => {
      const wrap = document.querySelector('.bg-wrap')
      if (!wrap) {
        setSettled(true)
        return
      }
      wrap.classList.add('bg-ready')
      if (prefersReducedMotion()) {
        setSettled(true)
        return
      }
      // the sweep is short; the entrance animations start once it ends
      wrap.addEventListener('animationend', () => setSettled(true), { once: true })
    })
  }, [])
  return settled
}

export default function App() {
  useUiScale()
  useHideSidebarOnScroll()
  const bgSettled = useBgReveal()
  const { pathname } = useLocation()
  const locale = localeFromPath(pathname)

  // Fade the new page's content in after a route change. Card morph
  // transitions manage their own fades, so they are skipped. On the
  // first load the content stays hidden until the background reveal has
  // settled (bgSettled) — and then until the sidebar bloom finishes — so
  // the entrance is the same fade a later page switch plays, queued
  // behind the nav appearing first instead of alongside it.
  const introPlayedRef = useRef(false)
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    if (document.querySelector('.card-transition')) return
    const main = document.querySelector<HTMLElement>('.main')
    if (!main) return
    main.style.opacity = '0'
    if (!bgSettled) return
    const fadeIn = () => {
      main.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 150,
        easing: 'ease-out',
        fill: 'forwards',
      })
    }
    if (!introPlayedRef.current) {
      // first load: the sidebar bloom (styles.css) starts when `.app`
      // turns bg-settled; hold the content hidden until the last nav item
      // has finished, then play the page-switch fade. The listener sits
      // on the nav grid — its children persist across re-renders.
      const navGrid = document.querySelector('.nav-grid')
      if (!navGrid) return
      const onBloomEnd = (e: AnimationEvent) => {
        // only the last nav item's bloom counts — the earlier items fire
        // animationend first and must not consume the listener
        const t = e.target
        if (!(t instanceof Element) || t !== navGrid.lastElementChild) return
        if (e.animationName !== 'bloom') return
        navGrid.removeEventListener('animationend', onBloomEnd)
        if (introPlayedRef.current) return
        introPlayedRef.current = true
        fadeIn()
      }
      navGrid.addEventListener('animationend', onBloomEnd)
      return
    }
    fadeIn()
  }, [pathname, bgSettled])
  return (
    <LocaleProvider locale={locale}>
      <div className={`app${bgSettled ? ' bg-settled' : ''}`}>
        {/* Both backgrounds render full-screen and are clipped to their
            regions (left panel = blue, right panel = pink). The wrapper
            clips them together so the reveal sweep keeps the wave seam. */}
        <div className="bg-wrap" aria-hidden="true">
          <div className="bg bg--blue" />
          <div className="bg bg--pink" />
        </div>
        <Sidebar />
        <main className="main">
          <Routes>
            {/* the bare entry picks the locale from the browser language;
                un-prefixed deep links are not redirected (they fall into
                the localized 404 below) */}
            <Route path="/" element={<Navigate to={`/${locale}`} replace />} />
            <Route path="/:locale" element={<LocaleGate />}>
              <Route index element={<HomePage />} />
              <Route path="post/:slug" element={<PostPage />} />
              <Route path="posts" element={<PostsPage />} />
              <Route path="about" element={<PostPage slug="about" />} />
              <Route path="*" element={<PostPage slug="nonexistent" />} />
            </Route>
          </Routes>
        </main>
      </div>
    </LocaleProvider>
  )
}
