<script setup>
// 19 Oct: "Your topics", one level in from the Overview. Every saved topic as a watchlist row:
// mentions, change, the week's trend, how people feel, and alerts. A row opens the insights
// pop-up on top of this page; Back returns to the Overview.
import { computed, ref } from 'vue'
import { SearchMdIcon, ArrowUpIcon, ArrowDownIcon, BellRinging01Icon, DotsVerticalIcon, ChevronDownIcon, SwitchVertical01Icon } from '@gohighlevel/ghl-icons/24/outline'
import { quickSearchResult, fmtNum, TOPIC_SHOWN_LIMIT } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'

const { state, account } = useSocialListening()

const query = ref('')
const SORTS = [
  { key: 'mentions', label: 'Most mentions' },
  { key: 'change', label: 'Biggest change' },
  { key: 'name', label: 'A–Z' },
]
const sort = ref('mentions')
const sortLabel = computed(() => SORTS.find((s) => s.key === sort.value).label)

const alertsOn = (title) => (state.alertsBy[`${state.accountId}|${title}`] || []).length
const all = computed(() => (state.topicsByAccount[state.accountId] || []).length)
const atLimit = computed(() => all.value >= TOPIC_SHOWN_LIMIT)
const rows = computed(() => (state.topicsByAccount[state.accountId] || []).map((t) => {
  const r = quickSearchResult(t.term || t.title, state.range, account.value.space)
  return {
    title: t.title, collecting: !!t.collecting, created: String(t.created || 'today').toLowerCase(),
    mentions: r.mentions || 0, delta: r.delta || 0, alerts: alertsOn(t.title),
  }
}))
const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  const list = q ? rows.value.filter((r) => r.title.toLowerCase().includes(q)) : rows.value.slice()
  if (sort.value === 'change') list.sort((a, b) => b.delta - a.delta)
  else if (sort.value === 'name') list.sort((a, b) => a.title.localeCompare(b.title))
  else list.sort((a, b) => b.mentions - a.mentions)
  return list
})

const menuFor = (r) => [
  { key: 'open', label: 'Open insights' },
  ...(r.collecting ? [] : [{ key: 'alert', label: r.alerts ? 'Manage alerts' : 'Add alert' }]),
  { key: 'd', type: 'divider' },
  { key: 'stop', label: 'Stop listening', class: 'sl-danger-option' },
]
function onMenu(k, r) {
  if (k === 'open') state.peekTopic = r.title
  if (k === 'alert') { state.alertTopic = r.title; state.alertSavesSearch = false; state.alertMetric = null; state.modal = 'alert' }
  if (k === 'stop') state.confirmStop = r.title
}
</script>

