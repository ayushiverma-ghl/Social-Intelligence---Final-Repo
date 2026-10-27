<script setup>
// Mentions, brand-level with the niche as context.
//
// On 28 Sep this went niche-only: Sujith, "mentions will now be only niche-based, and it will
// never be brand-based." On 30 Sep he reversed it: "mentions now it is going to be this
// subaccount... what people are saying about your brand." So the heading and the headline
// figure are the account's again, and the keywords stay the niche's and say so, because no
// brand-level keywords exist in the data yet.
//
// Shivam on what replaces it: "top mentions around the niche", as keywords, "top 5,
// maximum top 5". Hence the ranked list rather than a chart.
//
// What went with the chart: the hover tooltip, the day axis and the beat-shaped series.
// Worth recording that the hover was the one interaction on this page anyone reacted well
// to — it is a real loss, taken deliberately in exchange for naming the five keywords.
import { computed, ref } from 'vue'
import { MessageChatCircleIcon, ArrowUpIcon, ArrowDownIcon } from '@gohighlevel/ghl-icons/24/outline'
import SectionChip from './SectionChip.vue'
import CardHead from './CardHead.vue'
import CountUp from './CountUp.vue'
import DailyBars from './DailyBars.vue'
import MentionsVariants from './MentionsVariants.vue'
import MentionsTabsCard from './MentionsTabsCard.vue'
import { tabsModeOf } from './brandWeek.js'
import { fmtNum, nicheKeywords, keywordSeries, quickSearchResult } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'

const { state, account, spaceData, range, nicheWindowVolume, brandVolume, brandDelta, simple, beat, runSearch, peek } = useSocialListening()
const tabsMode = computed(() => (simple.value ? tabsModeOf(state) : null))

// Simplified design: the Next step line carries a Search it button that runs the climber in AI insights.
const cap = (s) => s && s.charAt(0).toUpperCase() + s.slice(1)
function searchIt(term) {
  if (simple.value) { peek(term); return }
  state.tab = 'insights'
  runSearch(term)
}

// A niche is all this card needs now. It used to key off the demo beat carrying a volume,
// which meant it drew an account's figures for an account with nothing connected.
const hasData = computed(() => !!account.value.space)

const windowDays = computed(() => range.value.days)

// The niche's total for the window, shared with Industry trends so the two cards cannot
// print different figures for the same seven days the way they used to.
const windowTotal = computed(() => nicheWindowVolume.value)

// The brand's movement, derived from the same share its headline figure is, so the number
// and the arrow cannot tell different stories. Null at day 7, which has no beat behind it.
const delta = computed(() => brandDelta.value)
// Simplified design greys the delta at the dip beat rather than painting it red.
const deltaTone = computed(() =>
  simple.value && beat.value.dip ? 'text-gray-600' : delta.value < 0 ? 'text-negative-strong' : 'text-positive-strong')

const keywords = computed(() => nicheKeywords(account.value.space, range.value.key))

// Month names for the axis ticks past a week.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// The fastest riser rather than the biggest. The chart ranks by size already, so repeating
// its top line as the closing sentence would say nothing new.
const climbing = computed(() =>
  [...keywords.value].sort((a, b) => b.delta - a.delta)[0])

// ——— The chart ————————————————————————————————————————————————————————————
// Five lines, one per keyword, on a single-hue ramp that darkens by rank.
//
// Not five colours. The token file has one strong blue and four accents, three of which are
// reserved for status, and every combination of what is left fails a colourblind-separation
// check against the brand blue: #6938EF against #155EEF is dE 1.0 for a deuteranope and 10.3
// for normal vision, under a floor of 15. A deuteranope would read the top two keywords as
// one line. The five are a RANKED list, so one hue darkening by rank is both honest and
// legible, and 300/400/500/700/900 is the run that clears the adjacent-step gap check.
// 600/500/400/300/200, which is what the eye reaches for, fails it at the dark end.
// Darkest first: the series arrive ranked by size, and a sequential encoding reads dark for
// large. Drawn the other way round the biggest keyword was the faintest line on the card.
const RAMP = [
  'var(--color-primary-900)',
  'var(--color-primary-700)',
  'var(--color-primary-500)',
  'var(--color-primary-400)',
  'var(--color-primary-300)',
]
// The same ramp as classes, for the HTML swatches (legend, tooltip, markers). Inline colour
// styles are off the table, and the SVG strokes above are the only place a var() is needed.
const RAMP_BG = ['bg-primary-900', 'bg-primary-700', 'bg-primary-500', 'bg-primary-400', 'bg-primary-300']

