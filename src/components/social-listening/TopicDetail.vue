<script setup>
// One topic's detail, for a saved topic and a fresh search alike.
//
// The frame around it (back bar, vertical tabs, the title-only top bar) belongs to the page,
// because it replaces shell chrome. This component owns what scrolls: the eight sections,
// and which of them is being read. The vertical tabs read `state.detailSection` and ask for
// a jump through `state.detailJump`; this is the only place either is resolved.
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { QUICK_SEARCH_SECTIONS, quickSearchResult, TOPIC_SHOWN_LIMIT } from '../../data/socialListening.js'
import { Headphones01Icon, XCloseIcon } from '@gohighlevel/ghl-icons/24/outline'
import { useSocialListening } from '../../composables/useSocialListening.js'
import TopicSections from './TopicSections.vue'
import ListeningLoader from './ListeningLoader.vue'

const { state, account, search, ensureSearch, detail, isSavedTerm, saveSearchAsTopic, closeDetail, simple } = useSocialListening()
const bannerClosed = ref(false)
const savedCount = computed(() => (state.topicsByAccount[state.accountId] || []).length)
function goOverview() { closeDetail(); state.tab = 'overview' }

// A search keeps its own result (it is what was paid for); a topic derives one on the spot.
const result = computed(() => {
  const d = detail.value
  if (!d) return null
  if (d.kind === 'search') return search.value.result
  return quickSearchResult(d.term, state.range, account.value.space)
})
// The empty state's copy. "Try another search" is wrong for a saved topic, which nobody
// searched for just now and which keeps listening whatever this window shows.
const emptyCopy = computed(() => {
  const phrase = result.value?.range?.phrase || ''
  return detail.value?.kind === 'topic'
    ? { body: `Nothing on the six platforms mentions it ${phrase}. We'll keep listening and fill this in when it does.`, action: 'Back to topics' }
    : { body: `We checked all six platforms and found nothing ${phrase}.`, action: 'Try another search' }
})
// Locked sections open in place the moment the search is saved.
const quick = computed(() => detail.value?.kind === 'search' && !isSavedTerm(detail.value.term))

// The range lives in the back bar now. A search result is stored, so re-derive it rather
// than leave figures that disagree with the control above them.
watch(() => state.range, () => {
  const sc = ensureSearch()
  if (sc.result && !sc.result.empty) sc.result = quickSearchResult(sc.result.term, state.range, account.value.space)
})

// A search and a topic both open on the listening loader for 1.8s (S1, 7 Oct loader review,
// the reference's timing). state.detailLoading mirrors it so the vertical tabs can show their
// skeleton for the same beat.
const loading = ref(false)
let timer = null
function beat() {
  clearTimeout(timer)
  loading.value = true
  state.detailLoading = true
  timer = setTimeout(() => { loading.value = false; state.detailLoading = false; nextTick(attach) }, 1800)
}

// ---- scroll position <-> vertical tabs ----
const root = ref(null)
let scroller = null
let ticking = false

// Canvas puts overflow-auto on its wrapper; walk up rather than hardcode it.
function findScroller(el) {
  let n = el?.parentElement
  while (n && n !== document.body) {
    const o = getComputedStyle(n).overflowY
    if (o === 'auto' || o === 'scroll') return n
    n = n.parentElement
  }
  return null
}
function offsetOf(el) {
  return el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop
}
function sync() {
  ticking = false
  if (!scroller || !root.value) return
  const line = scroller.scrollTop + 120
  let id = QUICK_SEARCH_SECTIONS[0].id
  QUICK_SEARCH_SECTIONS.forEach((s) => {
    const el = root.value.querySelector('#sec-' + s.id)
    if (el && offsetOf(el) <= line) id = s.id
  })
  // The last section is often too short to reach the read line.
  if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4) {
    id = QUICK_SEARCH_SECTIONS[QUICK_SEARCH_SECTIONS.length - 1].id
  }
  state.detailSection = id
}
function onScroll() {
  if (!ticking) { ticking = true; requestAnimationFrame(sync) }
}
function attach() {
  detach()
  scroller = findScroller(root.value)
  if (scroller) scroller.addEventListener('scroll', onScroll, { passive: true })
  sync()
}
function detach() {
  if (scroller) scroller.removeEventListener('scroll', onScroll)
  scroller = null
}
function jump(id) {
  const el = root.value?.querySelector('#sec-' + id)
  if (!el || !scroller) return
  const smooth = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  scroller.scrollTo({ top: Math.max(0, offsetOf(el) - 16), behavior: smooth })
  state.detailSection = id
}
watch(() => state.detailJump, (id) => {
  if (!id) return
  state.detailJump = null
  jump(id)
})

