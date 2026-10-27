<script>
// Once per page load, not per mount: Overview remounts on every tab switch, and the grid
// shouldn't reshuffle under you when you come back to it.
const IDEA_SEED = Math.floor(Math.random() * 2 ** 31)
</script>

<script setup>
import { computed, ref, watch, onBeforeUnmount, nextTick } from 'vue'
import {
  ChevronDownIcon, ChevronUpIcon, Stars01Icon, PlusIcon, XCloseIcon, FilterLinesIcon, SwitchVertical01Icon,
  FaceSmileIcon, PieChart01Icon, Edit05Icon, TrendUp01Icon, Lightbulb01Icon, Stars02Icon, SearchMdIcon, Briefcase01Icon, ChevronRightIcon,
} from '@gohighlevel/ghl-icons/24/outline'
import { FORMATS, FORMAT_COPY, fmtNum, midSentence, isPlural, trendChange, sentimentReading, SENTIMENT_LABEL, industryRisers, spaceInText } from '../../data/socialListening.js'
import { FIG } from './figures.js'
import { useSocialListening } from '../../composables/useSocialListening.js'
import ZeroState from './ZeroState.vue'
import DashboardBanners from './DashboardBanners.vue'
import MentionsRow from './MentionsRow.vue'
import GlanceTiles from './GlanceTiles.vue'
import SectionChip from './SectionChip.vue'
import CardHead from './CardHead.vue'
import CountUp from './CountUp.vue'
import ChartTip from './ChartTip.vue'
import TopicsOverview from './TopicsOverview.vue'
import TrendsCard from './TrendsCard.vue'
import CompetitorsCard from './CompetitorsCard.vue'
import { tabsModeOf } from './brandWeek.js'
import { NETWORK_ICONS } from './networkIcons.js'
import { topicShares, industryTopics } from './industryTopics.js'

const {
  state, account, spaceData, metrics, range, period, competitorRows, formatCopy, removeCompetitor, addCompetitor, beat, fillCopy, nicheWindowVolume,
  simple, brandVolume, brandDelta, runSearch, toast, peek, patchAccount,
} = useSocialListening()

const trendRows = computed(() => spaceData.value.trends.map(t => ({
  label: t.label,
  value: t.value,
  change: trendChange(t.label, t.value),
})))

// Shares and the full topic list come from industryTopics.js, which the Industry trends page
// one level in reads too, so the card and the page can't disagree.
const baseShareRows = computed(() => topicShares(trendRows.value, account.value.space))

// 21 Oct (pick 16): one 12-column grid holds Mentions, Industry trends, Competitors and Trending
// everywhere as two-up rows. Mentions | Industry trends is halves or a third + two thirds;
// Competitors | Trending everywhere is halves. The other two Mentions layouts in Demo controls take
// the full width, with Industry trends | Competitors under them, as before.
const tabsMode = computed(() => (simple.value ? tabsModeOf(state) : null))
const spans = computed(() => {
  if (!tabsMode.value) return ['lg:col-span-12', 'lg:col-span-6', 'lg:col-span-6', 'lg:col-span-12']
  return state.mentionsSize === 'third'
    ? ['lg:col-span-4', 'lg:col-span-8', 'lg:col-span-6', 'lg:col-span-6']
    : ['lg:col-span-6', 'lg:col-span-6', 'lg:col-span-6', 'lg:col-span-6']
})
// Next to the taller Mentions card, Industry trends lists the next topics too (from the same list
// the page one level in reads), so the two cards end level with no dead gap.
// out15 W01: before the first mention, Mentions is a short empty state, so the pair keeps the four
// named topics and both cards sit at their own height (no band under the empty state).
const extraTopics = computed(() => (brandVolume.value ? ({ across: 5, compact: 4, grid: 6, rail: 6 }[tabsMode.value] || 0) : 0))
// 21 Oct audit: when Mentions is taller still (its figures stack at 1280), the card lists one more
// topic per 36px row of space left above Next step, so there's no blank band. Measured, and reset
// whenever the card's width or the Mentions layout changes.
const fillRows = ref(0)
const trendsCardEl = ref(null)
const trendsListEl = ref(null)
const trendsFootEl = ref(null)
function measureFill() {
  const list = trendsListEl.value, foot = trendsFootEl.value
  if (!list || !foot || !extraTopics.value) return
  const free = foot.getBoundingClientRect().top - list.getBoundingClientRect().bottom // the blank mt-auto leaves
  const add = Math.floor(free / 36)
  if (add > 0) fillRows.value += add
}
function refill() { fillRows.value = 0; nextTick(() => requestAnimationFrame(measureFill)) }
let fillRO = null, fillW = 0
watch(trendsCardEl, (v) => {
  fillRO?.disconnect(); fillRO = null
  // Round 7: the card is an HLCard, so the ref is the component; observe its element.
  const el = v?.$el || v
  if (!el || !(el instanceof Element)) return
  fillRO = new ResizeObserver(([e]) => { const w = Math.round(e.contentRect.width); if (w !== fillW) { fillW = w; refill() } else measureFill() })
  fillRO.observe(el)
})
watch([tabsMode, () => !!brandVolume.value], refill)
onBeforeUnmount(() => { fillRO?.disconnect(); fillRO = null })
const topicShareRows = computed(() => {
  const base = baseShareRows.value
  if (!extraTopics.value) return base
  const named = base.filter((r) => !r.rest)
  const all = industryTopics(base, account.value.space, nicheWindowVolume.value)
  // Always leave at least one topic for the "N other topics" row.
  const want = Math.min(extraTopics.value + fillRows.value, all.length - 1)
  const extra = all
    .filter((t) => !named.some((r) => r.label === t.label)).slice(0, want - named.length)
    .map((t) => ({ label: t.label, value: Math.round(t.share), change: t.change }))
  const rows = [...named, ...extra]
  return [...rows, { label: 'All other topics', value: 100 - rows.reduce((a, r) => a + r.value, 0), rest: true }]
})
// 19 Oct (option D): the remainder row opens every topic one level in.
const otherTopicCount = computed(() => industryTopics(baseShareRows.value, account.value.space, nicheWindowVolume.value).length - (topicShareRows.value.length - 1))
function openTopicRow(topic) { if (topic.rest) state.industryPage = true; else peek(topic.label) }

// The share the AI card quotes for its topic, taken from the same rows the Industry trends
// bars are drawn from. Reading it off topicShareRows rather than recomputing is what stops
// the stat and the bar under it disagreeing by a point.
// The share belongs to whichever topic the column is actually showing, which is not always
// trends[0]: day 45 points it at a complaint and day 60 at the third topic. Resolved by label
// against the same rows the Industry trends bars draw, so the stat and the bar agree.
// Day 45's complaint is not in the trends set at all and has no share, hence the null.
function shareForTopic(label) {
  const row = topicShareRows.value.find((r) => r.label.toLowerCase() === String(label || '').toLowerCase())
  return row ? row.value : null
}

// Same significance threshold the rows have always used. Reporting absence per row cost a
// column that mostly read "flat"; the count says it once instead.
const MOVED = ['None', 'One', 'Two', 'Three', 'Four', 'Five']
const topicsMoved = computed(() => trendRows.value.filter(t => Math.abs(t.change) > 2).length)
const topicsBench = computed(() => {
  const n = topicsMoved.value
  const of = trendRows.value.length
  const word = (i) => String(MOVED[i] ?? i)
  // "Three of the three moved" reads like a slip. When every row moved, or none did, the
  // count and the total are the same number and the sentence has to say it a different way.
  let moved
  if (of === 1) moved = n ? 'It moved' : 'It held steady'
  else if (n === of) moved = `All ${word(of).toLowerCase()} moved`
  else if (n === 0) moved = `None of the ${word(of).toLowerCase()} moved`
  else moved = `${word(n)} of the ${word(of).toLowerCase()} moved`
  return `Every bar is a share of that total. ${moved} ${period.value}.`
})

const rankedCompetitors = computed(() => [...competitorRows.value.comps].sort((a, b) => b.value - a.value))

// You and the brands you track, ranked together. Sujith on the 30th: a leaderboard shows you
// wherever you sit, because "where am I" is the question it exists to answer. "Everyone else"
// stays out, which was Shivam's separate call and still holds.
const shareRows = computed(() => {
  if (!account.value.competitors.length) return []
  return [...competitorRows.value.comps, { name: simple.value ? account.value.name : account.value.short, value: competitorRows.value.you, you: true }]
    .sort((a, b) => b.value - a.value)
})

// Your own share leads the card again, with the rank beside it. The leader's figure moved to
// the sentence below, where it can be stated as a distance rather than as a number belonging
// to nobody in particular.
const yourShare = computed(() => competitorRows.value.you || 0)
const yourRank = computed(() => shareRows.value.findIndex((r) => r.you) + 1)

// What the rows cannot draw: how far you are off the top, in the same units as the bars.
const competitorGap = computed(() => {
  const rows = shareRows.value
  if (!rows.length) return ''
  const lead = rows[0]
  if (lead.you) return rows[1] ? `You lead, ${pts(lead.value - rows[1].value)} clear of ${rows[1].name}.` : 'You are the only brand here.'
  return `${lead.name} leads on ${lead.value}%. You are ${pts(lead.value - yourShare.value)} behind.`
})
// 15 Oct (review 14): one sentence. "You're 2nd of 2. Bright Path Marketing is ahead on 75%."
const suggestedCompetitors = computed(() => (spaceData.value.competitors || []).filter((n) => !account.value.competitors.includes(n)).slice(0, 3))
const initials = (n) => n.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
const competitorLine = computed(() => {
  const rows = shareRows.value
  if (!rows.length) return ''
  const lead = rows[0]
  const place = `You’re ${yourRank.value}${ordinal(yourRank.value)} of ${rows.length}.`
  if (lead.you) return rows[1] ? `${place} You lead ${rows[1].name} by ${pts(lead.value - rows[1].value)}.` : place
  return `${place} ${lead.name} leads.`
})
function pts(n) {
  return `${n} ${n === 1 ? 'point' : 'points'}`
}
// 1st, 2nd, 3rd, 4th. Only ever called with 1 to 4 here, but the teens rule costs one clause.
function ordinal(n) {
  if (n % 100 >= 11 && n % 100 <= 13) return 'th'
  return ['th', 'st', 'nd', 'rd'][n % 10] || 'th'
}

// "X holds 35% of the conversation to your 25%" was awkward and repeated a comparison the
// rows directly above already draw. The chart carries the numbers; this carries the action.
// The beats override this per day, and every one of those lines measured the account's
// distance from the leader — a row this card no longer draws. Ignored while the "you" row
// is gone; the strings stay in the data until the 100% question is settled.
const competitorNextStep = computed(() => {
  const lead = rankedCompetitors.value[0]
  if (!lead) return 'Add a competitor to see who leads.'
  return `Search ${lead.name} to see which posts are carrying it.`
})


// 27 Oct (developers): an account with no industry gets the oct-5 landing first.
const zero = computed(() => !account.value.space)
// 15 Oct (Sujit 14 Oct: "you don't need any onboarding, it automatically starts"): no landing
// and no picker on a first visit. The page opens on the industry the account already has, with
// a one-time tip on the Industry pill saying where it came from. Only an account with no
// industry gets the picker.
watch(() => simple.value && !account.value.space, (first) => {
  if (!first) return
  const known = account.value.knownIndustry
  if (!known) return
  patchAccount(state.accountId, { space: known })
  if (state.day === 0) state.day = 15
}, { immediate: true })
function changeIndustry() { state.modal = 'space' }

