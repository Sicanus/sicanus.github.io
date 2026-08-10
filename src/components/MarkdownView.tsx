import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Link } from 'react-router-dom'
import { useT } from '../i18n'
import { formatDate } from '../i18n/dates'

/**
 * Renders markdown with the blog's typography. h1 is the "markdown title"
 * (pink, extra-bold) and paragraphs use the body style from the Figma design.
 */
export default function MarkdownView({ content, date }: { content: string; date: string }) {
  const { locale } = useT()
  return (
    <div className="markdown">
      {date && <p className="post-date">{formatDate(date, locale)}</p>}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => <h1 className="markdown__title">{children}</h1>,
          h2: ({ children }) => <h2>{children}</h2>,
          h3: ({ children }) => <h3>{children}</h3>,
          table: ({ children }) => (
            <div className="markdown__table-wrap">
              <table>{children}</table>
            </div>
          ),
          a: ({ href, children }) =>
            href?.startsWith('/') ? (
              // internal links in post content keep the current locale
              <Link to={`/${locale}${href}`}>{children}</Link>
            ) : (
              <a href={href} target="_blank" rel="noreferrer">
                {children}
              </a>
            ),
          input: ({ checked, ...props }) => (
            <input type="checkbox" checked={checked} readOnly {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