const nicheChart = computed(() => keywordSeries(account.value.space, range.value.key))
// Simplified design (Shivam, 5 Oct): one line, the brand's own mentions day by day. Five keyword
// lines would each need a topic running behind them. 7 Oct (Sujith): drawn like the topic page's
// Volume trend, so the day-by-day shape is the one a search for the brand would show, scaled to
// this card's total. The niche's shape is the fallback.
const chart = computed(() => {
  const c = nicheChart.value
  if (!simple.value || !c.points) return c
  const r = quickSearchResult(account.value.short, range.value.key, account.value.space)
  const shape = r && r.series && r.series.length === c.points ? r.series : c.totals
  const sum = shape.reduce((a, v) => a + v, 0) || 1
  const days = shape.map((v) => Math.round((v / sum) * (brandVolume.value || 0)))
  return { points: c.points, series: [{ term: account.value.short, days }], totals: days }
})

const CHART_W = 640
const CHART_H = 132
const TOP = 10
const BASE = 112
// The first and last points sit on the plot's edges; without this inset the outer half of
// each end marker would be clipped by the card.
const PAD_X = 6

const chartMax = computed(() => Math.max(1, ...chart.value.series.flatMap((sr) => sr.days)))
const px = (i) => PAD_X + (i / Math.max(1, chart.value.points - 1)) * (CHART_W - PAD_X * 2)
const py = (v) => BASE - (v / chartMax.value) * (BASE - TOP)

// Simplified (7 Oct review, 2A): the search page's Volume trend graph, reused as is. It takes
// the brand's day-by-day counts and a date for each day.
const days0 = computed(() => chart.value.series[0]?.days || [])
// Day 0 (7 Oct, option B): seven dates evenly spread over the window, for the ghost chart's axis.
const ghostLabels = computed(() => {
  const l = dayLabels.value
  if (l.length <= 7) return l
  return Array.from({ length: 7 }, (_, k) => l[Math.round((k / 6) * (l.length - 1))])
})
const dayMax = computed(() => Math.max(1, ...days0.value))
const dense = computed(() => days0.value.length > 14)
// 15 Oct (D): three readings of the same days, so the space under the figure says something.
const dayName = (i) => (i === days0.value.length - 1 ? 'Today' : dayLabels.value[i])
const readings = computed(() => {
  const d = days0.value
  if (!d.length) return []
  const hi = d.indexOf(Math.max(...d))
  const lo = d.indexOf(Math.min(...d))
  return [
    { label: 'Busiest day', value: dayName(hi), note: fmtNum(d[hi]) },
    { label: 'Daily average', value: fmtNum(Math.round(d.reduce((a, v) => a + v, 0) / d.length)), note: 'mentions' },
    { label: 'Quietest day', value: dayName(lo), note: fmtNum(d[lo]) },
  ]
})
const dayLabels = computed(() => days0.value.map((_, i) => { const d = dateAt(i); return `${MONTHS[d.getMonth()]} ${d.getDate()}` }))
const paths = computed(() => chart.value.series.map((sr, i) => ({
  term: sr.term,
  colour: simple.value ? 'var(--color-primary-600)' : (RAMP[i] || RAMP[RAMP.length - 1]),
  swatch: RAMP_BG[i] || RAMP_BG[RAMP_BG.length - 1],
  d: sr.days.map((v, j) => `${j ? 'L' : 'M'}${px(j).toFixed(1)},${py(v).toFixed(1)}`).join(' '),
})))

// Dates for the axis and the tooltip. The window ends today and runs back `points` days.
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const dateAt = (i) => new Date(Date.now() - (chart.value.points - 1 - i) * 86400000)

// A label per day at a week, six evenly spaced ticks beyond that, so 30 days does not draw
// thirty overlapping dates.
const xLabels = computed(() => {
  const n = chart.value.points
  if (n <= 7) return Array.from({ length: n }, (_, i) => ({ left: pctLeft(i), text: DAY_NAMES[dateAt(i).getDay()] }))
  const ticks = 6
  const step = (n - 1) / (ticks - 1)
  return Array.from({ length: ticks }, (_, k) => {
    const i = Math.round(k * step)
    const d = dateAt(i)
    return { left: pctLeft(i), text: `${MONTHS[d.getMonth()]} ${d.getDate()}` }
  })
})

