<script setup>
// 21 Oct (picks 15 V2 + 04 V1): the Mentions tabs card's line graph. A y axis whose top is the
// nearest round number above the peak, light gridlines, last week as a dashed grey line, and a
// hover readout (crosshair, dots, white popover, the same readout as the other charts).
// a15 (Ayushi, 21 Oct evening: "a lot of extra spacing… on the right-hand side"): the plot runs
// first day to today, edge to edge of the card's content. The y labels keep their own column on
// the left, sized to the widest label, and the gridlines end where the line ends.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { fmtNum } from '../../data/socialListening.js'

const props = defineProps({
  series: { type: Array, required: true },
  prev: { type: Array, default: null },
  labels: { type: Array, required: true },   // full date labels for the readout
  xLabels: { type: Array, default: null },   // axis labels (defaults to labels)
  height: { type: Number, default: 160 },
  unit: { type: String, default: '' },       // '%' for percentages
  noun: { type: String, default: 'mentions' },
  edgeLabels: { type: Boolean, default: false }, // only first + last x label (small multiples)
  ticks: { type: Number, default: 0 },       // force a tick count (3 for small charts)
  flipFrom: { type: Number, default: 0 },        // the readout flips to the left from this day on (narrow cards)
})

// The y labels' column (sized to the widest label, "2,000") and its gap to the plot.
const AXIS_W = 36
const AXIS_GAP = 8

// Nice max: the smallest round number at or above the peak, on 3 or 4 even steps.
// 218 → 225 (0/75/150/225); 1,980 → 2,000 (0/500/1,000/1,500/2,000).
const STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 8, 10]
function niceAxis(peak, counts, whole = true) {
  // out9 q03: a NaN or Infinity peak (last week divided by zero) drew "NaN" and "InfinityK" on the
  // axis; tiny counts drew 0, 0, 1, 1. Guarded, and counts get whole-number ticks.
  peak = Number.isFinite(peak) && peak > 0 ? peak : 0
  // No mentions yet: a 0 to 4 scale, so the flat line sits on a real axis rather than 0 and 1.
  if (whole && peak === 0) return { max: 4, ticks: [0, 1, 2, 3, 4] }
  if (whole && peak <= 4) { const max = Math.max(1, Math.ceil(peak)); return { max, ticks: Array.from({ length: max + 1 }, (_, i) => i) } }
  let best = null
  for (const k of counts) {
    const target = Math.max(1, peak) / k
    const mag = Math.pow(10, Math.floor(Math.log10(target)))
    const step = STEPS.map((s) => s * mag).find((v) => v >= target && (!whole || v >= 10 || Number.isInteger(v)))
    if (!best || step * k < best.max) best = { max: step * k, step, k }
  }
  return { max: best.max, ticks: Array.from({ length: best.k + 1 }, (_, i) => best.step * i) }
}
const axis = computed(() => niceAxis(Math.max(...props.series, ...(props.prev || [])), props.ticks ? [props.ticks] : [3, 4], props.unit !== '%'))
const fmt = (v) => (props.unit === '%' ? `${Math.round(v)}%` : v >= 10000 ? `${+(v / 1000).toFixed(v >= 100000 ? 0 : 1)}K` : fmtNum(v))
const fmtFull = (v) => (props.unit === '%' ? `${Math.round(v)}%` : fmtNum(v))

// The plot's width in real pixels, so the first and last day can sit exactly on its edges.
const plot = ref(null)
const W = ref(380)
let ro
onMounted(() => {
  ro = new ResizeObserver((entries) => {
    for (const e of entries) if (e.target === plot.value) W.value = e.contentRect.width
    measureEnd()
  })
  ro.observe(plot.value)
  nextTick(measureEnd)
  // The label is measured again once Inter has loaded: measured in the fallback font it came out
  // ~1px narrower and still hung past the edge.
  document.fonts?.ready.then(measureEnd)
})
// d05 (21 Oct): today's label is measured at its real (fractional) width, and again whenever the
// labels change. Rounded, or left at the 19px default when the labels arrived after the first
// resize, "Today" hung 0.8px past the content edge and the card's right inset read 24.2, not 25.
function measureEnd() {
  const el = Array.isArray(lastLbl.value) ? lastLbl.value[0] : lastLbl.value
  const node = el?.$el || el
  const w = node?.getBoundingClientRect ? node.getBoundingClientRect().width : 0
  if (w) endHalf.value = w / 2
  if (node && ro && node !== observedLbl) { observedLbl = node; ro.observe(node) }
}
let observedLbl = null
watch(() => (props.xLabels || props.labels).join('|'), () => nextTick(measureEnd))
onBeforeUnmount(() => ro && ro.disconnect())

