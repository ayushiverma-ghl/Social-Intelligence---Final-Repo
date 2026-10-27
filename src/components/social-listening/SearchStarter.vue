<script setup>
// Topics before anything is saved (Sujeet, 5 Oct). The search, then two rows of ready-made
// searches: what is rising in the industry, and the competitors you track. Each card is a real
// search result, so the figures on it are the ones the search would open on.
//
// `state.explore` picks the version. The Demo panel switches between three (7 Oct): "gradient",
// "cards" and "basic", where the search is the one thing to do. "suggestions" (URL only) makes
// the rows clickable and is unchanged.
import { computed, ref, watch } from 'vue'
import { SearchMdIcon, PlusIcon, ArrowUpIcon, ArrowDownIcon, ClockIcon, MessageCircle01Icon, TrendUp01Icon } from '@gohighlevel/ghl-icons/24/outline'
import { nicheSuggestions, quickSearchResult, fmtNum } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'
import CountUp from './CountUp.vue'
import { NETWORK_ICONS } from './networkIcons.js'
import TopicSections from './TopicSections.vue'
import { TOPIC_SOURCES } from './topicSources.js'

const { state, account, range, search, runSearch, isSavedTerm, maxCompetitors } = useSocialListening()

const pending = computed(() => search.value.pending)
// 7 Oct (option D): no platform count to go stale. A row of the sources' marks, read from the
// same list the Create topic modal uses; each names itself on hover.
const SOURCE_MARKS = TOPIC_SOURCES.map((s) => ({ key: s.key, label: s.name, icon: NETWORK_ICONS[s.key] || s.icon }))
// The Demo panel's three versions (7 Oct): 'gradient' (pick 5), 'cards' (B2) and 'basic', which
// is the gradient version's copy and search with the hero art and pictures taken away.
const basic = computed(() => state.explore === 'basic')
const cards = computed(() => state.explore === 'cards')
const query = ref(search.value.term || '')
watch(() => search.value.term, (t) => { if (t) query.value = t })

function go(term = query.value) {
  if (pending.value || !term.trim()) return
  query.value = term
  runSearch(term)
}

function card(term) {
  const r = quickSearchResult(term, state.range, account.value.space)
  if (r.empty) return { term, empty: true }
  const top = (r.platforms || [])[0]
  return { term, mentions: r.mentions, delta: r.delta, feel: `${r.pos}% positive`, where: top ? `Most on ${top.label}` : '' }
}

const rising = computed(() => nicheSuggestions(account.value.space).filter((t) => !isSavedTerm(t)).slice(0, 4).map(card))
const competitors = computed(() => (account.value.competitors || []).map(card))
const canAdd = computed(() => (account.value.competitors || []).length < maxCompetitors.value)
// 7 Oct follow-up, pick 5 ("quiet hero, rich pictures"): the Overview landing's recipe with the
// search as the action. A short hero with two signal stickers, then four pictures of what every
// search tells you. The figures are one example search's ("Mercedes", last 7 days) and the same
// for every account; nothing here is measured. Decorative only: hero art and pictures are
// aria-hidden, and each picture's caption says what it is.
const FacebookIcon = NETWORK_ICONS.facebook
const HEAT = [
  [1, 2, 4, 1, 3, 2, 5], [2, 4, 1, 2, 4, 1, 2], [2, 2, 3, 3, 3, 4, 4], [1, 1, 4, 4, 3, 2, 1],
]
const HEAT_SHADES = ['bg-gray-100', 'bg-primary-100', 'bg-primary-200', 'bg-primary-300', 'bg-primary-400', 'bg-primary-600']
const PICTURES = [
  { key: 'much', title: 'How much', line: 'Mentions over time, and how fast they move.' },
  { key: 'feel', title: 'How people feel', line: 'Positive, neutral and negative, at a glance.' },
  { key: 'when', title: 'When', line: 'The days and hours it gets talked about most.' },
  { key: 'who', title: 'Who', line: 'The people and posts driving the conversation.' },
]
// Cards: the preview is the result a search for this term opens on, so its figures are real ones.
const SAMPLE_TERM = 'Mercedes'
const sample = computed(() => quickSearchResult(SAMPLE_TERM, state.range, account.value.space))
const sections = computed(() => [
  { key: 'rising', title: 'Rising in your industry', cards: rising.value, add: false },
  { key: 'competitors', title: 'Your competitors', cards: competitors.value, add: canAdd.value },
].filter((s) => s.cards.length || s.add))
</script>

