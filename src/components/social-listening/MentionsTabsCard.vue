<script setup>
// 21 Oct (picks 15 + 16): the Mentions tabs card, sized for its half or third of the two-up row.
// Three figures as tabs (round 6, Ayushi: Mentions, People talking and Reach; Positive is in the
// AI summary). Each tab is the week's total; the chosen one draws this week day by day against
// last week's dashed line on a y axis with a round max, with a hover readout (MentionsLine). The
// legend reads "This week" / "Last week" (f1, 21 Oct: "per day" dropped), and the readout names the day and the
// unit ("Tue, Oct 20 · 1,633 mentions"), so 10,258 on the tab and ~2,000 on the axis read as the
// week and its days. The chart grows to fill the card so the row's two cards end level. Tab
// styles, from Demo controls and the review guide:
//   across / grid — c15 V2 tab cells, three in one row; below a 340px body (a third at 1280–1440)
//                   the three stack as full-width rows.
//   compact / rail — c15 V3 underline tabs on one rule; below a 340px body they become the rail,
//                   the three figures one per line, like vertical tabs.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { MessageChatCircleIcon, ArrowUpIcon, ArrowDownIcon } from '@gohighlevel/ghl-icons/24/outline'
import CardHead from './CardHead.vue'
import MentionsLine from './MentionsLine.vue'
import { useBrandWeek, deltaTone, MONTHS, DAYS } from './brandWeek.js'
import { FIG } from './figures.js'

const props = defineProps({ tabs: { type: String, default: 'across' } })
const { days, n, dateAt, fullLabels, tabMetrics } = useBrandWeek()
// Thirds are always narrow; the half-width cards turn narrow below a 420px body (1280).
const bodyW = ref(440)
const third = computed(() => props.tabs === 'grid' || props.tabs === 'rail')
const narrow = computed(() => third.value || bodyW.value < 420)
// Three tabs fit across down to a 340px body; below that they stack (both tab styles).
const stackTabs = computed(() => bodyW.value < 340)
const useRail = computed(() => (props.tabs === 'rail' || props.tabs === 'compact') && stackTabs.value)

const metric = ref('mentions')
const single = true
// out9 q02: HLTabs renders each tab's label slot once, so the figures froze at the first stage or
// range they were drawn with. Keyed on the figures, the tabs redraw whenever any of them changes.
const tabsKey = computed(() => tabMetrics.value.map((m) => `${m.value}|${m.delta}`).join(','))
const cur = computed(() => tabMetrics.value.find((m) => m.key === metric.value) || tabMetrics.value[0])
// Half width fits a short date under every day (a weekday at 1280); a third fits first, middle and today.
const xLabels = computed(() => days.value.map((_, i) => {
  if (i === n.value - 1) return 'Today'
  if (third.value && i !== 0 && i !== 3) return ''
  return narrow.value ? DAYS[dateAt(i).getDay()] : `${MONTHS[dateAt(i).getMonth()]} ${dateAt(i).getDate()}`
}))

// The chart takes whatever height the row leaves (min 100), measured in real pixels.
const box = ref(null)
const plotH = ref(150)
const LABELS_H = 24 // x labels: 8 gap + 16 line (f01: a 16px line box keeps the bottom inset at 24)
let ro
onMounted(() => {
  ro = new ResizeObserver(([e]) => { plotH.value = Math.max(100, Math.floor(e.contentRect.height - LABELS_H)); bodyW.value = e.contentRect.width })
  ro.observe(box.value)
})
onBeforeUnmount(() => ro && ro.disconnect())
</script>