// The card is wider than the viewBox, so the SVG stretches horizontally and anything round
// inside it would come out as an ellipse. The crosshair and markers are HTML on the same
// fractions instead, which also keeps the hairline at 1px whatever the card's width.
const pctLeft = (i) => `${(px(i) / CHART_W) * 100}%`
const pctTop = (v) => `${(py(v) / CHART_H) * 100}%`

const plot = ref(null)
const hover = ref(null)

function onMove(e) {
  const el = plot.value
  if (!el || !chart.value.points) return
  const box = el.getBoundingClientRect()
  const last = chart.value.points - 1
  showAt(Math.round(((e.clientX - box.left) / box.width) * last))
}
// Keyboard: the plot takes focus and the arrow keys walk the days, so the readout is not
// mouse-only. Focus lands on the latest day, which is the one people ask about.
function onFocus() { showAt(chart.value.points - 1) }
function onKey(e) {
  if (!hover.value) return
  const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
  if (!step) return
  e.preventDefault()
  showAt(hover.value.i + step)
}
function showAt(raw) {
  const last = chart.value.points - 1
  if (last < 0) return
  const i = Math.max(0, Math.min(last, raw))
  const d = dateAt(i)
  hover.value = {
    i,
    left: pctLeft(i),
    // Clamped so a tooltip near either edge stays on the card rather than hanging off it.
    // Beside the crosshair, flipping to whichever side has room, and vertically centred on
    // the plot. Parked above it the tooltip is taller than the 132px chart and covered the
    // card's own heading.
    flip: i > (chart.value.points - 1) / 2,
    // Month before day, as on the axis ("Sep 24"), with the weekday in front.
    date: `${DAY_NAMES[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`,
    total: chart.value.totals[i],
    rows: chart.value.series.map((sr, k) => ({
      term: sr.term, value: sr.days[i], swatch: RAMP_BG[k] || RAMP_BG[RAMP_BG.length - 1], top: pctTop(sr.days[i]),
    })),
  }
}
function onLeave() { hover.value = null }
</script>

