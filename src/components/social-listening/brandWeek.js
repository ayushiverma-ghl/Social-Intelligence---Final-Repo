// The account's own week for the Mentions card: each day's mentions, last week's run, and the
// three figures the tabs card charts. Shared by MentionsTabsCard (the default, 21 Oct) and
// MentionsVariants (the other two layouts in Demo controls), so the two can't disagree.
import { computed } from 'vue'
import { keywordSeries, quickSearchResult } from '../../data/socialListening.js'
import { fmtFig } from './figures.js'
import { useSocialListening } from '../../composables/useSocialListening.js'

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const deltaTone = (d) => (d < 0 ? 'text-negative-strong' : 'text-positive-strong')

// Whole numbers that add up to exactly `total`, in proportion to `weights` (largest remainder),
// so a week's seven days always sum to the figure printed on its tab.
export function splitTotal(weights, total) {
  const sum = weights.reduce((a, v) => a + v, 0)
  const t = Math.max(0, Math.round(total || 0))
  if (!weights.length) return []
  if (!sum) return weights.map((_, i) => (i === weights.length - 1 ? t : 0))
  const raw = weights.map((w) => (w / sum) * t)
  const out = raw.map(Math.floor)
  let left = t - out.reduce((a, v) => a + v, 0)
  raw.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { out[i]++; left-- } })
  return out
}
const sumOf = (a) => a.reduce((x, v) => x + v, 0)

export function useBrandWeek() {
  const { account, range, brandVolume, brandDelta, brandPrevVolume, metrics: slMetrics, spaceData } = useSocialListening()
  const result = computed(() => quickSearchResult(account.value.short, range.value.key, account.value.space))
  // 21 Oct (round 6, Ayushi: "Mentions says 10,258 whereas the graph is around 2,000"): the tab is
  // the week's total and the line is per day, and the seven days now add up to the tab exactly.
  // The whole window's shape is scaled to the window's mentions, and the card shows its last
  // seven days; at Last 7 days (the Overview's window) that is the same 10,258 as everywhere else.
  const days = computed(() => {
    const c = keywordSeries(account.value.space, range.value.key)
    const r = result.value
    const base = r && r.series && r.series.length === c.points ? r.series : c.totals
    // A typed-in industry has no keyword series; fall back to the search's own shape, then to a
    // gentle rise, so the week never draws empty.
    const shape = base.length ? base : r?.series?.length ? r.series : [6, 7, 8, 8, 8, 9, 11]
    return splitTotal(shape, brandVolume.value || 0).slice(-7)
  })
  const n = computed(() => days.value.length)
  const dateAt = (i) => new Date(Date.now() - (n.value - 1 - i) * 86400000)
  const labels = computed(() => days.value.map((_, i) => (i === n.value - 1 ? 'Today' : `${MONTHS[dateAt(i).getMonth()]} ${dateAt(i).getDate()}`)))
  const fullLabels = computed(() => days.value.map((_, i) => `${i === n.value - 1 ? 'Today' : DAYS[dateAt(i).getDay()]}, ${MONTHS[dateAt(i).getMonth()]} ${dateAt(i).getDate()}`))
  const dayName = (i) => (i === n.value - 1 ? 'Today' : DAYS[dateAt(i).getDay()])
  // The week's mentions: the sum of the days drawn.
  const total = computed(() => sumOf(days.value))
  const delta = computed(() => brandDelta.value || 0)
  // Last week, day by day, adding up to the total the delta is worked out against.
  // out9 q03: never divide by (1 - 100%); the floor keeps a sharp fall finite.
  const lastWeek = (t, d) => t / (1 + Math.max(-99, d) / 100)
  const prevDays = computed(() => splitTotal(days.value.map((_, i) => 0.82 + 0.36 * Math.abs(Math.sin(i * 1.7 + 0.4))), brandPrevVolume.value && brandVolume.value ? Math.round(total.value * brandPrevVolume.value / brandVolume.value) : lastWeek(total.value, delta.value)))
  // 19 Oct: the same reading as the AI summary's "How people feel" (net score, 30% neutral).
  // Only the other Mentions layouts (Demo controls) still show it; the tabs card dropped it
  // (round 6: the AI summary covers how people feel).
  const positive = computed(() => Math.round((70 + Math.round(slMetrics.value.sentiment || spaceData.value.nicheSent || 0)) / 2))

  // People talking: unique people each day. Someone who posts on two days counts on both days but
  // once in the week, so the week's figure is the unique count (about 78% of the days added up).
  const pplDays = computed(() => days.value.map((v, i) => Math.round(v * (0.52 + 0.2 * Math.abs(Math.cos(i * 1.3))))))
  const people = computed(() => Math.round(sumOf(pplDays.value) * 0.78))
  // Reach: people who could have seen a mention each day; the week's reach is the days added up.
  const rchDays = computed(() => days.value.map((v, i) => Math.round(v * 38 * (0.6 + 0.8 * Math.abs(Math.sin(i * 0.9 + 1))))))
  const reach = computed(() => sumOf(rchDays.value))

  // The three figures as tabs (Mentions, People talking, Reach). Each keeps its own day-to-day
  // shape, so switching tabs visibly redraws the week, with last week's run and the noun for the
  // hover readout ("1,633 mentions").
  const wobble = (i) => 0.86 + 0.28 * Math.abs(Math.sin(i * 1.9 + 0.7))
  const prevOf = (s, d) => splitTotal(s.map((v, i) => v * wobble(i)), lastWeek(sumOf(s), d))
  const tabMetrics = computed(() => {
    // out9 q03: a derived fall can't pass 99% (it showed "↓120%").
    const pd = Math.max(-99, Math.round(delta.value * 0.8))
    const rd = Math.max(-99, Math.round(delta.value * 1.2))
    return [
      { key: 'mentions', label: 'Mentions', value: fmtFig(total.value), delta: delta.value, series: days.value, prev: prevDays.value, unit: '', noun: 'mentions' },
      // out15 S2: the figure is unique people this week, the chart is people each day (the days add up
      // to more, since someone posting on two days counts on both). The tab says so in a 13px grey
      // line under its figure, and the readout says "people that day".
      { key: 'people', label: 'People talking', value: fmtFig(people.value), delta: pd, series: pplDays.value, prev: prevOf(pplDays.value, pd), unit: '', noun: 'people that day', qual: 'Unique this week' },
      { key: 'reach', label: 'Reach', value: fmtFig(reach.value), delta: rd, series: rchDays.value, prev: prevOf(rchDays.value, rd), unit: '', noun: 'people reached' },
    ]
  })

  return { result, days, n, dateAt, labels, fullLabels, dayName, total, delta, prevDays, positive, people, reach, tabMetrics }
}

// What the tabs card draws, from the picks in state (null when Demo controls picked another layout).
// Halves: V2 tab cells four across, or V3 underline tabs. A third: V2 as 2×2 cells, or V3 as a rail.
export function tabsModeOf(state) {
  if (state.mentionsLayout !== 'tabs') return null
  const third = state.mentionsSize === 'third'
  if (state.mentionsTabs === 'compact') return third ? 'rail' : 'compact'
  return third ? 'grid' : 'across'
}
