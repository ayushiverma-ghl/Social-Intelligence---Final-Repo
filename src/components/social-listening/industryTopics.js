// 19 Oct (option D): Industry trends on the card and one level in, from one source so the two
// can't disagree. The card names the top three topics and closes with the remainder; the page
// lists every topic. Until the feed lists them, the topics past the top three are samples that
// share the remainder between them.

// The three tracked topics used to claim the whole niche between them. "All other topics"
// closes the list the way "Everyone else" closes the Competitors card, so a full-width track
// means the same thing on both: 100% of the conversation. The remainder is derived from the
// space name rather than fixed, so it is stable per niche without 21 hand-written numbers.
export function topicShares(named, space) {
  const seed = String(space || '').split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  const rest = 12 + (seed % 9)
  const scale = (100 - rest) / 100
  let running = 0
  const rows = named.map((t, i) => {
    // The last named row absorbs the rounding so the four values total exactly 100.
    const value = i === named.length - 1 ? 100 - rest - running : Math.round(t.value * scale)
    running += value
    return { ...t, value }
  })
  return [...rows, { label: 'All other topics', value: rest, rest: true }]
}

const MORE = {
  'Marketing & Advertising': ['Lead gen funnels', 'White label tools', 'AI automation for agencies', 'UGC ads', 'Email nurture sequences', 'Local SEO', 'Agency pricing', 'Retargeting ads', 'LinkedIn carousels', 'Podcast guesting'],
}
const GENERIC = ['Customer reviews', 'Pricing questions', 'Before and after results', 'Behind the scenes', 'How-to tips', 'Seasonal offers', 'Client stories', 'Local events', 'Staff spotlights', 'Common questions']
// How the remainder splits across the other topics, largest first. Sums to 100.
const WEIGHTS = [26, 20, 16, 12, 9, 6, 4.5, 3, 2, 1.5]
const hash = (t) => [...String(t)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)

// Every topic: { label, share (%), posts, change (% vs the period before) }, most posts first.
export function industryTopics(shares, space, volume) {
  const named = shares.filter((r) => !r.rest)
  const rest = (shares.find((r) => r.rest) || { value: 0 }).value
  const taken = new Set(named.map((r) => r.label.toLowerCase()))
  const others = (MORE[space] || GENERIC).filter((n) => !taken.has(n.toLowerCase())).slice(0, WEIGHTS.length)
  const total = others.reduce((s, _, i) => s + WEIGHTS[i], 0) || 1
  const rows = [
    ...named.map((r) => ({ label: r.label, share: r.value, change: r.change ?? 0 })),
    ...others.map((label, i) => ({ label, share: Math.round((rest * WEIGHTS[i] / total) * 10) / 10, change: (hash(label) % 22) - 6 })),
  ]
  return rows.map((r) => ({ ...r, posts: Math.round((volume * r.share) / 100) })).sort((a, b) => b.posts - a.posts)
}
