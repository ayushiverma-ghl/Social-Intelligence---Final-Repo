<script setup>
// 19 Oct (option D): every topic in the industry, one level in from the Industry trends card.
// Sort by topic, posts or change; a row opens the insights pop-up.
import { computed, ref } from 'vue'
import { ChevronRightIcon, ArrowDownIcon, ArrowUpIcon, ChevronSelectorVerticalIcon } from '@gohighlevel/ghl-icons/24/outline'
import { fmtNum, trendChange } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'
import { topicShares, industryTopics } from './industryTopics.js'

const { account, spaceData, range, nicheWindowVolume, peek } = useSocialListening()
// 26 Oct: inside the Trends tab the section heading says what the intro line says.
const props = defineProps({ bare: Boolean })
const shares = computed(() => topicShares(spaceData.value.trends.map((t) => ({ label: t.label, value: t.value, change: trendChange(t.label, t.value) })), account.value.space))
const topics = computed(() => industryTopics(shares.value, account.value.space, nicheWindowVolume.value))
const maxShare = computed(() => Math.max(...topics.value.map((t) => t.share), 1))
const sort = ref({ key: 'posts', dir: 'desc' })
const sorted = computed(() => {
  const { key, dir } = sort.value
  const list = [...topics.value].sort((a, b) => (key === 'label' ? a.label.localeCompare(b.label) : a[key] - b[key]))
  return dir === 'desc' ? list.reverse() : list
})
function sortBy(key) {
  sort.value = sort.value.key === key ? { key, dir: sort.value.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: key === 'label' ? 'asc' : 'desc' }
}
const ariaSort = (key) => (sort.value.key === key ? (sort.value.dir === 'desc' ? 'descending' : 'ascending') : 'none')
const sortIcon = (key) => (sort.value.key !== key ? ChevronSelectorVerticalIcon : sort.value.dir === 'desc' ? ArrowDownIcon : ArrowUpIcon)
const pct = (v) => (v >= 10 ? Math.round(v) : v.toFixed(1)) + '%'
</script>

<template>
  <div class="flex flex-col gap-5 max-w-376 mx-auto w-full">
    <HLText v-if="!props.bare" size="lg" class="text-gray-600">
      <b class="font-semibold text-gray-900 tabular-nums">{{ topics.length }}</b> topics in {{ account.space }} ·
      <b class="font-semibold text-gray-900 tabular-nums">{{ fmtNum(nicheWindowVolume) }}</b> posts {{ range.phrase }} · click a topic to see what people say about it
    </HLText>
    <div :class="['bg-white border border-gray-200 rounded-xl px-6 pt-2 pb-4', props.bare && 'mt-4']">
      <div class="sl-ind-grid h-11 border-b border-gray-200" role="row">
        <HLText html-tag="span" size="md" class="text-gray-500">#</HLText>
        <button type="button" class="sl-ind-th" :aria-sort="ariaSort('label')" @click="sortBy('label')">Topic<component :is="sortIcon('label')" class="w-3.5 h-3.5" /></button>
        <HLText html-tag="span" size="md" class="text-gray-500 whitespace-nowrap">Share of posts</HLText>
        <span />
        <button type="button" class="sl-ind-th justify-end" :aria-sort="ariaSort('posts')" @click="sortBy('posts')">Posts<component :is="sortIcon('posts')" class="w-3.5 h-3.5" /></button>
        <button type="button" class="sl-ind-th justify-end" :aria-sort="ariaSort('change')" @click="sortBy('change')">Change<component :is="sortIcon('change')" class="w-3.5 h-3.5" /></button>
        <span />
      </div>
      <button
        v-for="(t, i) in sorted" :key="t.label" type="button" class="sl-ind-grid sl-ind-row"
        :aria-label="`${t.label}: ${pct(t.share)} of posts. See what people say about it`" @click="peek(t.label)"
      >
        <HLText html-tag="span" size="md" class="text-gray-400 tabular-nums">{{ i + 1 }}</HLText>
        <HLText html-tag="span" size="md" class="text-gray-900 truncate text-left">{{ t.label }}</HLText>
        <span class="sl-ind-track"><i :style="{ width: (t.share / maxShare) * 100 + '%' }" /></span>
        <HLText html-tag="span" size="md" weight="semibold" class="text-gray-900 text-right tabular-nums">{{ pct(t.share) }}</HLText>
        <HLText html-tag="span" size="md" class="text-gray-700 text-right tabular-nums">{{ fmtNum(t.posts) }}</HLText>
        <HLText html-tag="span" size="md" weight="semibold" :class="['text-right tabular-nums', t.change >= 0 ? 'text-positive-strong' : 'text-negative-strong']">{{ t.change >= 0 ? '↑' : '↓' }} {{ Math.abs(t.change) }}%</HLText>
        <ChevronRightIcon class="w-4 h-4 text-gray-400 sl-ind-go" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.sl-ind-grid { display: grid; grid-template-columns: 24px minmax(0, 240px) minmax(0, 1fr) 48px 84px 84px 16px; gap: 16px; align-items: center; }
.sl-ind-th { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: var(--color-gray-500); background: none; cursor: pointer; }
.sl-ind-th[aria-sort='ascending'], .sl-ind-th[aria-sort='descending'] { color: var(--color-gray-900); font-weight: 600; }
.sl-ind-th:focus-visible, .sl-ind-row:focus-visible { outline: 2px solid var(--color-primary-600); outline-offset: 2px; border-radius: 6px; }
.sl-ind-row { width: calc(100% + 16px); height: 40px; margin: 0 -8px; padding: 0 8px; border-radius: 8px; background: none; cursor: pointer; text-align: left; }
.sl-ind-row:hover { background: var(--color-gray-50); }
.sl-ind-row:hover .sl-ind-go { color: var(--color-gray-700); }
.sl-ind-track { height: 10px; border-radius: 5px; background: var(--color-gray-100); overflow: hidden; }
.sl-ind-track i { display: block; height: 100%; border-radius: 4px; background: var(--color-chart-strong); }
</style>
