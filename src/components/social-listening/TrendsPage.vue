<script setup>
// 19 Oct: Trending everywhere, one level in from the Overview. Tabs filter by platform. All
// shows every source as a card of five; a single source opens as a full-width ranked table.
// A row opens the insights pop-up; hover offers Listen.
import { computed, ref } from 'vue'
import { Headphones01Icon } from '@gohighlevel/ghl-icons/24/outline'
import { TOPIC_SHOWN_LIMIT } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'
import TrendRow from './TrendRow.vue'
import TrendsLimitNotice from './TrendsLimitNotice.vue'
import { trendSources, SOURCE_ICONS, PLATFORMS, shortNum, sparkPath } from './trendsData.js'

const { state, range, peek, listenTo, isSavedTerm, toast, removeTopicQuietly } = useSocialListening()
const sources = computed(() => trendSources(state.range))
const rows = computed(() => sources.value.flatMap((s) => s.rows))
const fresh = computed(() => rows.value.filter((r) => r.isNew).length)
const atLimit = computed(() => (state.topicsByAccount[state.accountId] || []).length >= TOPIC_SHOWN_LIMIT)
const filter = ref('all')
const tabLabel = (key, label) => `${label} ${key === 'all' ? rows.value.length : sources.value.filter((s) => s.platform === key).reduce((n, s) => n + s.rows.length, 0)}`
const shown = computed(() => sources.value.filter((s) => filter.value === 'all' || s.platform === filter.value))
const asTable = computed(() => filter.value !== 'all' && shown.value.length === 1)
const unitLabel = (u) => u.charAt(0).toUpperCase() + u.slice(1)
function listen(t) {
  listenTo(t)
  toast(`You’re now listening to “${t}”`, 'It’s in Your topics. We check it every 6 hours.', 'positive', [{ label: 'Undo', run: () => removeTopicQuietly(t) }])
}
</script>

