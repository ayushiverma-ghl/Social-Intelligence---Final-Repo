<script setup>
// Search and "Your topics" at the top of the Overview.
// 14 Oct (1A): "Create a topic" sits beside Search, so both ways in are one glance apart.
// 14 Oct (2E): every topic as a slim card (name, mentions, change), up to five; more than that
// and "See all" carries the rest. A search or a card opens the insights modal.
// 14 Oct (search + Trending now): the industry's fastest risers sit 10px under the search, on
// the white card, as one block with it. Only the tags that fit on one line show; a tag is never
// cut off. Tapping one runs that search.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { SearchMdIcon, ArrowUpIcon, ArrowDownIcon, TrendUp01Icon, ChevronDownIcon, ChevronUpIcon, BellRinging01Icon, Headphones01Icon } from '@gohighlevel/ghl-icons/24/outline'
import { quickSearchResult, fmtNum, TOPIC_SHOWN_LIMIT, industryRisers } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'
import { FIG } from './figures.js'
import TrendChipRow from './TrendChipRow.vue'

const { state, account, spaceData, range, peek, isSavedTerm } = useSocialListening()
// 23 Oct: the search block lives on the Explore tab. The page title moved above the tabs, and
// Explore lists every topic itself, so both can be switched off here.
const props = defineProps({ intro: { type: Boolean, default: true }, tiles: { type: Boolean, default: true }, wrap: { type: Boolean, default: false } })

// The industry's topics and keywords, growing ones only, fastest first.
const trending = computed(() => industryRisers(account.value.space, state.range).slice(0, 5))
// The row is one line tall and wraps out of sight; anything that wrapped is hidden from the
// keyboard and screen readers too.
const tagRow = ref(null)
const fits = ref(5)
function measure() {
  const el = tagRow.value
  if (!el) return
  const tags = [...el.querySelectorAll('.sl-trend-tag')]
  const top = tags[0]?.offsetTop
  fits.value = props.wrap ? tags.length : tags.filter((t) => t.offsetTop === top).length
}
let ro
onMounted(() => { ro = new ResizeObserver(measure); if (tagRow.value) ro.observe(tagRow.value); measure() })
onBeforeUnmount(() => ro && ro.disconnect())
watch(trending, () => nextTick(measure))

const query = ref('')
// out9 q14: a lone letter or a quote mark returned 35,000+ mentions. A search needs two letters or
// digits; until then Search stays off and the line under the field says why.
const searchable = computed(() => (query.value.match(/[\p{L}\p{N}]/gu) || []).length >= 2)
const tooShort = computed(() => !!query.value.trim() && !searchable.value)
function go() {
  const t = query.value.trim()
  if (t && searchable.value) peek(t)
}
watch(tooShort, () => nextTick(() => { if (tagRow.value) { ro?.disconnect(); ro?.observe(tagRow.value) } measure() }))

// 19 Oct (option 4): no row until the first topic; the pop-up explains listening when it matters.
// 15 Oct (audit 4): every topic lives here. Five show; "Show all" opens the rest in place as
// more rows of the same cards, instead of the old Topics tab. A bell marks topics with alerts.
const SHOWN = 5
const showAll = ref(false)
const alertsOn = (title) => (state.alertsBy[`${state.accountId}|${title}`] || []).length
const topics = computed(() => (state.topicsByAccount[state.accountId] || []).map((t) => {
  if (t.collecting) return { title: t.title, collecting: true, alerts: alertsOn(t.title) }
  const r = quickSearchResult(t.term || t.title, state.range, account.value.space)
  if (!r || r.empty) return null
  return { title: t.title, mentions: r.mentions, delta: r.delta, alerts: alertsOn(t.title) }
}).filter(Boolean).sort((a, b) => (b.mentions || 0) - (a.mentions || 0)))
const visible = computed(() => topics.value.slice(0, SHOWN))
const all = computed(() => (state.topicsByAccount[state.accountId] || []).length)
const atLimit = computed(() => all.value >= TOPIC_SHOWN_LIMIT)
</script>

