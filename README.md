# Blog Name

A pastel blog built with Vite + React, following the design in `blog.fig`:
blue background SVG on the left (sidebar), pink background SVG on the right
(article card), and a right-click context menu on the article card.

## Run

```bash
npm install
npm run dev      # development server (regenerates posts first)
npm run build    # production build (regenerates posts first)
npm run preview  # serve the production build
```

## How posts work

**Just drop a markdown file into `posts/`** (next to `src/`) — that's it. Every file
must start with a frontmatter block:

```markdown
---
title: My Post
date: 2026-08-09
hidden: true        # optional — hide from the /posts list (e.g. /about)
---

Your markdown content here...
```

`npm run generate` (run automatically by `dev`/`build`) scans the folder,
sorts posts by `date` (newest first) and writes `src/posts.generated.js`,
which the app imports. The newest visible post is the featured post on the
home page.

Markdown is rendered with `react-markdown` + `remark-gfm` (tables, task
lists, strikethrough) and `rehype-highlight` (code syntax highlighting).

## GitHub Pages

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every
push to `main`. The build regenerates the post registry, so a new file in
`posts/` is picked up automatically. The app uses a hash router, so
any URL (`/#/post/...`) works on refresh or direct access.

## Structure

- `posts/` — the markdown content folder (the only thing you edit)
- `scripts/generate-posts.js` — scans `posts/`, generates the registry
- `src/components/` — Sidebar, MarkdownView, ContextMenu, PageTitle, ...
- `src/pages/` — Home, Post, Posts list
- `src/assets/bg_blue.svg`, `bg_pink.svg` — the background assets from the
  design, replacing the flat blue/pink fills