<template>
  <!-- Round 7: the card shell is HLCard (HighRise), 24 on all sides inside; hover kept (.sl-card). -->
  <HLCard
    v-if="hasData"
    id="mentions-card"
    :style="{ '--i': '1' }"
    class="sl-enter sl-card sl-hrcard"
  >
  <div :class="['p-6 flex-1 min-h-0', tabsMode && 'flex flex-col']">
    <!-- 21 Oct: the tabs card (default) sits in the two-up row; the other two layouts from
         Demo controls take the full width. -->
    <MentionsTabsCard v-if="simple && brandVolume && tabsMode" :tabs="tabsMode" />
    <MentionsVariants v-else-if="simple && brandVolume" />

    <template v-else>
    <!-- 21 Oct audit 3: the empty (New) state keeps the shared 32px card header, like the tabs card. -->
    <CardHead v-if="simple" :icon="MessageChatCircleIcon" :eyebrow="`Mentions · ${range.label}`" heading="How often people mention you" />
    <template v-else>
    <div class="flex items-center gap-2">
      <SectionChip :icon="MessageChatCircleIcon" inline />
      <HLText size="md" weight="medium" class="text-gray-500">Mentions</HLText>
    </div>
    <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900 mt-0.5!">
      {{ `What people are saying about ${account.name}` }}
    </HLText>
    </template>

    <!-- Simplified: the brand's count on its own, a plain empty line when there is none, and a
         heading that says the keywords below are the industry's. -->
    <template v-if="simple">
      <div v-if="brandVolume" class="flex items-baseline gap-2.5 mt-4">
        <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900 tabular-nums"><CountUp :value="brandVolume" /></HLText>
        <HLText html-tag="span" size="md" class="text-gray-500">mentions</HLText>
        <HLText
          v-if="delta"
          html-tag="span"
          size="md"
          weight="semibold"
          :class="['inline-flex items-center gap-0.5 tabular-nums', deltaTone]"
        >
          <component :is="delta < 0 ? ArrowDownIcon : ArrowUpIcon" class="w-3.5 h-3.5 self-center" aria-hidden="true" />
          <span class="sr-only">{{ delta < 0 ? 'Down' : 'Up' }}</span>{{ Math.abs(delta) }}%
        </HLText>
      </div>
      <!-- Before the first mention (7 Oct, option B). An empty Volume trend drew a made-up 0 to 4
           axis under a flat line, which read as broken. A ghost of the chart holds its place at
           full height, so nothing jumps when data arrives, and the pill says what is happening.
           The real chart takes over on its own once there is a mention. -->
      <!-- out9 q11: no bordered ghost chart (a box in the card, a made-up dashed line and a blank
           band under it). HighRise's empty state fills the card, says what happens next and offers
           the one useful thing to do now: see what's already said about you. -->
      <!-- out15 W01: centred between the header and the card's bottom border (-mb-6 takes in the
           card padding), so the space above and below the empty state is equal. -->
      <div v-else id="mentions-empty" class="flex-1 flex items-center justify-center pt-6 -mb-6 pb-6">
        <HLEmpty
          size="sm" :custom-icon="MessageChatCircleIcon" custom-icon-bg-color="var(--color-gray-100)" custom-icon-color="var(--color-gray-600)"
          title="No mentions yet" description="We’re listening. Your first mentions will show up here."
        >
          <template #actions>
            <HLButton id="mentions-empty-search" variant="secondary" size="sm" @click="peek(account.name)">Search your business name</HLButton>
          </template>
        </HLEmpty>
      </div>
      <!-- WBR 12 Oct (4E): seven bars instead of a tall line. -->
      <DailyBars
        v-if="brandVolume"
        class="mt-5" :series="days0" :labels="dayLabels" title="Mentions each day"
        :subtitle="`Mentions of ${account.short} ${range.phrase}`"
      />
    </template>

    <div v-if="!simple" class="flex items-baseline gap-2.5 mt-4">
      <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900 tabular-nums">{{ fmtNum(brandVolume) }}</HLText>
      <HLText
        v-if="delta"
        html-tag="span"
        size="md"
        weight="semibold"
        :class="['inline-flex items-center gap-0.5 tabular-nums', delta < 0 ? 'text-negative-strong' : 'text-positive-strong']"
      >
        <component :is="delta < 0 ? ArrowDownIcon : ArrowUpIcon" class="w-3.5 h-3.5 self-center" aria-hidden="true" />
        <span class="sr-only">{{ delta < 0 ? 'Down' : 'Up' }}</span>{{ Math.abs(delta) }}%
      </HLText>
      <!-- The niche total sits beside the figure rather than replacing it, so the card says
           whose number this is and what it is a slice of in one line. -->
      <HLText html-tag="span" size="md" class="text-gray-500">of the {{ fmtNum(windowTotal) }} in {{ account.space }}</HLText>
    </div>
    <!-- The keywords below are the niche's, not this brand's. Saying so is what keeps the
         heading honest now that it names the account. -->
    <HLText v-if="!simple" size="md" class="text-gray-600 mt-2!">
      Across every platform we listen to. What your niche is talking about:
    </HLText>

    <!-- Plot. The SVG stretches to the card; the crosshair, markers and tooltip are HTML on
         matching percentages so circles stay circular and the hairline stays 1px. -->
    <div
      v-if="!simple"
      ref="plot" tabindex="0" role="group"
      class="relative mt-3.5 cursor-crosshair rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
      aria-label="Daily mentions chart. Use the left and right arrow keys to read each day."
      @mousemove="onMove" @mouseleave="onLeave"
      @focus="onFocus" @blur="onLeave" @keydown="onKey"
    >
      <svg
        :viewBox="`0 0 ${CHART_W} ${CHART_H}`" preserveAspectRatio="none"
        class="w-full h-[132px] block" role="img"
        :aria-label="`Daily mentions for the five leading keywords in ${account.space} over the last ${chart.points} days.`"
      >
        <line
          :x1="0" :y1="BASE" :x2="CHART_W" :y2="BASE"
          stroke="var(--color-gray-100)" stroke-width="1" vector-effect="non-scaling-stroke"
        />
        <path
          v-for="p in paths" :key="p.term"
          :d="p.d" fill="none" :stroke="p.colour" stroke-width="1.75"
          stroke-linecap="round" stroke-linejoin="round"
          vector-effect="non-scaling-stroke"
        />
      </svg>

      <template v-if="hover">
        <span
          class="absolute top-0 w-0 border-l border-dashed border-gray-300 pointer-events-none"
          :style="{ left: hover.left, height: `${(BASE / CHART_H) * 100}%` }"
        />
        <span
          v-for="r in hover.rows" :key="r.term"
          :class="['absolute w-2 h-2 -ml-1 -mt-1 rounded-full ring-2 ring-white pointer-events-none', r.swatch]"
          :style="{ left: hover.left, top: r.top }"
        />
      </template>

      <!-- Date, the day's total, then the five beneath it. The five are the top keywords,
           not every mention, so they are listed under the total rather than presented as
           adding up to it. nicheKeywords cuts them to about 60% of the window on purpose. -->
      <!-- Hand-built on purpose: it follows the pointer day by day, which HLPopover and
           HLTooltip cannot be positioned to. Styled as HighRise's light popover (white, gray-200
           border, shadow-lg) so every grey on it keeps its usual role. aria-live so the day
           the keyboard lands on is read out. -->
      <div
        v-if="hover"
        :class="['absolute pointer-events-none z-10 top-1/2 -translate-y-1/2 rounded-lg bg-white border border-gray-200 px-3 py-2 whitespace-nowrap shadow-(--shadow-lg)',
                 hover.flip ? '-translate-x-[calc(100%+14px)]' : 'translate-x-3.5']"
        :style="{ left: hover.left }"
        aria-live="polite"
      >
        <HLText size="md" weight="medium" class="text-gray-500">{{ hover.date }}</HLText>
        <HLText size="md" weight="semibold" class="text-gray-900 tabular-nums mb-1.5!">{{ fmtNum(hover.total) }} mentions</HLText>
        <HLText v-for="r in hover.rows" :key="r.term" size="md" class="flex items-center gap-2">
          <span :class="['w-2 h-2 rounded-full shrink-0', r.swatch]" />
          <span class="text-gray-600">{{ r.term }}</span>
          <span class="ml-auto pl-3 font-semibold text-gray-900 tabular-nums">{{ fmtNum(r.value) }}</span>
        </HLText>
      </div>
    </div>

    <!-- The axis carries the window, so the "Mentions · Sep 24 to Sep 30" line above the
         chart is gone: it was only ever there because there was no axis to say it. -->
    <div v-if="!simple" class="relative h-4 mt-1">
      <HLText
        v-for="(l, i) in xLabels" :key="i"
        html-tag="span"
        size="md"
        weight="medium"
        class="absolute -translate-x-1/2 text-gray-400 whitespace-nowrap"
        :style="{ left: l.left }"
      >{{ l.text }}</HLText>
    </div>

    <!-- Five series always get a legend: identity must never be colour alone. Ranked, so the
         order here is the order of the shades. -->
    <div v-if="!simple" class="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
      <HLText v-for="(p, i) in paths" :key="p.term" html-tag="span" size="md" weight="medium" class="flex items-center gap-1.5 text-gray-600">
        <span :class="['w-2 h-2 rounded-full shrink-0', p.swatch]" />
        {{ i + 1 }}. {{ p.term }}
      </HLText>
    </div>

    <!-- Simplified: no Next step here. Mentions is information on its own; Search it lives on Industry trends (Shivam). -->
    <HLText v-if="!simple" size="md" class="text-gray-600 mt-4! pt-3.5 border-t border-gray-200">
      <span class="font-semibold text-gray-900">Next step:</span>{{ ' ' }}
      <template v-if="climbing">{{ climbing.term }} is climbing fastest. Search it to see who is driving it.</template>
      <template v-else>Pick a niche to see what is driving this.</template>
    </HLText>
    </template>
  </div>
</HLCard>

  <!-- No niche set. Connection has nothing to do with this card any more, so the missing
       piece can only ever be the niche. -->
  <div v-else class="bg-white border border-gray-200 rounded-xl p-5">
    <div class="flex items-center gap-2">
      <SectionChip :icon="MessageChatCircleIcon" inline />
      <HLText size="md" weight="medium" class="text-gray-500">Mentions</HLText>
    </div>
    <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900 mt-0.5!">What people are saying about {{ account.name }}</HLText>
    <HLText size="md" class="text-gray-600 max-w-[46ch] mt-2.5!">
      Set a niche and this fills with what your industry is talking about, across every
      platform we listen to.
    </HLText>
  </div>
</template>
