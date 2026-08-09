/**
 * Shared-element transition between the posts list and an article.
 *
 * Clicking a post card records its rect via beginCardTransition(); the
 * destination page consumes it (consumeCardTransition()) and plays the
 * animation onto its own card (runCardTransition()), then removes the
 * overlay. Direct visits (no pending state) skip the animation.
 *
 * The overlay animates left/top/width/height instead of transform scale,
 * so the dashed outline inside keeps its dash pattern and corner radius
 * (no stretching). The destination cards share the same dash insets, so
 * at the final frame the overlay's outline coincides with the card's —
 * removing it is seamless.
 */
const pending = { from: null, slug: null }

export const beginCardTransition = (from, slug) => {
  pending.from = from
  pending.slug = slug ?? null
}

export const consumeCardTransition = () => {
  if (!pending.from) return null
  const v = { from: pending.from, slug: pending.slug }
  pending.from = null
  pending.slug = null
  return v
}

/**
 * Animates a floating card overlay from `from` to `to` (both DOMRect-like).
 * `targetEl` (the destination card) is hidden during the animation and
 * revealed when it finishes; `fadeEls` (the page's other elements) fade
 * out as the animation starts and fade back in when it completes, so the
 * card morph is the only visual focus; `done` runs after completion.
 */
export function runCardTransition(from, to, targetEl, fadeEls, done) {
  const el = document.createElement('div')
  el.className = 'card-transition'
  el.style.left = `${from.x}px`
  el.style.top = `${from.y}px`
  el.style.width = `${from.width}px`
  el.style.height = `${from.height}px`
  // same look as a post card: 5px ring + dashed outline (12/9/11/9, r 65.5)
  el.innerHTML = `
    <svg class="card-transition__dash" aria-hidden="true">
      <rect style="x:0.844rem; y:0.656rem; width:calc(100% - 1.625rem);
                   height:calc(100% - 1.312rem); rx:4.094rem;"
            fill="none" stroke="#ffbad3"
            stroke-width="0.187rem" stroke-dasharray="0.625rem 0.625rem"/>
    </svg>`
  document.body.appendChild(el)

  if (targetEl) targetEl.style.opacity = '0'
  // fade the other elements out via WAAPI (animates from the current
  // computed value, so the fade actually happens — unlike setting
  // opacity inline before the first paint, which would snap)
  fadeEls.forEach((f) =>
    f.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 150,
      easing: 'ease-out',
      fill: 'both',
    })
  )

  el.animate(
    [
      {
        offset: 0,
        left: `${from.x}px`,
        top: `${from.y}px`,
        width: `${from.width}px`,
        height: `${from.height}px`,
      },
      {
        offset: 1,
        left: `${to.x}px`,
        top: `${to.y}px`,
        width: `${to.width}px`,
        height: `${to.height}px`,
      },
    ],
    { duration: 320, easing: 'cubic-bezier(0.33, 1, 0.68, 1)', fill: 'both' }
  ).onfinish = () => {
    el.remove()
    if (targetEl) targetEl.style.opacity = ''
    fadeEls.forEach((f) =>
      f.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 200,
        easing: 'ease-out',
        fill: 'forwards',
      })
    )
    done && done()
  }
}
