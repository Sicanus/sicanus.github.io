---
title: Markdown Guide
date: 2026-08-09
---
# Markdown Guide

Markdown is a lightweight markup language that lets you write documents in plain
text. Here's everything this blog's renderer supports.

## Headings

Headings go from `#` all the way down to `######`. I mostly use the first three.

## Text formatting

You can make text **bold**, *italic*, or ***both***. Add ~~strikethrough~~ for
things you regret, and use `inline code` for things like `npm install`.

## Links

Links are easy too — [like this one to Wikipedia](https://en.wikipedia.org/wiki/Markdown).

## Lists

Unordered lists are useful for bullet points:

- First item
- Second item
  - Nested item
  - Another nested item
- Third item

Ordered lists work for steps:

1. Open your terminal
2. Type `npm run dev`
3. Be amazed

You can even make task lists with checkboxes:

- [x] Write a blog post
- [ ] Publish it
- [ ] Tell everyone about it

## Blockquotes

> The best way to predict the future is to invent it.
> — Alan Kay

## Code blocks

Code blocks come with syntax highlighting:

```js
const posts = await fetch("/api/posts");
console.log(posts.length); // how many posts are there?
```

```css
.blog-card {
  border-radius: 75.5px;
  background: #ffffff;
}
```

```bash
npm install && npm run dev
```

## Tables

| Feature            | Supported | Notes                    |
| ------------------ | :-------: | ------------------------ |
| Headings           |    ✅     | h1 – h6                  |
| Code blocks        |    ✅     | with syntax highlighting |
| Tables             |    ✅     | GFM extension            |
| Task lists         |    ✅     | GFM extension            |
| Strikethrough      |    ✅     | GFM extension            |

## Horizontal rules

A horizontal rule breaks up long sections:

---

That's everything! Now go write something worth reading. ✨