// "What to post next" formats narrow to whatever the account has connected —
// falls back to the full list when nothing's connected yet so the card never goes empty.
const availableFormats = computed(() => {
  const nets = account.value.connectedNetworks || []
  if (!nets.length) return FORMATS
  const matched = FORMATS.filter(f => f.networks.some(n => nets.includes(n)))
  return matched.length ? matched : FORMATS
})

// Keeps the headline on a format the account can actually post. There's no picker any more,
// so this is the only thing that moves state.format.
watch(availableFormats, (list) => {
  if (!list.some(f => f.key === state.format)) state.format = list[0].key
}, { immediate: true })

// One mixed feed instead of a tab per format: the data can't reliably say which format a
// post is, so the tiles don't name one — no pills, no tags, no play/dots/story chrome.
// Each tile keeps only its shape.
//
// Balanced shuffle (option C, 1 Oct): the order is random, but dealt five at a time with at
// most two 9:16 tiles in each five. Round-robin by format put the three 9:16 video formats
// first, so the top row was always three identical tall tiles and the same ideas led on every
// load. The draw is seeded once per page load (IDEA_SEED below), so it holds still across
// tab switches and Show more, and a refresh gives a new mix. No shuffle control: Ayushi.
// Ideas without a reference photo (doc, pin, the tail of each list) are left out: with no
// chrome, an empty plate says nothing.
// Ages vary per tile — a column of "this week" repeated under every card read as filler.
const IDEA_AGES = ['2d ago', '5d ago', '1d ago', '3d ago', '6d ago', '4d ago', '2d ago', '1d ago', '5d ago', '3d ago', '6d ago', '4d ago']
const IDEA_ROW = 5
const IDEA_TALL_PER_ROW = 2
// There are ten reference photos for 36 ideas, so a shuffle can put the same photo on screen
// twice. Any repeat inside a ten-tile window swaps with the next tile of the same shape whose
// photo is not in the window, so the deal above keeps its mix.
const IDEA_PHOTO_WINDOW = 10