<template>
  <div id="mentions-week" data-layout="tabs" :data-tabs="tabs" class="r16 flex flex-col flex-1 min-h-0">
    <!-- 21 Oct (b2 V5): the shared card header, 32 tile, 8 to the heading (top = bottom = 25).
         Legend top-right, centred on the tile (platform standard). Moves above the chart when the card is narrow. -->
    <CardHead center-controls :icon="MessageChatCircleIcon" eyebrow="Mentions · Last 7 days" heading="How often people mention you">
    </CardHead>

    <!-- 27 Oct (developers): mentions only, for the last 7 days. The backend has no previous week
         and no people or reach figures, so no tabs, no change and no last-week line. -->
    <div v-if="single" id="mentions-total" class="flex items-baseline gap-2 flex-wrap mt-4">
      <HLText html-tag="span" v-bind="FIG.card" class="text-gray-900 tabular-nums">{{ cur.value }}</HLText>
      <HLText html-tag="span" size="md" class="text-gray-500">mentions in the last 7 days</HLText>
    </div>

    <!-- across / grid: figures as tabs, edge to edge, hairlines between (gap-px on gray-200) -->
    <div
      v-else-if="tabs === 'across' || tabs === 'grid'" :class="['r16-tabs grid mt-4 -mx-6 border-y border-gray-200 bg-gray-200 gap-px', stackTabs ? 'is-stack' : 'is-across']"
      role="tablist" aria-label="What to chart"
    >
      <button
        v-for="m in tabMetrics" :id="`mentions-tab-${m.key}`" :key="m.key" type="button" role="tab" :aria-selected="metric === m.key"
        :class="['r16-tab text-left bg-white', metric === m.key && 'is-on']" @click="metric = m.key"
      >
        <HLText html-tag="span" size="md" class="block text-gray-500 truncate">{{ m.label }}</HLText>
        <span class="r16-fig mt-1">
          <HLText html-tag="span" v-bind="FIG.card" class="text-gray-900 tabular-nums">{{ m.value }}</HLText>
          <HLText html-tag="span" size="md" weight="semibold" :class="['inline-flex items-center', deltaTone(m.delta)]">
            <component :is="m.delta < 0 ? ArrowDownIcon : ArrowUpIcon" class="w-3.5 h-3.5" aria-hidden="true" />{{ Math.abs(m.delta) }}%
          </HLText>
        </span>
        <HLText v-if="m.qual" html-tag="span" size="md" class="block text-gray-500 truncate mt-1!">{{ m.qual }}</HLText>
      </button>
    </div>

    <!-- compact (c15 V3): HLTabs line (round 7, HighRise only), three tabs sharing the width; each
         tab's label slot holds the 13px label, the card figure and its change. -->
    <!-- a20: label above the figure; the figure takes the page's card figure size (figures.js). -->
    <HLTabs
      v-else-if="!useRail" :key="tabsKey" id="mentions-metric-tabs" class="sl-metric-tabs mt-4" type="line" :value="metric"
      @update:value="(v) => (metric = v)"
    >
      <HLTab v-for="m in tabMetrics" :id="`mentions-tab-${m.key}`" :key="m.key" :name="m.key">
        <span class="r16-utab block text-left min-w-0">
          <HLText html-tag="span" size="md" :class="['block truncate', metric === m.key ? 'text-gray-900 font-medium' : 'text-gray-500']">{{ m.label }}</HLText>
          <span class="r16-fig mt-1">
            <HLText html-tag="span" v-bind="FIG.card" class="text-gray-900 tabular-nums">{{ m.value }}</HLText>
            <HLText html-tag="span" size="md" weight="semibold" :class="['inline-flex items-center', deltaTone(m.delta)]">
              <component :is="m.delta < 0 ? ArrowDownIcon : ArrowUpIcon" class="w-3.5 h-3.5" aria-hidden="true" />{{ Math.abs(m.delta) }}%
            </HLText>
          </span>
          <HLText v-if="m.qual" :id="`mentions-tab-${m.key}-qual`" html-tag="span" size="md" class="block text-gray-500 truncate mt-1!">{{ m.qual }}</HLText>
        </span>
      </HLTab>
    </HLTabs>
    <!-- rail: one figure per line, the chosen one marked like a selected list item -->
    <div v-else class="flex flex-col gap-1 mt-4 -mx-3" role="tablist" aria-label="What to chart" aria-orientation="vertical">
      <button
        v-for="m in tabMetrics" :id="`mentions-tab-${m.key}`" :key="m.key" type="button" role="tab" :aria-selected="metric === m.key"
        :class="['r16-rail grid grid-cols-[minmax(0,1fr)_auto_52px] items-center gap-2 h-10 px-3 rounded-lg text-left', metric === m.key && 'is-on']" @click="metric = m.key"
      >
        <HLText html-tag="span" size="md" :class="['truncate', metric === m.key ? 'text-gray-900 font-medium' : 'text-gray-600']">{{ m.label }}</HLText>
        <HLText html-tag="span" v-bind="FIG.card" class="text-gray-900 tabular-nums text-right">{{ m.value }}</HLText>
        <HLText html-tag="span" size="md" weight="semibold" :class="['inline-flex items-center justify-end', deltaTone(m.delta)]">
          <component :is="m.delta < 0 ? ArrowDownIcon : ArrowUpIcon" class="w-3.5 h-3.5" aria-hidden="true" />{{ Math.abs(m.delta) }}%
        </HLText>
      </button>
    </div>

    <div v-if="narrow && !single" class="r16-legend justify-end mt-5" aria-label="Legend">
      <span><svg width="16" height="2" aria-hidden="true"><line x1="0" y1="1" x2="16" y2="1" stroke="var(--color-chart-strong)" stroke-width="2" /></svg><HLText html-tag="span" size="md" class="text-gray-600">This week</HLText></span>
      <span><svg width="16" height="2" aria-hidden="true"><line x1="0" y1="1" x2="16" y2="1" stroke="var(--color-gray-400)" stroke-width="2" stroke-dasharray="4 4" /></svg><HLText html-tag="span" size="md" class="text-gray-600">Last week</HLText></span>
    </div>

    <div ref="box" :class="['r16-chart relative flex-1', narrow ? 'mt-3' : 'mt-6']" :data-narrow="narrow || null">
      <div class="absolute inset-x-0 top-0">
        <MentionsLine
          id="mentions-line" :series="cur.series" :prev="single ? null : cur.prev" :labels="fullLabels" :x-labels="xLabels" :height="plotH"
          :unit="cur.unit" :noun="cur.noun" :flip-from="narrow ? 3 : 4"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.r16-chart { min-height: 158px; }
