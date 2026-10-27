<script setup>
// 21 Oct (picks 18 V1 + 19 V1): the Trending everywhere pop-up's body. Every source sits in one
// scrolling column and the side list follows the scroll (scroll-spy), like the insights pop-up;
// clicking a source scrolls to it. Each source shows its top 12 as small cards, three per row:
// HLCard with a gray-200 hairline, no shadow, no chevrons. Hover lifts the card and swaps the
// change for "+ Listen".
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { Headphones01Icon, Briefcase01Icon, InfoCircleIcon } from '@gohighlevel/ghl-icons/24/outline'
import { TOPIC_SHOWN_LIMIT } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'
import SectionChip from './SectionChip.vue'
import { SOURCE_ICONS, shortNum } from './trendsData.js'
import IndustryTopicsPage from './IndustryTopicsPage.vue'
import { topicShares, industryTopics } from './industryTopics.js'
import { trendChange } from '../../data/socialListening.js'
// 21 Oct (a19 V2 Figure first, Ayushi's pick over V1 Trend line): the volume leads as a figure.

// 26 Oct (Trends tab, layout A): `industry` puts the industry's topics first, as one more section.
const props = defineProps({ sources: { type: Array, required: true }, industry: Boolean, more: Boolean })
// 27 Oct (developers): on the Trends tab each source shows 12, and Show more opens the rest in
// place, up to the 50 the API returns. The pop-up keeps its 12.
const STEP = 12
const shownBy = ref({})
const shownOf = (s) => (props.more ? shownBy.value[s.key] || STEP : s.rows.length)
// 27 Oct (Ayushi): Show more opens the whole list at once (no 24, 36, 48 in between).
function seeMore(s) { shownBy.value = { ...shownBy.value, [s.key]: s.rows.length } }
// 27 Oct (Ayushi, option C): on the right of each source heading, "12 of 50 · Show more" as a text
// link; at 50 it reads "Show less" and folds back to 12.
function setShown(s, n) { shownBy.value = { ...shownBy.value, [s.key]: Math.min(s.rows.length, n) } }
const allShown = (s) => shownOf(s) >= s.rows.length
const { state, range, peek, listenTo, isSavedTerm, toast, removeTopicQuietly, account, spaceData, nicheWindowVolume } = useSocialListening()
const industryCount = computed(() => industryTopics(topicShares(spaceData.value.trends.map((t) => ({ label: t.label, value: t.value, change: trendChange(t.label, t.value) })), account.value.space), account.value.space, nicheWindowVolume.value).length)

const TREND_NOUN = { google: 'searches', pinterest: 'pins', wikipedia: 'pages', 'yt-videos': 'videos', 'yt-channels': 'channels', 'yt-keywords': 'searches' }
const SUB = {
  google: 'What people search for on Google', pinterest: 'What people save on Pinterest', wikipedia: 'What people read on Wikipedia',
  'yt-videos': 'What people watch on YouTube', 'yt-keywords': 'What people search for on YouTube', 'yt-channels': 'The channels people watch on YouTube',
}
const ABOUT = {
  google: 'The fastest-rising searches on Google in your country this week, ranked by search volume.',
  pinterest: 'The pins people are saving most this week, ranked by saves.',
  wikipedia: 'The Wikipedia pages read most this week, ranked by page views.',
  'yt-videos': 'The videos trending on YouTube this week, ranked by views.',
  'yt-keywords': 'What people search for most on YouTube this week, ranked by searches.',
  'yt-channels': 'The channels gaining the most views on YouTube this week.',
}
const keys = computed(() => [...(props.industry ? ['industry'] : []), ...props.sources.map((s) => s.key)])

// ---- scroll position <-> the side list (same rule as the insights pop-up) ----
const scroller = ref(null)
const navEl = ref(null)
const active = ref(keys.value.includes(state.trendsPeekSource) ? state.trendsPeekSource : keys.value[0])
let lockUntil = 0
const secEl = (k) => scroller.value && scroller.value.querySelector(`[data-src="${k}"]`)
const offsetOf = (el) => el.getBoundingClientRect().top - scroller.value.getBoundingClientRect().top + scroller.value.scrollTop
function onScroll() {
  const sc = scroller.value
  if (!sc || Date.now() < lockUntil) return
  let id = keys.value[0]
  if (sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 4) id = keys.value[keys.value.length - 1]
  else for (const k of keys.value) { const el = secEl(k); if (el && offsetOf(el) <= sc.scrollTop + 120) id = k }
  active.value = id
}
function goTo(k, smooth = true) {
  const el = secEl(k)
  active.value = k
  if (!el) return
  const reduce = !smooth || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  lockUntil = Date.now() + (reduce ? 0 : 700)
  scroller.value.scrollTo({ top: Math.max(0, offsetOf(el) - 20), behavior: reduce ? 'auto' : 'smooth' })
}
// The source you were reading is remembered, so Back from a trend's insights lands on it again.
watch(active, (k) => {
  state.trendsPeekSource = k
  nextTick(() => navEl.value?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }))
})
onMounted(() => { if (active.value !== keys.value[0]) nextTick(() => goTo(active.value, false)) })
// Below 1100px the source list goes above the cards (HLTabs placement top).
const narrowMq = window.matchMedia('(max-width: 1100px)')
const narrow = ref(narrowMq.matches)
const onNarrow = (e) => { narrow.value = e.matches }
narrowMq.addEventListener('change', onNarrow)
onBeforeUnmount(() => narrowMq.removeEventListener('change', onNarrow))