function reset() {
  state.detailSection = QUICK_SEARCH_SECTIONS[0].id
  nextTick(() => {
    attach()
    scroller?.scrollTo({ top: 0, behavior: 'auto' })
  })
}
watch(() => detail.value?.title, () => { beat(); reset() })
onMounted(() => { beat(); reset() })
onBeforeUnmount(() => { clearTimeout(timer); state.detailLoading = false; detach() })
</script>

<template>
  <!-- max-w-360 is 1440px on the spacing scale: the cap the detail view has always had. -->
  <div ref="root" class="max-w-360 mx-auto w-full">
    <!-- WBR 12 Oct (2A): say what listening did, in place, the moment it happens. -->
    <div
      v-if="simple && detail && detail.kind === 'search' && isSavedTerm(detail.term) && !bannerClosed"
      id="sl-listening-banner" class="mb-5 flex items-center gap-3.5 rounded-xl border border-primary-200 bg-primary-25 px-4.5 py-3.5"
    >
      <span class="w-9 h-9 rounded-full bg-white border border-primary-200 grid place-items-center shrink-0"><Headphones01Icon class="w-4.5 h-4.5 text-primary-600" /></span>
      <div class="flex-1 min-w-0">
        <HLText size="lg" weight="semibold" class="text-gray-900">You’re now listening to “{{ detail.term }}”</HLText>
        <HLText size="md" class="text-gray-600">Every section stays open. We refresh it every 6 hours and keep it on your Overview. {{ savedCount }} of {{ TOPIC_SHOWN_LIMIT }} topics.</HLText>
      </div>
      <HLButton variant="secondary" size="xs" @click="goOverview">Go to Overview</HLButton>
      <HLButton variant="ghost" size="xs" aria-label="Dismiss" @click="bannerClosed = true"><template #iconLeft><XCloseIcon /></template></HLButton>
    </div>
    <!-- A topic saved from a search can stop having results. Say so rather than draw zeroes.
         The way out depends on how you got here: a search offers another search, a saved
         topic is still being listened to and goes back to the list. -->
    <div v-if="!loading && !detail?.pending && result && result.empty" class="bg-white border border-gray-200 rounded-xl px-6 py-12 flex justify-center sl-empty">
      <!-- md gives 13px body copy; .sl-empty lifts its 14px title to the 16px card title.
           The action goes in the slot so it can stay an xs button. -->
      <HLEmpty
        id="sl-detail-empty" size="md" icon="default"
        :title="`No mentions of “${result.term}”`"
        :description="emptyCopy.body"
      >
        <template #actions>
          <HLButton variant="secondary" size="xs" @click="closeDetail">{{ emptyCopy.action }}</HLButton>
        </template>
      </HLEmpty>
    </div>

    <!-- Fills the canvas like the reference's card: the loader centres in what is left of the
         window below the shell's two bars. -->
    <div v-else-if="loading || detail?.pending" class="flex flex-col min-h-[calc(100vh-180px)]" aria-busy="true">
      <ListeningLoader :query="detail?.term || ''" />
    </div>

    <TopicSections v-else-if="result" :key="result.term" :result="result" :quick="quick" @save="saveSearchAsTopic" />
  </div>
</template>
