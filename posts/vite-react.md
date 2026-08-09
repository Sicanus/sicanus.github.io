---
title: Building with Vite & React
date: 2026-08-09
---
# Building with Vite & React

This blog is built with [Vite](https://vitejs.dev) and [React](https://react.dev) —
a setup that makes it delightfully fast to develop and ship.

## Why Vite?

Vite gives you instant server start and blazing-fast hot module replacement.
There's almost no configuration needed to get going:

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev
```

## The React part

React makes the UI declarative. Components are just functions:

```jsx
function PostCard({ title, excerpt }) {
  return (
    <article className="post-card">
      <h2>{title}</h2>
      <p>{excerpt}</p>
    </article>
  );
}
```

## Rendering markdown

The whole point of a blog is writing content in markdown. On this site, posts
are plain `.md` files that get imported as raw text and rendered with
`react-markdown`:

```jsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

<ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>;
```

`remark-gfm` adds the good stuff — tables, task lists, strikethrough.

## Tip of the day

> Keep your posts as markdown files and your components as React components.
> Mixing content and markup rarely ends well.

Happy building! 🚀