<template>
  <!-- 4A, as pick 5 from the 7 Oct follow-up: the Overview landing's recipe with the search in
       place of the button. A quiet hero (side washes, dot field, two signal stickers), then a
       dotted rule and four frameless pictures of what every search tells you. -->
  <div v-if="state.explore === 'gradient' || basic" :class="['sl-starter', basic && 'sl-starter-basic']">
    <div class="sl-hero-box relative isolate overflow-hidden rounded-xl grid place-items-center">
      <div v-if="!basic" class="sl-hero-stage" aria-hidden="true">
        <svg class="absolute inset-0 w-full h-full" viewBox="0 0 1120 540" fill="none">
          <path d="M150 150 C 230 170, 250 230, 270 280" class="stroke-primary-200" stroke-width="1.5" stroke-dasharray="1 6" stroke-linecap="round" />
          <path d="M975 410 C 920 380, 880 330, 860 290" class="sl-violet-line" stroke-width="1.5" stroke-dasharray="1 6" stroke-linecap="round" />
        </svg>
        <span class="sl-stk" style="left: 150px; top: 150px; --r: -6deg">
          <span class="w-6 h-6 grid place-items-center shrink-0"><FacebookIcon class="w-6 h-6" /></span>
          <HLText html-tag="span" size="md" weight="semibold" class="text-gray-900">Most on Facebook · 29%</HLText>
        </span>
        <span class="sl-stk" style="left: 975px; top: 410px; --r: 5deg">
          <span class="w-6 h-6 rounded-full grid place-items-center shrink-0 bg-primary-50 text-primary-600"><ClockIcon class="w-3.5 h-3.5" /></span>
          <HLText html-tag="span" size="md" weight="semibold" class="text-gray-900">Busiest Sun, 6 pm</HLText>
        </span>
      </div>

      <div class="sl-hero-copy relative z-10 w-full max-w-150 px-4 text-center">
        <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900 text-balance">What do you want to keep an eye on?</HLText>
        <HLText size="2xl" class="text-gray-600 mt-3!">Search any brand, topic or hashtag.</HLText>
        <div id="search-starter-sources" class="flex items-center justify-center gap-2 mt-3" role="list" :aria-label="`Searches ${SOURCE_MARKS.map((s) => s.label).join(', ')}`">
          <HLTooltip v-for="s in SOURCE_MARKS" :key="s.key" trigger="hover">
            <template #trigger>
              <span role="listitem" class="w-7 h-7 grid place-items-center rounded-full bg-white border border-gray-200">
                <component :is="s.icon" class="w-4 h-4" aria-hidden="true" />
              </span>
            </template>
            {{ s.label }}
          </HLTooltip>
        </div>
        <div class="flex gap-2 mt-7 w-full max-w-135 mx-auto">
          <div class="flex-1">
            <HLInput
              id="insights-search" v-model="query" size="lg" clearable :maxlength="100"
              :disabled="pending" :prefix-icon="SearchMdIcon" autofocus
              placeholder="Search a brand, topic or hashtag"
              @keydown.enter="go()"
            />
          </div>
          <HLButton variant="primary" color="blue" size="lg" :disabled="!query.trim() || pending" :loading="pending" @click="go()">
            {{ pending ? 'Searching' : 'Search' }}
          </HLButton>
        </div>
        <HLText v-if="pending" size="md" class="text-gray-500 mt-3.5!" role="status">
          Checking Facebook, Instagram, LinkedIn, X, Reddit and YouTube
        </HLText>
        <!-- A blue text link, not a button, so it never competes with Search. -->
        <HLText v-else size="md" class="text-gray-600 mt-3.5!">
          Want to follow it over time?
          <HLButton id="search-starter-create-topic" class="sl-inline-link" variant="text" color="blue" size="xs" @click="state.modal = 'topic'">Create a topic</HLButton>
        </HLText>
      </div>
    </div>

    <template v-if="!basic">
    <div class="flex items-center gap-3.5 mt-9 mb-6" aria-hidden="true">
      <span class="sl-dot-rule flex-1" />
      <HLText html-tag="span" size="md" weight="medium" class="text-gray-500">What every search tells you</HLText>
      <span class="sl-dot-rule flex-1" />
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-y-10 lg:gap-y-0">
      <div v-for="(pic, i) in PICTURES" :key="pic.key" :style="{ '--i': i + 1 }" class="sl-enter sl-vig-col px-6 text-center">
        <div class="relative h-37.5 mb-3.5" aria-hidden="true">
          <span :class="['sl-vig-halo', pic.key === 'feel' || pic.key === 'who' ? 'sl-vig-halo-violet' : pic.key === 'when' ? 'sl-vig-halo-mix' : 'sl-vig-halo-blue']" />
          <template v-if="pic.key === 'much'">
            <div class="sl-vig-glass w-50 text-left" style="--r: -3deg">
              <div class="flex items-baseline gap-1.5">
                <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900 tabular-nums">7,342</HLText>
                <HLText html-tag="span" size="md" weight="semibold" class="inline-flex items-center gap-0.5 text-positive-strong tabular-nums"><ArrowUpIcon class="w-3.5 h-3.5 self-center" />20%</HLText>
              </div>
              <HLText size="md" class="text-gray-500">mentions this week</HLText>
              <svg viewBox="0 0 170 40" class="block w-full h-10 mt-1.5" fill="none">
                <defs><linearGradient id="sl-starter-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--color-primary-600)" stop-opacity=".18" /><stop offset="1" stop-color="var(--color-primary-600)" stop-opacity="0" /></linearGradient></defs>
                <path d="M0 27 C 9 27, 19 21, 28 21 C 38 21, 47 18, 57 18 C 66 18, 76 17, 85 17 C 94 17, 104 17, 113 17 C 123 17, 132 14, 142 14 C 151 14, 161 5, 170 5 L170 40 L0 40 Z" fill="url(#sl-starter-area)" />
                <path d="M0 27 C 9 27, 19 21, 28 21 C 38 21, 47 18, 57 18 C 66 18, 76 17, 85 17 C 94 17, 104 17, 113 17 C 123 17, 132 14, 142 14 C 151 14, 161 5, 170 5" class="stroke-primary-600" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
            <span class="sl-stk" style="left: 80%; top: 14%; --r: 6deg">
              <span class="w-6 h-6 rounded-full grid place-items-center bg-primary-50 text-primary-600"><TrendUp01Icon class="w-3.5 h-3.5" /></span>
              <HLText html-tag="span" size="md" weight="semibold" class="text-gray-900">Rising</HLText>
            </span>
          </template>
          <template v-else-if="pic.key === 'feel'">
            <div class="sl-vig-glass sl-vig-glass-violet w-50 text-left" style="--r: 2deg">
              <div class="flex items-baseline gap-1.5">
                <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900 tabular-nums">+48</HLText>
                <HLText html-tag="span" size="md" class="text-gray-500">net sentiment</HLText>
              </div>
              <span class="flex gap-0.5 h-1.5 rounded-full overflow-hidden mt-2.5">
                <span class="bg-positive" style="flex: 56" /><span class="bg-gray-200" style="flex: 36" /><span class="bg-negative" style="flex: 8" />
              </span>
              <HLText size="md" class="text-gray-500 mt-1.5!">56% positive · 8% negative</HLText>
            </div>
            <span class="sl-stk" style="left: 24%; top: 88%; --r: -5deg">
              <span class="w-6 h-6 rounded-full grid place-items-center bg-accent-purple-light text-accent-purple"><MessageCircle01Icon class="w-3.5 h-3.5" /></span>
              <HLText html-tag="span" size="md" weight="semibold" class="text-gray-900">Mostly positive</HLText>
            </span>
          </template>
          <template v-else-if="pic.key === 'when'">
            <div class="sl-vig-glass text-left" style="--r: -2deg">
              <HLText size="md" class="text-gray-500">Busiest hours</HLText>
              <div class="grid grid-cols-[repeat(7,12px)] gap-1 mt-2">
                <span v-for="(v, j) in HEAT.flat()" :key="j" :class="['block w-3 h-3 rounded-full', HEAT_SHADES[v]]" />
              </div>
            </div>
            <span class="sl-stk" style="left: 80%; top: 92%; --r: 5deg">
              <span class="w-6 h-6 rounded-full grid place-items-center bg-primary-50 text-primary-600"><ClockIcon class="w-3.5 h-3.5" /></span>
              <HLText html-tag="span" size="md" weight="semibold" class="text-gray-900">Sun, 6 pm</HLText>
            </span>
          </template>
          <template v-else>
            <div class="sl-vig-glass sl-vig-glass-violet w-49 text-left" style="--r: 3deg">
              <div class="flex items-center gap-2">
                <HLText html-tag="span" size="md" weight="semibold" class="w-5.5 h-5.5 rounded-full grid place-items-center bg-accent-purple-light text-accent-purple shrink-0">AK</HLText>
                <HLText html-tag="span" size="md" weight="medium" class="text-gray-700">Auto Kritik</HLText>
                <span class="ml-auto w-2 h-2 rounded-full bg-positive" />
              </div>
              <div class="grid gap-1.75 mt-2.5">
                <span class="h-1.5 w-[92%] rounded-full bg-gray-200" />
                <span class="h-1.5 w-[70%] rounded-full bg-gray-200" />
              </div>
            </div>
            <span class="sl-stk" style="left: 28%; top: 12%; --r: -4deg">
              <HLText html-tag="span" size="md" weight="semibold" class="w-6 h-6 rounded-full grid place-items-center bg-accent-purple-light text-accent-purple">AK</HLText>
              <HLText html-tag="span" size="md" weight="semibold" class="text-gray-900">12.4K followers</HLText>
            </span>
          </template>
        </div>
        <HLText html-tag="h3" size="lg" weight="semibold" class="text-gray-900">{{ pic.title }}</HLText>
        <HLText size="md" class="text-gray-600 mt-0.5!">{{ pic.line }}</HLText>
      </div>
    </div>
    </template>
  </div>

  <!-- Cards, as B2 from the 7 Oct follow-up (Ayushi's sketch, "muted"): the search on a glass
       panel over the first three result cards of a real search, stacked at equal height, each
       heading sharp and its body softened and muted, with the glass centred on the gap between
       the first two. -->
  <div v-else-if="cards" class="pt-12 pb-10">
    <div class="relative w-full max-w-210 mx-auto">
      <!-- Decorative: the real Overview, How people feel and Best time to post cards for one
           search, never focusable or clickable. -->
      <div class="sl-starter-cards" inert aria-hidden="true">
        <TopicSections :result="sample" quick />
      </div>
    <div class="sl-starter-glass absolute z-10 left-1/2 top-[250px] w-[calc(100%-80px)] -translate-x-1/2 -translate-y-1/2 flex flex-col gap-3.5 px-10 pt-9 pb-7.5 rounded-xl">
      <div class="text-center">
        <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">What do you want to keep an eye on?</HLText>
        <HLText size="lg" class="text-gray-600 mt-1.5!">Search any brand, topic or hashtag across six platforms.</HLText>
      </div>
      <div class="flex gap-2 mt-2">
        <div class="flex-1">
          <HLInput
            id="insights-search" v-model="query" size="lg" clearable :maxlength="100"
            :disabled="pending" :prefix-icon="SearchMdIcon" autofocus
            placeholder="Search a brand, topic or hashtag"
            @keydown.enter="go()"
          />
        </div>
        <HLButton variant="primary" color="blue" size="lg" :disabled="!query.trim() || pending" :loading="pending" @click="go()">
          {{ pending ? 'Searching' : 'Search' }}
        </HLButton>
      </div>
      <HLText v-if="pending" size="md" class="text-gray-500 text-center" role="status">
        Checking Facebook, Instagram, LinkedIn, X, Reddit and YouTube
      </HLText>
      <!-- A blue text link, not a button, so it never competes with Search. -->
      <HLText v-else size="md" class="text-gray-600 text-center mt-1!">
        Want to follow it over time?
        <HLButton id="search-starter-create-topic" class="sl-inline-link" variant="text" color="blue" size="xs" @click="state.modal = 'topic'">Create a topic</HLButton>
      </HLText>
    </div>
    </div>
  </div>

  <div v-else class="flex flex-col gap-8 pt-6 pb-10">
    <div class="w-full max-w-170 mx-auto flex flex-col gap-3.5">
      <div class="text-center">
        <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">What do you want to keep an eye on?</HLText>
        <HLText size="lg" class="text-gray-600 mt-1.5!">Search any brand, topic or hashtag. Save it as a topic and we'll keep listening.</HLText>
      </div>
      <div class="flex gap-2">
        <div class="flex-1">
          <HLInput
            id="insights-search" v-model="query" size="lg" clearable :maxlength="100"
            :disabled="pending" :prefix-icon="SearchMdIcon" autofocus
            placeholder="Search a brand, topic or hashtag"
            @keydown.enter="go()"
          />
        </div>
        <HLButton variant="primary" color="blue" size="lg" :disabled="!query.trim() || pending" :loading="pending" @click="go()">
          {{ pending ? 'Searching' : 'Search' }}
        </HLButton>
      </div>
      <HLText v-if="pending" size="md" class="text-gray-500 text-center" role="status">
        Checking Facebook, Instagram, LinkedIn, X, Reddit and YouTube
      </HLText>
    </div>

    <!-- Day zero offers both paths (Shivam, 5 Oct): a one-time search above, or a topic that
         keeps listening. This took the place of "Pick your industry". -->
    <!-- 7 Oct (Sujith): a blue text link, not a button, so it never competes with Search. -->
    <div class="flex justify-center text-center">
      <HLText size="md" class="text-gray-600">
        Want to keep track of something over time?
        <HLButton id="search-starter-create-topic" class="sl-inline-link" variant="text" color="blue" size="xs" @click="state.modal = 'topic'">Create a topic</HLButton>
      </HLText>
    </div>

    <div class="flex flex-col gap-8 sl-starter-preview">
      <section v-for="s in sections" :id="`search-starter-${s.key}`" :key="s.key" class="flex flex-col gap-3">
        <div class="flex items-baseline justify-between gap-3">
          <HLText html-tag="h3" size="lg" weight="semibold" class="text-gray-900">{{ s.title }}</HLText>
          <HLText v-if="s.cards.length" html-tag="span" size="md" class="text-gray-500">Mentions · {{ range.label }}</HLText>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <!-- A whole card is one search, so it is one button. -->
          <button
            v-for="(c, n) in s.cards" :key="c.term" type="button" :style="{ '--i': n + (s.key === 'rising' ? 1 : 5) }" :disabled="pending"
            :aria-label="c.empty ? `Search ${c.term}` : `Search ${c.term}: ${fmtNum(c.mentions)} mentions, ${c.delta < 0 ? 'down' : 'up'} ${Math.abs(c.delta)}%`"
            class="sl-enter sl-lift group text-left bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 hover:border-gray-300 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            @click="go(c.term)"
          >
            <HLText html-tag="span" size="lg" weight="semibold" class="text-gray-900 truncate group-hover:text-primary-600 transition-colors">{{ c.term }}</HLText>
            <HLText v-if="c.empty" html-tag="span" size="md" class="text-gray-500">Not enough posts yet. Search to check again.</HLText>
            <span v-else class="flex items-baseline gap-2">
              <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900 tabular-nums"><CountUp :value="c.mentions" /></HLText>
              <HLText html-tag="span" size="md" weight="semibold" :class="['inline-flex items-center gap-0.5 tabular-nums', c.delta < 0 ? 'text-negative-strong' : 'text-positive-strong']">
                <component :is="c.delta < 0 ? ArrowDownIcon : ArrowUpIcon" class="w-3.5 h-3.5 self-center" aria-hidden="true" />{{ Math.abs(c.delta) }}%
              </HLText>
            </span>
            <HLText v-if="!c.empty" html-tag="span" size="md" class="text-gray-600">
              {{ c.feel }}<template v-if="c.where"><span class="text-gray-400" aria-hidden="true"> · </span>{{ c.where }}</template>
            </HLText>
          </button>
          <HLButton v-if="s.add" id="search-starter-add-competitor" class="sl-dashed sl-starter-add" variant="secondary" size="lg" @click="state.modal = 'competitor'">
            <template #iconLeft><PlusIcon /></template>
            Add a competitor
          </HLButton>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* A text link inside a sentence: HLButton's text variant without its own height or padding,
   so it sits on the line like a word. */
:deep(.sl-inline-link.hr-button) { height: auto !important; padding: 0 !important; vertical-align: baseline; font-size: inherit !important; }
/* Pick 5: the Overview landing's hero and previews (ZeroState, 19b + N1). Since F3 (7 Oct) both
   heroes are 440px with the stage at 80%, and this one starts 24px under the tabs like Overview's.
   A blue wash left, a violet wash right, a dot grid fading in from the edges. HighRise defines
   the violet steps but the app has no tokens for them, so they are read straight from HighRise. */
.sl-starter { padding-bottom: 40px; container-type: inline-size; }
.sl-hero-box {
  height: 440px;
  background:
    radial-gradient(34% 62% at 3% 42%, color-mix(in srgb, var(--color-primary-200) 55%, transparent), transparent 72%),
    radial-gradient(34% 62% at 97% 42%, color-mix(in srgb, var(--violet-200) 75%, transparent), transparent 72%),
    radial-gradient(50% 40% at 50% 104%, var(--color-primary-50), transparent 70%),
    var(--color-white);
}
.sl-hero-box::before {
  content: ""; position: absolute; inset: 0; z-index: -1;
  background-image: radial-gradient(color-mix(in srgb, var(--color-primary-300) 32%, transparent) 1px, transparent 1.3px);
  background-size: 20px 20px;
  -webkit-mask-image: radial-gradient(ellipse 52% 62% at 50% 50%, transparent 48%, black 100%);
  mask-image: radial-gradient(ellipse 52% 62% at 50% 50%, transparent 48%, black 100%);
}
/* A fixed stage centred on the copy, so the two stickers keep their distance from the words. */
.sl-hero-stage { position: absolute; left: 50%; top: 50%; width: 1120px; height: 540px; transform: translate(-50%, -50%) scale(.8); transform-origin: 50% 50%; }
@container (max-width: 780px) { .sl-hero-stage { display: none; } }
.sl-hero-copy::before {
  content: ""; position: absolute; inset: -40px -90px; z-index: -1;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--color-white) 96%, transparent) 55%, transparent);
}
.sl-violet-line { stroke: var(--violet-300); }
/* The landing's sticker: white, die-cut, a tinted icon chip, tilted to its side. */
.sl-stk {
  position: absolute; display: inline-flex; align-items: center; gap: 8px; padding: 5px 12px 5px 5px; white-space: nowrap;
  border-radius: 9999px; background: var(--color-white); border: 3px solid var(--color-white); box-shadow: var(--shadow-lg);
  transform: translate(-50%, -50%) rotate(var(--r)); transition: transform .3s cubic-bezier(.2, .8, .2, 1);
}
.sl-hero-box:hover .sl-stk { transform: translate(-50%, -50%) rotate(calc(var(--r) * -0.5)); }
/* The previews: dotted rules, a faint halo, one glass fragment and one sticker each. Nothing
   reacts to the pointer here. */
