<script setup>
// The eight sections of a topic dashboard, shared by both tabs that show one.
//
// Quick Search renders it with `quick` set: the four sections a loose search does not open
// show one real figure and a save row instead of their charts. Insights renders it plain —
// same data, same cards, nothing withheld.
//
// Splitting it out is what stops the two tabs drifting. Before this, Insights would have been
// a second copy of four hundred lines of chart markup, and the first fix applied to one of
// them would have been the moment they stopped matching.
import { ref, computed, watch } from 'vue'
import {
  MessageChatCircleIcon, FaceSmileIcon, ActivityIcon, TrendUp01Icon,
  Announcement01Icon, PieChart01Icon, MessageTextSquare01Icon, Users01Icon, Lock01Icon,
  BookmarkIcon, ArrowUpIcon, ArrowDownIcon,
  Stars01Icon, BellRinging01Icon, Download01Icon, RefreshCcw01Icon, ChevronDownIcon,
} from '@gohighlevel/ghl-icons/24/outline'
import { QUICK_SEARCH_SECTIONS, SIMPLE_SECTION_ORDER, SECTION_NAMES, platformOptions, fmtNum, niceScale, platformTrends } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'
import SectionChip from './SectionChip.vue'
import ChartTip from './ChartTip.vue'
import CountUp from './CountUp.vue'
import VolumeTrend from './VolumeTrend.vue'
import { NETWORK_ICONS } from './networkIcons.js'

const props = defineProps({
  result: { type: Object, required: true },
  // Quick Search shows four sections, Insights all eight. Not a gate — a difference in
  // depth between a quick look and the full dashboard.
  quick: { type: Boolean, default: false },
})
const emit = defineEmits(['save'])

const { state, simple, toast, isSavedTerm } = useSocialListening()
const result = computed(() => props.result)
// 15 Oct: a global trend (World Cup qualifiers) has nothing to do with the account's industry, so
// the one-page design doesn't compare it with one. Everything else says "industry", not "niche".
const globalTerms = computed(() => new Set(platformTrends(state.range).sources.flatMap((s) => s.rows.map((r) => String(r.term).toLowerCase()))))
const compareIndustry = computed(() => !!result.value?.niche && !(simple.value && globalTerms.value.has(String(result.value.term).toLowerCase())))
const placeWord = computed(() => (simple.value ? 'industry' : 'niche'))
// The industry's net score as a positive share, holding neutral at 30% as the overview does.
const industryPositive = computed(() => Math.round((70 + (result.value?.niche?.sentiment || 0)) / 2))

// Renders its slot with no element of its own: lets a simplified-only wrapper drop out of the
// current design without duplicating what it wraps.
const Bare = (_, { slots }) => slots.default?.()

// ---- simplified design: per-section actions and hover readouts (Sujeet, 5 Oct) ----
// Which alert metric each section preselects in the alert modal.
const ALERT_METRIC = { snapshot: 'mentions', sentiment: 'sentiment', share: 'mentions', trends: 'mentions' }

// Ask AI answers with the section's own reading, then its Next step.
function aiReply(id) {
  const r = result.value
  const top = r.platforms[0]
  const n = nextStep.value
  return {
    snapshot: `"${r.term}" got ${fmtNum(r.mentions)} mentions ${r.range.phrase}, ${r.delta < 0 ? 'down' : 'up'} ${Math.abs(r.delta)}% on the period before.${top ? ` Most of it is on ${top.label}.` : ''}\n\n${n.snapshot}`,
    sentiment: `${r.pos}% of posts are positive and ${r.neg}% are negative. ${toneLine.value}\n\n${n.sentiment}`,
    trends: `The busiest day had ${fmtNum(r.peak)} posts, ${r.peakMultiple} times a normal day.\n\n${n.trends}`,
    share: top
      ? `${top.label} carries ${top.value}% of this conversation, more than any other platform.\n\n${n.share}`
      : n.share,
    engagement: `${fmtNum(r.engagement.total)} likes, comments and shares. Likes are ${likeShare.value}% of them, so people react more than they talk.\n\nEnding posts with a question is the simplest way to get more comments.`,
    conversations: topTopic.value
      ? `${topTopic.value.label} is what people talk about most alongside it.\n\nPosts that join that conversation tend to travel further than ones that start a new one.`
      : 'No clear topics have formed around it yet.',
    messages: `The most engaged post has ${fmtNum(postReach.value)} likes, comments and shares.\n\nReading the top few posts is the quickest way to see what people care about.`,
    audience: `${r.audience.language[0].value}% of posts are in ${r.audience.language[0].label}, and ${r.audience.places[0].label} accounts for ${r.audience.places[0].value}%.\n\nWrite for that audience first.`,
  }[id] || ''
}
function askAbout(s) {
  const name = SECTION_NAMES[s.id] || s.label
  state.askAI = {
    prompt: `What does "${name}" for "${result.value.term}" tell me?`,
    topic: result.value.term,
    reply: aiReply(s.id),
    autoSend: true,
  }
}
function alertAbout(s) {
  const term = result.value.term
  const saved = (state.topicsByAccount[state.accountId] || []).find(
    (t) => (t.term || t.title).trim().toLowerCase() === term.trim().toLowerCase())
  state.alertTopic = saved ? saved.title : term
  state.alertSavesSearch = !isSavedTerm(term)
  state.alertMetric = ALERT_METRIC[s.id] || null
  state.modal = 'alert'
}

const HEAT_WORDS = ['Quiet', 'Fairly quiet', 'About average', 'Busy', 'Busiest']
function heatWord(v) {
  return HEAT_WORDS[v < 30 ? 0 : v < 45 ? 1 : v < 60 ? 2 : v < 78 ? 3 : 4]
}
const aboutPosts = (pct, total) => `About ${fmtNum(Math.round((total * pct) / 100))} posts`
// Where each emotion dot sits, as a share of the 300×176 radar box.
const radarHits = computed(() => {
  const r = result.value
  if (!r) return []
  return r.emotions.map((e, i) => {
    const [x, y] = radarPoint(i, e.value)
    return { label: e.label, value: e.value, left: `${(x / 300) * 100}%`, top: `${(y / 176) * 100}%` }
  })
})
// A hover column centred on point i of n, half a step either side.
function hitCol(i, n) {
  const step = 100 / Math.max(1, n - 1)
  const left = Math.max(0, (i - 0.5) * step)
  const right = Math.min(100, (i + 0.5) * step)
  return { left: left + '%', width: right - left + '%' }
}

// Refresh: a shimmer on the card, then a toast. The data cannot change, so it only says so.
const refreshing = ref(null)
let refreshTimer = null
function refreshSection(s) {
  clearTimeout(refreshTimer)
  refreshing.value = s.id
  refreshTimer = setTimeout(() => {
    refreshing.value = null
    if (simple.value) toast(`${SECTION_NAMES[s.id] || s.label}: nothing new yet`, '', 'info')
    else toast('Up to date', `${SECTION_NAMES[s.id] || s.label} has the latest posts.`, 'info')
  }, 900)
}

function exportPosts() {
  const rows = result.value?.messages || []
  const cell = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"'
  const csv = [['Author', 'Handle', 'Platform', 'Posted', 'Sentiment', 'Post'].map(cell).join(',')]
    .concat(rows.map((m) => [m.who, m.handle, m.platform, m.ago, m.tone, m.text].map(cell).join(',')))
    .join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  a.download = String(result.value.term).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-posts.csv'
  a.click()
  URL.revokeObjectURL(a.href)
  if (simple.value) toast(`Downloaded ${rows.length} posts`)
  else toast('Export ready', rows.length + ' posts saved as CSV.')
}

// Locked sections in the simplified design: a blurred preview of what saving opens.
const LOCK_LINES = {
  engagement: 'See likes, comments, shares and saves, week by week.',
  conversations: 'See the words, hashtags and topics people use.',
  messages: 'Read every post, with a filter for each platform.',
  audience: 'See where people are and which languages they use.',
}
const lockBars = computed(() => {
  const r = result.value
  if (!r) return []
  const max = Math.max(...r.engagement.byWeek) || 1
  return r.engagement.byWeek.map((v) => Math.max(12, Math.round((v / max) * 100)))
})
const lockPlaces = computed(() => (result.value?.audience.places || []).filter((p) => !p.rest).slice(0, 4))
const lockWords = computed(() => (result.value?.words || []).slice(0, 12))
const lockPosts = computed(() => (result.value?.messages || []).slice(0, 3))
// All eight either way. Quick Search shows four open and four locked in the positions they
// will hold once saved, rather than rendering a shorter page that reshuffles on save.
// Shivam on the 28 Sep call: "the other graph should be there, but they should have a lock
// saying save it as a topic to do that."
// Simplified (Harsh, 6 Oct): the open sections come first and the locked ones after, so a
// search reads as an answer before it asks for anything. Saved or not, the order is the
// same, so saving does not reshuffle the page.
const sections = computed(() => (simple.value ? SIMPLE_SECTION_ORDER : QUICK_SEARCH_SECTIONS))

