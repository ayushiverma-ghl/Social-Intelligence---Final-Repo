// 21 Oct (a20 V2, Ayushi: "check Neuron for how we present numbers"): one number system for every
// figure on the Overview. Neuron's rule (qa_checklist_2026): big stat figures use a HighRise display
// token (HLStatistic uses display).
//   card  — each card's own figures (Mentions tabs, Industry trends total, Competitors share):
//           HLText display xs (24), semibold, tabular-nums.
//   strip — the small figures in the Your topics strip: 2xl (16), semibold, tabular-nums.
//   unit  — 13 grey, inline on the figure's baseline ("78,911 posts in the last 7 days").
//   delta — 13 semibold, green/red, arrow icon + % (the same on every card).
export const FIG = {
  card: { type: 'display', size: 'xs', weight: 'semibold' },
  strip: { size: '2xl', weight: 'semibold' },
}
// Figures run in full up to 99,999 and short from 100,000 (390K, 1.2M), as Trending everywhere's
// 282K and the posts' 44.3K saves already do, so a figure never outgrows its tab.
export function fmtFig(n) {
  if (n == null) return '–'
  if (n < 100000) return Math.round(n).toLocaleString('en-US')
  if (n < 1e6) return `${Math.round(n / 1000)}K`
  return `${+(n / 1e6).toFixed(1)}M`
}