.sl-dot-rule { border-top: 2px dotted var(--color-primary-100); }
@media (min-width: 1024px) { .sl-vig-col + .sl-vig-col { border-left: 2px dotted var(--color-gray-200); } }
.sl-vig-halo { position: absolute; inset: 14px 40px; border-radius: 50%; }
.sl-vig-halo-blue { background: radial-gradient(closest-side, color-mix(in srgb, var(--color-primary-100) 42%, transparent), transparent); }
.sl-vig-halo-violet { background: radial-gradient(closest-side, color-mix(in srgb, var(--violet-100) 60%, transparent), transparent); }
.sl-vig-halo-mix { background: radial-gradient(closest-side, color-mix(in srgb, color-mix(in srgb, var(--color-primary-100), var(--violet-100)) 45%, transparent), transparent); }
.sl-vig-glass {
  position: absolute; left: 50%; top: 50%; padding: 12px 14px; border-radius: 16px; border: 1px solid transparent;
  transform: translate(-50%, -50%) rotate(var(--r));
  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--color-white) 82%, transparent), color-mix(in srgb, var(--color-white) 60%, transparent)) padding-box,
    linear-gradient(140deg, var(--color-white), color-mix(in srgb, var(--color-primary-200) 90%, transparent) 55%, var(--color-white)) border-box;
  box-shadow: 0 12px 24px -14px color-mix(in srgb, var(--color-gray-900) 18%, transparent), var(--shadow-xs);
}
.sl-vig-glass-violet {
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--color-white) 82%, transparent), color-mix(in srgb, var(--color-white) 60%, transparent)) padding-box,
    linear-gradient(140deg, var(--color-white), color-mix(in srgb, var(--violet-200) 80%, transparent) 55%, var(--color-white)) border-box;
}
/* Basic: the same frame and copy, with the washes and dot field taken away. */
.sl-starter-basic .sl-hero-box { background: none; }
.sl-starter-basic .sl-hero-box::before { display: none; }
/* Cards (B2). The glass: translucent white with a hairline edge that catches a little blue.
   HighRise has no shadow above lg, so lg carries one deeper layer to lift the card off the stack. */
