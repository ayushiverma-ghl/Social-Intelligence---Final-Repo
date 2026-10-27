<script setup>
// The Volume trend graph, shared. Lifted out of TopicSections on 7 Oct so the Overview's
// mentions card can draw exactly the same graph (Sujith: "reuse this graph there… this
// gradient and everything looks richer"). One series, a round-numbered scale on the left,
// six dates along the bottom, the gradient under the line, and the hover readout.
//
// How it is drawn: the plot is `preserveAspectRatio="none"` at a fixed pixel height, so the
// geometry is authored in a 1000-unit box and stretched horizontally only. Strokes carry
// vector-effect="non-scaling-stroke" so a 2px line stays 2px. Anything round would come out an
// ellipse, so the hover dot, crosshair and labels are HTML on the same fractions.
import { computed, ref } from 'vue'
import { fmtNum, niceScale } from '../../data/socialListening.js'

const props = defineProps({
  // One value per day, oldest first.
  series: { type: Array, required: true },
  // One label per value ("Oct 1"), used on the axis and in the readout.
  labels: { type: Array, required: true },
  title: { type: String, default: 'Volume trend' },
  subtitle: { type: String, default: '' },
  ariaLabel: { type: String, default: '' },
  // Inside the pop-up's section cards the graph sits flat, without its own box.
  flat: { type: Boolean, default: false },
})

const PLOT_W = 1000
const H = 120
// Each mounted chart needs its own gradient id, or the second one on a page paints with the first's.
const gradId = `slVol${Math.random().toString(36).slice(2, 8)}`

const vol = computed(() => {
  const s = props.series
  const n = s.length
  // A floor of 4 keeps an all-zero window on a whole-number scale (0 to 4) instead of decimals.
  const sc = niceScale(Math.max(4, ...s))
  const xAt = (i) => (n < 2 ? 0 : (i / (n - 1)) * PLOT_W)
  const y = (v) => H - (v / sc.max) * H
  const pts = s.map((v, i) => `${xAt(i).toFixed(1)} ${y(v).toFixed(1)}`)
  return {
    line: `M${pts.join(' L')}`,
    area: `M${pts.join(' L')} L${PLOT_W} ${H} L0 ${H} Z`,
    grid: sc.ticks.map(y),
    // Top value first: the labels are laid out down the axis, not up it.
    yLabels: [...sc.ticks].reverse().map((t) => fmtNum(t)),
    // 7 Oct (option E): each date sits under its own point. Up to a week, every day is
    // labelled; it used to print six marks for seven days, so one day dropped out. Longer
    // windows keep six, evenly spaced. The last reads "Today".
    xLabels: (n <= 7 ? s.map((_, i) => i) : Array.from({ length: 6 }, (_, k) => Math.round((k / 5) * (n - 1))))
      .map((i) => ({ i, left: `${((i / Math.max(1, n - 1)) * 100).toFixed(4)}%`, text: i === n - 1 ? 'Today' : props.labels[i] })),
    pts: s.map((v, i) => ({
      left: `${((i / Math.max(1, n - 1)) * 100).toFixed(4)}%`,
      top: `${((y(v) / H) * 100).toFixed(4)}%`,
      value: v,
      day: props.labels[i],
    })),
    avg: Math.round(s.reduce((a, b) => a + b, 0) / Math.max(1, n)),
  }
})

// Hovering a graph should tell you what it signifies, and a raw count alone doesn't. So the
// tooltip carries the day, the count, and where that day sits against the window's average.
const hover = ref(null)

function onMove(e) {
  const box = e.currentTarget.getBoundingClientRect()
  const last = vol.value.pts.length - 1
  // The nearest day snaps: tracing a 2px stroke at 120px tall would miss most of the time.
  showPoint(Math.max(0, Math.min(last, Math.round(((e.clientX - box.left) / box.width) * last))))
}
// The same readout from the keyboard: focus lands on the latest day, the arrow keys walk it.
function onFocus() {
  if (!hover.value) showPoint(vol.value.pts.length - 1)
}
function onKey(e) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
  e.preventDefault()
  const last = vol.value.pts.length - 1
  const at = hover.value ? hover.value.i : last
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? last : at + (e.key === 'ArrowLeft' ? -1 : 1)
  showPoint(Math.max(0, Math.min(last, next)))
}
function showPoint(i) {
  const v = vol.value
  const p = v.pts[i]
  const diff = p.value - v.avg
  // Anything inside 8% of the mean is noise, not a story.
  const flat = Math.abs(diff) <= Math.max(1, v.avg * 0.08)
  hover.value = {
    ...p,
    i,
    // Centred on the dot, except near the ends, where centring would hang it off the card.
    tipLeft: `clamp(104px, ${p.left}, calc(100% - 104px))`,
    vs: flat ? 'About average for this window' : `${fmtNum(Math.abs(diff))} ${diff > 0 ? 'above' : 'below'} average`,
  }
}
function onLeave() {
  hover.value = null
}
</script>

