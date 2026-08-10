import { useEffect, useRef, useState } from 'react'
import type { Post } from '../posts'

const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * Right-click context menu shown on the article card — matches the
 * "right click menu" frame in the Figma design. Its height adapts to the
 * number of items (58 + 54×n + 13×(n−1) + 14), it fades in on open and
 * fades out before closing; picking an item closes it immediately.
 */
interface ContextMenuProps {
  x: number
  y: number
  post: Post
  selectedText?: string
  onClose: () => void
}

export default function ContextMenu({ x, y, post, selectedText = '', onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [closing, setClosing] = useState(false)

  // fade in on mount
  useEffect(() => {
    const el = ref.current
    if (el) {
      el.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 80,
        easing: 'ease-out',
        fill: 'forwards',
      })
    }
  }, [])

  // fade out, then unmount
  useEffect(() => {
    if (!closing) return
    const el = ref.current
    if (!el) {
      onClose()
      return
    }
    el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 80,
      easing: 'ease-in',
      fill: 'forwards',
    }).onfinish = () => onClose()
  }, [closing, onClose])

  const requestClose = () => {
    if (!closing) setClosing(true)
  }

  useEffect(() => {
    // Left-click outside closes immediately. Right-click is handled via
    // the contextmenu event below, so right-clicking on the article card
    // repositions the menu instead of closing it.
    const close = (event: MouseEvent) => {
      if (event.button === 2) return
      const t = event.target
      if (ref.current && (!(t instanceof Node) || !ref.current.contains(t))) requestClose()
    }
    const closeOnKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose()
    }
    // A right-click anywhere else (not handled by the card) closes the
    // menu; one handled by the card leaves it open for the new position.
    const onContextMenu = (event: MouseEvent) => {
      if (!event.defaultPrevented) requestClose()
    }
    window.addEventListener('mousedown', close)
    window.addEventListener('keydown', closeOnKey)
    window.addEventListener('contextmenu', onContextMenu)
    return () => {
      window.removeEventListener('mousedown', close)
      window.removeEventListener('keydown', closeOnKey)
      window.removeEventListener('contextmenu', onContextMenu)
    }
  }, [closing])

  // "Copy" only appears when there is selected text on the page.
  const hasSelection = selectedText.length > 0

  // plain text of the whole article
  const fullText = post.content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  const items = [
    ...(hasSelection
      ? [
          {
            label: 'コピー',
            onClick: () => {
              copy(selectedText)
              requestClose()
            },
          },
        ]
      : []),
    {
      label: 'すべてコピー',
      onClick: () => {
        copy(fullText)
        requestClose()
      },
    },
    {
      label: 'リンクコピー',
      onClick: () => {
        copy(window.location.href)
        requestClose()
      },
    },
    {
      label: 'シェア',
      onClick: () => {
        navigator.share({ url: window.location.href }).catch(() => copy(window.location.href))
        requestClose()
      },
    },
  ]

  // height adapts to the item count (figma: items start at 58,
  // each item 54 tall with 13px gaps, 14px bottom margin)
  const menuHeight = 58 + items.length * 54 + (items.length - 1) * 13 + 14

  // Keep the menu inside the viewport (281 wide + 5px ring each side).
  const left = Math.min(x, window.innerWidth - 291 - 8)
  const top = Math.min(y, window.innerHeight - menuHeight - 5 - 8)

  return (
    <div
      ref={ref}
      className="context-menu"
      role="menu"
      style={{ left, top, height: menuHeight }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* title text at (35,9); the three rotated rectangles behind it */}
      <span className="context-menu__title-text">Menu</span>
      <span className="context-menu__dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <div className="context-menu__items">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            className="context-menu__item"
            onClick={item.onClick}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