<template>
  <div class="flex flex-col gap-5 max-w-376 mx-auto w-full">
    <div class="flex flex-col gap-1">
      <HLText size="lg" class="text-gray-600">What people search, save, read and watch most on Google, Pinterest, Wikipedia and YouTube. Not tied to your industry.</HLText>
      <HLText size="md" class="text-gray-500"><b class="font-semibold text-gray-900 tabular-nums">{{ rows.length }}</b> trends {{ range.phrase }} · <b class="font-semibold text-gray-900 tabular-nums">{{ fresh }}</b> are new · click a trend to see what people say about it</HLText>
    </div>
    <HLTabs id="trends-page-tabs" :value="filter" type="line" @update:value="(v) => (filter = v)">
      <HLTab name="all" :tab="tabLabel('all', 'All')" />
      <HLTab v-for="p in PLATFORMS" :key="p.key" :name="p.key" :tab="tabLabel(p.key, p.label)" />
    </HLTabs>
    <TrendsLimitNotice v-if="atLimit" />

    <div v-if="!asTable" class="grid grid-cols-1 min-[1000px]:grid-cols-2 min-[1340px]:grid-cols-3 gap-4">
      <div v-for="s in shown" :key="s.key" class="sl-tcard">
        <div class="flex items-center gap-2 pb-2.5 mb-1 border-b border-gray-200">
          <component :is="SOURCE_ICONS[s.platform]" class="w-4 h-4 shrink-0" aria-hidden="true" />
          <HLText html-tag="span" size="lg" weight="semibold" class="text-gray-900 truncate min-w-0">{{ s.label }}</HLText>
          <span class="flex-1" /><HLText html-tag="span" size="md" class="text-gray-500 shrink-0">{{ s.unit }}</HLText>
        </div>
        <TrendRow v-for="(r, i) in s.rows" :key="r.term" :row="r" :rank="i + 1" show-change />
      </div>
    </div>

    <div v-else class="rounded-xl border border-gray-200 overflow-x-auto">
      <div class="flex items-center gap-2 px-5 h-13 border-b border-gray-200">
        <component :is="SOURCE_ICONS[shown[0].platform]" class="w-4 h-4 shrink-0" aria-hidden="true" />
        <HLText html-tag="span" size="lg" weight="semibold" class="text-gray-900">{{ shown[0].label }}</HLText>
      </div>
      <div class="sl-ttr sl-ttr-head">
        <HLText html-tag="span" size="md" weight="medium" class="text-gray-600">#</HLText>
        <HLText html-tag="span" size="md" weight="medium" class="text-gray-600">Trend</HLText>
        <HLText html-tag="span" size="md" weight="medium" class="text-gray-600">{{ unitLabel(shown[0].unit) }}</HLText>
        <HLText html-tag="span" size="md" weight="medium" class="text-gray-600 text-right">Change</HLText>
        <HLText html-tag="span" size="md" weight="medium" class="text-gray-600">Last 7 days</HLText>
        <span />
      </div>
      <div
        v-for="(r, i) in shown[0].rows" :key="r.term" class="sl-ttr sl-ttr-body" role="button" tabindex="0"
        :aria-label="`See what people say about ${r.term}`" @click="peek(r.term)" @keydown.enter="peek(r.term)"
      >
        <HLText html-tag="span" size="md" class="text-gray-500 tabular-nums">{{ i + 1 }}</HLText>
        <span class="flex items-center gap-2 min-w-0">
          <HLText html-tag="span" size="lg" weight="medium" class="text-gray-900 truncate">{{ r.term }}</HLText>
          <HLTag v-if="r.isNew" size="md" color="gray" round :interactive="false">New</HLTag>
        </span>
        <span class="flex items-center gap-3">
          <span class="sl-ttrack"><i :style="{ width: `${(r.value / shown[0].rows[0].value) * 100}%` }" /></span>
          <HLText html-tag="span" size="md" weight="semibold" class="text-gray-900 tabular-nums w-12 text-right">{{ shortNum(r.value) }}</HLText>
        </span>
        <HLText html-tag="span" size="md" weight="semibold" class="text-positive-strong tabular-nums text-right">↑ {{ r.change }}%</HLText>
        <svg viewBox="0 0 120 28" class="w-[110px] h-7" aria-hidden="true"><path :d="sparkPath(r.series).area" fill="var(--color-chart-strong)" fill-opacity=".1" /><path :d="sparkPath(r.series).line" fill="none" stroke="var(--color-chart-strong)" stroke-width="2" /></svg>
        <span class="flex justify-end">
          <HLText v-if="isSavedTerm(r.term)" html-tag="span" size="md" class="inline-flex items-center gap-1 text-gray-500"><Headphones01Icon class="w-4 h-4" />Listening</HLText>
          <HLButton v-else class="sl-ttr-listen" variant="text" color="blue" size="xs" :disabled="atLimit" @click.stop="listen(r.term)" @keydown.enter.stop>
            Listen
          </HLButton>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sl-tcard { min-width: 0; padding: 16px 16px 6px; border: 1px solid var(--color-gray-200); border-radius: 8px; }
.sl-ttr { min-width: 820px; display: grid; grid-template-columns: 28px minmax(0, 1fr) 220px 80px 120px 120px; align-items: center; gap: 16px; padding: 0 20px; }
.sl-ttr-head { height: 40px; background: var(--color-gray-50); border-bottom: 1px solid var(--color-gray-200); }
.sl-ttr-body { min-height: 60px; border-bottom: 1px solid var(--color-gray-100); cursor: pointer; }
.sl-ttr-body:last-child { border-bottom: 0; }
.sl-ttr-body:hover { background: var(--color-gray-50); }
.sl-ttr-body:focus-visible { outline: 2px solid var(--color-primary-600); outline-offset: -2px; }
.sl-ttr-listen { opacity: 0; }
.sl-ttr-body:hover .sl-ttr-listen, .sl-ttr-body:focus-within .sl-ttr-listen { opacity: 1; }
.sl-ttrack { display: block; flex: 1; height: 8px; border-radius: 4px; background: var(--color-gray-100); overflow: hidden; }
.sl-ttrack i { display: block; height: 100%; border-radius: 4px; background: var(--color-chart-strong); }
</style>
