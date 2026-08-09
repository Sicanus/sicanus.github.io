import { useEffect, useLayoutEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import HomePage from './pages/HomePage'
import PostPage from './pages/PostPage'
import PostsPage from './pages/PostsPage'

/**
 * Below 1080p the root font size shrinks, scaling every rem-based UI
 * element (text, buttons, cards, spacing) proportionally while the
 * proportional layout itself keeps flowing. Touch devices keep 16px.
 */
function useUiScale() {
  useEffect(() => {
    const apply = () => {
      const scale = window.matchMedia('(pointer: coarse)').matches
        ? 1
        : Math.min(1, window.innerHeight / 1080)
      document.documentElement.style.fontSize = `${(scale * 16).toFixed(3)}px`
    }
    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [])
}

export default function App() {
  useUiScale()
  const { pathname } = useLocation()

  // Fade the new page's content in after a route change. Card morph
  // transitions manage their own fades, so they are skipped.
  useLayoutEffect(() => {
    if (document.querySelector('.card-transition')) return
    const main = document.querySelector('.main')
    if (!main) return
    main.style.opacity = '0'
    main.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 150,
      easing: 'ease-out',
      fill: 'forwards',
    })
  }, [pathname])
  return (
    <div className="app">
      {/* Both backgrounds render full-screen and are clipped to their
          regions (left panel = blue, right panel = pink). */}
      <div className="bg bg--blue" aria-hidden="true" />
      <div className="bg bg--pink" aria-hidden="true" />
      <Sidebar />
      <main className="main">
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="post/:slug" element={<PostPage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="about" element={<PostPage slug="about" />} />
          <Route path="*" element={<PostPage slug="nonexistent" />} />
        </Routes>
      </main>
    </div>
  )
}