// Platform filter. Only sections with an entry in PLATFORM_SUPPORT get one; the rest have
// no filter rather than one that does nothing.
//
// It reads and writes `state.detailPlatform`, which the back-toolbar dropdown also drives.
// The pill row and the dropdown are one filter shown twice, so picking Instagram in either
// place has to light up the other; a local ref let them hold different answers at once.
// The back-toolbar dropdown is a multi-select, so this row reads a set rather than a value.
// A pill is a shortcut to "only this one"; All is a shortcut back to everything.
const allMsgLabels = computed(() => msgPlatforms.value.map((p) => p.label))
const selectedPlatforms = computed(() => state.detailPlatforms ?? allMsgLabels.value)
const allPlatformsOn = computed(() => state.detailPlatforms === null)
const isOnlyPlatform = (label) => selectedPlatforms.value.length === 1 && selectedPlatforms.value[0] === label
function pickPlatform(label) {
  state.detailPlatforms = label === 'All' ? null : [label]
}
// The switcher is single-choice, so it can only name All or one platform. When the
// back-toolbar dropdown has picked two or three, no segment is lit: the row is not wrong,
// it just has no one answer to show, and the dropdown still does.
const switcherValue = computed(() => {
  if (allPlatformsOn.value) return 'All'
  return selectedPlatforms.value.length === 1 ? selectedPlatforms.value[0] : null
})
// SEARCH_PLATFORMS are display names; NETWORK_ICONS is keyed by source id.
const PLATFORM_KEY = { Facebook: 'facebook', Instagram: 'instagram', LinkedIn: 'linkedin', X: 'x', Reddit: 'reddit', YouTube: 'youtube' }
const msgPlatforms = computed(() => platformOptions('messages') || [])
const filteredMessages = computed(() => {
  const r = result.value
  if (!r) return []
  if (allPlatformsOn.value) return r.messages
  return r.messages.filter((m) => selectedPlatforms.value.includes(m.platform))
})
// 27 Oct (developers): the top 10 posts, then Show more adds 10 (posts are the costliest call).
const POSTS_STEP = 10
const postsShown = ref(POSTS_STEP)
watch(() => [result.value?.term, state.detailPlatforms], () => { postsShown.value = POSTS_STEP })
const visibleMessages = computed(() => filteredMessages.value.slice(0, postsShown.value))

// Locked because it is a search, not because of a plan. `s.locked` was the Pro gate and is
// false everywhere since the PM deferred gating; what decides it here is simply whether the
// section is one of the four a loose search opens. Saving the search unlocks the rest, which
// is the trade the panel offers.
// WBR 12 Oct (1D): in the simplified design every section is open on a search. The lock read
// as a paywall (Khoi, Richard, Chetan); listening is what keeps a topic, not what unlocks it.
function isLocked(s) {
  return !simple.value && props.quick && !s.quick
}

// G3. A locked section gives away one real figure and withholds the rest, rather than
// blurring a whole dashboard the account has not earned. Every number below is computed the
// same way the open sections compute theirs, so nothing here is invented for the tease.
//
// The old treatment rendered the real content, blurred it 5px at 45% opacity, and floated a
// second card over it. Sujith: "we don't have to put a card on top of a card, you can surface
// this without even a card, because there's a good amount of blur there."
function lockedTeaser(id) {
  const r = result.value
  if (!r) return null
  if (id === 'engagement') return {
    figure: fmtNum(r.engagement.total), unit: 'total interactions',
    rest: 'The split across likes, comments, shares and saves, and how it moved over six weeks.',
  }
  if (id === 'conversations') return {
    figure: fmtNum((r.topics || []).length), unit: 'topics running alongside it',
    rest: 'The hashtags, the phrases people are using, and the live conversation feed.',
  }
  if (id === 'messages') return {
    figure: fmtNum(r.mentions), unit: 'posts mentioning it',
    rest: 'The posts themselves, who wrote them, and a filter for each platform.',
  }
  if (id === 'audience') {
    // Not a count of places: the list closes on an "Everywhere else" row, so counting it
    // would report five countries where the data names four. The top share is a real figure
    // and a better tease, because it says something rather than sizing a list.
    const top = (r.audience.places || []).find((pl) => !pl.rest)
    return top ? {
      // "from X" rather than "in X": the labels are bare country names and half of them want
      // a definite article ("the United States") while the other half do not ("India").
      figure: top.value + '%', unit: 'from ' + top.label,
      rest: 'The other countries, the languages people use, and the age split behind them.',
    } : null
  }
  return null
}

// `alt` is the shorter name a section takes as a card heading; only `snapshot` has one
// ("Overview" rather than "Snapshot"). This used to be gated on a `locked` prop that neither
// call site ever passed, so the gate was always open and the alt always won.
function sectionLabel(s) {
  if (simple.value) return SECTION_NAMES[s.id] || s.label
  return s.alt || s.label
}

// The glyph lexicon from the overview, extended. A metric wears the same glyph wherever it
// appears: mentions keep MessageChatCircle, sentiment keeps FaceSmile, share keeps
// PieChart01, trends keep TrendUp01. The four new ones are the four sections the overview
// has no card for.
const ICONS = {
  snapshot: MessageChatCircleIcon,
  sentiment: FaceSmileIcon,
  engagement: ActivityIcon,
  trends: TrendUp01Icon,
  conversations: Announcement01Icon,
  share: PieChart01Icon,
  messages: MessageTextSquare01Icon,
  audience: Users01Icon,
}

// ---- chart geometry -------------------------------------------------------------------
// Two rules, both learned the hard way on this file.
//
// 1. No type inside a stretched SVG. A `w-full` SVG with a 220-unit viewBox multiplies
//    everything inside it by the column width — a font-size of 22 rendered at 70px, and the
//    radar's axis labels ran off their own card. MentionsRow.vue already says this: its
//    labels "sit outside so they don't skew". So the wide plots draw marks only, and every
//    axis value below is HTML sitting beside the plot.
// 2. Wide plots are `preserveAspectRatio="none"` at a fixed pixel height, so the geometry
//    below is authored in a 1000-unit box and stretched horizontally only. Strokes carry
//    vector-effect="non-scaling-stroke" so a 2px line stays 2px. Nothing round is drawn in
//    one — a circle in a non-uniform box is an ellipse — so point markers are left out.
//
// The radar is the exception: it is intrinsically sized, so it gets a real width and height
// and is centred. It renders 1:1 and its labels are safe inside it.
const PLOT_W = 1000
const xAt = (i, n) => (n < 2 ? 0 : (i / (n - 1)) * PLOT_W)

// The volume graph itself lives in VolumeTrend.vue; this page only names its days.
const volLabels = computed(() => {
  const r = result.value
  return r ? r.series.map((_, i) => dayLabel(i, r.series.length, r.stepDays)) : []
})