<template>
  <div class="flex flex-col gap-5 max-w-376 mx-auto w-full">
    <HLAlert
      v-if="atLimit" id="topics-page-limit" color="orange" :closable="false" width="100%" max-width="100%"
      title="You’re listening to all 50 topics"
      content="Stop listening to one to add another. Use the ⋯ menu on any row."
    />

    <div class="flex items-center gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <span class="w-28"><HLProgress id="topics-page-capacity" :percentage="Math.min(100, (all / TOPIC_SHOWN_LIMIT) * 100)" :show-indicator="false" :height="6" :border-radius="3" rail-color="var(--color-gray-100)" :color="atLimit ? 'var(--color-warning)' : 'var(--color-chart-strong)'" /></span>
        <HLText size="md" class="text-gray-600"><span :class="['font-semibold tabular-nums', atLimit ? 'text-warning-strong' : 'text-gray-900']">{{ all }} of {{ TOPIC_SHOWN_LIMIT }}</span> topics · checked every 6 hours</HLText>
      </div>
      <span class="flex-1" />
      <div class="w-64"><HLInput id="topics-page-search" v-model="query" size="md" clearable :prefix-icon="SearchMdIcon" placeholder="Search your topics" /></div>
      <HLDropdown id="topics-page-sort" trigger="click" placement="bottom-end" :options="SORTS.map((o) => ({ ...o, class: o.key === sort ? 'sl-opt-on' : undefined }))" :show-search="false" @select="(k) => (sort = k)">
        <HLButton variant="secondary" size="sm" :aria-label="`Sorted by ${sortLabel}. Change`">
          <template #iconLeft><SwitchVertical01Icon /></template>
          <span class="mr-1">{{ sortLabel }}</span>
          <template #iconRight><ChevronDownIcon /></template>
        </HLButton>
      </HLDropdown>
    </div>

    <div v-if="!all" id="topics-page-empty" class="rounded-xl border border-gray-200 px-6 py-12 flex flex-col items-center gap-2 text-center">
      <HLText size="2xl" weight="semibold" class="text-gray-900">You’re not listening to any topics</HLText>
      <HLText size="lg" class="text-gray-600">Search a brand, topic or hashtag above and press Start listening, or create one here.</HLText>
      <HLButton id="topics-page-empty-create" class="mt-2" variant="primary" color="blue" size="sm" @click="state.modal = 'topic'">Create a topic</HLButton>
    </div>
    <div v-else class="rounded-xl border border-gray-200 overflow-x-auto">
      <div class="tp-row tp-head">
        <HLText html-tag="span" size="md" weight="medium" class="text-gray-600">Topic</HLText>
        <HLText html-tag="span" size="md" weight="medium" class="text-gray-600 text-right">Mentions · 7 days</HLText>
        <HLText html-tag="span" size="md" weight="medium" class="text-gray-600 text-right">Change</HLText>
        <HLText html-tag="span" size="md" weight="medium" class="text-gray-600">Alerts</HLText>
        <span />
      </div>
      <div v-for="r in shown" :key="r.title" class="tp-row tp-body" role="button" tabindex="0" @click="state.peekTopic = r.title" @keydown.enter="state.peekTopic = r.title">
        <span class="min-w-0">
          <HLText html-tag="span" size="lg" weight="medium" class="block text-gray-900 truncate">{{ r.title }}</HLText>
          <HLText html-tag="span" size="md" class="block text-gray-500">Added {{ r.created }}</HLText>
        </span>
        <template v-if="r.collecting">
          <HLText html-tag="span" size="md" class="text-gray-500 col-span-2">Collecting the first posts…</HLText>
        </template>
        <template v-else>
          <HLText html-tag="span" size="lg" weight="semibold" class="text-gray-900 text-right tabular-nums">{{ fmtNum(r.mentions) }}</HLText>
          <HLText html-tag="span" size="md" weight="semibold" :class="['inline-flex items-center justify-end tabular-nums', r.delta < 0 ? 'text-negative-strong' : 'text-positive-strong']"><component :is="r.delta < 0 ? ArrowDownIcon : ArrowUpIcon" class="w-3 h-3" aria-hidden="true" />{{ Math.abs(r.delta) }}%</HLText>
        </template>
        <span class="flex items-center gap-1 text-gray-600">
          <template v-if="r.alerts"><BellRinging01Icon class="w-4 h-4" aria-hidden="true" /><HLText html-tag="span" size="md">{{ r.alerts }} on</HLText></template>
          <HLText v-else html-tag="span" size="md" class="text-gray-500">None</HLText>
        </span>
        <span class="flex justify-end" @click.stop>
          <HLDropdown trigger="click" placement="bottom-end" :options="menuFor(r)" :width="180" :show-search="false" @select="(k) => onMenu(k, r)">
            <HLButton variant="ghost" size="sm" :aria-label="`More actions for ${r.title}`"><template #iconLeft><DotsVerticalIcon /></template></HLButton>
          </HLDropdown>
        </span>
      </div>
      <div v-if="!shown.length" class="px-6 py-10 flex flex-col items-center gap-2 text-center">
        <HLText size="lg" weight="medium" class="text-gray-900">No topics match “{{ query.trim() }}”</HLText>
        <HLButton variant="text" color="blue" size="xs" @click="query = ''">Clear search</HLButton>
      </div>
    </div>
    <HLText v-if="all && shown.length" size="md" class="text-gray-500">Showing {{ shown.length }} of {{ all }}. Click a topic to see what people are saying.</HLText>
  </div>
</template>

<style scoped>
/* 27 Oct (developers): no 7-day chart and no Positive column; both cost an extra call per topic. */
.tp-row { min-width: 640px; display: grid; grid-template-columns: minmax(0, 1fr) 150px 100px 90px 48px; align-items: center; gap: 20px; padding: 0 20px; }
.tp-head { height: 44px; background: var(--color-gray-50); border-bottom: 1px solid var(--color-gray-200); }
.tp-body { min-height: 64px; border-bottom: 1px solid var(--color-gray-100); cursor: pointer; transition: background-color .12s; }
.tp-body:last-child { border-bottom: 0; }
.tp-body:hover { background: var(--color-gray-50); }
.tp-body:focus-visible { outline: 2px solid var(--color-primary-600); outline-offset: -2px; }
</style>
