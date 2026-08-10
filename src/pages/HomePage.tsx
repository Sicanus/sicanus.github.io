import { useState } from 'react'
import MarkdownView from '../components/MarkdownView'
import ContextMenu from '../components/ContextMenu'
import DashedBorder from '../components/DashedBorder'
import PageTitle from '../components/PageTitle'
import BackButton from '../components/BackButton'
import { featuredPost } from '../posts'

interface MenuState {
  x: number
  y: number
  selectedText: string
}

export default function HomePage() {
  const [menu, setMenu] = useState<MenuState | null>(null)

  // all posts hidden (or none generated) — nothing to feature
  const post = featuredPost
  if (!post) return null

  return (
    <>
      <div className="title-row">
        <BackButton />
        <PageTitle>{post.title}</PageTitle>
        <span className="title-row__spacer" aria-hidden="true" />
      </div>
      <div
        className="article-card"
        onContextMenu={(e) => {
          // touch devices: keep the native context menu (long-press)
          if (window.matchMedia('(pointer: coarse)').matches) return
          e.preventDefault()
          setMenu({
            x: e.clientX,
            y: e.clientY,
            selectedText: window.getSelection()?.toString().trim() ?? '',
          })
        }}
      >
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
        <MarkdownView content={post.content} date={post.date} />
      </div>
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          post={post}
          selectedText={menu.selectedText}
          onClose={() => setMenu(null)}
        />
      )}
    </>
  )
}