.r16-chart[data-narrow] { min-height: 140px; }
.r16-legend { display: flex; align-items: center; gap: 16px; white-space: nowrap; }
.r16-legend > span { display: flex; align-items: center; gap: 8px; }
.r16 { container: r16card / inline-size; }
/* Hairlines between tabs come from the 1px gap over gray-200. The first column is 8px wider so its
   text lines up with the card's 24px padding while every other tab keeps 16px from its hairline. */
.r16-tabs.is-across { grid-template-columns: calc((100% - 2px - 8px) / 3 + 8px) repeat(2, calc((100% - 2px - 8px) / 3)); }
.r16-tab { position: relative; padding: 16px 8px 16px 16px; cursor: pointer; transition: background-color .15s; container-type: inline-size; }
.r16-tab:first-child { padding-left: 24px; }
/* Stacked (narrow): one full-width row per figure, label left, figure and change right, the card's
   24px padding on both sides; the chosen row is marked on its left edge, like the rail. */
.r16-tabs.is-stack { grid-template-columns: minmax(0, 1fr); }
.r16-tabs.is-stack .r16-tab { display: flex; align-items: center; gap: 12px; padding: 12px 24px; container-type: normal; }
.r16-tabs.is-stack .r16-tab > .hr-text:first-child { flex: 1; min-width: 0; }
.r16-tabs.is-stack .r16-fig { flex-direction: row; align-items: baseline; gap: 8px; margin-top: 0; }
.r16-tabs.is-stack .r16-tab.is-on::after { left: 0; right: auto; top: 0; bottom: 0; width: 2px; height: auto; }
.r16-tab:hover { background: var(--color-gray-50); }
.r16-tab:focus-visible { outline: 2px solid var(--color-primary-600); outline-offset: -2px; }
.r16-tab.is-on::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: var(--color-primary-600); }
/* Figure and change share a line when the tab is wide enough; otherwise the change sits under the figure. */
.r16-fig { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
/* a20: a 24px figure needs about 150px before its change fits beside it (1728 and up). */
@container (min-width: 150px) { .r16-fig { flex-direction: row; align-items: baseline; gap: 8px; } }
.r16-utab { position: relative; background: none; cursor: pointer; container-type: inline-size; }
/* Round 7: HLTabs line holds the three figures. HighRise sizes a line tab to a 32px text label;
   here each tab takes a third of the row (16 between, HighRise's tab pad) and grows to its
   label + figure, with HighRise's own active bar under it. */
.sl-metric-tabs :deep(.hr-tabs-nav-scroll-wrapper), .sl-metric-tabs :deep(.v-x-scroll), .sl-metric-tabs :deep(.hr-tabs-nav-scroll-content) { width: 100%; }
.sl-metric-tabs :deep(.hr-tabs-wrapper) { flex: 1; min-width: 0; }
.sl-metric-tabs :deep(.hr-tabs-tab-wrapper) { flex: 1 1 0; min-width: 0; }
.sl-metric-tabs :deep(.hr-tabs-tab-pad) { display: none; }
.sl-metric-tabs :deep(.hr-tabs-tab-wrapper + .hr-tabs-tab-wrapper) { margin-left: 16px; }
.sl-metric-tabs :deep(.hr-tabs-tab) { flex: 1; min-width: 0; height: auto !important; padding: 0 0 12px !important; align-items: flex-start; justify-content: flex-start; }
.sl-metric-tabs :deep(:is(.hr-tabs-nav, .hr-tabs-nav-scroll-wrapper, .v-x-scroll, .hr-tabs-nav-scroll-content, .hr-tabs-wrapper, .hr-tabs-tab-wrapper)) { height: auto !important; overflow: visible !important; }
.sl-metric-tabs :deep(.hr-tabs-tab__label) { flex: 1 1 auto !important; width: 100%; min-width: 0; display: block !important; }
.r16-utab:hover .hr-text:first-child { color: var(--color-gray-900); }
.r16-utab:focus-visible { outline: 2px solid var(--color-primary-600); outline-offset: 2px; border-radius: 4px; }
.r16-utab.is-on::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: var(--color-primary-600); }
.r16-rail { position: relative; background: none; cursor: pointer; transition: background-color .15s; }
.r16-rail:hover { background: var(--color-gray-50); }
.r16-rail:focus-visible { outline: 2px solid var(--color-primary-600); outline-offset: -2px; }
.r16-rail.is-on { background: var(--color-gray-50); }
.r16-rail.is-on::before { content: ""; position: absolute; left: 0; top: 10px; bottom: 10px; width: 2px; border-radius: 2px; background: var(--color-primary-600); }
</style>