<template>
  <div :class="!flat && 'border border-gray-200 rounded-lg p-4'">
    <HLText html-tag="h3" size="lg" weight="semibold" class="text-gray-900">{{ title }}</HLText>
    <HLText v-if="subtitle" size="md" class="text-gray-500 mb-3!">{{ subtitle }}</HLText>
    <div class="relative">
      <!-- out9 q18: each label is centred on its own gridline (justify-between put 7,500 a line-height
           below its rule and 0 above the baseline). -->
      <div class="absolute left-0 top-0 w-9" :style="{ height: H + 'px' }">
        <HLText
          v-for="(l, k) in vol.yLabels" :key="l" html-tag="span" size="md" class="absolute right-0 -translate-y-1/2 text-gray-400 tabular-nums"
          :style="{ top: `${vol.grid[vol.grid.length - 1 - k]}px` }"
        >{{ l }}</HLText>
      </div>
      <div
        class="ml-11 relative cursor-crosshair rounded-lg focus-visible:outline-2 focus-visible:outline-primary-600 focus-visible:outline-offset-2"
        tabindex="0"
        :aria-label="`${title}. Use the left and right arrow keys to read each day.`"
        @mousemove="onMove" @mouseleave="onLeave"
        @focus="onFocus" @blur="onLeave" @keydown="onKey"
      >
        <svg :viewBox="`0 0 ${PLOT_W} ${H}`" preserveAspectRatio="none" :height="H"
          class="w-full block" role="img" :aria-label="ariaLabel || title">
          <defs>
            <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--color-chart-strong)" stop-opacity=".12" />
              <stop offset="100%" stop-color="var(--color-chart-strong)" stop-opacity="0" />
            </linearGradient>
          </defs>
          <line v-for="(g, i) in vol.grid" :key="i" x1="0" :x2="PLOT_W" :y1="g" :y2="g"
            stroke="var(--color-gray-200)" vector-effect="non-scaling-stroke" />
          <path :d="vol.area" :fill="`url(#${gradId})`" />
          <path :d="vol.line" fill="none" stroke="var(--color-chart-strong)" stroke-width="2"
            stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
        </svg>

        <!-- Hand-built on purpose: HLTooltip anchors to an element, and this one follows the
             pointer along a line. Styled as HighRise's light popover. -->
        <template v-if="hover">
          <span
            class="absolute top-0 bottom-0 w-0 border-l border-dashed border-gray-300 pointer-events-none"
            :style="{ left: hover.left }"
          />
          <span
            class="absolute w-2 h-2 -ml-1 -mt-1 rounded-full bg-chart-strong ring-2 ring-white pointer-events-none"
            :style="{ left: hover.left, top: hover.top }"
          />
          <div
            class="absolute pointer-events-none z-10 -translate-x-1/2 -translate-y-full -mt-2 rounded-lg bg-white border border-gray-200 px-3 py-2 whitespace-nowrap shadow-(--shadow-lg)"
            :style="{ left: hover.tipLeft, top: hover.top }"
            role="status"
          >
            <HLText size="md" weight="medium" class="text-gray-500">{{ hover.day }} · {{ hover.vs }}</HLText>
            <HLText size="md" weight="semibold" class="text-gray-900 tabular-nums">{{ fmtNum(hover.value) }} mentions</HLText>
          </div>
        </template>
      </div>
      <div class="ml-11 relative h-5 mt-2" aria-hidden="true">
        <!-- A tick under every point, so each date visibly belongs to its point. -->
        <span v-for="(p, i) in vol.pts" :key="'t' + i" class="absolute -top-1.5 w-px h-1.5 bg-gray-300" :style="{ left: p.left }" />
        <HLText
          v-for="l in vol.xLabels" :key="l.i" html-tag="span" size="md"
          :weight="l.text === 'Today' ? 'medium' : 'regular'"
          :class="['absolute top-0 whitespace-nowrap', l.text === 'Today' ? 'text-gray-600' : 'text-gray-400',
            l.i === 0 ? '' : l.i === vol.pts.length - 1 ? '-translate-x-full' : '-translate-x-1/2']"
          :style="{ left: l.left }"
        >{{ l.text }}</HLText>
      </div>
    </div>
  </div>
</template>