// A trailing window ending today, so the labels are real dates rather than "Day 1". Same
// reasoning as MentionsRow's windowLabel. `step` is days per point — 1 inside a month, 7
// beyond it — so the marks stay honest when the picker changes.
function dayLabel(i, n, step = 1) {
  const d = new Date()
  d.setDate(d.getDate() - Math.round((n - 1 - i) * step))
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// The simplified design scales the bars so the tallest is the busiest day's real count, which
// makes the axis and the hover readout agree with the figure above the chart.
const trendBars = computed(() => {
  const r = result.value
  if (!r) return []
  if (!simple.value) return r.trendBars
  const k = r.peak / (Math.max(...r.trendBars) || 1)
  return r.trendBars.map((v) => Math.round(v * k))
})

const trend = computed(() => {
  const r = result.value
  if (!r) return null
  const H = 150
  const bars = trendBars.value
  const n = bars.length
  const s = niceScale(Math.max(...bars))
  const bw = PLOT_W / n
  return {
    h: H,
    grid: s.ticks.map((t) => H - (t / s.max) * H),
    bars: bars.map((v, i) => ({
      x: i * bw + bw * 0.22, w: bw * 0.56,
      y: H - (v / s.max) * H, h: (v / s.max) * H,
    })),
    // Sentiment rides its own 0–80 axis, printed down the right-hand side.
    line: `M${r.trendLine.map((v, i) => `${(i * bw + bw * 0.5).toFixed(1)} ${(H - (v / 80) * H).toFixed(1)}`).join(' L')}`,
    yLabels: [...s.ticks].reverse().map((t) => fmtNum(t)),
    y2Labels: [80, 60, 40, 20, 0],
    xLabels: [0, 2, 4, 6, 8, n - 1].map((i) => dayLabel(i * 3, n * 3, 1)),
  }
})

// Stacked bands, 0–100%. Positive sits on the floor and negative on the ceiling, so the two
// bands anyone actually reads each keep an edge against a real axis instead of floating.
const sentBands = computed(() => {
  const r = result.value
  if (!r) return null
  const H = 130
  const n = r.weeks.length
  const y = (pct) => H - (pct / 100) * H
  const pos = r.weeks.map((w, i) => `${xAt(i, n).toFixed(1)} ${y(w.pos).toFixed(1)}`)
  const top = r.weeks.map((w, i) => `${xAt(i, n).toFixed(1)} ${y(w.pos + w.neu).toFixed(1)}`)
  return {
    h: H,
    grid: [0, 25, 50, 75, 100].map(y),
    posArea: `M${pos.join(' L')} L${PLOT_W} ${H} L0 ${H} Z`,
    neuArea: `M${top.join(' L')} L${[...pos].reverse().join(' L')} Z`,
    negArea: `M${top.join(' L')} L${PLOT_W} 0 L0 0 Z`,
    posLine: `M${pos.join(' L')}`,
    neuLine: `M${top.join(' L')}`,
    yLabels: ['100%', '75%', '50%', '25%', '0%'],
    xLabels: r.weeks.map((w) => w.label),
  }
})

// Radar: eight axes at 45°, zero at the top, clockwise. Drawn at a real 300×176 so nothing
// inside it is scaled.
const RAD = { cx: 150, cy: 89, r: 63 }
function radarPoint(i, pct) {
  const a = (i * 45 * Math.PI) / 180
  const d = (pct / 100) * RAD.r
  return [RAD.cx + d * Math.sin(a), RAD.cy - d * Math.cos(a)]
}
function ring(pct) {
  return Array.from({ length: 8 }, (_, i) => radarPoint(i, pct).map((v) => v.toFixed(1)).join(',')).join(' ')
}
const radar = computed(() => {
  const r = result.value
  if (!r) return null
  return {
    rings: [33, 66, 100].map(ring),
    shape: r.emotions.map((e, i) => radarPoint(i, e.value).map((v) => v.toFixed(1)).join(',')).join(' '),
    dots: r.emotions.map((e, i) => radarPoint(i, e.value)),
    labels: r.emotions.map((e, i) => {
      const [x, y] = radarPoint(i, 128)
      return { label: e.label, x, y: y + 3.5, anchor: i === 0 || i === 4 ? 'middle' : i < 4 ? 'start' : 'end' }
    }),
  }
})

// His Overview Metrics row printed Total / Positive / Neutral / Negative as four separate
// tiles. The split bar is the better mark for one metric divided three ways — but the counts
// are real information, so the legend states both the number and the share rather than only
// the share. Nothing his tiles said is lost.
const toneCounts = computed(() => {
  const r = result.value
  if (!r) return { pos: 0, neu: 0, neg: 0 }
  const pos = Math.round((r.mentions * r.pos) / 100)
  const neu = Math.round((r.mentions * r.neu) / 100)
  return { pos, neu, neg: r.mentions - pos - neu }
})

const engMax = computed(() => (result.value ? Math.max(...result.value.engagement.byWeek) : 1))

// ---- closing lines -----------------------------------------------------------------
// Every overview card ends on a Next step: the card tells you what to do with what it has
// just shown. All four free sections get one, derived from their own figures so the
// sentence can never disagree with the chart above it. The locked sections don't — their
// closing line is the unlock panel.
const DAY_NAMES = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' }

const busiest = computed(() => {
  const r = result.value
  if (!r) return null
  let best = { v: -1 }
  r.heat.forEach((row) => row.cells.forEach((v, c) => {
    if (v > best.v) best = { v, day: row.day, hour: r.heatHours[c] }
  }))
  return best
})

const nextStep = computed(() => {
  const r = result.value
  if (!r) return {}
  const top = r.platforms[0]
  const first = r.weeks[0].pos
  const last = r.weeks[r.weeks.length - 1].pos
  const b = busiest.value
  // Sign-aware: the delta is positive in every seeded result today, but the sentence must
  // not say "up" the day the data says down.
  const moved = r.delta < 0 ? 'down' : 'up'
  return {
    snapshot: simple.value
      ? (r.peakAt === r.series.length - 1
        ? 'See what was posted today.'
        : `See what was posted on ${dayLabel(r.peakAt, r.series.length, r.stepDays)}.`)
      : `Mentions are ${moved} ${Math.abs(r.delta)}% on the previous ${r.range.days} days, and the peak was ${dayLabel(r.peakAt, r.series.length, r.stepDays)}. Check what was posted that day.`,
    sentiment: last > first
      ? 'People feel better about this each week. A good time to join in.'
      : last < first
        ? 'Positive share has slipped over this period. Read the negative posts before your next campaign.'
        : 'Positive share has held steady over this period. Nothing here needs a response yet.',
    trends: b ? `The busiest window is ${DAY_NAMES[b.day]} around ${b.hour}. Schedule your posts for then.`
              : 'Not enough activity yet to name a best time to post.',
    share: top
      ? `${top.label} carries ${top.value}% of this conversation. Start your posting there.`
      : 'No platform has answered yet, so there is no split to read.',
  }
})

// A net score is a level, not a change, so it keeps a sign rather than an arrow. The sign is
// read from the value: a hard-coded "+" printed "+-12" the first time a score went negative.
function signed(n) {
  if (n > 0) return '+' + n
  if (n < 0) return '−' + Math.abs(n)
  return '0'
}

// The tile's verdict, from the same two shares it prints beside it. It used to say "Mostly
// positive" whatever the numbers were.
const leaning = computed(() => {
  const r = result.value
  if (!r) return ''
  if (r.pos >= 50) return 'Mostly positive'
  if (r.neg >= 50) return 'Mostly negative'
  if (r.pos > r.neg) return 'Leaning positive'
  if (r.neg > r.pos) return 'Leaning negative'
  return 'Evenly split'
})

// "Roughly N to one", guarded both ways: with no negative posts the ratio is Infinity, and
// when negative leads the sentence has to turn round rather than print "0 to one".
const toneLine = computed(() => {
  const r = result.value
  if (!r) return ''
  if (!r.pos && !r.neg) return 'Almost everything said here is neutral.'
  if (!r.neg) return 'No negative posts in this window.'
  if (!r.pos) return 'No positive posts in this window.'
  const ratio = r.pos / r.neg
  // 15 Oct (review 4): one plain line, the number in words.
  const words = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
  const say = (n) => words[n] || String(n)
  if (simple.value && ratio >= 1.5) return `About ${say(Math.round(ratio))} positive posts for every negative one.`
  if (simple.value && ratio <= 1 / 1.5) return `About ${say(Math.round(1 / ratio))} negative posts for every positive one.`
  if (ratio >= 1.5) return `Positive posts outnumber negative ones roughly ${Math.round(ratio)} to one.`
  if (ratio <= 1 / 1.5) return `Negative posts outnumber positive ones roughly ${Math.round(1 / ratio)} to one.`
  return 'Positive and negative posts are roughly even.'
})

// The figures the three content-only sections were missing. Each promotes a number the
// section already shows, so nothing new is invented to fill the slot.
const topTopic = computed(() => (result.value?.topics || [])[0] || null)
const fastestTopic = computed(() =>
  [...(result.value?.topics || [])].sort((a, b) => b.change - a.change)[0] || null)
const loudestPost = computed(() => {
  const r = result.value
  if (!r) return null
  return [...r.messages].sort((a, b) =>
    (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares))[0]
})
const postReach = computed(() => {
  const m = loudestPost.value
  return m ? m.likes + m.comments + m.shares : 0
})
const likeShare = computed(() => {
  const r = result.value
  if (!r) return 0
  return (r.engagement.parts.find((x) => x.label === 'Likes') || { value: 0 }).value
})

// Curly quotes around the user's own term, the same way the rest of the product quotes one.
function sectionHeading(s) {
  const t = result.value ? `“${result.value.term}”` : ''
  // 15 Oct: the section promises a time to post, so the title says so.
  if (simple.value && s.id === 'trends') return `When to post about ${t}`
  return `${s.heading} ${t}`
}

// Heatmap steps. Five fills from the primary scale rather than one fill at a computed
// opacity: the quietest cell used to fade to nothing, and a legend can show five steps where
// it could not show a continuous opacity. The floor is dataviz-100, so no cell is invisible.
// 19 Oct (white label): the dark-blue chart scale rather than the brand blue.
const HEAT_STEPS = ['bg-dataviz-100', 'bg-dataviz-200', 'bg-dataviz-300', 'bg-dataviz-500', 'bg-dataviz-700']
function heatStep(v) {
  return HEAT_STEPS[v < 30 ? 0 : v < 45 ? 1 : v < 60 ? 2 : v < 78 ? 3 : 4]
}

// Word cloud, in three type steps from the scale rather than a continuous 13–32px. An exception
// to the 13 / 14 / 16 rule (Ayushi, 19 Oct): it's a word chart, so size carries the data.
function wordStep(n) {
  if (n > 70) return { type: 'display', size: 'xs', color: 'text-gray-900' }
  if (n > 42) return { type: 'text', size: '2xl', color: 'text-gray-900' }
  return { type: 'text', size: 'lg', color: 'text-gray-500' }
}

const TONE_TAG = {
  positive: { color: 'success', label: 'Positive' },
  negative: { color: 'error', label: 'Negative' },
  neutral: { color: 'gray', label: 'Neutral' },
}
// f05: the line above names the leader (or the two tied leaders); the tile names the next one down.
const platTie = computed(() => { const p = result.value?.platforms || []; return !!p[1] && p[1].value === p[0].value })
const nextPlat = computed(() => { const p = result.value?.platforms || []; return p[platTie.value ? 2 : 1] || p[0] || { label: '', value: 0 } })
</script>

<template>
  <div :class="['flex flex-col', simple ? 'gap-6' : 'gap-4']">
        <!-- `@container`: the card grids below respond to the card's own width, not the
             window's. The detail view sits beside a vertical tab rail, so the viewport is a
             poor guide to how much room a card actually has. -->
        <!-- Simplified: staggered entry, hover lift, and a shimmer while a section refreshes. -->
        <div
          v-for="(s, si) in sections" :key="s.id"
          :id="'sec-' + s.id" :data-sec="s.id"
          :style="simple ? { '--i': si } : undefined"
          class="@container bg-white border border-gray-200 rounded-xl overflow-hidden"
          :class="simple ? ['group/sec sl-enter sl-card', refreshing === s.id ? 'sl-refreshing' : ''] : ''"
        >
          <div :key="simple ? (isLocked(s) ? 'locked' : 'open') : undefined" :class="[simple ? 'p-6 sl-enter' : 'p-5']">
            <div class="flex items-center gap-2">
              <SectionChip :icon="ICONS[s.id]" inline :size="simple ? 'md' : 'sm'" />
              <HLText size="md" weight="medium" class="text-gray-500">{{ sectionLabel(s) }}</HLText>
              <!-- The tag is what stops a locked section reading as one that failed to
                   load. It sits on the eyebrow row so the heading keeps its own line. -->
              <HLTag round v-if="isLocked(s)" size="md" :interactive="false">
                <template #icon><Lock01Icon /></template>
                Locked
              </HLTag>
              <!-- Simplified: the open section's actions, shown on hover. -->
              <div
                v-if="simple && !isLocked(s)"
                class="sl-hover-actions ml-auto flex items-center gap-1" role="toolbar"
                :aria-label="`Actions for ${sectionLabel(s)}`"
              >
                <HLTooltip trigger="hover">
                  <template #trigger>
                    <HLButton :id="`sl-sec-ai-${s.id}`" variant="ghost" size="sm" :aria-label="`Ask AI about ${sectionLabel(s)}`" @click="askAbout(s)">
                      <template #iconLeft><Stars01Icon /></template>
                    </HLButton>
                  </template>
                  Ask AI what this means
                </HLTooltip>
                <HLTooltip trigger="hover">
                  <template #trigger>
                    <HLButton :id="`sl-sec-alert-${s.id}`" variant="ghost" size="sm" :aria-label="`Create an alert for ${sectionLabel(s)}`" @click="alertAbout(s)">
                      <template #iconLeft><BellRinging01Icon /></template>
                    </HLButton>
                  </template>
                  Alert me when this changes
                </HLTooltip>
                <HLTooltip v-if="s.id === 'messages'" trigger="hover">
                  <template #trigger>
                    <HLButton :id="`sl-sec-export-${s.id}`" variant="ghost" size="sm" aria-label="Export posts as CSV" @click="exportPosts">
                      <template #iconLeft><Download01Icon /></template>
                    </HLButton>
                  </template>
                  Export posts
                </HLTooltip>
                <!-- 15 Oct (audit 11): no Refresh. It could only say "You're seeing the latest". -->
              </div>
            </div>
            <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900 mt-1!">{{ sectionHeading(s) }}</HLText>

            <!-- ---------- locked: one real figure, the rest named ---------- -->
            <template v-if="isLocked(s)">
              <div v-if="lockedTeaser(s.id)" class="flex items-baseline gap-2 mt-4 flex-wrap">
                <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900 tabular-nums">{{ lockedTeaser(s.id).figure }}</HLText>
                <HLText html-tag="span" size="md" class="text-gray-500">{{ lockedTeaser(s.id).unit }}</HLText>
              </div>
              <HLText v-if="!simple" size="md" class="text-gray-600 mt-2! max-w-[60ch]">
                {{ lockedTeaser(s.id) ? lockedTeaser(s.id).rest : s.blurb }}
              </HLText>
              <!-- Simplified: a blurred preview of the section, with the lock and the action
                   centred on it, in place of the save row below. -->
              <div v-else :id="'sl-locked-' + s.id" class="relative mt-4 h-60 rounded-lg border border-gray-200 overflow-hidden">
                <div class="sl-locked-art absolute inset-0 p-5" aria-hidden="true">
                  <div v-if="s.id === 'engagement'" class="h-full flex items-end gap-3">
                    <div
                      v-for="(h, bi) in lockBars" :key="bi"
                      class="sl-grow-y flex-1 rounded-t-lg bg-linear-to-t from-dataviz-700 to-dataviz-400"
                      :style="{ height: h + '%', '--i': bi }"
                    />
                  </div>
                  <div v-else-if="s.id === 'conversations'" class="h-full flex flex-wrap content-center justify-center items-baseline gap-x-4 gap-y-2">
                    <HLText
                      v-for="w in lockWords" :key="w.w"
                      html-tag="span" :type="wordStep(w.n).type" :size="wordStep(w.n).size" weight="semibold"
                      :class="wordStep(w.n).color"
                    >{{ w.w }}</HLText>
                  </div>
                  <div v-else-if="s.id === 'messages'" class="flex flex-col gap-3">
                    <div v-for="m in lockPosts" :key="m.who" class="flex gap-3 border border-gray-200 rounded-lg p-3">
                      <span class="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
                      <div class="min-w-0 flex-1">
                        <HLText size="md" weight="semibold" class="text-gray-900">{{ m.who }}</HLText>
                        <HLText size="md" class="text-gray-600 truncate">{{ m.text }}</HLText>
                      </div>
                    </div>
                  </div>
                  <div v-else-if="s.id === 'audience'" class="h-full flex flex-col justify-center gap-4">
                    <div v-for="p in lockPlaces" :key="p.label" class="grid grid-cols-[8rem_1fr] items-center gap-4">
                      <HLText html-tag="span" size="md" class="text-gray-900 truncate">{{ p.label }}</HLText>
                      <span class="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                        <span
                          class="sl-grow-x block h-full rounded-full bg-linear-to-r from-dataviz-700 to-dataviz-400"
                          :style="{ width: Math.min(100, p.value * 2.4) + '%' }"
                        />
                      </span>
                    </div>
                  </div>
                </div>
                <div class="sl-locked-veil absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-6">
                  <span class="sl-pop w-10 h-10 rounded-full bg-white border border-gray-200 shadow-(--shadow-md) flex items-center justify-center" aria-hidden="true">
                    <Lock01Icon class="w-5 h-5 text-gray-600" />
                  </span>
                  <HLText size="lg" weight="semibold" class="text-gray-900 mt-1!">Save it as a topic to see this</HLText>
                  <HLText size="md" class="text-gray-600">{{ LOCK_LINES[s.id] }}</HLText>
                  <HLButton class="mt-2" variant="secondary" size="sm" @click="emit('save')">
                    <template #iconLeft><BookmarkIcon /></template>
                    Save as a topic
                  </HLButton>
                </div>
              </div>
            </template>

            <!-- ---------- snapshot ---------- -->
            <template v-else-if="s.id === 'snapshot'">
              <div class="flex items-baseline gap-2 mt-4 flex-wrap">
                <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900 tabular-nums"><CountUp :value="result.mentions" /></HLText>
                <HLText html-tag="span" size="md" class="text-gray-500">mentions {{ result.range.phrase }}</HLText>
                <HLText
                  html-tag="span" size="md" weight="semibold"
                  :class="['inline-flex items-baseline gap-1 tabular-nums',
                    result.delta < 0 ? 'text-negative-strong' : 'text-positive-strong']"
                >
                  <ArrowDownIcon v-if="result.delta < 0" class="w-3.5 h-3.5 self-center" aria-hidden="true" />
                  <ArrowUpIcon v-else class="w-3.5 h-3.5 self-center" aria-hidden="true" />
                  <span class="sr-only">{{ result.delta < 0 ? 'Down' : 'Up' }}</span>
                  {{ Math.abs(result.delta) }}%
                </HLText>
                <template v-if="compareIndustry">
                  <HLText html-tag="span" size="md" class="text-gray-400" aria-hidden="true">·</HLText>
                  <HLText html-tag="span" size="md" class="text-gray-500"><b class="font-semibold text-gray-900 tabular-nums">{{ result.niche.sharePct }}%</b> of your {{ placeWord }}</HLText>
                </template>
              </div>
              <!-- Was "A free snapshot of everything we can see this week", which the heading
                   had already said. The line now carries the one thing only this search knows. -->
              <HLText size="md" class="text-gray-600 mt-2!">
                <template v-if="result.platforms[0].value > 50">Most of the conversation is on <b class="font-semibold text-gray-900">{{ result.platforms[0].label }}</b>.</template><template v-else-if="platTie"><b class="font-semibold text-gray-900">{{ result.platforms[0].label }}</b> and <b class="font-semibold text-gray-900">{{ result.platforms[1].label }}</b> lead, with {{ result.platforms[0].value }}% of mentions each.</template><template v-else><b class="font-semibold text-gray-900">{{ result.platforms[0].label }}</b> leads, with {{ result.platforms[0].value }}% of mentions.</template>
              </HLText>

              <!-- The tiles take the same chip as the eyebrow above them, so the card carries
                   one icon treatment rather than a 24px chip and a 36px one. -->
              <div class="grid grid-cols-1 @2xl:grid-cols-3 gap-6 mt-4">
                <div class="@2xl:pr-6 @2xl:border-r border-gray-200 flex flex-col gap-2">
                  <SectionChip :icon="MessageChatCircleIcon" inline :size="simple ? 'md' : 'sm'" />
                  <!-- 15 Oct (review 3): the count already leads the section, so this says something new. -->
                  <template v-if="simple">
                    <HLText html-tag="h3" size="lg" weight="semibold" class="text-gray-900">Busiest day</HLText>
                    <HLText size="md" class="text-gray-600">
                      <b class="font-semibold text-gray-900">{{ result.peakAt === result.series.length - 1 ? 'Today' : dayLabel(result.peakAt, result.series.length, result.stepDays) }}</b>, at
                      <b class="font-semibold text-gray-900 tabular-nums">{{ result.peakMultiple }}×</b> a normal day.
                    </HLText>
                  </template>
                  <template v-else>
                    <HLText html-tag="h3" size="lg" weight="semibold" class="text-gray-900">Mentions</HLText>
                    <HLText size="md" class="text-gray-600">
                      <b class="font-semibold text-gray-900 tabular-nums">{{ fmtNum(result.mentions) }}</b> posts, comments and replies mention it.
                    </HLText>
                  </template>
                </div>
                <div class="@2xl:pr-6 @2xl:border-r border-gray-200 flex flex-col gap-2">
                  <SectionChip :icon="PieChart01Icon" inline :size="simple ? 'md' : 'sm'" />
                  <!-- f05 (21 Oct final): the line above already names the busiest platform and its share,
                       so this tile names the next one instead of repeating it. -->
                  <HLText html-tag="h3" size="lg" weight="semibold" class="text-gray-900">{{ nextPlat === result.platforms[0] ? 'Busiest platform' : 'Next busiest platform' }}</HLText>
                  <!-- This slot held "Reach", the second-biggest number on the screen, which
                       nothing in the prototype or the call ever defined. Cut rather than
                       guessed at. If Shivam can say what Reach counts it comes back here. -->
                  <HLText size="md" class="text-gray-600">
                    <b class="font-semibold text-gray-900">{{ nextPlat.label }}</b>, with
                    <b class="font-semibold text-gray-900 tabular-nums">{{ nextPlat.value }}%</b> of mentions.
                  </HLText>
                </div>
                <div class="flex flex-col gap-2">
                  <SectionChip :icon="FaceSmileIcon" inline :size="simple ? 'md' : 'sm'" />
                  <HLText html-tag="h3" size="lg" weight="semibold" class="text-gray-900">{{ simple ? 'How people feel' : 'Net sentiment' }}</HLText>
                  <HLText size="md" class="text-gray-600">
                    {{ leaning }}, <b class="font-semibold text-gray-900 tabular-nums">{{ result.pos }}%</b> positive
                    against <b class="font-semibold text-gray-900 tabular-nums">{{ result.neg }}%</b> negative.
                  </HLText>
                </div>
              </div>

              <!-- Shared with the Overview mentions card (7 Oct), so both draw the same graph. -->
              <!-- 19 Oct spacing pass: no box inside the section's box (Sujit), so the graph sits flat. -->
              <VolumeTrend
                flat class="mt-8" :series="result.series" :labels="volLabels"
                :subtitle="`Mentions of “${result.term}” ${result.range.phrase}`"
                :aria-label="`Mentions of ${result.term} peaking at ${fmtNum(result.peak)} in the window`"
              />
              <HLText size="md" class="text-gray-600 mt-6! pt-4 border-t border-gray-200">
                <span class="font-semibold text-gray-900">Next step:</span> {{ nextStep.snapshot }}
              </HLText>
            </template>

            <!-- ---------- sentiment ---------- -->
            <template v-else-if="s.id === 'sentiment'">
              <div class="flex items-baseline gap-2 mt-4 flex-wrap">
                <!-- 15 Oct (review 4): the one-page design leads with the share people read, not a
                     −100 to +100 score nobody uses. -->
                <template v-if="simple">
                  <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900 tabular-nums">{{ result.pos }}%</HLText>
                  <HLText html-tag="span" size="md" class="text-gray-500">positive · {{ result.neg }}% negative</HLText>
                  <template v-if="compareIndustry">
                    <HLText html-tag="span" size="md" class="text-gray-400" aria-hidden="true">·</HLText>
                    <HLText html-tag="span" size="md" class="text-gray-500">your industry is <b class="font-semibold text-gray-900 tabular-nums">{{ industryPositive }}%</b> positive</HLText>
                  </template>
                </template>
                <template v-else>
                <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900 tabular-nums">{{ signed(result.net) }}</HLText>
                <HLText html-tag="span" size="md" class="text-gray-500">net sentiment, from −100 to +100</HLText>
                <template v-if="compareIndustry">
                  <HLText html-tag="span" size="md" class="text-gray-400" aria-hidden="true">·</HLText>
                  <HLText html-tag="span" size="md" class="text-gray-500">your {{ placeWord }} sits at <b class="font-semibold text-gray-900 tabular-nums">{{ signed(result.niche.sentiment) }}</b></HLText>
                </template>
                </template>
              </div>
              <HLText size="md" class="text-gray-600 mt-2!">{{ toneLine }}</HLText>
              <!-- A three-way split has no HLProgress equivalent, so it stays hand-built. -->
              <div class="flex h-2.5 rounded-full overflow-hidden mt-4">
                <ChartTip :lines="['Positive', `${result.pos}% of posts`, `${fmtNum(toneCounts.pos)} posts`]">
                  <span :class="['block h-full bg-positive', simple ? 'sl-seg' : '']" :style="{ width: result.pos + '%' }" />
                </ChartTip>
                <ChartTip :lines="['Neutral', `${result.neu}% of posts`, `${fmtNum(toneCounts.neu)} posts`]">
                  <span :class="['block h-full bg-gray-300', simple ? 'sl-seg' : '']" :style="{ width: result.neu + '%' }" />
                </ChartTip>
                <ChartTip :lines="['Negative', `${result.neg}% of posts`, `${fmtNum(toneCounts.neg)} posts`]">
                  <span :class="['block h-full bg-negative', simple ? 'sl-seg' : '']" :style="{ width: result.neg + '%' }" />
                </ChartTip>
              </div>
              <div class="flex gap-4 mt-2 flex-wrap">
                <HLText html-tag="span" size="md" class="flex items-center gap-2 text-gray-600">
                  <i class="w-2.5 h-2.5 bg-positive" />Positive {{ fmtNum(toneCounts.pos) }} · {{ result.pos }}%
                </HLText>
                <HLText html-tag="span" size="md" class="flex items-center gap-2 text-gray-600">
                  <i class="w-2.5 h-2.5 bg-gray-300" />Neutral {{ fmtNum(toneCounts.neu) }} · {{ result.neu }}%
                </HLText>
                <HLText html-tag="span" size="md" class="flex items-center gap-2 text-gray-600">
                  <i class="w-2.5 h-2.5 bg-negative" />Negative {{ fmtNum(toneCounts.neg) }} · {{ result.neg }}%
                </HLText>
              </div>

              <!-- Two up only once the card can hold the radar's 300px beside the bands. -->
              <div class="grid grid-cols-1 @3xl:grid-cols-2 gap-12 gap-y-8 mt-8">
                <!-- Option B: no gauge. The card has already stated net sentiment three times
                     above — the 28px figure, the 100% split bar, and the legend spelling out the
                     three shares — and a semicircle is the weakest way to read a single value.
                     Dropping it lets the radar, the one thing here the figure cannot say, sit at
                     a readable size instead of being squeezed into half a column. -->
                <div class="min-w-0">
                  <HLText html-tag="h3" size="lg" weight="semibold" class="text-gray-900">Emotions in the posts</HLText>
                  <HLText size="md" class="text-gray-500 mb-3!">How strongly each feeling comes through</HLText>
                  <!-- Real width and height, centred. This one is intrinsically sized, so it must
                       never be stretched to the column — that is what blew its labels up to 34px. -->
                  <div class="flex justify-center items-center h-44">
                    <!-- Simplified: a box the size of the radar, so each dot can carry a hover target. -->
                    <component :is="simple ? 'div' : Bare" v-bind="simple ? { class: 'relative w-75 h-44' } : {}">
                    <svg width="300" height="176" viewBox="0 0 300 176" role="img"
                      aria-label="Emotion profile across eight emotions">
                      <polygon v-for="(pts, i) in radar.rings" :key="i" :points="pts" fill="none" stroke="var(--color-gray-200)" />
                      <line x1="150" y1="89" x2="150" y2="26" stroke="var(--color-gray-200)" />
                      <line x1="150" y1="89" x2="213" y2="89" stroke="var(--color-gray-200)" />
                      <line x1="150" y1="89" x2="150" y2="152" stroke="var(--color-gray-200)" />
                      <line x1="150" y1="89" x2="87" y2="89" stroke="var(--color-gray-200)" />
                      <polygon :points="radar.shape" fill="var(--color-chart-strong)" fill-opacity=".12"
                        stroke="var(--color-chart-strong)" stroke-width="2" stroke-linejoin="round" />
                      <circle v-for="(d, i) in radar.dots" :key="'rd' + i" :cx="d[0]" :cy="d[1]" r="2.4" fill="var(--color-chart-strong)" />
                      <text v-for="l in radar.labels" :key="l.label" :x="l.x" :y="l.y" :text-anchor="l.anchor"
                        class="text-hr-md font-medium" fill="var(--color-gray-500)">{{ l.label }}</text>
                    </svg>
                    <template v-if="simple">
                      <ChartTip v-for="d in radarHits" :key="d.label" :lines="[d.label, `${d.value} out of 100`]">
                        <span class="sl-hit-dot absolute w-4 h-4 -ml-2 -mt-2 rounded-full" :style="{ left: d.left, top: d.top }" />
                      </ChartTip>
                    </template>
                    </component>
                  </div>
                </div>
                <div class="min-w-0">
                  <HLText html-tag="h3" size="lg" weight="semibold" class="text-gray-900">Sentiment over time</HLText>
                  <HLText size="md" class="text-gray-500 mb-3!">Positive, neutral and negative posts, last 4 weeks</HLText>
                  <div class="relative pt-4">
                    <div class="absolute left-0 top-4 w-9 flex flex-col justify-between items-end"
                      :style="{ height: sentBands.h + 'px' }">
                      <HLText v-for="l in sentBands.yLabels" :key="l" html-tag="span" size="md" class="text-gray-400 tabular-nums">{{ l }}</HLText>
                    </div>
                    <div class="ml-11">
                      <svg :viewBox="`0 0 ${PLOT_W} ${sentBands.h}`" preserveAspectRatio="none" :height="sentBands.h"
                        class="w-full block" role="img" aria-label="Share of posts in each tone, week by week">
                        <line v-for="(g, i) in sentBands.grid" :key="i" x1="0" :x2="PLOT_W" :y1="g" :y2="g"
                          stroke="var(--color-gray-200)" vector-effect="non-scaling-stroke" />
                        <path :d="sentBands.negArea" fill="var(--color-negative-light)" />
                        <path :d="sentBands.neuArea" fill="var(--color-gray-100)" />
                        <path :d="sentBands.posArea" fill="var(--color-positive-light)" />
                        <path :d="sentBands.neuLine" fill="none" stroke="var(--color-negative)" stroke-width="2" vector-effect="non-scaling-stroke" />
                        <path :d="sentBands.posLine" fill="none" stroke="var(--color-positive)" stroke-width="2" vector-effect="non-scaling-stroke" />
                      </svg>
                    </div>
                    <!-- Simplified: one hover column per week, over the plot. -->
                    <div v-if="simple" class="absolute top-4 left-11 right-0" :style="{ height: sentBands.h + 'px' }">
                      <ChartTip
                        v-for="(w, wi) in result.weeks" :key="w.label"
                        :lines="[w.label, `${w.pos}% positive`, `${w.neu}% neutral`, `${w.neg}% negative`]"
                      >
                        <span class="sl-hit-col absolute top-0 bottom-0" :style="hitCol(wi, result.weeks.length)" :aria-label="`${w.label}: ${w.pos}% positive`" />
                      </ChartTip>
                    </div>
                    <div class="ml-11 flex justify-between mt-2">
                      <HLText v-for="l in sentBands.xLabels" :key="l" html-tag="span" size="md" class="text-gray-400">{{ l }}</HLText>
                    </div>
                    <!-- Area swatches, because every tone here is a band: each is the band's
                         fill with its edge colour. The two lines are band edges, green where the
                         positive band ends and red where the negative band begins. -->
                    <div class="flex justify-center gap-4 mt-2">
                      <HLText html-tag="span" size="md" class="flex items-center gap-2 text-gray-600"><i class="w-2.5 h-2.5 bg-positive-light border border-positive" />Positive</HLText>
                      <HLText html-tag="span" size="md" class="flex items-center gap-2 text-gray-600"><i class="w-2.5 h-2.5 bg-gray-100 border border-gray-300" />Neutral</HLText>
                      <HLText html-tag="span" size="md" class="flex items-center gap-2 text-gray-600"><i class="w-2.5 h-2.5 bg-negative-light border border-negative" />Negative</HLText>
                    </div>
                  </div>
                </div>
              </div>
              <HLText size="md" class="text-gray-600 mt-6! pt-4 border-t border-gray-200">
                <span class="font-semibold text-gray-900">Next step:</span> {{ nextStep.sentiment }}
              </HLText>
            </template>

            <!-- ---------- engagement ---------- -->
            <template v-else-if="s.id === 'engagement'">
              <div class="flex items-baseline gap-2 mt-4 flex-wrap">
                <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900 tabular-nums">{{ fmtNum(result.engagement.total) }}</HLText>
                <HLText html-tag="span" size="md" class="text-gray-500">{{ simple ? 'likes, comments, shares and saves' : 'total interactions' }}</HLText>
                <!-- No niche comparison here. The rate it was measured against came from the
                     niche's NAME, not from any data, and it sat beside real derivations —
                     which made the whole row look equally sourced. Comes back when there is a
                     real per-niche engagement rate to read. -->
              </div>
              <HLText size="md" class="text-gray-600 mt-2!">
                <template v-if="simple">Likes are {{ likeShare }}% of it.<template v-if="likeShare > 50"> People react more than they reply.</template></template>
                <template v-else>Likes make up {{ likeShare }}% of all interactions.<template v-if="likeShare > 50"> People react more than they comment.</template></template>
              </HLText>
              <div class="grid grid-cols-1 @2xl:grid-cols-2 gap-12 gap-y-8 mt-8">
                <div class="min-w-0">
                  <HLText html-tag="h3" size="lg" weight="semibold" class="text-gray-900">Interactions over time</HLText>
                  <HLText size="md" class="text-gray-500 mb-3!">{{ simple ? 'Each week, last 6 weeks' : 'Interactions per week, last six weeks' }}</HLText>
                  <component :is="simple ? 'div' : Bare" v-bind="simple ? { class: 'relative' } : {}">
                  <svg viewBox="0 0 400 120" preserveAspectRatio="none" height="120" class="w-full block" aria-hidden="true">
                    <rect v-for="(v, i) in result.engagement.byWeek" :key="i"
                      :x="8 + i * 65" :y="120 - (v / engMax) * 112" width="48" :height="(v / engMax) * 112"
                      fill="var(--color-chart-strong)" />
                  </svg>
                  <template v-if="simple">
                    <ChartTip v-for="(v, i) in result.engagement.byWeek" :key="'eh' + i" :lines="[`Week ${i + 1}`, `${fmtNum(v)} interactions`]">
                      <span class="sl-hit-col absolute top-0 bottom-0" :style="{ left: ((8 + i * 65) / 400) * 100 + '%', width: '12%' }" />
                    </ChartTip>
                  </template>
                  </component>
                </div>
                <div class="min-w-0">
                  <HLText html-tag="h3" size="lg" weight="semibold" class="text-gray-900">Interactions by type</HLText>
                  <HLText size="md" class="text-gray-500 mb-3!">Likes, comments, shares and saves, as a share of the total</HLText>
                  <ChartTip
                    v-for="(p, i) in result.engagement.parts" :key="p.label"
                    :lines="[p.label, `${p.value}% of all interactions`, `About ${fmtNum(Math.round((result.engagement.total * p.value) / 100))}`]"
                  >
                    <div :class="['grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_3rem] items-center gap-4 py-2', simple ? 'sl-row-hover' : '']">
                      <HLText html-tag="span" size="md" class="text-gray-900 truncate">{{ p.label }}</HLText>
                      <HLProgress
                        :id="'sl-eng-' + i" type="line" :percentage="p.value" :show-indicator="false" :height="10"
                        color="var(--color-chart-strong)" rail-color="var(--color-gray-100)"
                        :aria-label="`${p.label}, ${p.value}%`"
                      />
                      <HLText html-tag="span" size="md" weight="semibold" class="text-gray-900 text-right tabular-nums">{{ p.value }}%</HLText>
                    </div>
                  </ChartTip>
                </div>
              </div>
            </template>

            <!-- ---------- trends ---------- -->
            <template v-else-if="s.id === 'trends'">
              <div class="flex items-baseline gap-2 mt-4 flex-wrap">
                <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900 tabular-nums">{{ fmtNum(result.peak) }}</HLText>
                <HLText html-tag="span" size="md" class="text-gray-500">mentions on the busiest day</HLText>
                <HLText html-tag="span" size="md" class="text-gray-400" aria-hidden="true">·</HLText>
                <HLText html-tag="span" size="md" class="text-gray-500"><b class="font-semibold text-gray-900 tabular-nums">{{ result.peakMultiple }}×</b> a normal day</HLText>
              </div>
              <div class="mt-8">
                <HLText html-tag="h3" size="lg" weight="semibold" class="text-gray-900">{{ simple ? 'Mentions and sentiment, last 6 weeks' : 'Mentions and sentiment over time' }}</HLText>
                <HLText size="md" class="text-gray-500 mb-3!">{{ simple ? '' : 'How mentions and sentiment moved across the date range' }}</HLText>
                <div class="relative">
                  <div class="absolute left-0 top-0 w-9 flex flex-col justify-between items-end" :style="{ height: trend.h + 'px' }">
                    <HLText v-for="l in trend.yLabels" :key="l" html-tag="span" size="md" class="text-gray-400 tabular-nums">{{ l }}</HLText>
                  </div>
                  <div class="absolute right-0 top-0 w-7 flex flex-col justify-between items-start" :style="{ height: trend.h + 'px' }">
                    <HLText v-for="l in trend.y2Labels" :key="l" html-tag="span" size="md" class="text-gray-400 tabular-nums">{{ l }}</HLText>
                  </div>
                  <div class="ml-11 mr-9">
                    <svg :viewBox="`0 0 ${PLOT_W} ${trend.h}`" preserveAspectRatio="none" :height="trend.h"
                      class="w-full block" role="img" aria-label="Mentions and sentiment over time">
                      <line v-for="(g, i) in trend.grid" :key="i" x1="0" :x2="PLOT_W" :y1="g" :y2="g"
                        stroke="var(--color-gray-200)" vector-effect="non-scaling-stroke" />
                      <rect v-for="(b, i) in trend.bars" :key="'b' + i" :x="b.x" :y="b.y" :width="b.w" :height="b.h"
                        fill="var(--color-chart-soft)" />
                      <path :d="trend.line" fill="none" stroke="var(--color-positive)" stroke-width="2"
                        stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
                    </svg>
                  </div>
                  <!-- Simplified: one hover column per bar. -->
                  <div v-if="simple" class="absolute top-0 left-11 right-9 flex" :style="{ height: trend.h + 'px' }">
                    <ChartTip
                      v-for="(v, bi) in trendBars" :key="'tb' + bi"
                      :lines="[dayLabel(bi * 3, result.trendBars.length * 3, 1), `${fmtNum(v)} mentions`, `Sentiment score ${result.trendLine[bi]}`]"
                    >
                      <span class="sl-hit-col flex-1 h-full" />
                    </ChartTip>
                  </div>
                  <div class="ml-11 mr-9 flex justify-between mt-2">
                    <HLText v-for="l in trend.xLabels" :key="l" html-tag="span" size="md" class="text-gray-400">{{ l }}</HLText>
                  </div>
                  <div class="flex justify-center gap-4 mt-2">
                    <HLText html-tag="span" size="md" class="flex items-center gap-2 text-gray-600"><i class="w-2.5 h-2.5 bg-chart-soft" />Mentions</HLText>
                    <HLText html-tag="span" size="md" class="flex items-center gap-2 text-gray-600"><i class="w-3 h-0.5 rounded-full bg-positive" />Sentiment score</HLText>
                  </div>
                </div>
              </div>
              <div class="mt-8">
                <HLText html-tag="h3" size="lg" weight="semibold" class="text-gray-900">Busiest times</HLText>
                <HLText size="md" class="text-gray-500 mb-3!">{{ simple ? result.range.label : 'Posts by day of the week and hour' }}</HLText>
                <div
                  class="grid grid-cols-[2.25rem_repeat(8,minmax(0,1fr))] gap-1" role="img"
                  :aria-label="busiest ? `Activity by day and hour. Busiest on ${DAY_NAMES[busiest.day]} around ${busiest.hour}.` : 'Activity by day and hour'"
                >
                  <template v-for="row in result.heat" :key="row.day">
                    <HLText html-tag="span" size="md" class="text-gray-400 flex items-center justify-end pr-2">{{ row.day }}</HLText>
                    <ChartTip v-for="(c, i) in row.cells" :key="i" :lines="[`${DAY_NAMES[row.day]} around ${result.heatHours[i]}`, heatWord(c)]">
                      <span :class="['h-6', heatStep(c), simple ? 'sl-heat-cell' : '']" />
                    </ChartTip>
                  </template>
                  <span />
                  <HLText v-for="h in result.heatHours" :key="h" html-tag="span" size="md" class="text-gray-400 text-center pt-1">{{ h }}</HLText>
                </div>
                <!-- The steps, so darkness is read against a key rather than guessed at. -->
                <HLText html-tag="div" size="md" class="flex items-center justify-end gap-2 mt-3! text-gray-500">
                  <span>Quieter</span>
                  <i v-for="c in HEAT_STEPS" :key="c" :class="['w-3 h-3', c]" />
                  <span>Busier</span>
                </HLText>
              </div>
              <HLText size="md" class="text-gray-600 mt-6! pt-4 border-t border-gray-200">
                <span class="font-semibold text-gray-900">Next step:</span> {{ nextStep.trends }}
              </HLText>
            </template>

            <!-- ---------- conversation insights ---------- -->
            <template v-else-if="s.id === 'conversations'">
              <template v-if="topTopic">
                <div class="flex items-baseline gap-2 mt-4 flex-wrap">
                  <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900 tabular-nums">{{ fmtNum(topTopic.value) }}</HLText>
                  <HLText html-tag="span" size="md" class="text-gray-500">mentions of “{{ topTopic.label }}”, the biggest theme</HLText>
                </div>
                <HLText size="md" class="text-gray-600 mt-2!">
                  <template v-if="fastestTopic && fastestTopic.label !== topTopic.label && fastestTopic.change > 0">
                    {{ fastestTopic.label }} is growing fastest, up {{ fastestTopic.change }}%.
                  </template>
                  <template v-else>It’s also growing fastest.</template>
                </HLText>
              </template>
              <HLText v-else size="md" class="text-gray-600 mt-4!">No topics have formed around it yet.</HLText>
              <div class="mt-8">
                <HLText html-tag="h3" size="lg" weight="semibold" class="text-gray-900">Words people use most</HLText>
                <div class="mb-3" />
                <div class="flex flex-wrap gap-x-4 gap-y-2 items-baseline justify-center py-2">
                  <HLText
                    v-for="w in result.words" :key="w.w"
                    html-tag="span" :type="wordStep(w.n).type" :size="wordStep(w.n).size" weight="semibold"
                    :class="wordStep(w.n).color"
                  >{{ w.w }}</HLText>
                </div>
              </div>
              <div class="grid grid-cols-1 @2xl:grid-cols-2 gap-12 gap-y-8 mt-8">
                <div class="min-w-0">
                  <HLText html-tag="h3" size="lg" weight="semibold" class="text-gray-900">Trending topics</HLText>
                  <HLText size="md" class="text-gray-500 mb-1!">Mentions per topic, and the change since the last period</HLText>
                  <HLText v-for="(t, i) in result.topics" :key="t.label"
                    html-tag="div" size="md"
                    :class="['flex items-center justify-between gap-3 py-2', i !== result.topics.length - 1 ? 'border-b border-gray-100' : '']">
                    <span class="text-gray-900 truncate">{{ t.label }}</span>
                    <span class="flex gap-3 shrink-0 tabular-nums">
                      <span class="text-gray-600">{{ fmtNum(t.value) }}</span>
                      <span :class="['inline-flex items-center gap-1 font-semibold', t.change < 0 ? 'text-negative-strong' : 'text-positive-strong']">
                        <ArrowDownIcon v-if="t.change < 0" class="w-3.5 h-3.5" aria-hidden="true" />
                        <ArrowUpIcon v-else class="w-3.5 h-3.5" aria-hidden="true" />
                        <span class="sr-only">{{ t.change < 0 ? 'Down' : 'Up' }}</span>
                        {{ Math.abs(t.change) }}%
                      </span>
                    </span>
                  </HLText>
                </div>
                <div class="min-w-0">
                  <HLText html-tag="h3" size="lg" weight="semibold" class="text-gray-900">Trending hashtags</HLText>
                  <HLText size="md" class="text-gray-500 mb-1!">Posts using each tag</HLText>
                  <div v-for="(h, i) in result.hashtags" :key="h.label"
                    :class="['flex items-center justify-between gap-3 py-2', i !== result.hashtags.length - 1 ? 'border-b border-gray-100' : '']">
                    <!-- Gray, not link blue: nothing here opens anything yet. -->
                    <HLText html-tag="span" size="md" class="text-gray-900 truncate">{{ h.label }}</HLText>
                    <span class="flex gap-2 items-center shrink-0 tabular-nums">
                      <HLTag round v-if="h.isNew" size="md" color="gray" :interactive="false">New</HLTag>
                      <HLText html-tag="span" size="md" class="text-gray-600">{{ fmtNum(h.value) }}</HLText>
                    </span>
                  </div>
                </div>
              </div>
            </template>

            <!-- ---------- share of voice ---------- -->
            <template v-else-if="s.id === 'share'">
              <div class="flex items-baseline gap-2 mt-4 flex-wrap">
                <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900 tabular-nums">{{ result.platforms[0].value }}%</HLText>
                <HLText html-tag="span" size="md" class="text-gray-500">of mentions are on {{ result.platforms[0].label }}</HLText>
                <!-- Same reason: the niche's "preferred platform" was a char sum, not a
                     measurement. The share rows below are real and carry this card on their own. -->
              </div>
              <!-- Same 100% track as the Competitors card on the overview, so a 25% bar is
                   the same length on both tabs. The prototype used a treemap here, which
                   answered the same question with a different mark. -->
              <HLText size="md" class="text-gray-600 mt-2!">
                <template v-if="simple && result.down">{{ result.down }} isn’t included this time.</template>
              </HLText>
              <!-- In the card, not in a page banner: a reader who scrolls past the top would
                   otherwise never learn the denominator moved. The shares still total 100
                   without the missing platform, so nothing here looks wrong on its own. -->
              <div v-if="result.down && !simple" class="mt-4">
                <HLAlert
                  id="sl-share-down" color="orange"
                  :title="`${result.down} didn't respond`"
                  content="These shares add to 100% without it."
                />
              </div>
              <div class="flex flex-col mt-3">
                <ChartTip
                  v-for="(p, i) in result.platforms" :key="p.label"
                  :lines="[p.label, `${p.value}% of mentions`, aboutPosts(p.value, result.mentions)]"
                >
                  <div :class="['grid grid-cols-[minmax(0,12.5rem)_minmax(0,1fr)_3rem] items-center gap-4 py-2', simple ? 'sl-row-hover' : '']">
                    <HLText html-tag="span" size="md" class="text-gray-900 min-w-0 truncate">{{ p.label }}</HLText>
                    <HLProgress
                      :id="'sl-share-' + i" type="line" :percentage="p.value" :show-indicator="false" :height="10"
                      color="var(--color-chart-strong)" rail-color="var(--color-gray-100)"
                      :aria-label="`${p.label}, ${p.value}%`"
                    />
                    <HLText html-tag="span" size="md" weight="semibold" class="text-gray-900 text-right tabular-nums">{{ p.value }}%</HLText>
                  </div>
                </ChartTip>
              </div>
              <HLText size="md" class="text-gray-600 mt-6! pt-4 border-t border-gray-200">
                <span class="font-semibold text-gray-900">Next step:</span> {{ nextStep.share }}
              </HLText>
            </template>

            <!-- ---------- messages ---------- -->
            <template v-else-if="s.id === 'messages'">
              <div class="flex items-baseline gap-2 mt-4 flex-wrap">
                <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900 tabular-nums">{{ fmtNum(postReach) }}</HLText>
                <HLText html-tag="span" size="md" class="text-gray-500">interactions on the top post</HLText>
              </div>
                            <!-- A source with no filter support is shown, marked and not clickable. Hiding
                   it would read as "we don't cover Reddit", which is not what it means. The
                   reason sits in a tooltip on its label, since a disabled segment takes no focus. -->
              <div class="mt-4">
                <HLRadioGroup
                  id="sl-msg-platforms" size="sm" theme="neutral"
                  :value="switcherValue" @update:value="pickPlatform"
                >
                  <HLContentSwitcher id="sl-msg-platform-all" value="All" label="All" />
                  <HLContentSwitcher
                    v-for="pf in msgPlatforms" :key="pf.label"
                    :id="'sl-msg-platform-' + pf.key" :value="pf.label"
                    :label="pf.supported ? pf.label : undefined" :disabled="!pf.supported"
                  >
                    <!-- Greyscale rather than a slash badge: a full-colour logo on a dead
                         control reads as a bug, and two marks on one chip is one too many. -->
                    <template v-if="NETWORK_ICONS[pf.key]" #icon>
                      <component :is="NETWORK_ICONS[pf.key]" :class="['w-4 h-4', pf.supported ? '' : 'grayscale opacity-50']" />
                    </template>
                    <HLTooltip v-if="!pf.supported" placement="top">
                      <template #trigger><HLText html-tag="span" size="lg" weight="semibold">{{ pf.label }}</HLText></template>
                      Filtering by {{ pf.label }} is not available on this table yet
                    </HLTooltip>
                  </HLContentSwitcher>
                </HLRadioGroup>
              </div>
              <div v-if="visibleMessages.length" class="flex flex-col mt-4">
                <div v-for="m in visibleMessages" :key="m.who" class="px-1 py-4 border-t border-gray-200 last:border-b flex gap-3">
                  <!-- The source mark, not the author's initials: it is what the filter above
                       selects on, so the row should show it. -->
                  <HLAvatar size="xs" round preferred-initials-bg-color="var(--color-gray-50)" class="shrink-0" :aria-label="m.platform">
                    <component :is="NETWORK_ICONS[PLATFORM_KEY[m.platform]]" class="w-4 h-4" />
                  </HLAvatar>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <HLText html-tag="span" size="md" weight="semibold" class="text-gray-900">{{ m.who }}</HLText>
                      <HLText html-tag="span" size="md" class="text-gray-500">{{ m.handle }} · {{ m.ago }}</HLText>
                      <HLTag round class="ml-auto" size="md" :color="TONE_TAG[m.tone].color" :interactive="false">{{ TONE_TAG[m.tone].label }}</HLTag>
                    </div>
                    <HLText size="md" class="text-gray-600 mt-1!">{{ m.text }}</HLText>
                    <HLText html-tag="div" size="md" class="flex gap-4 text-gray-500 mt-2! tabular-nums">
                      <span>{{ fmtNum(m.likes) }} likes</span>
                      <span>{{ fmtNum(m.comments) }} comments</span>
                      <span>{{ fmtNum(m.shares) }} shares</span>
                    </HLText>
                  </div>
                </div>
              </div>
              <div v-if="filteredMessages.length > visibleMessages.length" class="flex justify-center mt-4">
                <HLButton id="sl-msg-more" variant="secondary" size="sm" @click="postsShown += POSTS_STEP">
                  Show more
                  <template #iconRight><ChevronDownIcon /></template>
                </HLButton>
              </div>
              <!-- .sl-empty sets the 16px title; see the style block in TopicDetail.vue. -->
              <div v-else class="border border-gray-200 rounded-lg py-8 px-6 mt-4 flex justify-center sl-empty">
                <HLEmpty
                  id="sl-msg-empty" size="md" icon="default"
                  title="No posts from these platforms"
                  :description="`Nothing on ${selectedPlatforms.join(', ')} mentions it ${result.range.phrase}.`"
                >
                  <template #actions>
                    <HLButton variant="secondary" size="sm" @click="pickPlatform('All')">Show all platforms</HLButton>
                  </template>
                </HLEmpty>
              </div>
            </template>

            <!-- ---------- audience ---------- -->
            <template v-else-if="s.id === 'audience'">
              <div class="flex items-baseline gap-2 mt-4 flex-wrap">
                <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900 tabular-nums">{{ result.audience.language[0].value }}%</HLText>
                <HLText html-tag="span" size="md" class="text-gray-500">of the conversation is in {{ result.audience.language[0].label }}</HLText>
              </div>
              <!-- No age block: Infigi does not return it, so it was a table of invented
                   numbers. Language and Top locations are the two Audience facts that exist. -->
              <HLText size="md" class="text-gray-600 mt-2!">More posts come from {{ /^United|^Netherlands|^Philippines/.test(result.audience.places[0].label) ? 'the ' : '' }}{{ result.audience.places[0].label }} than anywhere else ({{ result.audience.places[0].value }}%).</HLText>
              <div class="grid grid-cols-1 @2xl:grid-cols-2 gap-12 gap-y-8 mt-8">
                <div v-for="(g, gi) in [
                  { title: 'Language', sub: 'Share of posts in each language', rows: result.audience.language },
                  { title: 'Top locations', sub: 'Where people post from', rows: result.audience.places },
                ]" :key="g.title" class="min-w-0">
                  <HLText html-tag="h3" size="lg" weight="semibold" class="text-gray-900">{{ g.title }}</HLText>
                  <HLText size="md" class="text-gray-500 mb-3!">{{ g.sub }}</HLText>
                  <ChartTip
                    v-for="(row, ri) in g.rows" :key="row.label"
                    :lines="[row.label, `${row.value}% of posts`, aboutPosts(row.value, result.mentions)]"
                  >
                    <div :class="['grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_3rem] items-center gap-4 py-2', simple ? 'sl-row-hover' : '']">
                      <HLText html-tag="span" size="md" class="text-gray-900 truncate">{{ row.label }}</HLText>
                      <HLProgress
                        :id="`sl-aud-${gi}-${ri}`" type="line" :percentage="row.value" :show-indicator="false" :height="10"
                        :color="row.rest ? 'var(--color-chart-faint)' : 'var(--color-chart-strong)'" rail-color="var(--color-gray-100)"
                        :aria-label="`${row.label}, ${row.value}%`"
                      />
                      <HLText html-tag="span" size="md" weight="semibold" class="text-gray-900 text-right tabular-nums">{{ row.value }}%</HLText>
                    </div>
                  </ChartTip>
                </div>
              </div>
            </template>
          </div>

          <!-- The action is a row inside the card rather than a panel floating over it.
               Same surface, same border, no second card and nothing blurred. Secondary: the
               back bar's Save as topic is the page's one primary, and four more below it
               made every card shout the same thing. -->
          <div v-if="isLocked(s) && !simple" class="flex items-center gap-4 flex-wrap px-5 py-4 border-t border-gray-200 bg-gray-50">
            <HLText size="md" class="text-gray-600">
              <span class="font-semibold text-gray-900">Save this topic</span> to open it, and to keep listening to it.
            </HLText>
            <HLButton class="ml-auto" variant="secondary" size="sm" @click="emit('save')">
              <template #iconLeft><BookmarkIcon /></template>
              Save as topic
            </HLButton>
          </div>
        </div>

        <!-- The unlock bar stood here. It sold the four locked sections, and nothing is
             locked in beta. It comes back with the gate, alongside the lock panels above. -->
  </div>
</template>

<style scoped>
/* Simplified design: the locked section's preview, blurred and fading out under its veil. */
.sl-locked-art {
  filter: blur(1px);
  opacity: 0.9;
  -webkit-mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
}
.sl-locked-veil {
  background: radial-gradient(
    ellipse 42% 48% at 50% 50%,
    color-mix(in srgb, var(--color-white) 96%, transparent) 0%,
    color-mix(in srgb, var(--color-white) 80%, transparent) 55%,
    transparent 100%
  );
}
</style>
