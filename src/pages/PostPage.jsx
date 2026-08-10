import { useLayoutEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MarkdownView from '../components/MarkdownView'
import ContextMenu from '../components/ContextMenu'
import DashedBorder from '../components/DashedBorder'
import PageTitle from '../components/PageTitle'
import BackButton from '../components/BackButton'
import { getPost } from '../posts'
import { consumeCardTransition, runCardTransition } from '../transition'

export default function PostPage({ slug: propSlug }) {
  const { slug: paramSlug } = useParams()
  const slug = propSlug ?? paramSlug
  const [menu, setMenu] = useState(null)
  const cardRef = useRef(null)
  const post = getPost(slug)

  // Coming from the posts list: grow the floating card from the clicked
  // post card's rect onto this article card.
  useLayoutEffect(() => {
    if (!post) return
    const t = consumeCardTransition()
    if (!t?.from) return
    const card = cardRef.current
    if (!card) return
    const to = card.getBoundingClientRect()
    // everything except the article card fades out during the morph;
    // the title row stays visible and only cross-fades its text
    const others = [...card.parentElement.children].filter(
      (el) => el !== card && !el.classList.contains('title-row')
    )
    const titleRow = card.parentElement.querySelector('.title-row')
    if (titleRow) {
      titleRow.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 150,
        easing: 'ease-out',
        fill: 'forwards',
      })
    }
    runCardTransition(t.from, to, card, others, () => {
      card.style.opacity = ''
    })
  }, [post])

  if (!post) {
    return (
      <>
        <PageTitle>みつからないのだ……</PageTitle>
        <div className="article-card">
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
          <div className="markdown">
            <p>
              「<code>{slug}</code>」っていう記事はないみたい。
            </p>
            <p>
              <Link to="/posts">記事一覧</Link>か<Link to="/">ホーム</Link>
              から探してみてね。
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="title-row">
        <BackButton slug={post.slug} />
        <PageTitle>{post.title}</PageTitle>
        <span className="title-row__spacer" aria-hidden="true" />
      </div>
      <div
        ref={cardRef}
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
