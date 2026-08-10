import { useEffect, useLayoutEffect } from 'react'
import { Navigate, Outlet, Routes, Route, useLocation, useParams } from 'react-router-dom'
import Sidebar from './components/Sidebar'
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

export default function App() {
  useUiScale()
  useHideSidebarOnScroll()
  const { pathname } = useLocation()
  const locale = localeFromPath(pathname)

  // Fade the new page's content in after a route change. Card morph
  // transitions manage their own fades, so they are skipped.
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    if (document.querySelector('.card-transition')) return
    const main = document.querySelector<HTMLElement>('.main')
    if (!main) return
    main.style.opacity = '0'
    main.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 150,
      easing: 'ease-out',
      fill: 'forwards',
    })
  }, [pathname])
  return (
    <LocaleProvider locale={locale}>
      <div className="app">
        {/* Both backgrounds render full-screen and are clipped to their
            regions (left panel = blue, right panel = pink). */}
        <div className="bg bg--blue" aria-hidden="true" />
        <div className="bg bg--pink" aria-hidden="true" />
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
