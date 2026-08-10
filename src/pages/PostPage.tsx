import { useLayoutEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MarkdownView from '../components/MarkdownView'
import ContextMenu from '../components/ContextMenu'
import DashedBorder from '../components/DashedBorder'
import PageTitle from '../components/PageTitle'
import BackButton from '../components/BackButton'
import { getPost } from '../posts'
import { useT } from '../i18n'
import { consumeCardTransition, runCardTransition } from '../transition'
import profileArt from '../assets/profile.svg'
import profileMobileArt from '../assets/profile_mobile.svg'

interface MenuState {
  x: number
  y: number
  selectedText: string
}

export default function PostPage({ slug: propSlug }: { slug?: string }) {
  const { slug: paramSlug } = useParams()
  const slug = propSlug ?? paramSlug ?? ''
  const [menu, setMenu] = useState<MenuState | null>(null)
  // the profile card fades in only after its SVG asset finished loading,
  // so a slow asset never pops in after a blank gap
  const [profileReady, setProfileReady] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const post = getPost(slug)
  const { locale, t } = useT()

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
    const parent = card.parentElement
    if (!parent) return
    const others = [...parent.children].filter(
      (el) => el !== card && !el.classList.contains('title-row')
    )
    const titleRow = parent.querySelector('.title-row')
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
        <PageTitle>{t('notFound.title')}</PageTitle>
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
              {t('notFound.quotePre')}
              <code>{slug}</code>
              {t('notFound.quotePost')}
            </p>
            <p>
              {t('notFound.tryPre')}
              <Link to={`/${locale}/posts`}>{t('notFound.postsLink')}</Link>
              {t('notFound.tryMid')}
              <Link to={`/${locale}`}>{t('notFound.homeLink')}</Link>
              {t('notFound.tryPost')}
            </p>
          </div>
        </div>
      </>
    )
  }

  // The about page is a bare profile card: the landscape passport design
  // from references/profile.svg fills the desktop panel, the portrait
  // references/profile_mobile.svg takes over at the mobile breakpoint.
  // The picture element only downloads the source matching the viewport.
  // The article card chrome is intentionally omitted on both viewports.
  if (post.slug === 'about') {
    return (
      <div className="profile-page">
        <picture>
          <source srcSet={profileMobileArt} media="(max-width: 960px)" />
          <img
            src={profileArt}
            alt=""
            onLoad={() => setProfileReady(true)}
            className={profileReady ? 'profile-page__img--ready' : undefined}
          />
        </picture>
      </div>
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