<template>
  <!-- 19 Oct spacing pass: 40px from here to the first card (the page's 32 plus 8). -->
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-4">
    <!-- 21 Oct (13 V2): a page title and one line saying what Social intelligence is. -->
    <!-- out15 (Ayushi): the page's one h1 is HighRise display xs (24/32 semibold), a step above the
         16 card headings; 8 to the one-liner, 16 (gap-4 above) to the search. -->
    <div v-if="props.intro" id="si-intro" class="flex flex-col gap-2">
      <HLText id="si-title" html-tag="h1" type="display" size="xs" weight="semibold" class="text-gray-900">Social intelligence</HLText>
      <HLText size="md" class="text-gray-600">See what people are saying about you, your competitors and your industry across social media.</HLText>
    </div>
    <div class="flex flex-col gap-3">
    <div class="flex gap-2">
      <div class="flex-1">
        <HLInput
          id="overview-search" v-model="query" size="md" clearable :maxlength="100"
          :prefix-icon="SearchMdIcon" placeholder="Search any brand, topic or hashtag" @keydown.enter="go"
        />
      </div>
      <HLButton variant="primary" color="blue" size="md" :disabled="!searchable" @click="go">Search</HLButton>
      <!-- 21 Oct CTA audit: label only, like Search beside it (one rule for actions: no leading icon). -->
      <HLButton id="overview-create-topic" variant="secondary" size="md" @click="state.modal = 'topic'">Create a topic</HLButton>
    </div>
    <!-- out9 q14: takes the Trending now row's place (same 32px), so nothing moves. -->
    <div v-if="tooShort" id="overview-search-hint" class="flex items-center h-8" role="status">
      <HLText size="md" class="text-gray-600">Type at least 2 letters to search.</HLText>
    </div>
    <div v-else-if="trending.length" class="flex items-start gap-2 min-w-0">
      <span class="flex items-center gap-2 h-8 shrink-0">
        <TrendUp01Icon class="w-4 h-4 text-gray-500" aria-hidden="true" />
        <HLText html-tag="span" size="md" weight="medium" class="text-gray-500 whitespace-nowrap">Trending in your industry</HLText>
      </span>
      <!-- 26 Oct (Sujit): one line, the rest behind "+N". -->
      <TrendChipRow v-if="props.wrap" class="flex-1" :items="trending" @pick="peek" />
      <div v-else ref="tagRow" :class="['flex flex-wrap gap-2 min-w-0 flex-1', props.wrap ? '' : 'h-8 overflow-hidden']">
        <!-- Round 7: each chip is HLButton secondary xs (32 tall, HighRise padding and icon gap). -->
        <HLButton
          v-for="(t, i) in trending" :key="t.term" variant="secondary" size="xs" class="sl-trend-tag"
          :class="{ 'invisible': i >= fits, 'is-listening': isSavedTerm(t.term) }" :tabindex="i >= fits ? -1 : 0" :aria-hidden="i >= fits ? 'true' : undefined"
          :aria-label="`${isSavedTerm(t.term) ? 'Listening to' : 'Search'} ${t.term}, up ${t.delta}%`" @click="peek(t.term)"
        >
          <!-- 15 Oct (review 13): a topic you already listen to is marked as yours. -->
          <template v-if="isSavedTerm(t.term)" #iconLeft><Headphones01Icon /></template>
          <span class="inline-flex items-center gap-2 whitespace-nowrap">
            <span>{{ t.term }}</span>
            <span class="text-positive-strong tabular-nums inline-flex items-center gap-1">
              <ArrowUpIcon class="w-3.5 h-3.5" aria-hidden="true" />{{ t.delta }}%
            </span>
          </span>
        </HLButton>
      </div>
    </div>
    </div>
    </div>

    <div v-if="props.tiles && topics.length" id="overview-topics" class="flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <HLText size="md" weight="medium" class="text-gray-500">Your topics · <span :class="atLimit && 'text-warning-strong font-semibold'">{{ all }} of {{ TOPIC_SHOWN_LIMIT }}</span><template v-if="atLimit"> · limit reached</template></HLText>
        <span class="flex-1" />
        <!-- 19 Oct: more than five opens "Your topics", one level in, instead of growing the Overview.
             21 Oct (Ayushi): a text link like "Search it", not a boxed button. -->
        <HLButton v-if="topics.length > SHOWN" id="overview-topics-all" variant="text" color="blue" size="xs" @click="state.topicsPage = true">
          View all {{ topics.length }}
        </HLButton>
      </div>
      <!-- 19 Oct: always five to a row, so one topic isn't a full-width card.
           21 Oct audit: each card sizes to its name (192–280px, a fifth of the row at most when
           five don't fit), so a name isn't cut while the row has room. -->
      <!-- Round 7: each tile is an HLCard (16/8 inside, HighRise radius 8, shadow-xs), 8 apart. -->
      <div class="flex gap-2">
        <HLCard
          v-for="t in visible" :key="t.title" role="button" tabindex="0"
          class="sl-topic-slim text-left" :aria-label="`Open ${t.title}`" @click="state.peekTopic = t.title" @keydown.enter="state.peekTopic = t.title"
        >
          <span class="flex items-center gap-2 min-w-0">
            <HLText html-tag="span" size="md" class="block text-gray-600 truncate flex-1">{{ t.title }}</HLText>
            <span v-if="t.alerts" class="inline-flex items-center gap-0.5 text-gray-500 shrink-0" :title="`${t.alerts} alert${t.alerts > 1 ? 's' : ''}`">
              <BellRinging01Icon class="w-3.5 h-3.5" aria-hidden="true" />
              <HLText html-tag="span" size="md" weight="semibold" class="tabular-nums">{{ t.alerts }}</HLText>
              <span class="sr-only">alerts</span>
            </span>
          </span>
          <span v-if="t.collecting" class="flex items-center gap-2 mt-1">
            <HLText html-tag="span" size="md" class="text-gray-500">Collecting…</HLText>
          </span>
          <!-- a20: the strip's figures are 16, not HLText xl (15, off the 13/14/16 scale). -->
          <span v-else class="flex items-baseline gap-2 mt-1">
            <HLText html-tag="span" v-bind="FIG.strip" class="text-gray-900 tabular-nums">{{ fmtNum(t.mentions) }}</HLText><HLText html-tag="span" size="md" class="text-gray-500 -ml-1!">mentions</HLText>
            <HLText html-tag="span" size="md" weight="semibold" :class="['inline-flex items-center gap-1 tabular-nums', t.delta < 0 ? 'text-negative-strong' : 'text-positive-strong']">
              <component :is="t.delta < 0 ? ArrowDownIcon : ArrowUpIcon" class="w-3.5 h-3.5 self-center" aria-hidden="true" />{{ Math.round(Math.abs(t.delta)) }}%
            </HLText>
          </span>
        </HLCard>
        <!-- 21 Oct (12 V1): no dashed "Listen to a topic" card; Create a topic by the search is the one way in. -->
      </div>
    </div>

  </div>
</template>

<style scoped>
/* HLCard tiles: HighRise's card with 16/8 inside and shadow-xs at rest; hover lifts to gray-300
   like every card. Width rules unchanged (each sizes to its name, 192–280px). */
.hr-v-4-8-5 .hr-card.sl-topic-slim {
  padding: 8px 16px; flex: 0 1 auto; width: max-content; max-width: 280px; min-width: min(192px, calc((100% - 32px) / 5));
  box-shadow: var(--shadow-xs); cursor: pointer; transition: border-color .15s, box-shadow .15s;
}
.hr-v-4-8-5 .hr-card.sl-topic-slim:hover { border-color: var(--color-gray-300); box-shadow: var(--shadow-sm); }
.sl-topic-slim:focus-visible { outline: 2px solid var(--color-primary-600); outline-offset: 2px; }
</style>
