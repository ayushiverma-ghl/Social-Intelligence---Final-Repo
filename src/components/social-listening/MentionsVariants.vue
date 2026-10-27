<script setup>
// 19 Oct: the Mentions card's other two layouts, picked from Demo controls (state.mentionsLayout).
//   compare   — a row of figures, then each day's bar against last week's line (option 3)
//   platforms — each day's bar split by platform, with the shares as the legend (option 6)
// 21 Oct: the default, Tabs (option 2), is MentionsTabsCard. Lives inside MentionsRow's card,
// which keeps the empty state and the original design.
import { computed, ref } from 'vue'
import { MessageChatCircleIcon, ArrowUpIcon, ArrowDownIcon } from '@gohighlevel/ghl-icons/24/outline'
import { niceScale, fmtNum } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'
import SectionChip from './SectionChip.vue'
import { NETWORK_ICONS } from './networkIcons.js'
import { useBrandWeek, deltaTone } from './brandWeek.js'

const { state, range } = useSocialListening()
const layout = computed(() => state.mentionsLayout)
const { result, days, n, labels, dayName, total, delta, prevDays, positive, people } = useBrandWeek()
const max = computed(() => Math.max(1, ...days.value))
const busiest = computed(() => days.value.indexOf(Math.max(...days.value)))
const average = computed(() => Math.round(total.value / Math.max(1, n.value)))

// ---- compare (3) ----
const compare = ref(true)
// Round, even steps (0 / 500 / 1,000 …), the same scale rule as the pop-up's charts.
const nice = computed(() => niceScale(Math.max(max.value, ...prevDays.value)))
const scaleMax = computed(() => nice.value.max)
const ticks = computed(() => [...nice.value.ticks].reverse())
// Points on each bar's centre, in a 700-wide box.
const prevLine = computed(() => prevDays.value
  .map((v, i) => `${i ? 'L' : 'M'}${((i + 0.5) * (700 / n.value)).toFixed(1)},${(150 - (v / scaleMax.value) * 150).toFixed(1)}`).join(' '))
const figures = computed(() => [
  { label: 'Mentions', value: fmtNum(total.value) },
  { label: 'People talking', value: fmtNum(people.value) },
  { label: 'Positive', value: `${positive.value}%` },
  { label: 'Busiest day', value: dayName(busiest.value) },
  { label: 'Daily average', value: fmtNum(average.value) },
])

// ---- platforms (6) ----
const PLATFORM_KEY = { instagram: 'instagram', facebook: 'facebook', tiktok: 'tiktok', youtube: 'youtube', linkedin: 'linkedin', x: 'x', reddit: 'reddit', web: 'web', blogs: 'web', news: 'web' }
const SHADES = ['var(--color-dataviz-700)', 'var(--color-dataviz-500)', 'var(--color-dataviz-400)', 'var(--color-dataviz-200)', 'var(--color-chart-faint)']
const platforms = computed(() => {
  const top = (result.value?.platforms || []).slice(0, 4)
  const other = Math.max(0, 100 - top.reduce((a, p) => a + p.value, 0))
  const rows = top.map((p) => ({ label: p.label, value: p.value, key: PLATFORM_KEY[String(p.label).toLowerCase()] }))
  return other ? [...rows, { label: 'Other', value: other, key: null }] : rows
})

</script>