.sl-starter-glass {
  backdrop-filter: blur(14px);
  border: 1px solid transparent;
  background:
    linear-gradient(color-mix(in srgb, var(--color-white) 88%, transparent), color-mix(in srgb, var(--color-white) 88%, transparent)) padding-box,
    linear-gradient(160deg, var(--color-white), color-mix(in srgb, var(--color-primary-100) 90%, transparent) 45%, var(--color-gray-200)) border-box;
  box-shadow: var(--shadow-lg), 0 40px 64px -32px color-mix(in srgb, var(--color-gray-900) 26%, transparent);
}
/* The stack: three equal cards, 20px apart, so the glass sits centred on the first gap. */
.sl-starter-cards { pointer-events: none; user-select: none; }
.sl-starter-cards > :deep(div) { gap: 20px; }
.sl-starter-cards :deep([data-sec]) { position: relative; height: 240px; }
.sl-starter-cards :deep([data-sec]:not([data-sec="snapshot"]):not([data-sec="sentiment"]):not([data-sec="trends"])) { display: none; }
/* Each card keeps its eyebrow and heading sharp; the body is softened and its colour pulled
   back to about a third, under a light veil. */
.sl-starter-cards :deep([data-sec] > div > :first-child) { filter: saturate(.4); }
.sl-starter-cards :deep([data-sec] > div > :nth-child(n+3)) { filter: blur(1.8px) saturate(.35); }
.sl-starter-cards :deep([data-sec])::after {
  content: ""; position: absolute; left: 0; right: 0; top: 90px; bottom: 0; pointer-events: none;
  background: color-mix(in srgb, var(--color-white) 22%, transparent);
}
/* The third card fades out over its lower half. */
.sl-starter-cards :deep([data-sec="trends"]) { mask-image: linear-gradient(#000 35%, transparent); }
@media (prefers-reduced-motion: reduce) {
  .sl-stk { transition: none; }
  .sl-hero-box:hover .sl-stk { transform: translate(-50%, -50%) rotate(var(--r)); }
}
</style>