const atLimit = computed(() => (state.topicsByAccount[state.accountId] || []).length >= TOPIC_SHOWN_LIMIT)
function listen(t) {
  listenTo(t)
  toast(`You’re now listening to “${t}”`, 'It’s in Your topics. We check it every 6 hours.', 'positive', [{ label: 'Undo', run: () => removeTopicQuietly(t) }])
}
</script>

<template>
  <div class="sl-modal-body">
    <!-- 21 Oct (HighRise pass): the source list is HLTabs placement left, as in the insights pop-up. -->
    <nav ref="navEl" class="sl-modal-nav" aria-label="Sources">
      <HLTabs id="sl-trends-tabs" :value="active" type="line" no-border :placement="narrow ? 'top' : 'left'" :max-visible-tabs="keys.length" @update:value="goTo">
        <HLTab v-if="industry" key="industry" name="industry">
          <span class="sl-modal-tab"><Briefcase01Icon class="w-4 h-4 shrink-0" aria-hidden="true" />Your industry</span>
        </HLTab>
        <HLTab v-for="s in sources" :key="s.key" :name="s.key">
          <span class="sl-modal-tab"><component :is="SOURCE_ICONS[s.platform]" class="w-4 h-4 shrink-0" aria-hidden="true" />{{ s.short }}</span>
        </HLTab>
      </HLTabs>
    </nav>

    <div ref="scroller" class="sl-modal-content" @scroll.passive="onScroll">
      <section v-if="industry" data-src="industry">
        <div class="flex items-center gap-2 h-9">
          <SectionChip :icon="Briefcase01Icon" inline />
          <HLText html-tag="h3" size="2xl" weight="semibold" class="text-gray-900">Your industry · {{ industryCount }} topics</HLText>
        </div>
        <HLText size="md" class="text-gray-600 mt-1!">What people in {{ account.space }} post about, {{ range.phrase }}</HLText>
        <IndustryTopicsPage bare />
      </section>
      <section v-for="(s, si) in sources" :key="s.key" :data-src="s.key" :class="(si || industry) && 'mt-8'">
        <div class="flex items-center gap-2 h-9">
          <SectionChip :icon="SOURCE_ICONS[s.platform]" inline />
          <HLText html-tag="h3" size="2xl" weight="semibold" class="text-gray-900">{{ s.short }}<template v-if="s.rows.length && !more"> · Top {{ s.rows.length }} {{ TREND_NOUN[s.key] }}</template></HLText>
          <!-- 27 Oct (developers): the source header carries what that platform's list is. -->
          <HLTooltip v-if="more" trigger="hover" placement="right">
            <template #trigger>
              <button type="button" :id="`trends-info-${s.key}`" class="sl-src-info" :aria-label="`About ${s.short} trends`"><InfoCircleIcon class="w-4 h-4" /></button>
            </template>
            <span class="block max-w-[280px]">{{ ABOUT[s.key] }}</span>
          </HLTooltip>
          <template v-if="more && s.rows.length > STEP">
            <span class="flex-1" />
            <HLText html-tag="span" size="md" class="text-gray-500 tabular-nums">{{ shownOf(s) }} of {{ s.rows.length }}</HLText>
            <HLButton v-if="!allShown(s)" :id="`trends-more-${s.key}`" variant="text" color="blue" size="xs" @click="seeMore(s)">Show more</HLButton>
            <HLButton v-else :id="`trends-less-${s.key}`" variant="text" color="blue" size="xs" @click="setShown(s, STEP)">Show less</HLButton>
          </template>
        </div>
        <HLText v-if="s.rows.length" size="md" class="text-gray-600 mt-1!">{{ SUB[s.key] }}</HLText>
        <!-- out9 q05: an empty feed keeps its place in the list and says so in one line. -->
        <HLText v-else :id="`trends-src-empty-${s.key}`" size="md" class="text-gray-600 mt-1!">{{ s.short }} trends didn’t come through this time. They’ll be back at the next update.</HLText>

        <div v-if="s.rows.length" class="grid grid-cols-3 gap-4 mt-4">
          <HLCard
            v-for="(r, i) in s.rows.slice(0, shownOf(s))" :id="`trend-card-${s.key}-${i}`" :key="r.term"
            class="sl-tc" role="button" tabindex="0" :aria-label="`See what people say about ${r.term}`"
            @click="peek(r.term)" @keydown.enter="peek(r.term)"
          >
            <!-- 21 Oct (pick 19): less top and bottom padding than the sides (12 by default; 10 and 8 in the guide).
                 a19 V2 Figure first (Ayushi's pick): rank + name, then the volume as a 16 semibold
                 figure with its unit inline, like "78,911 posts in the last 7 days" on Industry trends. -->
            <div class="px-4" :style="{ paddingBlock: `${state.trendCardPad || 12}px` }">
              <!-- out15 F08: rank 20 (fits "12") + gap 4 = 24, so the figure row below starts on the term's left edge (pl-6). -->
              <div class="flex items-center gap-1">
                <HLText html-tag="span" size="md" class="text-gray-500 tabular-nums shrink-0 w-5">{{ i + 1 }}</HLText>
                <HLText html-tag="span" size="md" class="text-gray-600 truncate min-w-0 flex-1 sl-tc-name">{{ r.term }}</HLText>
              </div>
              <div class="flex items-baseline gap-2 mt-1 pl-6 min-h-6">
                <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900 tabular-nums">{{ shortNum(r.value) }}</HLText>
                <HLText html-tag="span" size="md" class="text-gray-500 flex-1 min-w-0 truncate">{{ r.unit }}</HLText>
                <span class="sl-tc-rest self-center">
                  <HLTag v-if="r.isNew" size="md" color="gray" round :interactive="false">New</HLTag>
                  <HLText v-else html-tag="span" size="md" weight="semibold" class="text-positive-strong tabular-nums">↑ {{ r.change }}%</HLText>
                </span>
                <span class="sl-tc-hover self-center">
                  <HLText v-if="isSavedTerm(r.term)" html-tag="span" size="md" class="inline-flex items-center gap-1 text-gray-500"><Headphones01Icon class="w-4 h-4" />Listening</HLText>
                  <HLButton v-else variant="text" color="blue" size="xs" :disabled="atLimit" :aria-label="`Listen to ${r.term}`" @click.stop="listen(r.term)" @keydown.enter.stop>
                    Listen
                  </HLButton>
                </span>
              </div>
            </div>
          </HLCard>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.sl-modal-body { flex: 1; min-height: 0; display: grid; grid-template-columns: 220px minmax(0, 1fr); }
.sl-modal-nav { padding: 16px 0 16px 16px; background: var(--base-white); border-right: 1px solid var(--gray-200); overflow-y: auto; }
/* The tab list fills the column, so HLTabs' active bar runs on the column's own rule. */
@media (min-width: 1101px) { .sl-modal-nav :deep(.hr-tabs), .sl-modal-nav :deep(.hr-tabs-nav), .sl-modal-nav :deep(.hr-tabs-nav-scroll-content) { width: 100%; } }
.sl-modal-tab { display: inline-flex; align-items: center; gap: 8px; }
.sl-modal-content { overflow-y: auto; padding: 24px 32px; }
.sl-modal-content [data-src] { scroll-margin-top: 20px; }
/* HLCard ships shadow-md; Sujit asked for a thin gray-200 hairline, so the resting shadow is off
   and the card lifts to gray-300 + shadow-xs on hover, like every card. */
.sl-tc { box-shadow: none !important; cursor: pointer; transition: border-color .2s, box-shadow .2s; min-width: 0; }
.sl-tc:hover { border-color: var(--gray-300) !important; box-shadow: var(--shadow-xs) !important; }
.sl-tc:hover .sl-tc-name { text-decoration: underline; text-underline-offset: 3px; }
.sl-tc:focus-visible { outline: 2px solid var(--primary-600); outline-offset: 2px; }
.sl-tc-rest { display: inline-flex; align-items: center; }
.sl-src-info { display: inline-grid; place-items: center; color: var(--gray-500); border-radius: 4px; cursor: pointer; }
.sl-src-info:hover { color: var(--gray-900); }
.sl-src-info:focus-visible { outline: 2px solid var(--primary-600); outline-offset: 1px; }
.sl-tc-hover { display: none; align-items: center; }
.sl-tc:hover .sl-tc-rest, .sl-tc:focus-within .sl-tc-rest { display: none; }
.sl-tc:hover .sl-tc-hover, .sl-tc:focus-within .sl-tc-hover { display: inline-flex; }
@media (prefers-reduced-motion: reduce) { .sl-tc { transition: none; } }
@media (max-width: 1100px) {
  .sl-modal-body { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); }
  .sl-modal-nav { min-width: 0; padding: 0 16px; border-right: 0; border-bottom: 1px solid var(--gray-200); overflow-x: auto; overflow-y: hidden; }
}
</style>