function seeded(seed) {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6D2B79F5) >>> 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}
function shuffled(list, rand) {
  const a = list.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
function spreadPhotos(a) {
  for (let i = 0; i < a.length; i++) {
    const seen = new Set(a.slice(Math.max(0, i - IDEA_PHOTO_WINDOW + 1), i).map(x => x.image))
    if (!seen.has(a[i].image)) continue
    let j = a.findIndex((x, k) => k > i && x.aspect === a[i].aspect && !seen.has(x.image))
    if (j < 0) j = a.findIndex((x, k) => k > i && !seen.has(x.image))
    if (j > 0) [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const ideaFeed = computed(() => {
  const all = availableFormats.value.flatMap(f => (FORMAT_COPY[f.key]?.ideas || [])
    .filter(i => i.image)
    .map(i => ({ ...i, aspect: f.aspect, kind: f.kind, key: `${f.key}:${i.title}` })))
  const rand = seeded(IDEA_SEED)
  const tall = shuffled(all.filter(i => i.aspect === '9 / 16'), rand)
  const rest = shuffled(all.filter(i => i.aspect !== '9 / 16'), rand)
  const out = []
  while (tall.length || rest.length) {
    const row = tall.splice(0, rest.length ? IDEA_TALL_PER_ROW : IDEA_ROW)
    row.push(...rest.splice(0, IDEA_ROW - row.length))
    row.push(...tall.splice(0, IDEA_ROW - row.length))
    out.push(...shuffled(row, rand))
  }
  return spreadPhotos(out).map((i, n) => ({ ...i, metric: i.metric.replace(/ · this week$/, ''), age: IDEA_AGES[n % IDEA_AGES.length] }))
})
// Two rows of five at full width. A count, not a row calculation: the columns below balance
// themselves, so ten is "about two rows" rather than exactly two.
const IDEAS_COLLAPSED = 10
const showAllIdeas = ref(false)
// Two full rows at whatever column count fits (ten at five columns). A whole number of rows
// is what keeps Show more an append: the row-by-row placement below never re-sorts a row
// that was already on screen.
const ideasCollapsed = computed(() => Math.min(IDEAS_COLLAPSED, ideaColCount.value * 2))

// ---- simplified design (Sujeet, 5 Oct): real posts, ranked by what you want more of ----
const POST_GOALS = [
  { key: 'saves', label: 'Most saved', unit: 'saves' },
  { key: 'shares', label: 'Most shared', unit: 'shares' },
  { key: 'comments', label: 'Most replies', unit: 'replies' },
]
const postGoal = ref('saves')
const industryList = computed(() => industryTopics(baseShareRows.value, account.value.space, nicheWindowVolume.value).slice(0, 10))
// The Topics picks (declared up here: the feed below reads them during setup).
const topicPicks = ref([])
const goalUnit = computed(() => (POST_GOALS.find(g => g.key === postGoal.value) || POST_GOALS[0]).unit)
const goalLabel = computed(() => (POST_GOALS.find(g => g.key === postGoal.value) || POST_GOALS[0]).label)
const POST_AUTHORS = ['@ellacreates', '@studio.north', '@thebrightside.co', '@maple.and.co', '@hollis.made', '@juniper.works', '@thedailyedit', '@river.and.oak', '@makers.lane', '@oakhouse.co']
const POST_SOURCES = {
  instagram: { key: 'instagram', label: 'Instagram' },
  tiktok: { key: 'tiktok', label: 'TikTok' },
  youtube: { key: 'youtube', label: 'YouTube' },
  facebook: { key: 'facebook', label: 'Facebook' },
  linkedin: { key: 'linkedin', label: 'LinkedIn' },
  x: { key: 'x', label: 'X' },
}
// Text-only posts (Shivam, 5 Oct): no image, so the tile shows the words themselves.
const TEXT_POSTS = [
  { key: 'text:prices', title: 'We raised our prices this month. Here is exactly why, line by line.', metric: '3.4K saves', source: 'linkedin' },
  { key: 'text:mistake', title: 'The one mistake I see new clients make before they even call us.', metric: '2.1K saves', source: 'x' },
  { key: 'text:quiet', title: 'Slow week. Here is what we did with the quiet days instead of panicking.', metric: '1.6K saves', source: 'facebook' },
  { key: 'text:review', title: 'A client left us a two-star review. This was our reply.', metric: '4.8K saves', source: 'linkedin' },
  { key: 'text:faq', title: 'Five questions we get every single week, answered in one post.', metric: '2.7K saves', source: 'x' },
]
const TEXT_SHAPE = { aspect: 'auto', label: 'Text post', text: true }
const POST_SHAPES = {
  photo: { aspect: '1 / 1', label: 'Photo post' },
  carousel: { aspect: '4 / 5', label: 'Carousel', stack: true },
}
function postShape(idea) {
  if (POST_SHAPES[idea.kind]) return POST_SHAPES[idea.kind]
  return idea.aspect === '16 / 9' ? { aspect: idea.aspect, label: 'Video' } : { aspect: idea.aspect, label: 'Short video' }
}
function postSource(aspect, i) {
  if (aspect === '16 / 9') return POST_SOURCES.youtube
  if (aspect === '9 / 16') return [POST_SOURCES.instagram, POST_SOURCES.tiktok, POST_SOURCES.youtube][i % 3]
  return [POST_SOURCES.instagram, POST_SOURCES.facebook][i % 2]
}
// "12.4K saves" -> 12400.
function parseCount(text) {
  const m = String(text).match(/([\d.]+)\s*(K|M)?/i)
  return m ? Math.round(parseFloat(m[1]) * (m[2] ? (m[2].toUpperCase() === 'M' ? 1e6 : 1e3) : 1)) : 0
}
function compactNum(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}
const postFeed = computed(() => {
  const goal = postGoal.value
  const texts = TEXT_POSTS.map((t, i) => ({ ...t, image: t.key, kind: 'text', age: IDEA_AGES[(i * 3) % IDEA_AGES.length] }))
  // out15 S3: the ranking is the order. The spread (shape variety per five) reordered the sorted
  // list, so "Most saved" read 44.3K, 2.6K, 31.5K. Sorted only, highest first.
  const ranked = [...ideaFeed.value, ...texts].map((idea, i) => {
    const h = [...idea.key].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
    const base = Math.max(120, parseCount(idea.metric))
    const counts = {
      saves: Math.round(base * (0.5 + (h % 7) / 6)),
      shares: Math.round(base * (0.2 + (h % 5) / 8)),
      comments: Math.round(base * (0.06 + (h % 4) / 20)),
    }
    const lift = { saves: 2 + (h % 5), shares: 2 + ((h >> 2) % 5), comments: 2 + ((h >> 3) % 4) }
    const shape = idea.kind === 'text' ? TEXT_SHAPE : postShape(idea)
    const source = idea.kind === 'text' ? POST_SOURCES[idea.source] : postSource(shape.aspect, i)
    // out9 q17: each post belongs to one of the industry's top seven topics, so picking a topic in
    // Topics actually narrows the feed. The smallest topics have no standout posts this week.
    const topics = industryList.value.slice(0, 7)
    const topic = topics.length ? topics[h % topics.length].label : null
    return { ...idea, aspect: shape.aspect, shape, source, topic, author: POST_AUTHORS[h % POST_AUTHORS.length], metrics: counts, lift }
  })
  // 26 Oct (Ayushi): the first rows mix every kind of post. Sorting by count put only the big
  // 9:16 videos on top, so the order is dealt instead: each five takes one of each kind (short
  // video, carousel, photo, text, long video) in a random order, drawn fresh on each load and
  // for each ranking. The counts are then handed out highest first down that order, so the
  // list still reads as ranked (out15 S3).
  const rand = seeded(IDEA_SEED + POST_GOALS.findIndex((g) => g.key === goal) + 1)
  const kindOf = (p) => (p.shape.text ? 'text' : p.shape.stack ? 'carousel' : p.shape.aspect === '9 / 16' ? 'short' : p.shape.aspect === '16 / 9' ? 'long' : 'photo')
  const piles = {}
  for (const p of shuffled(ranked, rand)) (piles[kindOf(p)] ||= []).push(p)
  const KINDS = ['short', 'carousel', 'photo', 'text', 'long']
  const dealt = []
  while (KINDS.some((k) => piles[k]?.length)) {
    const five = KINDS.map((k) => piles[k]?.shift()).filter(Boolean)
    while (five.length < 5) { const k = KINDS.find((x) => piles[x]?.length); if (!k) break; five.push(piles[k].shift()) }
    dealt.push(...shuffled(five, rand))
  }
  const values = Object.fromEntries(Object.keys(dealt[0]?.metrics || {}).map((m) => [m, dealt.map((p) => p.metrics[m]).sort((x, y) => y - x)]))
  dealt.forEach((p, i) => { p.metrics = Object.fromEntries(Object.keys(p.metrics).map((m) => [m, values[m][i]])) })
  // Sorting can put two posts with the same reference photo side by side, so photos are handed
  // out in rank order from the distinct set: none repeats until every photo has been used.
  const photos = [...new Set(dealt.filter((p) => typeof p.image === 'string' && p.image.includes('/thumbs/')).map((p) => p.image))]
  let n = 0
  return dealt.map((p) => (typeof p.image === 'string' && p.image.includes('/thumbs/') ? { ...p, image: photos[n++ % photos.length] } : p))
})
const feed = computed(() => {
  if (!simple.value) return ideaFeed.value
  if (!topicPicks.value.length) return postFeed.value
  return postFeed.value.filter((p) => topicPicks.value.includes(p.topic))
})
const noTopicPosts = computed(() => simple.value && topicPicks.value.length > 0 && !feed.value.length)
function makeLikeThis(p) {
  const unit = goalUnit.value
  state.askAI = {
    prompt: `Help me make a post like "${p.title}" from ${p.author}`,
    topic: p.title,
    autoSend: true,
    reply: `Here's how to make your own version for ${account.value.name}.\n\nWhat it is: ${p.title.charAt(0).toLowerCase() + p.title.slice(1)}.\nWhy it worked: it got ${p.lift[postGoal.value]} times more ${unit} than ${p.author} usually gets.\n\nYour version: keep the same shape, swap in your own work, and say one thing only. Post it on ${p.source.label} first, since that is where this one took off.`,
  }
}
// 15 Oct (audit 15): opens the account on its platform in a new tab. The prototype has no real
// post links, so it goes to the author's profile.
const PROFILE = {
  instagram: (h) => `https://www.instagram.com/${h}/`, tiktok: (h) => `https://www.tiktok.com/@${h}`,
  youtube: (h) => `https://www.youtube.com/@${h}`, facebook: (h) => `https://www.facebook.com/${h}`,
  linkedin: (h) => `https://www.linkedin.com/company/${h}/`, x: (h) => `https://x.com/${h}`, twitter: (h) => `https://x.com/${h}`,
}
function openOriginal(p) {
  if (simple.value) {
    const handle = String(p.author || '').replace(/^@/, '')
    const url = (PROFILE[p.source.key] || ((h) => `https://www.google.com/search?q=${encodeURIComponent(h)}`))(handle)
    window.open(url, '_blank', 'noopener')
    return
  }
  else toast('Original post', `In the live product this opens ${p.author}'s post on ${p.source.label}.`, 'info')
}

const visibleIdeas = computed(() => showAllIdeas.value ? feed.value : feed.value.slice(0, ideasCollapsed.value))

// ---- masonry ----
//
// This was CSS multi-column, which cannot do what the section needs. Multi-column flows down
// each column and then across, so it does not place tiles: it divides the whole list by the
// column count and re-partitions on every change to the list. Three things followed.
//
//  1. Show more re-flowed instead of appending. The top row went from tiles 1,3,5,7,9 to
//     1,7,13,19,25 — every tile but the first moved, including the one you were reaching for.
//  2. The stagger vanished once expanded. At two tiles a column the shapes differ and the
//     columns end at different heights; at six or seven a column each one holds a full cycle
//     of 9:16, 4:5 and 16:9, so they all sum to the same height and the tops line up.
//  3. The remainder landed entirely in the last column: 31 over 5 is 6,6,6,6,7, which left
//     column five hanging ~290px below the rest with the toggle floating in the gap.
//
// Placing each tile in the shortest column, walking the list in order, fixes all three. It is
// a forward pass, so a tile's column depends only on the tiles before it: appending can never
// move what is already placed. And balancing by height keeps the ends within one tile of each
// other instead of dumping the remainder on the right.
const IDEA_GAP = 24
// 19 Oct (Sujit): more room between posts down a column, so the caption reads as part of the
// picture above it and not the one below.
const IDEA_ROW_GAP = 40
const IDEA_MIN_COL = 200
const IDEA_MAX_COLS = 5
// The image height is exact from the aspect ratio; the caption is not, because titles run to
// one, two or three lines. Estimating it at a flat two lines left the ends 319px apart over
// six tiles, so the estimate only seeds the first paint: once the tiles are on screen their
// real heights are measured and the balance is redone against those.
//
// Every column is the same width, so a tile measures the same wherever it lands. That is what
// makes this safe: the measurement cannot change the assignment that produced it, so the
// second pass settles and there is no oscillation.
const IDEA_CAPTION_H = 56

const ideaGrid = ref(null)
const ideaGridW = ref(0)
let ideaRO = null
// Watched rather than attached on mount: the card sits behind the zero state, so on a fresh
// account the element does not exist yet when this component mounts. Observing once at mount
// left the width at 0 forever, which pinned the grid to five columns at every width and sent
// the tiles down to 79px wide on a narrow window.
watch(ideaGrid, (el) => {
  ideaRO?.disconnect()
  ideaRO = null
  if (!el) { ideaGridW.value = 0; return }
  ideaGridW.value = el.clientWidth
  ideaRO = new ResizeObserver(([e]) => { ideaGridW.value = e.contentRect.width })
  ideaRO.observe(el)
  nextTick(() => { measureIdeaTiles(); bindIdeaImages() })
}, { immediate: true, flush: 'post' })
onBeforeUnmount(() => { ideaRO?.disconnect(); ideaRO = null })

const ideaColCount = computed(() => {
  const w = ideaGridW.value
  if (!w) return IDEA_MAX_COLS
  return Math.max(1, Math.min(IDEA_MAX_COLS, Math.floor((w + IDEA_GAP) / (IDEA_MIN_COL + IDEA_GAP))))
})

const ideaTileH = ref({})

const ideaColumns = computed(() => {
  const n = ideaColCount.value
  const colW = Math.max(1, (ideaGridW.value - IDEA_GAP * (n - 1)) / n)
  const measured = ideaTileH.value
  const cols = Array.from({ length: n }, () => [])
  const heights = new Array(n).fill(0)
  const heightOf = (idea) => {
    if (measured[idea.key]) return measured[idea.key]
    const [aw, ah] = String(idea.aspect).split('/').map((v) => parseFloat(v))
    return (aw && ah ? colW * (ah / aw) : colW) + IDEA_CAPTION_H
  }
  // A row at a time, tallest first into the shortest column. The row's tiles are still the
  // shuffled draw; only which column each lands in changes, and that keeps the column ends
  // within a short tile of each other (they were ~340px apart at ten tiles).
  // out15 S3: in the simplified design the list is a ranking, so tiles keep its order: each goes
  // into the shortest column (the highest free slot), which reads left to right along the top and
  // then top to bottom, most to fewest. The older design keeps the tallest-first balance.
  const list = visibleIdeas.value
  for (let r = 0; r < list.length; r += n) {
    const row = simple.value ? list.slice(r, r + n) : list.slice(r, r + n).sort((a, b) => heightOf(b) - heightOf(a))
    for (const idea of row) {
      // Strictly shorter, so ties go to the leftmost column.
      let k = 0
      for (let i = 1; i < n; i++) if (heights[i] < heights[k]) k = i
      cols[k].push(idea)
      heights[k] += heightOf(idea) + IDEA_ROW_GAP
    }
  }
  return cols
})

// Read the rendered heights back. Only writes when something actually moved, so the computed
// above re-runs at most once per change rather than ping-ponging with the observer.
function measureIdeaTiles() {
  const root = ideaGrid.value
  if (!root) return
  const next = { ...ideaTileH.value }
  let changed = false
  root.querySelectorAll('[data-idea]').forEach((el) => {
    const k = el.getAttribute('data-idea')
    const h = Math.round(el.getBoundingClientRect().height)
    if (h > 0 && next[k] !== h) { next[k] = h; changed = true }
  })
  if (changed) ideaTileH.value = next
}

// The images arrive after the markup, and an unloaded image reports its aspect-ratio box
// rather than nothing, so this re-runs on load as well as on render.
let ideaImgsBound = new WeakSet()
function bindIdeaImages() {
  ideaGrid.value?.querySelectorAll('img').forEach((img) => {
    if (ideaImgsBound.has(img)) return
    ideaImgsBound.add(img)
    if (!img.complete) img.addEventListener('load', () => nextTick(measureIdeaTiles), { once: true })
  })
}

watch([visibleIdeas, ideaColCount], () => nextTick(() => { measureIdeaTiles(); bindIdeaImages() }), { flush: 'post' })
// A width change makes every measurement stale, so they go rather than being corrected.
watch(ideaGridW, () => { ideaTileH.value = {}; nextTick(measureIdeaTiles) })

// "How the industry is doing" reads as a report on the industry's health; what follows is
// about conversations and trends. This says what the section actually contains.
// Four of the six ranges describe a window that has already closed, so the verb moves.
// "What's happening ... last month" is the wrong tense for a finished week.
// The niche is named here even though the pill above and aiDrivers below both name it too —
// that repetition was reviewed and accepted, so don't "fix" it by pulling the niche out of
// one of the other two. A headline reading "your industry" beside a pill saying which one
// was the thing being fixed.
// The journey authors this per beat now. The template stays as the fallback for any day
// that has no copy of its own, so the block never renders headless.
const aiHeadline = computed(() => {
  const c = beat.value.copy
  if (c && c.headline) return fillCopy(c.headline)
  return range.value.past
    ? `What happened in ${account.value.space} ${period.value}`
    : `What's happening in ${account.value.space} ${period.value}`
})

// The topic gaining the most attention. Deliberately not trends[0] — that one already has
// its own tile, and repeating it here was the redundancy called out twice.
const fastestTrend = computed(() => spaceData.value.trends
  .map(t => ({ label: t.label, change: trendChange(t.label, t.value) }))
  .reduce((a, b) => (b.change > a.change ? b : a)))

// The AI insights row names the fastest-growing topic as a finding; the Industry trends card
// closes with the same topic as an action. Falls back when nothing has actually moved, so the
// card never advises chasing a flat week.
const topicsNextStep = computed(() => {
  const c = beat.value.copy
  if (c && c.nextTrends) return fillCopy(c.nextTrends)
  const t = fastestTrend.value
  if (!t || t.change <= 2) return 'Track a trend to get an alert when it starts moving.'
  return `Track ${midSentence(t.label)} while ${isPlural(t.label) ? 'they are' : 'it is'} climbing.`
})

// Insight, then meaning. Neither sentence restates a tile beneath it, and neither carries
// a recommendation — the action belongs in "What to post next", not here.
const aiDrivers = computed(() => {
  const c = beat.value.copy
  if (c && c.p1) return fillCopy(c.p1)
  const t = fastestTrend.value
  const verb = isPlural(t.label) ? 'are' : 'is'
  // "growing faster than anything else" promised a ranking of growth rates the page never
  // shows — the rows underneath are shares. "Getting more attention" is what the data says.
  return `${t.label} ${range.value.past ? 'got' : verb + ' getting'} more attention in ${account.value.space} ${period.value}.`
})
const aiCaveat = computed(() => {
  const c = beat.value.copy
  if (c && c.p2) return fillCopy(c.p2)
  // An explicit `p2: null` means the beat wants one paragraph, not two. Without this the
  // template below fills the gap and the line comes straight back, which is what happened
  // the first time day 7's second sentence was removed.
  if (c && 'p2' in c && !c.p2) return ''
  const net = Math.round(metrics.value.sentiment || spaceData.value.nicheSent || 0)
  const was = range.value.past
  const lead = net >= 15 ? `Most conversations ${was ? 'were' : 'are'} positive`
    : net > -15 ? `Conversations ${was ? 'were' : 'are'} mixed`
    : `Most conversations ${was ? 'were' : 'are'} negative`
  const watch = spaceData.value.watch
  return watch
    ? `${lead}, but complaints about ${watch} ${was ? 'kept' : 'are still'} coming up.`
    : `${lead} ${period.value}.`
})

// Labels a café owner can read without knowing the metric behind them: each one names
// whose number it is and what it counts, which is the whole of Sujith's copy note.
// Each stat is a sentence rather than a figure in a box, so the row carries on in the
// voice of the two paragraphs above it. Only the figures are lifted out of the prose.
const aiStats = computed(() => {
  const c = beat.value.copy
  const m = metrics.value
  const net = Math.round(m.sentiment || spaceData.value.nicheSent || 0)
  const topic = spaceData.value.trends[0]

  // No Mentions tile: the Mentions card states 2,402 a few hundred pixels below, and a tile
  // that repeats the card under it is the thing this row keeps being trimmed for.
  // The three that remain lead with the reading and close on the movement — the absolute
  // figure each one used to carry is now on the card that owns it.
  return [
    {
      label: SENTIMENT_LABEL,
      icon: FaceSmileIcon,
      // The beat can override the tail: "too early to call" at day 7 says more than a delta
      // computed from a week of data, and "down from Mostly positive" at day 45 names the
      // reading that changed rather than a point count nobody converts in their head.
      // Q1. The tail is the split behind the reading rather than the reading said again.
      // Beat overrides are gone: a stat row wants one shape at every beat, and "down from
      // Mostly positive" was the only override carrying anything the split does not.
      parts: (() => {
        const sp = sentimentSplit(net)
        return [{ b: sentimentReading(net) }, `, ${sp.pos}% positive, ${sp.neg}% negative, ${sp.neu}% neutral.`]
      })(),
    },
    {
      label: 'Share of voice',
      icon: PieChart01Icon,
      // S1. Your share as a count of real conversations, against the same window volume the
      // Industry trends card and Mentions now both use. Before this it was 8% of a 30 day
      // figure labelled as 7 days, which is where 3,280 came from.
      parts: [
        { b: (m.share || 0) + '% of the niche' },
        `, ${fillCopy('{yourSlice} of the {nicheVolume} conversations here.')}`,
      ],
    },
    // The biggest topic by share, without its percentage — the Industry trends card below
    // lists that, and "climbing" is the part no row over there states now.
    {
      label: 'Top trending topic',
      icon: TrendUp01Icon,
      // Day 45 points this at a complaint instead of an opportunity. Every other beat shows
      // something to chase; that one shows something to fix, which is what makes it land.
      // T3. Its share of the niche, not "climbing". The old line appended that unconditionally
      // and `topic` is trends[0], the BIGGEST topic rather than the fastest, so on 12 of the
      // 21 niches the card called a falling topic a riser. A share is true whichever way it
      // is moving.
      parts: (() => {
        const label = c && c.topic ? sentenceCase(fillCopy(c.topic)) : topic.label
        const share = shareForTopic(label)
        // No tail rather than a borrowed number. Quoting trends[0]'s 49% beside day 45's
        // complaint was the same class of mistake as the "climbing" string it replaced.
        return share == null ? [{ b: label }] : [{ b: label }, `, ${share}% of all conversation here.`]
      })(),
    },
  ]
})
// "+9% vs prev" -> ", up " + "9%", with the figure kept separate so the sentence can set it
// apart. The sign becomes a word: a fall has to read as a fall, not as a character a skim misses.
const sentenceCase = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t)

// A net score is positive minus negative. Holding neutral steady lets both halves back out,
// which turns an abstract 12 into the split people actually read. The 30% is an assumption,
// not a measurement: if a real split is ever added to the 21 niches, this comes out.
const NEUTRAL_SHARE = 30
function sentimentSplit(net) {
  const pos = Math.round((100 - NEUTRAL_SHARE + Math.round(net || 0)) / 2)
  return { pos, neg: 100 - NEUTRAL_SHARE - pos, neu: NEUTRAL_SHARE }
}

// The tail, ready to stand on its own line. Every tail string was written to follow the
// reading inside one sentence, so it opens on ", " — which reads as a typo once the reading
// is a heading above it rather than a clause before it.
function tailParts(parts) {
  const rest = parts.slice(1)
  if (!rest.length) return []
  const [first, ...others] = rest
  if (typeof first !== 'string') return rest
  const trimmed = first.replace(/^[,\s]+/, '')
  // Sentence case, since it now starts a line rather than continuing one.
  const cased = trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
  return cased ? [cased, ...others] : others
}

function deltaPhrase(raw) {
  if (!raw) return []
  const value = raw.replace(/\s*vs prev\s*/i, '').trim()
  const down = /^[−-]/.test(value)
  return [`, ${down ? 'down' : 'up'} `, { b: value.replace(/^[−-]\s*/, '') }]
}

// ---- simplified AI summary (Sujeet, 5 Oct) ----
// One headline and up to two lines per stage. `__share` and `__dip` are worked out here
// because they read off the competitor rows and the mentions delta.
const STAGE_COPY = {
  7: {
    headline: 'Your industry is busy. You are just getting started.',
    p1: '{nicheVolume} posts in {space} so far. Posts about you will show up here as they come in.',
    p2: '',
  },
  15: {
    headline: 'Your {topic2} are taking off',
    p1: 'They brought in most of your mentions.',
    p2: '{Topic2} are the second biggest topic in {space} right now.',
  },
  30: {
    headline: 'You now have a month of history',
    p1: 'From here on, we will point out anything unusual.',
    p2: '__share',
  },
  45: {
    headline: 'More people are talking. Fewer are happy.',
    p1: '__dip',
    // out9 q08: the complaint is named once, in the Reply this week reading below.
    p2: 'Replying quickly is the fastest way to turn it around.',
  },
  60: {
    headline: 'Complaints are down. One thing still needs work.',
    p1: 'Complaints halved once you started replying.',
    p2: 'Your best format has stopped getting saves. People are saving {topic3} now.',
  },
  90: {
    headline: 'Your share keeps growing',
    p1: 'Up from single digits in July.',
    // out9 q06: "Client results case studies is the biggest topic" -> worked out in stageLine with isPlural.
    p2: 'Keep posting about what your industry talks about most.',
  },
}
const stageCopy = computed(() => (beat.value.metrics ? STAGE_COPY[beat.value.day] : null) || null)
const leadCompetitor = computed(() => rankedCompetitors.value[0] || null)
function stageLine(line) {
  if (!line) return ''
  if (line === '__share') {
    const lead = leadCompetitor.value
    if (!lead) return ''
    return lead.value > yourShare.value ? `${lead.name} is ahead of you among the brands you track.` : 'You lead the brands you track.'
  }
  if (line === '__biggest') {
    const T = (spaceData.value.trends || [])[0]?.label
    if (!T) return ''
    const pl = isPlural(T)
    return `${T} ${pl ? 'are' : 'is'} the biggest topic in ${spaceInText(account.value.space)}. Post about ${pl ? 'them' : 'it'} to grow.`
  }
  if (line === '__dip') {
    const d = brandDelta.value
    return d && d > 0 ? `Mentions are up ${d}%, but more of them are negative.` : 'More people are mentioning you, but more of them are negative.'
  }
  return fillCopy(line)
}
// 15 Oct (review 1): the one-page summary talks about the business by name and ends in one thing
// to do this week.
const name = computed(() => account.value.name)
const lower = (t) => midSentence(t)
const simpleStory = computed(() => {
  if (!simple.value) return null
  const day = beat.value.metrics ? beat.value.day : 0
  const tr = spaceData.value.trends || []
  const sp = spaceInText(account.value.space)
  if (day === 0) return {
    headline: 'Your industry is busy. You’re just getting started.',
    line: 'Posts about you will show up here as they come in. Until then, here’s what’s getting attention in your industry.',
  }
  // 19 Oct (Sujit): "taking off" says it; "they brought in most of your mentions" was the
  // redundant line, and the account's name stays out of the copy.
  // out9 q07: "taking off" named the second biggest topic, which was the slowest riser on the page,
  // while Trending now and Industry trends said another topic was climbing fastest. It names the
  // fastest riser now, with its rise.
  const riser = industryRisers(account.value.space, state.range)[0]
  if (day === 15 && (riser || tr[1])) {
    const T = riser ? riser.term : tr[1].label, pl = isPlural(T)
    return {
      headline: `${T} ${pl ? 'are' : 'is'} taking off`,
      line: riser ? `Up ${riser.delta}% ${period.value}, faster than any other topic in ${sp}.` : `${pl ? 'They’re' : 'It’s'} the second biggest topic in ${sp} right now.`,
    }
  }
  return null
})
const doThisWeek = computed(() => {
  const day = beat.value.metrics ? beat.value.day : 0
  const tr = spaceData.value.trends || []
  if (day === 45) return { value: `Reply to complaints about ${spaceData.value.watch || 'pricing and wait times'}`, cta: 'Draft a reply with AI', topic: spaceData.value.watch || 'pricing and wait times', reply: true }
  const riser0 = industryRisers(account.value.space, state.range)[0]?.term
  const t = day === 0 || day === 15 ? (riser0 || tr[day === 15 ? 1 : 0]?.label)
    : day === 60 ? tr[2]?.label : tr[0]?.label
  return t ? { value: `Post about ${lower(t)}`, cta: 'Draft it with AI', topic: t } : null
})

const summaryHeadline = computed(() => {
  if (simpleStory.value) return simpleStory.value.headline
  const c = stageCopy.value
  return c ? stageLine(c.headline) : `What people in ${account.value.space} are talking about`
})
const summaryLines = computed(() => {
  if (simpleStory.value) return [simpleStory.value.line]
  const c = stageCopy.value
  if (c) return [stageLine(c.p1), stageLine(c.p2)].filter(Boolean)
  const t = fastestTrend.value
  return [`${t.label} ${isPlural(t.label) ? 'are' : 'is'} getting more attention than anything else.`]
})
const summaryStats = computed(() => {
  const m = metrics.value
  const net = Math.round(m.sentiment || spaceData.value.nicheSent || 0)
  const sp = sentimentSplit(net)
  // out9 q10: before the first mention the reading is the industry's, and says so; "Too early to
  // tell" is off the copy rules.
  const own = m.mode === 'real' && m.share
  const feel = { label: 'How people feel', icon: FaceSmileIcon, value: sentimentReading(net), tail: own ? `${sp.pos}% positive, ${sp.neg}% negative` : `${sp.pos}% positive across your industry` }
  const share = own
    // out15 W6: the label names the base (copy rules s4, never a bare "Your share"), so the reading
    // is the figure alone. W3: before the first mention the Mentions card already says "No mentions
    // yet", so this reading says when the share starts instead.
    ? { label: 'Your share of industry posts', icon: PieChart01Icon, value: `${m.share}%`, tail: `${fmtNum(brandVolume.value)} of ${fmtNum(nicheWindowVolume.value)} mention you` }
    : { label: 'Your share of industry posts', icon: PieChart01Icon, value: 'Starts with your first mention', tail: 'Out of every post in your industry' }
  const day = beat.value.metrics ? beat.value.day : 0
  const trends = spaceData.value.trends
  let topic
  if (day === 45) {
    topic = { label: 'Top complaint', icon: TrendUp01Icon, value: sentenceCase(spaceData.value.watch || 'pricing and wait times'), tail: 'Most of this week’s complaints' }
  } else if (day === 60 && trends[2]) {
    const pct = shareForTopic(trends[2].label)
    topic = { label: 'Worth posting about', icon: TrendUp01Icon, value: trends[2].label, tail: pct == null ? '' : `${pct}% of all posts, and people are saving it` }
  } else {
    const pct = shareForTopic(trends[0].label)
    topic = { label: 'Biggest topic', icon: TrendUp01Icon, value: trends[0].label, tail: pct == null ? '' : `${pct}% of all posts` }
  }
  return [feel, share, topic]
})
// 14 Oct (AC): the same three readings, number first. A reading with no number (too early, the
// top complaint) keeps its words at title size in the number's place.
const summaryFigures = computed(() => {
  const m = metrics.value
  const net = Math.round(m.sentiment || spaceData.value.nicheSent || 0)
  const sp = sentimentSplit(net)
  const feel = { key: 'feel', big: `${sp.pos}%`, unit: 'positive', line: `How people feel about ${account.value.name} · ${sp.neg}% negative` }
  const share = m.mode === 'real' && m.share
    ? { key: 'share', big: `${m.share}%`, unit: 'of all posts', line: `Of industry posts mention ${account.value.name}` }
    : { key: 'share', value: 'No mentions yet', line: 'Your share shows up after your first mentions.' }
  const act = doThisWeek.value
  if (act) return [feel, share, { key: 'action', label: 'Do this week', value: act.value, cta: act.cta }]
  const day = beat.value.metrics ? beat.value.day : 0
  const trends = spaceData.value.trends
  let topic
  if (day === 45) {
    topic = { key: 'topic', value: sentenceCase(spaceData.value.watch || 'pricing and wait times'), line: 'Top complaint · three times more posts than last month' }
  } else {
    const t = day === 60 && trends[2] ? trends[2] : trends[0]
    const pct = shareForTopic(t.label)
    const label = day === 60 && trends[2] ? 'Worth posting about' : 'Biggest topic'
    topic = pct == null ? { key: 'topic', value: t.label, line: label } : { key: 'topic', big: `${pct}%`, unit: 'of all posts', line: `${label} · ${t.label}` }
  }
  return [feel, share, topic]
})
// 19 Oct: the WBR card's three readings. The third is this week's action when there is one.
// 21 Oct (Ayushi: "no inconsistency in font size, font weight, how we present it"): the action
// reads like the other two, a short label, a short reading (the topic, not a sentence that wraps)
// and one line under it, which for the action is its Draft link.
const summaryCards = computed(() => {
  const [feel, share, topic] = summaryStats.value
  const act = doThisWeek.value
  // Round 6 (Ayushi: "headings and subheadings consistent"): every column's sub line is the same
  // 13px grey data line. The third used to be a blue "Draft it with AI" text button, the one sub
  // line in another component, colour and weight; drafting lives on What to post next right below.
  if (!act) return [feel, share, topic]
  const pct = act.reply ? null : shareForTopic(act.topic)
  const isRiser = !act.reply && industryRisers(account.value.space, state.range)[0]?.term === act.topic
  const tail = act.reply ? 'Most of this week’s complaints' : isRiser ? 'Climbing fastest in your industry' : pct == null ? 'Rising in your industry' : `${pct}% of industry posts this week`
  return [feel, share, { label: act.reply ? 'Reply this week' : 'Post this week', icon: Edit05Icon, value: sentenceCase(act.topic), tail }]
})
// Next steps that carry a term get a Search it button.
const trendsNext = computed(() => {
  const day = beat.value.metrics ? beat.value.day : 0
  // out9 q08: the AI summary already names one topic (Post this week) or the complaint (Reply this
  // week). This line names the other one: the fastest riser, or the biggest topic if the summary
  // took the riser. Never the same fact twice on one screen.
  // 21 Oct (out15 S1): one posting recommendation per screen. The AI summary owns "Post this week"
  // (or "Reply this week"), so this card never recommends posting. Its own job is the industry's
  // conversation: who is posting about its biggest topic (the next one down if the summary already
  // names the biggest), with a search for it. Same line in every stage.
  if (simple.value) {
    const ai = String(doThisWeek.value?.topic || '').toLowerCase()
    const trends = spaceData.value.trends || []
    const big = trends.find((t) => t.label.toLowerCase() !== ai)
    const which = big && big !== trends[0] ? 'the next biggest topic' : 'the biggest topic'
    if (big) return searchLine(`See who is posting about ${midSentence(big.label)}, ${which}.`, `See who is posting about ${which}.`, big.label)
    return { text: 'Search any topic to see who is posting about it.' }
  }
  if (day === 45) return { text: `Reply to complaints about ${spaceData.value.watch || 'pricing and wait times'} before they pile up.` }
  const t = day === 90 ? spaceData.value.trends[0] : fastestTrend.value
  if (!t) return { text: 'Search any topic to see who is talking about it.' }
  const verb = isPlural(t.label) ? 'are' : 'is'
  return day === 90
    ? { text: `Post about ${midSentence(t.label)} to reach the most people.`, term: t.label }
    : { text: `${t.label} ${verb} climbing fastest.`, term: t.label }
})
// f04 (21 Oct final): the search link names what it searches ("Search lead gen funnels") and the
// line before it drops the name, so it is said once. A name too long for one line at 1280 keeps
// "Search it" and stays in the line instead.
const SEARCH_MAX = 22
function searchLine(named, generic, term) {
  const t = midSentence(term)
  return t.length <= SEARCH_MAX ? { text: generic, term, label: `Search ${t}` } : { text: named, term, label: 'Search it' }
}
const competitorNext = computed(() => {
  const lead = leadCompetitor.value
  return lead ? { text: `See what ${lead.name} is posting.`, term: lead.name } : null
})
function searchFor(term) {
  if (simple.value) { peek(term); return }
  state.tab = 'insights'
  runSearch(term)
}


// 21 Oct (pick 06 V1): "Tuned to" lists the Industry trends topics (the top 10) with "All topics"
// on top. All is the default; picking a topic unticks All; unticking the last pick, or ticking
// every topic, goes back to All, so the filter can never be empty. An empty pick list means All.
// The feed itself doesn't re-rank by topic in the prototype.
watch(() => account.value.space, () => { topicPicks.value = [] })
const allTopics = computed(() => topicPicks.value.length === 0)
function togglePick(k) {
  if (k === '__all') { topicPicks.value = []; return }
  const list = topicPicks.value.includes(k) ? topicPicks.value.filter((x) => x !== k) : [...topicPicks.value, k]
  topicPicks.value = list.length === industryList.value.length ? [] : list
}
// 21 Oct (a07 V1, Ayushi: "can we just say Topics… and then in brackets how many are selected"):
// 21 Oct (b2 V5): "All 10 topics" by default (the old sub line's count, folded into the button),
// "2 of 10 topics" once some are picked: the same length as "All 10 topics", so the button never leaves a gap.
const picksLabel = computed(() => {
  const n = topicPicks.value.length
  return n ? `${n} of ${industryList.value.length} topics` : `All ${industryList.value.length} topics`
})
// Every label the Topics button can show (picking every topic falls back to All, so 1 to n - 1).
// They are laid in one grid cell under the current label so the button never changes width (b1 V1).
const picksLabels = computed(() => {
  const n = industryList.value.length
  return [`All ${n} topics`, ...Array.from({ length: Math.max(0, n - 1) }, (_, i) => `${i + 1} of ${n} topics`)]
})
// out9 q17: the picked topics mid-sentence ("lead gen funnels and local SEO").
const picksList = computed(() => {
  const l = topicPicks.value.map((f) => midSentence(f))
  return l.length < 2 ? l.join('') : `${l.slice(0, -1).join(', ')} and ${l[l.length - 1]}`
})
const topicOptions = computed(() => [
  { key: '__all', label: 'All topics', selected: allTopics.value },
  { type: 'divider', key: 'all-divider' },
  ...industryList.value.map((t) => ({ key: t.label, label: t.label, selected: topicPicks.value.includes(t.label) })),
])

// 21 Oct (pick 08 V1): about a second of skeleton tiles after any filter change, in each tile's
// real shape, then the new ranking rises in.
const postsLoading = ref(false)
let loadTimer = null
watch([postGoal, topicPicks], () => {
  clearTimeout(loadTimer)
  postsLoading.value = true
  loadTimer = setTimeout(() => { postsLoading.value = false }, 1000)
})
onBeforeUnmount(() => clearTimeout(loadTimer))
</script>

<template>
  <ZeroState v-if="zero" />

  <!-- 19 Oct spacing pass: 32px between cards, 24px between the two side-by-side cards. -->
  <div v-else :class="['flex flex-col', simple ? 'gap-6' : 'gap-5']">
    <DashboardBanners />

    <!-- AI Insights leads the page. Shivam on the review call: "First should be the summary."
         The page used to open on the three glance tiles, which asked you to act before
         anything had told you what happened. This is niche-level and it is the sentence the
         screen exists to say, so it goes first.

         No purple rail: it was the only non-blue element on the page, and "these colors,
         something we don't use in HighLevel" was pointed partly at it. -->
    <!-- Simplified (Sujeet, 5 Oct): an AI summary with one headline per stage, the industry
         picker on the eyebrow row and three plain-language stats. -->
    <!-- 19 Oct (Sujit): the WBR summary card, lifted as it was: a border, the wash along the top,
         the headline and one line, then three readings with their icons. The industry control sits
         on the eyebrow row, top-aligned with the chip, as every card's control now does. -->
    <HLCard v-if="simple" id="ai-summary" class="sl-enter sl-hrcard ai-insights-surface" style="--i: 0">
  <div class="p-6 flex flex-col gap-6">
      <!-- 21 Oct (b2 V5): the shared card header. 32 tile, 8 to the heading; the industry control
           sits on the top line, top-aligned with the tile, as every card's control does.
           The dropdown says what it is, "Industry:" in grey inside the button (01 V2), so no
           first-load tip is needed. -->
      <CardHead ai :icon="Stars01Icon" :eyebrow="`AI summary · ${range.label}`" :heading="summaryHeadline" :sub="summaryLines.join(' ')" sub-class="sl-enter max-w-4xl">
        <template #controls>
          <HLButton id="niche-picker" variant="secondary" size="sm" :aria-label="`Industry: ${account.space}. Change industry`" @click="changeIndustry">
            <template #iconLeft><Briefcase01Icon /></template>
            <span class="mr-1 max-w-72 truncate"><span class="text-gray-500 font-normal">Industry:</span> {{ account.space }}</span>
            <template #iconRight><ChevronDownIcon /></template>
          </HLButton>
        </template>
      </CardHead>
      <!-- 21 Oct (Ayushi): the three readings are one structure. Three rows shared across the
           columns (subgrid), so a reading that wraps moves all three sub lines together; equal
           column widths (the rule sits in the middle of the gap, index.css .sl-readings); every
           column is label 13 medium grey, reading 16 semibold, then one 13px line. -->
      <div class="sl-readings grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-0">
        <div
          v-for="(s, i) in summaryCards"
          :key="s.label"
          class="sl-enter flex flex-col min-w-0 sm:grid sm:grid-rows-subgrid sm:row-span-3"
          :style="{ '--i': i + 2 }"
        >
          <span class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ai-insights-icon" aria-hidden="true">
              <component :is="s.icon" class="w-3.5 h-3.5" />
            </span>
            <HLText html-tag="span" size="md" weight="medium" class="text-gray-500">{{ s.label }}</HLText>
          </span>
          <HLText size="2xl" weight="semibold" class="sl-reading text-gray-900 mt-2! line-clamp-2" :title="s.value">{{ s.value }}</HLText>
          <div class="sl-reading-sub mt-1 min-w-0 flex">
            <HLText v-if="s.tail" size="md" class="text-gray-600 leading-4!">{{ s.tail }}</HLText>
          </div>
        </div>
      </div>
    </div>
</HLCard>
    <div v-else class="rounded-xl border border-gray-200 ai-insights-surface p-5 flex flex-col gap-4">
      <!-- The Niche control used to sit on the eyebrow row, which grew that row from 24px to
           32px and pushed the heading 18px lower than the four other section headers on the
           page. Industry trends and Competitors put their control on the heading row instead;
           doing the same here makes the eyebrow 24px again and the spacing falls out on its
           own, rather than being corrected with a margin. It also reads better: the picker
           qualifies the headline, not the section label. -->
      <div>
        <div class="flex items-center gap-2">
          <SectionChip :icon="Stars01Icon" inline ai />
          <!-- The same eyebrow as the four other cards: 12px medium gray-500, sentence case. The
               purple chip beside it is what says AI is speaking, so the label does not need to. -->
          <HLText size="md" weight="medium" class="text-gray-500">AI insights</HLText>
        </div>
        <div class="flex items-start justify-between gap-4 mt-1">
          <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">{{ aiHeadline }}</HLText>
          <div class="flex items-center gap-2 shrink-0">
            <HLText html-tag="span" size="md" class="text-gray-500">Niche:</HLText>
            <!-- B1b: the hand-rolled pill is gone. HLButton sizes the chevron itself, so the
                 icon carries no class of its own. -->
            <!-- The label carries its own right margin. Seven of the 21 niche names end in a
                 descender — "Marketing & Advertising" is the one Sujith caught — and HLButton's
                 own icon gap put that g against the chevron's stroke. Widening the button would
                 have padded both ends and left the two glyphs exactly as close. -->
            <!-- An HLButton rather than an HLDropdown on purpose: it opens the niche modal, which
                 searches all 21 niches. Truncated so a long name cannot push the headline over. -->
            <HLButton id="niche-picker" variant="secondary" size="sm" :aria-label="`Niche: ${account.space}. Change niche`" @click="state.modal = 'space'">
              <span class="mr-1 max-w-48 truncate">{{ account.space }}</span>
              <template #iconRight><ChevronDownIcon /></template>
            </HLButton>
          </div>
        </div>
        <!-- One block, not two paragraphs: nothing but line-height separates the sentences, so
             they read together and the heading takes the only gap in the group. The 6px that used
             to sit between them was close enough to the heading's 8px that neither gap grouped
             anything — four lines in an even column. -->
        <!-- mt-3 restores the 12px the old `flex flex-col gap-3` wrapper was providing; this
             block is no longer a flex column, so the gap has to be stated. -->
        <!-- max-w-4xl (896px), not 78ch. `ch` tracks font size rather than the container, so it resolved
             to a fixed 689px and broke the second sentence with 271px of card unused beside it
             at 1440, and 711px at 1920. 900 comes from measuring every beat against all 20
             niches: the widest sentence in the product is 883px, day 60 on Coaching, whose
             middle is a topic label the copy does not control. Holds both sentences on one
             line each from a 1366px viewport up, and stops the measure growing past 900 on a
             large monitor. It was an arbitrary 900px; 896 is the nearest scale step and
             still clears the 883px sentence. -->
        <div class="max-w-4xl mt-3">
          <HLText size="md" class="text-gray-600">{{ aiDrivers }}</HLText>
          <HLText v-if="aiCaveat" size="md" class="text-gray-600">{{ aiCaveat }}</HLText>
        </div>
      </div>
      <!-- Three across is a desktop layout. Below 1024 the three readings are 16px headings in
           roughly 200px columns and break mid-phrase; they stack rather than wrap. -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div
          v-for="(s, i) in aiStats"
          :key="s.label"
          :class="['flex flex-col gap-3', i < aiStats.length - 1 ? 'pr-6 border-r border-gray-200' : '']"
        >
          <!-- Label beside the icon, reading as the heading. Sujith on the 28 Sep call:
               "copy the same boldness, style and size you use for sentiment and replace it
               with mostly positive — that will actually stand out." The category was the
               largest type in the tile and the least useful word in it: "Sentiment" says
               what you are looking at, "Mostly positive" is the answer.

               The label is the eyebrow every other card on this page uses (12px medium
               gray-500, sentence case) beside a chip at SectionChip's size (24px box, 14px
               glyph), so this stops being the one block with its own rules. -->
          <span class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ai-insights-icon" aria-hidden="true">
              <component :is="s.icon" class="w-3.5 h-3.5" />
            </span>
            <HLText html-tag="span" size="md" weight="medium" class="text-gray-500">{{ s.label }}</HLText>
          </span>
          <!-- The reading, then the movement under it. `parts[0]` is always the reading and
               the rest is the tail, so the split is structural rather than string-matched. -->
          <div>
            <HLText size="2xl" weight="semibold" class="text-gray-900 tabular-nums">
              {{ s.parts[0] && s.parts[0].b ? s.parts[0].b : s.parts[0] }}
            </HLText>
            <HLText size="md" class="text-gray-600 mt-1!">
              <template v-for="(part, j) in tailParts(s.parts)" :key="j"><span v-if="part.b" class="font-semibold text-gray-900 tabular-nums">{{ part.b }}</span><template v-else>{{ part }}</template></template>
            </HLText>
          </div>
        </div>
      </div>
      <!-- H1. The directional caveat is gone. Sujith: "I don't know if that is something
           needed for a customer to know this." -->
    </div>

    <!-- The account's own numbers, before the industry's -->
    <!-- Hidden by default, and between AI Insights and Mentions when shown — the position
         Sujith named on the call. Shivam's objection was redundancy: "mention up by 9%, and
         then you see the mentions below… people might get confused in terms of what
         difference is it in these two mentions." Kept behind the demo toggle rather than
         deleted, because the tiles are dynamic and there may be a use for them once the
         product has more to say. -->
    <GlanceTiles v-if="state.showTiles" />

    <div :class="simple ? 'grid grid-cols-1 lg:grid-cols-12 gap-6' : 'contents'">
    <MentionsRow :class="simple && spans[0]" />

    <!-- What the space is doing: the industry and the people competing in it -->
    <!-- Both cards carry a 200px label column and a bar; side by side under about 1024 the bar
         has too little left to read as a comparison, so they stack instead. -->
    <div :class="simple ? 'contents' : 'grid grid-cols-1 lg:grid-cols-2 gap-5'">

      <!-- Both cards are flex columns with the Next step footer on mt-auto. The grid stretches
           the pair to one height, so the footers sit on the same line whichever card has fewer
           rows (Sujith, 1 Oct). pt-4 keeps the 16px gap the footer had when it followed the rows. -->
      <!-- Simplified adds the entrance and hover motion (sl-enter, sl-card) and nothing else. -->
      <HLCard
        id="industry-trends-card" ref="trendsCardEl"
        :class="simple ? ['sl-enter sl-card sl-hrcard', spans[1]] : 'sl-hrcard'"
        :style="simple ? { '--i': '2' } : undefined"
      >
        <div :class="simple ? 'p-6 flex-1 min-h-0 flex flex-col' : 'p-5 flex-1 min-h-0 flex flex-col'">
        <!-- 21 Oct (b2 V5): the shared card header, 32 tile, 8 to the heading. -->
        <CardHead v-if="simple" :icon="TrendUp01Icon" eyebrow="Industry trends" heading="What your industry is talking about" />
        <template v-else>
        <!-- Round 7 spacing: header row 36 (HLButton sm), chip + eyebrow 24 on the padding line, controls top-aligned with no offset, so content starts 25 from the top and ends 25 from the bottom. -->
        <div class="flex items-start h-9">
          <div class="flex items-center gap-2 h-6 min-w-0">
            <SectionChip :icon="TrendUp01Icon" inline />
            <HLText size="md" weight="medium" class="text-gray-500">Industry trends</HLText>
          </div>
        </div>
        <div class="flex items-start justify-between gap-4 mt-1">
          <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">Topics people are talking about</HLText>
        </div>
        </template>
        <!-- The figure names its own unit inline. Deliberately no "CONVERSATIONS · SEP 15 – SEP 21"
             row like the Mentions card carries: that card has its own 30/60/90 control and has to
             declare the window it used, while this one follows the header range picker, which is
             already on screen. Copying the anatomy brought the fix for a problem this card
             doesn't have. -->
        <!-- a20: the figure takes the page's figure size and its unit sits on its baseline (figures.js). -->
        <div class="flex items-baseline gap-2 flex-wrap mt-4">
          <!-- d01 (21 Oct): printed as is, not counted up. The AI summary's "787 of 6,057 industry posts"
               quotes this total as plain text, so a count-up from 0 showed a second total (4,926) for
               most of a second after every industry change. One figure, one value, at every moment. -->
          <HLText html-tag="span" v-bind="FIG.card" class="text-gray-900 tabular-nums">{{ fmtNum(nicheWindowVolume) }}</HLText>
          <HLText html-tag="span" size="md" class="text-gray-500">{{ simple ? 'posts' : 'mentions' }} {{ period }}</HLText>
        </div>
        <HLText v-if="!simple" size="md" class="text-gray-600 mt-2!">{{ topicsBench }}</HLText>
        <!-- The track is the scale: it spans the column and always stands for 100% of the
             conversation, so a bar means the same thing here and on the Competitors card. -->
        <div ref="trendsListEl" :class="['flex flex-col', simple ? 'mt-2' : 'mt-3']">
          <!-- No per-row change column. The subline says how many topics moved and the Next
               step names the one that did, so the movement is stated in prose instead of in a
               column that read "flat" on most rows. -->
          <!-- The trailing 32px column is empty here and holds the remove button on the
               Competitors card. It stays so both cards' tracks start and end at the same x: a 25%
               bar has to be the same length on each, which is what "same scale as the topics
               card" promises. The label column is 200px here and rank 18 + gap 14 + name 168
               there, which is the same 200. -->
          <!-- ChartTip is a hover readout in the simplified design and a pass-through otherwise. -->
          <ChartTip
            v-for="topic in topicShareRows" :key="topic.label"
            :lines="[topic.label, `${topic.value}% of all posts`, `About ${fmtNum((nicheWindowVolume * topic.value) / 100)} posts ${period}`]"
          >
            <!-- 19 Oct audit: label and bar share the width; a fixed 200px label left a 40px bar at 1280. -->
            <!-- 19 Oct: label, then a bar that fills everything up to the %, which sits on the card edge.
                 No trailing column here; Competitors keeps one for its Stop tracking button. -->
            <!-- 19 Oct (option D): every row opens; a topic opens its insights, the remainder opens every topic. -->
            <div
              :class="['grid items-center h-9', simple ? 'grid-cols-[minmax(0,172px)_minmax(0,1fr)_36px_16px] gap-4 sl-row-hover cursor-pointer' : 'grid-cols-[minmax(0,1.15fr)_minmax(64px,1fr)_46px_32px] gap-3.5']"
              :role="simple ? 'button' : undefined" :tabindex="simple ? 0 : undefined"
              :aria-label="simple ? (topic.rest ? `See all ${otherTopicCount + topicShareRows.length - 1} topics in your industry` : `See what people say about ${topic.label}`) : undefined"
              @click="simple && openTopicRow(topic)" @keydown.enter.space.prevent="simple && openTopicRow(topic)"
            >
              <HLText v-if="simple && topic.rest" html-tag="span" size="md" weight="semibold" class="text-primary-700 min-w-0 truncate">{{ otherTopicCount }} other topics</HLText>
              <HLText v-else html-tag="span" size="md" class="text-gray-900 min-w-0 truncate">{{ topic.label }}</HLText>
              <HLProgress
                :id="`topic-share-${topic.label}`"
                :percentage="topic.value"
                :show-indicator="false"
                :height="10"
                :border-radius="5"
                :fill-border-radius="4"
                rail-color="var(--color-gray-100)"
                :color="topic.rest ? 'var(--color-chart-faint)' : (simple ? 'var(--color-chart-strong)' : 'var(--color-primary-600)')"
                :aria-label="`${topic.label}, ${topic.value}% of the conversation`"
              />
              <HLText html-tag="span" size="md" weight="semibold" class="text-gray-900 text-right tabular-nums">{{ topic.value }}%</HLText>
              <ChevronRightIcon v-if="simple" class="w-4 h-4 text-gray-400" aria-hidden="true" />
              <span v-else aria-hidden="true" />
            </div>
          </ChartTip>
        </div>
        <div v-if="simple" ref="trendsFootEl" class="mt-auto pt-4">
          <div class="flex items-start gap-3 pt-3 border-t border-gray-200">
            <HLText size="md" class="text-gray-600 min-w-0 flex-1">
              <span class="font-semibold text-gray-900">Next step:</span> {{ trendsNext.text }}
            </HLText>
            <!-- A plain text link: the search icon made the line 8px too wide at 1440 and pushed it to a second line. -->
            <HLButton v-if="trendsNext.term" id="trends-next-search" class="shrink-0" variant="text" color="blue" size="xs" @click="searchFor(trendsNext.term)">
              {{ trendsNext.label || 'Search it' }}
            </HLButton>
          </div>
        </div>
        <div v-else class="mt-auto pt-4">
          <HLText size="md" class="text-gray-600 pt-3.5 border-t border-gray-200">
            <span class="font-semibold text-gray-900">Next step:</span> {{ topicsNextStep }}
          </HLText>
        </div>
      </div>
</HLCard>

      <!-- PieChart01, not Users01: the AI insights row already gives that glyph to "Share of
           conversation", which is exactly what this card measures. Same metric, same glyph. -->
      <!-- 21 Oct: the simplified design's card lives in CompetitorsCard.vue (0 / 1–2 / 3 tracked states). -->
      <CompetitorsCard v-if="simple" :class="spans[2]" />
      <div
        v-else
        id="competitors-card"
        :class="simple ? ['sl-enter sl-card bg-white border border-gray-200 rounded-xl p-6 flex flex-col', spans[2]] : 'bg-white border border-gray-200 rounded-xl p-5 flex flex-col'"
        :style="simple ? { '--i': '3' } : undefined"
      >
        <div class="flex items-center gap-2 h-9">
          <SectionChip :icon="PieChart01Icon" inline />
          <HLText size="md" weight="medium" class="text-gray-500">Competitors</HLText>
          <span class="flex-1" />
<div v-if="simple" class="relative top-1.5 shrink-0">
          <HLButton v-if="account.competitors.length" id="edit-competitors" variant="secondary" size="sm" @click="state.modal = 'competitor'">Edit competitors</HLButton>
          <!-- 19 Oct (B): the top-line slot always holds the card's one action, Add until there is
               a competitor, then Edit, like the other cards' controls. -->
          <HLButton v-else id="add-competitor" variant="secondary" size="sm" @click="state.modal = 'competitor'">Add competitor
          </HLButton>
          </div>
        </div>
        <div class="flex items-start justify-between gap-4 mt-1">
          <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">{{ simple ? 'Who leads among your competitors' : 'Who is leading the conversation' }}</HLText>
          <!-- Nothing to change until there is a competitor to change. With none set, this and the
               empty state's "+ Add competitor" were two buttons opening the same modal. -->
          <HLButton v-if="!simple && account.competitors.length" id="edit-competitors" variant="secondary" size="sm" @click="state.modal = 'competitor'">Edit competitors</HLButton>
        </div>

        <template v-if="account.competitors.length">
          <!-- Figure + inline unit, matching the topics card. No window label here either —
               same reason. The "SHARE OF CONVERSATION" eyebrow that sat below is gone: the
               unit phrase now says what the rows are. -->
          <div class="flex items-baseline gap-2 flex-wrap mt-4">
            <HLText html-tag="span" v-bind="FIG.card" class="text-gray-900 tabular-nums"><CountUp :value="yourShare" suffix="%" /></HLText>
            <!-- 15 Oct (audit 14): a short unit beside the figure, like the other cards; the
                 ranking moves into the sentence under it. -->
            <HLText v-if="simple" html-tag="span" size="md" class="text-gray-500">your share</HLText>
            <!-- "of the brands you track", not "of the conversation". These shares are rebased
                 across the tracked set, and Shivam was explicit that four brands are never
                 100% of a niche, so the unit has to say which 100% this is. -->
            <HLText v-else html-tag="span" size="md" class="text-gray-500">
              of the brands you track {{ period }}, {{ yourRank }}{{ ordinal(yourRank) }} of {{ shareRows.length }}
            </HLText>
          </div>
          <HLText size="md" class="text-gray-600 mt-2.5!">
            <template v-if="simple">{{ competitorLine }}</template><template v-else>{{ competitorGap }}</template>
          </HLText>
          <!-- A leaderboard, so every row carries its rank. The rank is what answers "where am
               I" before a single percentage is read, and it keeps working when you are 9th
               rather than 4th.
               
               Your row is structurally identical to the others: no tint band behind it and no
               chip beside the name. accent-indigo on the bar and the rank carries it, with the
               name in semibold so identity is not colour alone. -->
          <!-- Rows are a fixed 36px on both cards, so the 32px remove button fits inside a row
               rather than making the competitor rows taller than your own. -->
          <div :class="['flex flex-col', simple ? 'mt-2' : 'mt-3']">
            <ChartTip
              v-for="c in shareRows" :key="c.name"
              :lines="[c.you ? 'You' : c.name, `${c.value}% among the brands you track`, `Ranked ${shareRows.indexOf(c) + 1} of ${shareRows.length}`]"
            >
              <div :class="['grid grid-cols-[18px_168px_1fr_46px_32px] items-center gap-3.5 h-9', simple ? 'sl-row-hover' : '']">
                <HLText html-tag="span" size="md" :weight="c.you ? 'semibold' : 'regular'" :class="['text-right tabular-nums', c.you ? (simple ? 'text-gray-900' : 'text-accent-indigo') : 'text-gray-500']">
                  {{ shareRows.indexOf(c) + 1 }}
                </HLText>
                <HLText html-tag="span" size="md" :weight="c.you ? 'semibold' : 'regular'" class="min-w-0 truncate text-gray-900">
                  {{ c.you ? 'You' : c.name }}
                </HLText>
                <!-- 4px data-end on both cards' bars, not rounded-full. At 7% a fully rounded fill
                     is shorter than its own radius and renders as a dot, which stops reading as a
                     bar exactly where you most need it to: your own row, early on, when you are last. -->
                <HLProgress
                  :id="`competitor-share-${c.name}`"
                  :percentage="c.value"
                  :show-indicator="false"
                  :height="10"
                  :border-radius="5"
                  :fill-border-radius="4"
                  rail-color="var(--color-gray-100)"
                  :color="c.you ? (simple ? 'var(--color-chart-strong)' : 'var(--color-accent-indigo)') : (simple ? 'var(--color-chart-soft)' : 'var(--color-primary-200)')"
                  :aria-label="`${c.you ? 'You' : c.name}, ${c.value}% of the brands you track`"
                />
                <HLText html-tag="span" size="md" weight="semibold" class="text-gray-900 text-right tabular-nums">{{ c.value }}%</HLText>
                <!-- Its own 32px column, always visible. It used to sit in the card padding at
                     opacity 0 until hover, which hid it from anyone who did not already know it
                     was there. Never on your own row, which is not something you can stop tracking. -->
                <HLTooltip v-if="!c.you" trigger="hover">
                  <template #trigger>
                    <HLButton
                      :id="`remove-competitor-${c.name}`"
                      variant="ghost" size="sm"
                      :aria-label="`Stop tracking ${c.name}`"
                      @click="removeCompetitor(c.name)"
                    >
                      <template #iconLeft><XCloseIcon /></template>
                    </HLButton>
                  </template>
                  Stop tracking {{ c.name }}
                </HLTooltip>
                <span v-else aria-hidden="true" />
              </div>
            </ChartTip>
          </div>
          <template v-if="simple">
            <div v-if="competitorNext" class="mt-auto pt-4">
              <div class="flex items-start gap-3 pt-3 border-t border-gray-200">
                <HLText size="md" class="text-gray-600 min-w-0 flex-1">
                  <span class="font-semibold text-gray-900">Next step:</span> {{ competitorNext.text }}
                </HLText>
                <HLButton id="competitor-next-search" class="shrink-0" variant="text" color="blue" size="xs" @click="searchFor(competitorNext.term)">
                  Search it
                </HLButton>
              </div>
            </div>
          </template>
          <div v-else class="mt-auto pt-4">
            <HLText size="md" class="text-gray-600 pt-3.5 border-t border-gray-200">
              <span class="font-semibold text-gray-900">Next step:</span> {{ competitorNextStep }}
            </HLText>
          </div>
        </template>
        <!-- 15 Oct (review 2): suggest the industry's likely competitors, one click each, instead
             of an empty box. Someone else is still a search away. -->
        <!-- 19 Oct (Sujit): the suggestions read as suggestions. Dashed, grey, the whole row is the
             button, and nothing is added until it's clicked. The line under the title is the earlier
             one ("Add up to 3 competitors to see how you compare"). -->
        <div v-else-if="simple" id="competitor-suggestions" class="flex flex-col mt-1 flex-1">
          <HLText size="md" class="text-gray-600">Track up to 3 competitors to see how you compare.</HLText>
          <HLText size="md" weight="medium" class="text-gray-500 mt-4!">Suggested for {{ account.space }}</HLText>
          <div class="flex flex-col gap-2 mt-2">
            <button
              v-for="n in suggestedCompetitors" :key="n" :id="`suggest-add-${initials(n)}`" type="button" class="sl-comp-suggest"
              :aria-label="`Add ${n} as a competitor`" @click="addCompetitor(n)"
            >
              <span class="sl-comp-mono" aria-hidden="true">{{ initials(n) }}</span>
              <HLText html-tag="span" size="md" weight="medium" class="text-gray-700 flex-1 min-w-0 truncate text-left">{{ n }}</HLText>
              <PlusIcon class="w-4 h-4 text-gray-500 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div v-else class="flex justify-center py-8">
          <HLEmpty
            id="competitors-empty"
            size="sm"
            :custom-icon="PieChart01Icon"
            custom-icon-bg-color="var(--color-gray-100)"
            custom-icon-color="var(--color-gray-600)"
            :description="simple ? 'Track up to 3 competitors to see how you compare.' : `Add a competitor to see how ${account.short} compares.`"
          >
            <template #actions>
              <HLButton id="add-competitor" variant="secondary" size="sm" @click="state.modal = 'competitor'">Add competitor
              </HLButton>
            </template>
          </HLEmpty>
        </div>
      </div>
    </div>

    <!-- Simplified: the topics they saved, once there are three (Harsh, 6 Oct). -->
    <!-- Replaced in the simplified design by the topic cards at the top (WBR 12 Oct). -->
    <TopicsOverview v-if="!simple" />

    <!-- WBR 12 Oct (8E): the top trends, above what to post. -->
    <TrendsCard v-if="simple" :class="spans[3]" />
    </div>

    <!-- What to post next -->
    <HLCard
      id="post-card"
      :class="simple ? 'sl-enter sl-card sl-hrcard' : 'sl-hrcard'"
      :style="simple ? { '--i': '5' } : undefined"
    >
      <div :class="simple ? 'p-6' : 'p-5'">
      <!-- Same four slots as Mentions, Industry trends and Competitors: category eyebrow,
           a sentence as the heading, the figure, then a line of context. The card used to
           put its name in the heading slot and set the finding at 14px semibold — a pairing
           that appears nowhere else on the page, which is why it read as a foreign card. -->
      <!-- 19 Oct (Sujit): a card's controls start on its top line, level with the chip, as the
           Industry control does on the summary. -->
      <!-- 21 Oct (b2 V5): the shared card header. The sub line is folded into the heading, so the
           header is two lines: tile + eyebrow with the controls level with the tile, then the heading.
           21 Oct (b1 V1, Sujit: "the button size can't keep changing"): both buttons are HLButton
           secondary sm as HighRise draws it, with line icons of one weight (FilterLines filters,
           SwitchVertical01 sorts) and tabular figures. Each label sits in a one-cell grid with every
           label that button can show, hidden, so the button is always as wide as its longest label
           and never moves; the label stays left and the chevron stays right. -->
      <CardHead v-if="simple" :icon="Stars02Icon" :eyebrow="`What to post next · ${range.label}`" :heading="`Posts doing well in ${account.space}`">
        <template #controls>
          <div id="post-controls" class="flex items-center gap-2 shrink-0">
            <HLDropdown
              id="post-focus-dropdown" :options="topicOptions" multiple show-checkbox :close-on-select="false" :show-search="false" max-height="460px"
              placement="bottom-end" trigger="click" :width="280" @select="togglePick"
            >
              <HLButton id="post-focus-menu" variant="secondary" size="sm" :aria-label="`${picksLabel}. Change topics`">
                <template #iconLeft><FilterLinesIcon /></template>
                <span class="sl-reserve tabular-nums"><span v-for="l in picksLabels" :key="l" class="sl-reserve-ghost" aria-hidden="true">{{ l }}</span><span>{{ picksLabel }}</span></span>
                <template #iconRight><ChevronDownIcon /></template>
              </HLButton>
            </HLDropdown>
            <HLDropdown id="post-goal-menu" trigger="click" placement="bottom-end" :options="POST_GOALS.map((g) => ({ key: g.key, label: g.label, class: g.key === postGoal ? 'sl-opt-on' : undefined }))" :show-search="false" @select="(k) => (postGoal = k)">
              <HLButton id="post-goal" variant="secondary" size="sm" :aria-label="`Ranked by ${goalLabel}. Change`">
                <template #iconLeft><SwitchVertical01Icon /></template>
                <span class="sl-reserve tabular-nums"><span v-for="g in POST_GOALS" :key="g.key" class="sl-reserve-ghost" aria-hidden="true">{{ g.label }}</span><span>{{ goalLabel }}</span></span>
                <template #iconRight><ChevronDownIcon /></template>
              </HLButton>
            </HLDropdown>
          </div>
        </template>
      </CardHead>
      <template v-else>
        <div class="flex items-start justify-between gap-x-4 gap-y-2 flex-wrap min-h-9">
          <div class="flex items-center gap-2 h-6">
            <SectionChip :icon="Lightbulb01Icon" inline />
            <HLText size="sm" weight="medium" class="text-gray-500">What to post next</HLText>
          </div>
        </div>
        <!-- No Ask AI here: it opened the same panel as the header's Ask AI (Sujit, 30 Sep). -->
        <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900 mt-0.5!">{{ formatCopy.insight }}</HLText>
        <div class="flex items-baseline gap-2 mt-4">
          <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900 tabular-nums">{{ formatCopy.stat }}</HLText>
          <HLText html-tag="span" size="md" class="text-gray-500">{{ formatCopy.statUnit }}</HLText>
        </div>

        <!-- A subheading inside the card, not a second eyebrow: one eyebrow per card. -->
        <HLText html-tag="h3" size="lg" weight="semibold" class="text-gray-900 mt-5!">Get inspired</HLText>
      </template>

      <!-- Masonry: 9:16, 4:5 and 16:9 can't share an even grid, so each tile keeps its own
           shape and the columns stack them. Up to five columns, 170px minimum each — five was
           picked over four and six from an artifact (30 Sep).
           Real columns rather than CSS multi-column, so the stagger survives Show more; see
           the note above ideaColumns for what multi-column was doing to it.
           Plain photos only — the shape is the one format signal we can stand behind. -->
      <div id="post-grid" ref="ideaGrid" :class="['flex items-start', simple ? 'gap-6 mt-4' : 'gap-4 mt-3']">
        <div v-for="(col, ci) in ideaColumns" :key="ci" :class="['flex-1 min-w-0 flex flex-col', simple ? 'gap-8' : 'gap-4']">
          <!-- Keyed on the goal and the loading state too in the simplified design, so a new
               ranking enters again after its skeleton. -->
          <div
            v-for="idea in col" :key="idea.key + (simple ? postGoal + (postsLoading ? '-loading' : '') : '')" :data-idea="idea.key"
            :class="simple ? 'sl-zoom flex flex-col gap-3 sl-enter group/post' : 'flex flex-col gap-2'"
          >
            <!-- 21 Oct (pick 08 V1): the loading tile, HighRise skeletons in the tile's own shape. -->
            <template v-if="simple && postsLoading">
              <div class="w-full rounded-lg overflow-hidden" :style="idea.shape?.text ? { height: '128px' } : { aspectRatio: idea.aspect }">
                <HLSkeleton :id="`post-skeleton-${idea.key}`" width="100%" height="100%" :round="false" />
              </div>
              <div class="flex flex-col gap-2 pt-0.5">
                <HLSkeleton :id="`post-skeleton-a-${idea.key}`" width="55%" :height="12" :round="false" />
                <HLSkeleton :id="`post-skeleton-b-${idea.key}`" width="92%" :height="12" :round="false" />
                <HLSkeleton :id="`post-skeleton-c-${idea.key}`" width="45%" :height="12" :round="false" />
              </div>
            </template>
            <template v-else>
            <!-- Simplified: a platform badge, a carousel stack behind carousels, and hover actions. -->
            <div v-if="simple" :class="['relative', idea.shape?.stack ? 'sl-stack pr-3' : '']">
              <template v-if="idea.shape?.stack">
                <span class="sl-stack-layer sl-stack-back absolute right-0 inset-y-6 w-1/2 rounded-lg bg-gray-300" aria-hidden="true" />
                <span class="sl-stack-layer sl-stack-mid absolute right-2 inset-y-3 w-1/2 rounded-lg bg-gray-400" aria-hidden="true" />
              </template>
              <div :class="['relative w-full rounded-lg overflow-hidden', idea.shape?.text ? 'bg-gray-50 border border-gray-200 px-4 py-8' : 'bg-gray-100']" :style="idea.shape?.text ? undefined : { aspectRatio: idea.aspect }">
                <HLText v-if="idea.shape?.text" size="lg" weight="medium" class="text-gray-900">“{{ idea.title }}”</HLText>
                <img v-else :src="idea.image" :alt="idea.title" loading="lazy" class="absolute inset-0 w-full h-full object-cover object-top" />
                <span class="absolute top-2 left-2 w-7 h-7 rounded-full bg-white shadow-(--shadow-sm) flex items-center justify-center" :title="idea.source.label">
                  <component :is="NETWORK_ICONS[idea.source.key]" class="w-4 h-4" aria-hidden="true" />
                  <span class="sr-only">{{ idea.shape.label }} on {{ idea.source.label }}</span>
                </span>
                <div class="sl-post-actions absolute inset-x-0 bottom-0 p-2 flex flex-col gap-2">
                  <HLButton :id="`post-make-${idea.key}`" variant="primary" color="blue" size="sm" full-width @click="makeLikeThis(idea)">{{ simple ? 'Draft a post like this' : 'Create post like this' }}</HLButton>
                  <HLButton :id="`post-open-${idea.key}`" variant="secondary" size="sm" full-width @click="openOriginal(idea)">Open original</HLButton>
                </div>
              </div>
            </div>
            <div v-else class="relative w-full rounded-lg overflow-hidden bg-gray-100" :style="{ aspectRatio: idea.aspect }">
              <img :src="idea.image" :alt="idea.title" loading="lazy" class="absolute inset-0 w-full h-full object-cover object-top" />
            </div>
            <div v-if="simple">
              <HLText size="md" weight="medium" class="text-gray-500">{{ idea.author }} · {{ idea.age }}</HLText>
              <HLText v-if="!idea.shape?.text" size="md" weight="medium" class="text-gray-900 mt-1!">{{ idea.title }}</HLText>
              <HLText v-else size="md" weight="medium" class="text-gray-900 mt-1!">Text post on {{ idea.source.label }}</HLText>
              <HLText size="md" class="text-gray-600 mt-1! tabular-nums">
                <span class="font-semibold text-gray-900">{{ compactNum(idea.metrics[postGoal]) }} {{ goalUnit }}</span><span class="text-gray-400" aria-hidden="true"> · </span><span class="text-positive-strong font-medium">{{ idea.lift[postGoal] }}× their usual</span>
              </HLText>
            </div>
            <div v-else>
              <HLText size="md" weight="medium" class="text-gray-900">{{ idea.title }}</HLText>
              <HLText size="md" class="text-gray-500 mt-1! tabular-nums">{{ idea.metric }} · {{ idea.age }}</HLText>
            </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Under the grid: that's where the eye is when the preview runs out. -->
      <!-- out9 q17: the picked topics have no posts this week. -->
      <div v-if="noTopicPosts && !postsLoading" id="post-empty" class="flex justify-center py-12">
        <HLEmpty
          size="sm" :custom-icon="Stars02Icon" custom-icon-bg-color="var(--color-gray-100)" custom-icon-color="var(--color-gray-600)"
          :title="`No standout posts about ${picksList} yet`"
          description="Posts show up here once one does well for businesses like yours."
        >
          <template #actions>
            <HLButton id="post-empty-all" variant="secondary" size="sm" @click="topicPicks = []">Show all topics</HLButton>
          </template>
        </HLEmpty>
      </div>
      <div v-if="feed.length > ideasCollapsed" class="flex justify-center mt-1">
        <HLButton id="ideas-toggle" variant="secondary" size="sm" :aria-expanded="showAllIdeas" @click="showAllIdeas = !showAllIdeas">
          <template #iconRight><component :is="showAllIdeas ? ChevronUpIcon : ChevronDownIcon" /></template>
          {{ showAllIdeas ? 'Show less' : 'Show more' }}
        </HLButton>
      </div>
    </div>
</HLCard>
  </div>
</template>

<style scoped>
/* b1 V1: a button sized to its longest label. Every label shares one grid cell; only the current
   one shows, the rest hold the width open (left-aligned, so the chevron keeps its place). */
.sl-reserve { display: inline-grid; text-align: left; }
.sl-reserve > * { grid-area: 1 / 1; }
.sl-reserve-ghost { visibility: hidden; }
.sl-comp-suggest { display: flex; align-items: center; gap: 12px; height: 44px; padding: 0 14px 0 10px; border: 1px dashed var(--color-gray-300); border-radius: 8px; background: none; cursor: pointer; transition: border-color .15s, background-color .15s; }
.sl-comp-suggest:hover { border-color: var(--color-gray-400); background: var(--color-gray-50); }
.sl-comp-suggest:focus-visible { outline: 2px solid var(--color-primary-600); outline-offset: 2px; }
.sl-comp-mono { width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0; display: grid; place-items: center; background: var(--color-gray-100); font-size: 13px; font-weight: 600; color: var(--color-gray-500); }
</style>