const n = computed(() => props.series.length)
const top = 0
const H = computed(() => props.height)
// a15 V1 (Ayushi, 21 Oct): the first day sits on the plot's left edge.
const inset = 0
// With the first day on the left edge, today's label would hang past the card's content on the
// right, so today sits half its label's width in: the label then ends on the content edge, level
// with the legend above.
const lastLbl = ref(null)
const endHalf = ref(19)
const right = computed(() => W.value - endHalf.value)
const xAt = (i) => (n.value < 2 ? W.value / 2 : inset + (i / (n.value - 1)) * (right.value - inset))
const yAt = (v) => top + (H.value - top) - (v / axis.value.max) * (H.value - top)
const path = (s) => s.map((v, i) => `${i ? 'L' : 'M'}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(' ')
const line = computed(() => path(props.series))
// No days yet (e.g. a just-typed industry while its data loads): draw nothing rather than a broken path.
const area = computed(() => (n.value ? `${line.value} L${xAt(n.value - 1)},${H.value} L${xAt(0)},${H.value} Z` : ''))
const prevLine = computed(() => (props.prev ? path(props.prev) : ''))
const gid = `mentions-fill-${Math.random().toString(36).slice(2, 7)}`
// Gridlines run the plot's full width.
const gridL = 0
const gridR = computed(() => W.value)
// Hover columns: each day owns the half-way points to its neighbours.
const cols = computed(() => props.series.map((_, i) => {
  const l = i === 0 ? 0 : (xAt(i - 1) + xAt(i)) / 2
  const r = i === n.value - 1 ? W.value : (xAt(i) + xAt(i + 1)) / 2
  return { left: l, width: r - l }
}))

const hover = ref(null)
const tip = computed(() => {
  if (hover.value == null) return null
  const i = hover.value
  const v = props.series[i]
  const p = props.prev ? props.prev[i] : null
  const diff = p ? Math.round(((v - p) / p) * 100) : null
  return { i, v, p, diff, flip: props.edgeLabels ? i >= n.value / 2 : i >= (props.flipFrom || n.value - 2), top: Math.min(yAt(v), props.prev ? yAt(p) : 1e9) }
})
const xs = computed(() => props.xLabels || props.labels)
const padL = AXIS_W + AXIS_GAP
</script>

<template>
  <div
    class="relative"
    :style="{ paddingLeft: `${padL}px` }" @mouseleave="hover = null"
  >
    <!-- y labels in their own column on the left -->
    <div class="absolute top-0 left-0" aria-hidden="true" :style="{ height: `${H}px`, width: `${AXIS_W}px` }">
      <HLText
        v-for="(t, k) in axis.ticks" :key="k" html-tag="span" size="md"
        class="absolute inset-x-0 -translate-y-1/2 text-gray-500 tabular-nums text-right"
        :style="{ top: `${yAt(t)}px` }"
      >{{ fmt(t) }}</HLText>
    </div>
    <div ref="plot" class="relative" :style="{ height: `${H}px` }" role="img" :aria-label="`${noun.replace(/ that day$/, '')} each day: ${series.map((v, i) => `${labels[i]} ${fmtFull(v)}`).join(', ')}`">
      <!-- gridlines -->
      <span
        v-for="(t, k) in axis.ticks" :key="`g${k}`" aria-hidden="true"
        :class="['absolute h-0 border-t pointer-events-none', k === 0 ? 'border-gray-200' : 'border-gray-100']"
        :style="{ top: `${yAt(t)}px`, left: `${gridL}px`, width: `${gridR - gridL}px` }"
      />
      <svg :viewBox="`0 0 ${W} ${H}`" class="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
        <defs><linearGradient :id="gid" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--color-chart-strong)" stop-opacity=".14" /><stop offset="1" stop-color="var(--color-chart-strong)" stop-opacity="0" /></linearGradient></defs>
        <path :d="area" :fill="`url(#${gid})`" />
        <path v-if="prev" :d="prevLine" fill="none" stroke="var(--color-gray-400)" stroke-width="2" stroke-dasharray="4 4" />
        <path :d="line" fill="none" stroke="var(--color-chart-strong)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
      </svg>
      <!-- today's point always marked -->
      <span class="absolute w-2 h-2 -ml-1 -mt-1 rounded-full bg-chart-strong ring-2 ring-white pointer-events-none" :style="{ left: `${xAt(n - 1)}px`, top: `${yAt(series[n - 1])}px` }" />
      <template v-if="tip">
        <span class="absolute top-0 bottom-0 w-0 border-l border-dashed border-gray-300 pointer-events-none" :style="{ left: `${xAt(tip.i)}px` }" />
        <span v-if="prev" class="absolute w-2 h-2 -ml-1 -mt-1 rounded-full bg-gray-400 ring-2 ring-white pointer-events-none" :style="{ left: `${xAt(tip.i)}px`, top: `${yAt(tip.p)}px` }" />
        <span class="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-chart-strong ring-2 ring-white pointer-events-none" :style="{ left: `${xAt(tip.i)}px`, top: `${yAt(tip.v)}px` }" />
        <div
          :class="['absolute pointer-events-none z-10 rounded-lg bg-white border border-gray-200 px-3 py-2 whitespace-nowrap shadow-(--shadow-lg)',
                   edgeLabels ? '-translate-x-1/2 -translate-y-full' : '-translate-y-1/2',
                   edgeLabels ? '' : tip.flip ? '-translate-x-[calc(100%+14px)]' : 'translate-x-3.5']"
          :style="edgeLabels ? { left: `${xAt(tip.i)}px`, top: `${tip.top - 12}px` } : { left: `${xAt(tip.i)}px`, top: `${Math.max(28, Math.min(H - 28, tip.top))}px` }"
          aria-live="polite"
        >
          <HLText size="md" weight="medium" class="text-gray-500">{{ labels[tip.i] }}</HLText>
          <!-- Round 6: the readout names the unit, so a point reads as one day ("1,633 mentions"),
               not as the week's total on the tab. -->
          <template v-if="prev">
            <HLText size="md" class="flex items-center gap-2 mt-1!">
              <svg width="12" height="2" class="shrink-0" aria-hidden="true"><line x1="0" y1="1" x2="12" y2="1" stroke="var(--color-chart-strong)" stroke-width="2" /></svg>
              <span><span class="font-semibold text-gray-900 tabular-nums">{{ fmtFull(tip.v) }}</span> <span class="text-gray-600">{{ noun }}</span></span>
            </HLText>
            <HLText size="md" class="flex items-center gap-2">
              <svg width="12" height="2" class="shrink-0" aria-hidden="true"><line x1="0" y1="1" x2="12" y2="1" stroke="var(--color-gray-400)" stroke-width="2" stroke-dasharray="4 4" /></svg>
              <span><span class="font-semibold text-gray-900 tabular-nums">{{ fmtFull(tip.p) }}</span> <span class="text-gray-600">last week</span></span>
            </HLText>
          </template>
          <HLText v-else size="md" weight="semibold" class="text-gray-900 tabular-nums">{{ fmtFull(tip.v) }} {{ noun }}</HLText>
        </div>
      </template>
      <!-- hover columns, one per day, each reaching half way to its neighbours -->
      <div
        v-for="(c, i) in cols" :key="i" :data-col="i" class="absolute top-0 h-full cursor-default"
        :style="{ left: `${c.left}px`, width: `${c.width}px` }" @mouseenter="hover = i"
      />
    </div>
    <!-- Day labels centre on their day, so they stay evenly spaced. With the first day on the
         plot's left edge its label reaches under the y labels' column. -->
    <div v-if="!edgeLabels" class="relative h-4 mt-2" aria-hidden="true">
      <HLText
        v-for="(l, i) in xs" :key="i" :ref="i === n - 1 ? 'lastLbl' : undefined" html-tag="span" size="md"
        :class="['absolute top-0 leading-4! whitespace-nowrap -translate-x-1/2', i === n - 1 ? 'text-gray-900 font-medium' : 'text-gray-500']"
        :style="{ left: `${xAt(i)}px` }"
      >{{ l }}</HLText>
    </div>
    <div v-else class="flex justify-between mt-2" aria-hidden="true">
      <HLText html-tag="span" size="md" class="text-gray-500 leading-4!">{{ xs[0] }}</HLText>
      <HLText html-tag="span" size="md" class="text-gray-900 font-medium leading-4!">{{ xs[n - 1] }}</HLText>
    </div>
  </div>
</template>
