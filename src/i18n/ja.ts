/** Source-of-truth dictionary — every UI string of the ja interface,
 *  verbatim from the previously hardcoded components. The Key type is
 *  derived from this object, so every other locale must cover exactly
 *  these keys. */
export const ja = {
  'site.name': 'Sicanusのブログ',
  'nav.aria': 'Main navigation',
  'nav.home': 'ホーム',
  'nav.posts': '記事',
  'nav.about': 'プロフ',
  'menu.title': 'Menu',
  'menu.copy': 'コピー',
  'menu.copyAll': 'すべてコピー',
  'menu.copyLink': 'リンクコピー',
  'menu.share': 'シェア',
  'back.aria': '記事リストに戻る',
  'posts.title': '記事',
  'posts.empty': '空っぽなのだ……',
  'posts.paginationAria': 'Pagination',
  'notFound.title': 'みつからないのだ……',
  'notFound.quotePre': '「',
  'notFound.quotePost': '」っていう記事はないみたい。',
  'notFound.postsLink': '記事一覧',
  'notFound.homeLink': 'ホーム',
  'notFound.tryPre': '',
  'notFound.tryMid': 'か',
  'notFound.tryPost': 'から探してみてね。',
} as const

export type Key = keyof typeof ja
