<script setup>
// Explore, first visit (8 Oct). The search block from the Gradient starter (subtext, the six
// network marks, Create a topic link), then a blurred preview: the four topics rising in the
// industry, and the Overview and How people feel sections for the first of them. The preview is
// kept faint (S1): a heavier blur, low opacity, and a white haze behind the search.
//
// The preview fills whatever height is left on screen and fades into the bottom edge, so the
// page never scrolls; a taller screen simply shows more of it. Before an industry is picked it
// uses a sample industry, so the first landing is never an empty page.
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { SearchMdIcon, ArrowUpIcon, TrendUp01Icon } from '@gohighlevel/ghl-icons/24/outline'
import { nicheSuggestions, quickSearchResult, fmtNum, industryRisers } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'
import TopicSections from './TopicSections.vue'
import TrendChipRow from './TrendChipRow.vue'
import { NETWORK_ICONS } from './networkIcons.js'

const SAMPLE_SPACE = 'Beauty, Salon & Spa'
// The six networks a search checks, each naming itself on hover.
const SOURCE_MARKS = [
  { key: 'facebook', label: 'Facebook' }, { key: 'instagram', label: 'Instagram' }, { key: 'linkedin', label: 'LinkedIn' },
  { key: 'x', label: 'X (Twitter)' }, { key: 'reddit', label: 'Reddit' }, { key: 'youtube', label: 'YouTube' },
].map((s) => ({ ...s, icon: NETWORK_ICONS[s.key] }))

const { state, account, search, peek } = useSocialListening()

const pending = computed(() => search.value.pending)
const query = ref('')
function go(term = query.value) {
  if (pending.value || !term.trim()) return
  peek(term)
}
// 23 Oct (Sujith): the five quick-search keywords come back under the search.
const trending = computed(() => industryRisers(account.value.space || SAMPLE_SPACE, state.range).slice(0, 5))

const space = computed(() => account.value.space || SAMPLE_SPACE)
const terms = computed(() => nicheSuggestions(space.value).slice(0, 4))
const rising = computed(() => terms.value.map((t) => {
  const r = quickSearchResult(t, state.range, space.value)
  return { term: t, mentions: r.mentions, delta: r.delta, pos: r.pos, platform: r.platforms?.[0]?.label }
}))
const sample = computed(() => quickSearchResult(terms.value[0], state.range, space.value))

// Height for the preview: from its top to the bottom of the window, less anything that would
// still make the page scroll (the card's own padding and margin).
const preview = ref(null)
const height = ref(0)
function scroller(el) {
  for (let n = el?.parentElement; n; n = n.parentElement) {
    const o = getComputedStyle(n).overflowY
    if ((o === 'auto' || o === 'scroll') && n.scrollHeight > n.clientHeight - 1) return n
  }
  return document.scrollingElement
}
async function fit() {
  if (!preview.value) return
  height.value = Math.max(0, window.innerHeight - preview.value.getBoundingClientRect().top)
  await nextTick()
  const sc = scroller(preview.value)
  const over = sc ? sc.scrollHeight - sc.clientHeight : 0
  if (over > 0) height.value = Math.max(0, height.value - over)
}
let fitTimer = 0
onMounted(() => { fitTimer = setTimeout(fit, 50); window.addEventListener('resize', fit) })
onBeforeUnmount(() => { clearTimeout(fitTimer); window.removeEventListener('resize', fit) })
</script>