<template>
  <div id="mentions-week" :data-layout="layout">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <div class="flex items-center gap-2 h-9">
          <SectionChip :icon="MessageChatCircleIcon" inline />
          <HLText size="md" weight="medium" class="text-gray-500">Mentions · {{ range.label }}</HLText>
        </div>
        <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900 mt-1!">How often people mention you</HLText>
      </div>
      <label v-if="layout === 'compare'" class="flex items-center gap-2 h-9 shrink-0 cursor-pointer">
        <HLToggle id="mentions-compare" :value="compare" size="sm" aria-label="Compare to last week" @update:value="(v) => (compare = v)" />
        <HLText html-tag="span" size="md" class="text-gray-600">Compare to last week</HLText>
      </label>
    </div>

    <!-- 3 · Figures, then each day against last week -->
    <template v-if="layout === 'compare'">
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-6 mt-5">
        <div v-for="f in figures" :key="f.label" class="min-w-0">
          <HLText size="md" class="text-gray-500">{{ f.label }}</HLText>
          <HLText size="2xl" weight="semibold" class="text-gray-900 tabular-nums mt-1.5! truncate">{{ f.value }}</HLText>
        </div>
      </div>
      <!-- 19 Oct: space, not a rule, makes the figures and the week two groups. -->
      <div class="flex items-center gap-4 mt-8">
        <HLText size="lg" weight="semibold" class="text-gray-900">Each day</HLText>
        <span class="flex items-center gap-1.5"><i class="w-2.5 h-2.5 rounded-sm bg-chart-soft" aria-hidden="true" /><HLText html-tag="span" size="md" class="text-gray-600">This week</HLText></span>
        <span v-if="compare" class="flex items-center gap-1.5"><i class="w-3 border-t-2 border-dashed border-gray-900" aria-hidden="true" /><HLText html-tag="span" size="md" class="text-gray-600">Last week</HLText></span>
      </div>
      <div class="relative mt-5 pl-14" role="img" :aria-label="`Mentions each day: ${days.map((v, i) => `${labels[i]} ${fmtNum(v)}`).join(', ')}`">
        <div class="absolute left-0 right-0 top-0 h-[150px] flex flex-col justify-between" aria-hidden="true">
          <div v-for="(t, k) in ticks" :key="k" class="flex items-center gap-3 h-0">
            <HLText html-tag="span" size="md" class="text-gray-500 w-11 text-right tabular-nums">{{ fmtNum(t) }}</HLText>
            <span class="flex-1 border-t border-gray-100" />
          </div>
        </div>
        <div class="relative h-[150px] flex items-end gap-4">
          <div v-for="(v, i) in days" :key="i" :class="['flex-1 rounded-t-md', i === n - 1 ? 'bg-chart-strong' : 'bg-chart-soft']" :style="{ height: `${(v / scaleMax) * 100}%` }" />
          <svg v-if="compare" viewBox="0 0 700 150" preserveAspectRatio="none" class="absolute inset-0 w-full h-full" aria-hidden="true">
            <path :d="prevLine" fill="none" stroke="var(--color-gray-900)" stroke-width="2" stroke-dasharray="5 5" vector-effect="non-scaling-stroke" />
          </svg>
        </div>
        <div class="flex gap-4 mt-2" aria-hidden="true">
          <HLText v-for="(l, i) in labels" :key="i" html-tag="span" size="md" :class="['flex-1 text-center', i === n - 1 ? 'text-gray-900 font-medium' : 'text-gray-500']">{{ l }}</HLText>
        </div>
      </div>
    </template>

    <!-- 6 · Each day by platform -->
    <template v-else-if="layout === 'platforms'">
      <div class="flex items-baseline gap-2.5 mt-4">
        <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900 tabular-nums">{{ fmtNum(total) }}</HLText>
        <HLText html-tag="span" size="md" class="text-gray-500">mentions</HLText>
        <HLText v-if="delta" html-tag="span" size="md" weight="semibold" :class="['inline-flex items-center gap-0.5', deltaTone(delta)]">
          <component :is="delta < 0 ? ArrowDownIcon : ArrowUpIcon" class="w-3.5 h-3.5" aria-hidden="true" />{{ Math.abs(delta) }}%
        </HLText>
      </div>
      <div class="flex items-center gap-x-5 gap-y-2 flex-wrap mt-3">
        <span v-for="(p, k) in platforms" :key="p.label" class="flex items-center gap-1.5">
          <i class="w-2.5 h-2.5 rounded-sm" :style="{ background: SHADES[k] }" aria-hidden="true" />
          <component :is="NETWORK_ICONS[p.key]" v-if="p.key && NETWORK_ICONS[p.key]" class="w-4 h-4" aria-hidden="true" />
          <HLText html-tag="span" size="md" class="text-gray-600">{{ p.label }} <span class="font-semibold text-gray-900">{{ p.value }}%</span></HLText>
        </span>
      </div>
      <div class="flex items-end gap-4 h-[170px] mt-5" role="img" :aria-label="`Mentions each day by platform: ${days.map((v, i) => `${labels[i]} ${fmtNum(v)}`).join(', ')}`">
        <div v-for="(v, i) in days" :key="i" class="flex-1 h-full flex flex-col justify-end items-center gap-1.5">
          <HLText html-tag="span" size="md" :class="['tabular-nums', i === n - 1 ? 'text-gray-900 font-semibold' : 'text-gray-500']">{{ fmtNum(v) }}</HLText>
          <div class="w-full max-w-14 flex flex-col-reverse rounded-md overflow-hidden" :style="{ height: `${(v / max) * 130}px` }">
            <div v-for="(p, k) in platforms" :key="p.label" :style="{ height: `${p.value}%`, background: SHADES[k] }" />
          </div>
        </div>
      </div>
      <div class="flex gap-4 mt-2" aria-hidden="true">
        <HLText v-for="(l, i) in labels" :key="i" html-tag="span" size="md" :class="['flex-1 text-center', i === n - 1 ? 'text-gray-900 font-medium' : 'text-gray-500']">{{ l }}</HLText>
      </div>
    </template>

  </div>
</template>