<template>
  <div class="sl-explore relative flex flex-col gap-6 pt-6">
    <div class="relative z-10 w-full max-w-240 mx-auto flex flex-col items-center text-center">
      <!-- 23 Oct (Sujith): "What do you want to keep an eye on?" read as vague. Say the action. -->
      <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">Search any brand, topic or hashtag</HLText>
      <HLText size="lg" class="text-gray-600 mt-2!">See what people are saying about it on six social networks.</HLText>
      <div id="search-starter-sources" class="flex items-center justify-center gap-2 mt-4" role="list" :aria-label="`Searches ${SOURCE_MARKS.map((s) => s.label).join(', ')}`">
        <HLTooltip v-for="s in SOURCE_MARKS" :key="s.key" trigger="hover">
          <template #trigger>
            <span role="listitem" class="w-7 h-7 grid place-items-center rounded-full bg-white border border-gray-200">
              <component :is="s.icon" class="w-4 h-4" aria-hidden="true" />
            </span>
          </template>
          {{ s.label }}
        </HLTooltip>
      </div>
      <div class="flex gap-2 mt-6 w-full max-w-135">
        <div class="flex-1">
          <HLInput
            id="insights-search" v-model="query" size="md" clearable :maxlength="100"
            :disabled="pending" :prefix-icon="SearchMdIcon"
            placeholder="Try a competitor, a product or a #hashtag"
            @keydown.enter="go()"
          />
        </div>
        <HLButton variant="primary" color="blue" size="md" :disabled="!query.trim() || pending" :loading="pending" @click="go()">
          {{ pending ? 'Searching' : 'Search' }}
        </HLButton>
      </div>
      <HLText v-if="pending" size="md" class="text-gray-500 mt-4!" role="status">
        Checking Facebook, Instagram, LinkedIn, X, Reddit and YouTube
      </HLText>
      <div v-if="!pending && trending.length" id="explore-trending" class="flex flex-col items-center gap-2 mt-6 w-full">
        <span class="flex items-center gap-2">
          <TrendUp01Icon class="w-4 h-4 text-gray-500" aria-hidden="true" />
          <HLText html-tag="span" size="md" weight="medium" class="text-gray-500 whitespace-nowrap">Trending in your industry</HLText>
        </span>
        <!-- 26 Oct (Sujit): one line, the rest behind "+N". -->
        <TrendChipRow class="w-full" center :items="trending" @pick="go" />
      </div>
      <!-- A blue text link, not a button, so it never competes with Search. -->
      <HLText v-if="!pending" size="md" class="text-gray-600 mt-6!">
        Want to follow it over time?
        <HLButton id="search-starter-create-topic" class="sl-inline-link" variant="text" color="blue" size="xs" @click="state.modal = 'topic'">Create a topic</HLButton>
      </HLText>
    </div>

    <!-- Decorative: never focusable or clickable. -->
    <div ref="preview" class="sl-explore-preview" :style="{ height: height + 'px' }" inert aria-hidden="true">
      <div>
        <div class="flex items-baseline justify-between mb-3">
          <HLText size="lg" weight="semibold" class="text-gray-900">Rising in your industry</HLText>
          <HLText size="md" class="text-gray-500">Mentions · Last 7 days</HLText>
        </div>
        <div class="grid grid-cols-4 gap-4">
          <div v-for="t in rising" :key="t.term" class="sl-explore-card">
            <HLText size="md" weight="semibold" class="text-gray-900 truncate">{{ t.term }}</HLText>
            <div class="flex items-baseline gap-2 mt-2">
              <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900 tabular-nums">{{ fmtNum(t.mentions) }}</HLText>
              <span class="sl-explore-delta"><ArrowUpIcon class="w-3.5 h-3.5" />{{ Math.abs(t.delta) }}%</span>
            </div>
            <HLText size="md" class="text-gray-500 mt-2!">{{ t.pos }}% positive · Most on {{ t.platform }}</HLText>
          </div>
        </div>
      </div>
      <div class="sl-explore-sections mt-6">
        <TopicSections :result="sample" quick />
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.sl-inline-link.hr-button) { height: auto !important; padding: 0 !important; vertical-align: baseline; font-size: inherit !important; }
.sl-explore-card { display: flex; flex-direction: column; border: 1px solid var(--color-gray-200); border-radius: 12px; padding: 16px; background: #fff; }
.sl-explore-delta { display: inline-flex; align-items: center; gap: 2px; font-size: 13px; font-weight: 600; color: var(--color-positive-strong); }
/* The preview, kept faint: blurred 6px at 30%, cut at the bottom of the screen and faded into it. */
.sl-explore-preview {
  position: relative; z-index: 0; overflow: hidden; pointer-events: none; user-select: none;
  -webkit-mask-image: linear-gradient(#000 55%, transparent); mask-image: linear-gradient(#000 55%, transparent);
}
.sl-explore-preview > * { filter: blur(6px); opacity: .3; }
/* A white haze behind the search, so the preview fades out around it. */
.sl-explore::before {
  content: ""; position: absolute; left: 50%; top: 0; z-index: 1; width: 80%; height: 520px; transform: translateX(-50%); pointer-events: none;
  background: radial-gradient(ellipse 50% 55% at 50% 40%, rgba(255, 255, 255, .95), rgba(255, 255, 255, .6) 55%, transparent 80%);
}
/* Only Overview and How people feel. */
.sl-explore-sections :deep([data-sec]:not([data-sec="snapshot"]):not([data-sec="sentiment"])) { display: none !important; }
</style>
