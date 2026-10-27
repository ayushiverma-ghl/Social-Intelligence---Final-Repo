<script setup>
// The insights modal (14 Oct, 4C). A saved topic, a search and a trend all open here, so
// nothing moves you off the page (Khoi and Sujit, WBR follow-up). Centred, with the sections
// listed down the left.
//
// 15 Oct (D): every section in one scrolling column, as on the full topic page. Scrolling
// moves the highlight down the list and clicking a section scrolls to it. Each item wears its
// card's icon, and the foot of the list says where you are and what comes next.
//
// Size: 80% of the window, capped at 1200 × 920 so it doesn't balloon on a large monitor, and
// never closer than 32px to any edge, so the mask is always there to click away.
//
// 21 Oct (HighRise pass): the shell is HLModal (header slot, close, mask, focus trap) and the
// section list is HLTabs placement left, so nothing here is hand-built. HLModal teleports into HLContentWrap.
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import {
  Headphones01Icon, SearchMdIcon, MessageChatCircleIcon, FilterLinesIcon, ChevronDownIcon, BellRinging01Icon, FaceSmileIcon, ActivityIcon, TrendUp01Icon,
  Announcement01Icon, PieChart01Icon, MessageTextSquare01Icon, Users01Icon, ArrowLeftIcon, ArrowUpIcon, CalendarIcon,
} from '@gohighlevel/ghl-icons/24/outline'
import { SIMPLE_SECTION_ORDER, SECTION_NAMES, quickSearchResult, TOPIC_SHOWN_LIMIT, industryRisers, RANGES } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'
import TopicSections from './TopicSections.vue'
import OrbitLoader from './OrbitLoader.vue'
import { NETWORK_ICONS } from './networkIcons.js'
import SectionChip from './SectionChip.vue'
import TrendsScroll from './TrendsScroll.vue'
import { trendSources } from './trendsData.js'
import Canvas from '../../shell/Canvas.vue'

const { state, account, spaceData, range, isSavedTerm, listenTo, removeTopic, removeTopicQuietly, toast, peek } = useSocialListening()
// 23 Oct (Sujith, Shivam): a search or a topic opens as a full page, one level in; the same
// header, loader, empty state and sections as the 21 Oct pop-up, in the shell's level-2 frame.
// The pop-up stays for Trending now only.
const props = defineProps({ page: Boolean })
// 21 Oct CTA audit: the same "Trending in your industry" chips as the Overview, change and all.
const suggestions = computed(() => industryRisers(account.value.space, state.range).slice(0, 3))

const topic = computed(() => (state.topicsByAccount[state.accountId] || []).find((t) => t.title === state.peekTopic) || null)
const term = computed(() => (topic.value ? topic.value.term || topic.value.title : state.peekSearch))
// f04: the title keeps its quotes once you're listening, so it doesn't change style on save.
const title = computed(() => `“${topic.value ? topic.value.title : state.peekSearch}”`)
const saved = computed(() => !!term.value && isSavedTerm(term.value))
// 27 Oct (developers): the results page has its own range (7, 15 or 30 days; the Overview stays on
// 7). Changing it fetches more data, so the page keeps showing the old range, the Listening tag
// reads Refreshing and the range is locked until the new data lands.
const pageRange = ref('last-7')
const shownRange = ref('last-7')
const refreshing = ref(false)
let refreshTimer = null
const rangeOf = (k) => RANGES.find((x) => x.key === k) || RANGES[0]
function setRange(k) {
  if (k === pageRange.value || refreshing.value) return
  pageRange.value = k
  refreshing.value = true
  clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => { shownRange.value = k; refreshing.value = false }, 1800)
}
const rangeOptions = computed(() => RANGES.map((x) => ({ key: x.key, label: x.label, class: x.key === pageRange.value ? 'sl-opt-on' : undefined })))
const result = computed(() => (term.value ? quickSearchResult(term.value, props.page ? shownRange.value : state.range, account.value.space) : null))
const savedCount = computed(() => (state.topicsByAccount[state.accountId] || []).length)

// 19 Oct (option E): Trending everywhere in this same pop-up. The sources take the sections'
// place down the left, and a trend opens here as its own insights with a way back to the list.
const trendsMode = computed(() => state.trendsPeek && !term.value)
const TREND_ORDER = ['google', 'pinterest', 'wikipedia', 'yt-videos', 'yt-keywords', 'yt-channels']
const trendList = computed(() => [...trendSources(state.range)].sort((a, b) => TREND_ORDER.indexOf(a.key) - TREND_ORDER.indexOf(b.key)))
const unitLabel = (u) => u.charAt(0).toUpperCase() + u.slice(1)
const trendsLoading = ref(false)
let trendsTimer = null
watch(() => state.trendsPeek, (on) => {
  clearTimeout(trendsTimer)
  trendsLoading.value = on
  if (on) trendsTimer = setTimeout(() => { trendsLoading.value = false }, 700)
}, { immediate: true })
function backToTrends() { state.peekSearch = null; state.peekTopic = null; state.detailPlatforms = null }
// 21 Oct: every source is on screen now (one scrolling column), so Export takes them all.
function exportTrends() {
  const list = trendList.value
  const cell = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"'
  const csv = [['Source', 'Rank', 'Trend', 'Volume', 'Unit', 'Change vs last week'].map(cell).join(',')]
    .concat(list.flatMap((s) => s.rows.map((r, i) => [s.label, i + 1, r.term, r.value, unitLabel(s.unit), r.isNew ? 'New' : `${r.change}%`].map(cell).join(','))))
    .join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  a.download = 'trends.csv'
  a.click()
  URL.revokeObjectURL(a.href)
  toast(`Downloaded ${list.reduce((n, s) => n + s.rows.length, 0)} trends`)
}

// The same glyph each section's card wears (TopicSections' ICONS).
const ICONS = {
  snapshot: MessageChatCircleIcon, sentiment: FaceSmileIcon, engagement: ActivityIcon, trends: TrendUp01Icon,
  conversations: Announcement01Icon, share: PieChart01Icon, messages: MessageTextSquare01Icon, audience: Users01Icon,
}
const SECTIONS = SIMPLE_SECTION_ORDER.map((s) => ({ id: s.id, label: SECTION_NAMES[s.id] || s.label, icon: ICONS[s.id] }))
const active = ref('snapshot')
// The section list is HLTabs placement left (HLMenu moves focus to its active item whenever the
// value changes, so a scroll would pull focus into the list). Below 1100px it goes to the top.
const narrowMq = window.matchMedia('(max-width: 1100px)')
const narrow = ref(narrowMq.matches)
const onNarrow = (e) => { narrow.value = e.matches }
narrowMq.addEventListener('change', onNarrow)
onBeforeUnmount(() => narrowMq.removeEventListener('change', onNarrow))
// HLModal needs a closed state to animate from, so it opens on mount (as CreateTopicModal does).
const show = ref(false)
onMounted(() => { show.value = true })
// Listening started inside this modal: say what it did, once.
const justListened = ref(false)
// 19 Oct (Sujit): a new search takes a moment, so the pop-up says it's reading the posts
// first instead of appearing fully drawn. Starting to listen on the same topic doesn't reload.
const loading = ref(false)
let loadTimer = null
watch(term, (t, was) => {
  active.value = 'snapshot'; state.detailPlatforms = null
  if (t && was && t === was) return
  clearTimeout(refreshTimer); refreshing.value = false; pageRange.value = 'last-7'; shownRange.value = 'last-7'
  justListened.value = false
  clearTimeout(loadTimer)
  loading.value = !!t
  if (t) loadTimer = setTimeout(() => { loading.value = false }, 2600)
  nextTick(() => scroller.value && scroller.value.scrollTo({ top: 0, behavior: 'auto' }))
}, { immediate: true })
const loaderLines = computed(() => [`Finding posts about “${term.value}”`, 'Reading what people say', 'Working out how people feel', 'Spotting who is talking', 'Putting it together'])

// ---- scroll position <-> the list ----
// The section whose top has passed a line 120px into the column is the one you are reading.
// At the very bottom the last section wins, since a short last section never reaches the line.
// A click scrolls smoothly; the list ignores the sections the scroll passes on the way.
const scroller = ref(null)
const navEl = ref(null)
let lockUntil = 0
const secEl = (id) => scroller.value && scroller.value.querySelector(`[data-sec="${id}"]`)
const offsetOf = (el) => el.getBoundingClientRect().top - scroller.value.getBoundingClientRect().top + scroller.value.scrollTop
function onScroll() {
  const sc = scroller.value
  if (!sc || Date.now() < lockUntil) return
  let id = SECTIONS[0].id
  if (sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 4) id = SECTIONS[SECTIONS.length - 1].id
  else for (const s of SECTIONS) { const el = secEl(s.id); if (el && offsetOf(el) <= sc.scrollTop + 120) id = s.id }
  active.value = id
}
function goTo(id) {
  const el = secEl(id)
  active.value = id
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  lockUntil = Date.now() + (reduce ? 0 : 700)
  scroller.value.scrollTo({ top: Math.max(0, offsetOf(el) - 20), behavior: reduce ? 'auto' : 'smooth' })
}
// Keep the active item in view if the list itself scrolls on a short window.
watch(active, () => nextTick(() => navEl.value?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })))

// Once listening, the pop-up becomes the saved topic, so its header offers Alert and Stop listening.
// 21 Oct (Ayushi): no first-visit tip under Start listening; the button says what it does.
function start() { const t = term.value; listenTo(t); peek(t); justListened.value = true }
// 26 Oct (Sujith, 23 Oct call): the "now listening" alert offers Rename and Undo. Undo puts the
// page back to the unsaved search it was a moment ago.
function renameNew() { if (topic.value) state.renaming = topic.value.title }
function undoListen() {
  const t = term.value
  if (topic.value) removeTopicQuietly(topic.value.title)
  justListened.value = false
  state.peekTopic = null
  state.peekSearch = t
}
function close() { state.peekTopic = null; state.peekSearch = null; state.detailPlatforms = null; state.trendsPeek = false }
// Back from the page returns to whatever it was opened over, the Trending now pop-up included.
function back() { state.peekTopic = null; state.peekSearch = null; state.detailPlatforms = null }
const shell = computed(() => (props.page ? Canvas : 'HLModal'))
const shellProps = computed(() => (props.page
  ? { level: 2, flush: true, class: 'sl-page' }
  : { id: 'sl-peek-modal', show: show.value, class: 'sl-modal', width: 1280, showHeaderIcon: false, showFooter: false, closeOnEsc: false, ariaLabel: trendsMode.value ? 'Trending now' : title.value }))
const shellOn = computed(() => (props.page ? {} : { 'update:show': (v) => { show.value = v; if (!v) close() } }))

// 15 Oct (audit 6): no full page. Its two useful controls live here instead: the platform
// filter and Export. The counter shows only near the limit (audit 12).
const nearLimit = computed(() => savedCount.value >= TOPIC_SHOWN_LIMIT - 5)
const atLimit = computed(() => savedCount.value >= TOPIC_SHOWN_LIMIT)
// 19 Oct (Sujit): each platform carries its logo, as in Create a topic.
const NET_KEY = { x: 'x', twitter: 'x', 'x (twitter)': 'x', web: 'web', blogs: 'web', news: 'web' }
const netIcon = (label) => NETWORK_ICONS[NET_KEY[String(label).toLowerCase()] || String(label).toLowerCase()]
// 27 Oct (developers): platforms are a multi-select with checkboxes. Clearing the last one goes back
// to All. Turning Facebook on opens its Sources setup (public Pages to monitor).
const platformLabel = computed(() => {
  const p = state.detailPlatforms
  if (!p || !p.length) return 'All platforms'
  return p.length === 1 ? p[0] : `${p.length} platforms`
})
const platformLabels = computed(() => ['All platforms', ...(result.value?.platforms || []).map((x) => x.label), ...Array.from({ length: 5 }, (_, i) => `${i + 2} platforms`)])
const fbOn = computed(() => (state.detailPlatforms || []).includes('Facebook'))
const platformsOpen = ref(false)
// 19 Oct audit: the current choice carries sl-opt-on, which draws the check mark (index.css).
const platformOptions = computed(() => [
  { key: 'all', label: 'All platforms', selected: !state.detailPlatforms },
  { type: 'divider', key: 'all-divider' },
  ...(result.value?.platforms || []).map((p) => ({
    key: p.label, label: p.label, selected: (state.detailPlatforms || []).includes(p.label),
    ...(netIcon(p.label) ? { type: 'icon', icon: netIcon(p.label), iconPlacement: 'left' } : {}),
  })),
])
// 27 Oct (Ayushi): the button shows the logos of what it filters to (all of them for All), as in the live product.
const platformLogos = computed(() => {
  const all = (result.value?.platforms || []).map((p) => p.label)
  return (state.detailPlatforms && state.detailPlatforms.length ? state.detailPlatforms : all).map(netIcon).filter(Boolean).slice(0, 3)
})
function pickPlatform(k) {
  if (k === 'all') { state.detailPlatforms = null; return }
  const cur = state.detailPlatforms || []
  const on = !cur.includes(k)
  const next = on ? [...cur, k] : cur.filter((x) => x !== k)
  state.detailPlatforms = next.length && next.length < (result.value?.platforms || []).length ? next : null
  if (on && k === 'Facebook') { platformsOpen.value = false; state.fbSources = term.value }
}
function exportPosts() {
  const rows = result.value?.messages || []
  if (!rows.length) { toast('Nothing to export in this date range', '', 'warning'); return }
  const cell = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"'
  const csv = [['Author', 'Handle', 'Platform', 'Posted', 'Sentiment', 'Post'].map(cell).join(',')]
    .concat(rows.map((m) => [m.who, m.handle, m.platform, m.ago, m.tone, m.text].map(cell).join(',')))
    .join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  a.download = String(term.value).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-posts.csv'
  a.click()
  URL.revokeObjectURL(a.href)
  toast(`Downloaded ${rows.length} posts`)
}
// 15 Oct (audit 7, 8): a saved topic's alerts and Stop listening sit in the header.
const alertCount = computed(() => (topic.value ? (state.alertsBy[`${state.accountId}|${topic.value.title}`] || []).length : 0))
function openAlerts() {
  state.alertTopic = topic.value.title
  state.alertSavesSearch = false
  state.alertMetric = null
  state.modal = 'alert'
}
// 23 Oct: topics live on the Explore tab.
function manageTopics() { close(); state.trendsPage = false; state.topicsPage = false; state.industryPage = false; state.tab = 'insights' }
function stopListening() {
  if (topic.value) state.confirmStop = topic.value.title
}
// Escape closes the top layer only: with the alert panel or a picker open, that closes first.
function onKey(e) { if (!props.page && e.key === 'Escape' && !state.modal && !state.askAI && !state.confirmStop) close() }
// 15 Oct: toasts sit at the top of the screen, which is the pop-up's header. While it's open
// they move to the bottom, clear of its buttons.
watch(() => !props.page && (!!(term.value && result.value) || trendsMode.value), (on) => document.documentElement.classList.toggle('sl-peek-open', on), { immediate: true })
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => { clearTimeout(loadTimer); clearTimeout(trendsTimer); window.removeEventListener('keydown', onKey); document.documentElement.classList.remove('sl-peek-open') })
</script>

<template>
  <!-- 21 Oct (HighRise pass): HLModal is the shell. Its header slot carries the title row, its
       own close button closes, and the mask closes on a click. Escape stays with onKey so it
       closes only the top layer. Size: 80% of the window, capped at 1280 × 960 (style block). -->
  <component
    :is="shell"
    v-if="page ? !!(term && result) : (trendsMode || (term && result))"
    v-bind="shellProps"
    v-on="shellOn"
  >
    <template #[page?'bar':'header']>
      <div v-if="trendsMode" class="sl-modal-head">
        <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900 truncate">Trending now</HLText>
        <HLText html-tag="span" size="md" class="text-gray-500 whitespace-nowrap">{{ range.label }}</HLText>
        <span class="flex-1" />
        <HLButton v-if="!trendsLoading" id="sl-trends-export" variant="secondary" size="sm" @click="exportTrends">
          Export
        </HLButton>
      </div>
      <div v-else :class="['sl-modal-head', page && 'sl-page-head']">
        <!-- The page's Back is the shell's level-2 Back: a gray text button, then a divider. -->
        <template v-if="page">
          <HLButton id="sl-page-back" variant="text" color="gray" size="xs" class="shrink-0" @click="back">
            <template #iconLeft><ArrowLeftIcon /></template>
            Back
          </HLButton>
          <HLDivider vertical class="shrink-0" />
        </template>
        <HLButton v-else-if="state.trendsPeek" id="sl-modal-back" variant="secondary" size="sm" aria-label="Back to Trending now" @click="backToTrends">
          <template #iconLeft><ArrowLeftIcon /></template>
        </HLButton>
        <HLText html-tag="h1" :size="page ? 'lg' : '2xl'" weight="semibold" class="text-gray-900 truncate min-w-0" :title="title">{{ title }}</HLText>
        <HLTag v-if="page && refreshing" id="sl-modal-refreshing" size="md" color="blue" round :interactive="false" class="sl-live shrink-0" role="status">
          <span class="inline-flex items-center gap-1.5"><span class="sl-refresh-dot" aria-hidden="true" />Refreshing</span>
        </HLTag>
        <HLTag v-else-if="saved" id="sl-modal-live" size="md" color="success" round :interactive="false" class="sl-live shrink-0">
          <template #icon><Headphones01Icon /></template>
          Listening
        </HLTag>
        <HLText v-if="!page" html-tag="span" size="md" class="text-gray-500 whitespace-nowrap">{{ range.label }}</HLText>
        <span class="flex-1" />
        <HLDropdown
          v-if="!page && platformOptions.length > 3 && !result.empty && !loading" id="sl-modal-platforms-menu" trigger="click" placement="bottom-end"
          :options="platformOptions" multiple show-checkbox :close-on-select="false" :show-search="false" :width="220" :disabled="refreshing"
          :show="platformsOpen" @update:show="(v) => (platformsOpen = v)" @select="pickPlatform"
        >
          <HLButton id="sl-modal-platforms" variant="secondary" size="sm" :disabled="refreshing" :aria-label="`Platforms: ${platformLabel}`">
            <template #iconLeft><FilterLinesIcon /></template>
            <span class="sl-reserve mr-1"><span v-for="l in platformLabels" :key="l" class="sl-reserve-ghost" aria-hidden="true">{{ l }}</span><span>{{ platformLabel }}</span></span>
            <template #iconRight><ChevronDownIcon /></template>
          </HLButton>
        </HLDropdown>
        <HLButton v-if="saved && topic" id="sl-modal-alerts" variant="secondary" size="sm" @click="openAlerts">
          <template #iconLeft><BellRinging01Icon /></template>
          {{ alertCount ? 'Alert' : 'Add alert' }}
          <HLBadge v-if="alertCount" id="sl-modal-alert-badge" :value="alertCount" color="gray" size="md" class="sl-count" />
        </HLButton>
        <HLButton v-if="!result.empty && !loading" id="sl-modal-export" variant="secondary" size="sm" @click="exportPosts">
          Export
        </HLButton>
        <template v-if="!saved">
          <HLText v-if="nearLimit" html-tag="span" size="md" class="text-gray-500 whitespace-nowrap">{{ savedCount }} of {{ TOPIC_SHOWN_LIMIT }} topics</HLText>
          <!-- 19 Oct: at the limit, Start listening is off; the alert at the top of the body says why. -->
          <HLButton v-if="atLimit" id="sl-modal-listen" variant="primary" color="blue" size="sm" disabled>
            Start listening
          </HLButton>
          <HLButton v-else id="sl-modal-listen" variant="primary" color="blue" size="sm" @click="start">
            Start listening
          </HLButton>
        </template>
        <!-- 19 Oct (Sujit): Stop listening ends something, so it doesn't wear the same grey as the rest. -->
        <HLButton v-else-if="topic" id="sl-modal-stop" variant="secondary" color="orange" size="sm" @click="stopListening">Stop listening</HLButton>
      </div>
    </template>

    <div :class="['sl-modal-frame', page && 'sl-page-frame']">
      <template v-if="trendsMode">
        <div v-if="trendsLoading" class="sl-modal-loading">
          <OrbitLoader title="Loading trends" :lines="['Google, Pinterest, Wikipedia and YouTube', 'Ranking what people search, save, read and watch']" />
        </div>
        <!-- 21 Oct (picks 18 V1 + 19 V1): all sources in one scrolling column, small cards. -->
        <TrendsScroll v-else :sources="trendList" />
      </template>
      <template v-else>
        <div v-if="loading" id="sl-modal-loading" class="sl-modal-loading">
          <OrbitLoader :key="term" :title="`Looking into “${term}”`" :lines="loaderLines" />
        </div>
        <!-- 15 Oct (review 9): a search with no posts says so and offers a way on.
             21 Oct: HLEmpty, with the industry's trends as HLButton secondary xs. -->
        <div v-else-if="result.empty" id="sl-modal-empty" class="sl-modal-empty">
          <HLAlert
            v-if="atLimit && !saved" id="sl-modal-limit" color="orange" role="status" :closable="false" max-width="none" class="sl-modal-alert"
            :title="`You’re listening to all ${TOPIC_SHOWN_LIMIT} topics.`" :content="`Stop listening to one to start listening to “${term}”.`"
            :action-one="{ text: 'Manage topics', onActionClick: manageTopics }"
          />
          <HLEmpty
            id="sl-peek-empty" size="md" :custom-icon="SearchMdIcon" custom-icon-color="var(--gray-600)" custom-icon-bg-color="var(--gray-100)"
            :title="`No posts mention “${term}” ${range.phrase}`"
            description="Check the spelling, or try a broader word. You can still start listening, and we’ll show it here as soon as people post about it."
          >
            <template v-if="suggestions.length" #actions>
              <div class="flex flex-col items-center gap-2">
                <HLText size="md" weight="medium" class="text-gray-500">Trending in your industry</HLText>
                <div class="flex justify-center gap-2 w-max">
                  <HLButton v-for="(t, i) in suggestions" :id="`sl-modal-empty-tag-${i}`" :key="t.term" variant="secondary" size="xs" class="sl-modal-empty-tag" :aria-label="`Search ${t.term}, up ${t.delta}%`" @click="peek(t.term)">
                    <span class="inline-flex items-center gap-2 whitespace-nowrap">
                      <span>{{ t.term }}</span>
                      <span class="text-positive-strong tabular-nums inline-flex items-center gap-1"><ArrowUpIcon class="w-3.5 h-3.5" aria-hidden="true" />{{ t.delta }}%</span>
                    </span>
                  </HLButton>
                </div>
              </div>
            </template>
          </HLEmpty>
        </div>
        <div v-else class="sl-modal-body">
          <nav ref="navEl" class="sl-modal-nav" aria-label="Sections">
            <HLTabs id="sl-modal-tabs" :value="active" type="line" no-border :placement="narrow ? 'top' : 'left'" :max-visible-tabs="SECTIONS.length" @update:value="goTo">
              <HLTab v-for="s in SECTIONS" :key="s.id" :name="s.id">
                <span class="sl-modal-tab"><component :is="s.icon" class="w-4 h-4 shrink-0" aria-hidden="true" />{{ s.label }}</span>
              </HLTab>
            </HLTabs>
          </nav>
          <div ref="scroller" class="sl-modal-content" @scroll.passive="onScroll">
            <!-- 27 Oct (developers): the page's filters, date range (7, 15, 30 days) and platforms
                 (multi-select; Facebook adds its public Pages), sit above the sections, so the bar
                 keeps room for the topic name and its actions at every width. -->
            <div v-if="page" id="sl-page-filters" class="sl-page-filters">
              <HLDropdown id="sl-page-range-menu" trigger="click" placement="bottom-start" :options="rangeOptions" :show-search="false" :disabled="refreshing" @select="setRange">
                <HLButton id="sl-page-range" variant="secondary" size="sm" :disabled="refreshing" :aria-label="`Date range: ${rangeOf(pageRange).label}. Change`">
                  <template #iconLeft><CalendarIcon /></template>
                  <span class="mr-1">{{ rangeOf(pageRange).label }}</span>
                  <template #iconRight><ChevronDownIcon /></template>
                </HLButton>
              </HLDropdown>
              <HLDropdown
                v-if="platformOptions.length > 3" id="sl-modal-platforms-menu" trigger="click" placement="bottom-start"
                :options="platformOptions" multiple show-checkbox :close-on-select="false" :show-search="false" :width="220" :disabled="refreshing"
                :show="platformsOpen" @update:show="(v) => (platformsOpen = v)" @select="pickPlatform"
              >
                <HLButton id="sl-modal-platforms" variant="secondary" size="sm" :disabled="refreshing" :aria-label="`Platforms: ${platformLabel}`">
                  <span class="inline-flex items-center gap-2 mr-1">
                    <span class="sl-logo-stack" aria-hidden="true"><span v-for="(ic, i) in platformLogos" :key="i" class="sl-logo"><component :is="ic" /></span></span>
                    <span class="sl-reserve"><span v-for="l in platformLabels" :key="l" class="sl-reserve-ghost" aria-hidden="true">{{ l }}</span><span>{{ platformLabel }}</span></span>
                  </span>
                  <template #iconRight><ChevronDownIcon /></template>
                </HLButton>
              </HLDropdown>
              <HLTooltip v-if="fbOn" trigger="hover" placement="bottom">
                <template #trigger>
                  <HLButton id="sl-modal-fb-sources" variant="secondary" size="sm" aria-label="Facebook sources" @click="state.fbSources = term">
                    <template #iconLeft><component :is="NETWORK_ICONS.facebook" /></template>
                  </HLButton>
                </template>
                Facebook sources
              </HLTooltip>
              <span class="flex-1" />
              <HLText id="sl-page-updated" html-tag="span" size="md" class="text-gray-500 whitespace-nowrap">{{ refreshing ? `Fetching the ${rangeOf(pageRange).short}…` : `Showing the ${rangeOf(shownRange).short}` }}</HLText>
            </div>
            <HLAlert
              v-if="atLimit && !saved" id="sl-modal-limit" color="orange" role="status" :closable="false" max-width="none" class="sl-modal-alert"
              :title="`You’re listening to all ${TOPIC_SHOWN_LIMIT} topics.`" :content="`Stop listening to one to start listening to “${term}”.`"
              :action-one="{ text: 'Manage topics', onActionClick: manageTopics }"
            />
            <HLAlert
              v-if="justListened" id="sl-modal-listening" color="green" role="status" :closable="false" max-width="none" class="sl-modal-alert"
              :title="`You’re now listening to “${topic ? topic.title : term}”.`" :content="`We refresh it every 6 hours and keep it in your topics. ${savedCount} of ${TOPIC_SHOWN_LIMIT} topics.`"
              :action-one="{ text: 'Rename', onActionClick: renameNew }" :action-two="{ text: 'Undo', onActionClick: undoListen }"
            />
            <TopicSections :result="result" />
          </div>
        </div>
      </template>
    </div>
  </component>
</template>

<style scoped>
/* HLModal teleports into HLContentWrap, outside this component's DOM, so these rules are
   :global and keyed on the modal's own class. HighRise draws the shell (radius, border, shadow,
   header padding 16, close); these only size it and lay out the two-pane body. */
/* 15 Oct (Sujit): big on a laptop, capped on a large monitor, and always a gap of mask to tap
   outside: 24-64px at the sides, 24-48px top and bottom. */
:global(.hr-dialog.hr-modal.sl-modal) {
  width: min(1280px, calc(100vw - 2 * clamp(24px, 4vw, 64px))) !important;
  height: min(960px, calc(100vh - 2 * clamp(24px, 4vh, 48px)));
  display: flex; flex-direction: column; overflow: hidden;
}
/* The body under the header: grey-50, one gray-200 rule under the white header. */
:global(.hr-dialog.hr-modal.sl-modal .hr-dialog__content) {
  flex: 1; min-height: 0; display: flex; flex-direction: column;
  background: var(--gray-50); border-top: 1px solid var(--gray-200);
}
:global(.hr-dialog.hr-modal.sl-modal .hr-dialog__content--text),
:global(.hr-dialog.hr-modal.sl-modal .hr-modal__content) { flex: 1; min-height: 0; max-height: none; overflow: hidden; display: flex; flex-direction: column; }
/* HighRise's close is 20px at the 16px corner, centred on a 20px title line. This header's line is
   a 36px sm button row, so the close drops 8 to sit on the same centre line. */
:global(.hr-dialog.hr-modal.sl-modal > .hr-dialog__close) { margin-top: 24px !important; }
/* The two panes run to the modal's edges, so the body's own 16px inset is off here only. */
:global(.hr-dialog.hr-modal.sl-modal .hr-modal__content) { padding: 0; }
/* padding-right 6 + HighRise's 42 close inset = 12 between the last button and the close, the row's own gap. */
.sl-modal-head { display: flex; align-items: center; gap: 12px; min-width: 0; padding-right: 8px; }
/* The modal body is an HLText that breaks long words; the sections' axis labels must not wrap. */
.sl-modal-frame { flex: 1; min-height: 0; display: flex; flex-direction: column; word-break: normal; }
.sl-modal-loading { flex: 1; min-height: 0; display: grid; place-items: center; padding: 24px; }
.sl-modal-empty { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; align-items: center; gap: 24px; padding: 64px 24px; }
.sl-modal-empty .sl-modal-alert { align-self: stretch; }
/* HLEmpty takes its text colour from the modal body (gray-500); the title reads as a heading. */
.sl-modal-empty :deep(.hr-empty__title) { color: var(--gray-900); }
.sl-modal-empty :deep(.hr-empty__description) { color: var(--gray-600); }
.sl-modal-alert { margin-bottom: 16px; }
.sl-modal-body { flex: 1; min-height: 0; display: grid; grid-template-columns: 220px minmax(0, 1fr); }
.sl-modal-nav { padding: 16px 0 16px 16px; background: var(--base-white); border-right: 1px solid var(--gray-200); overflow-y: auto; }
/* The tab list fills the column, so HLTabs' active bar runs on the column's own rule (no-border
   drops the tabs' rail, which would be a second line beside it). */
@media (min-width: 1101px) { .sl-modal-nav :deep(.hr-tabs), .sl-modal-nav :deep(.hr-tabs-nav), .sl-modal-nav :deep(.hr-tabs-nav-scroll-content) { width: 100%; } }
/* Icon then label inside each HLTab, 8 apart (HLButton's icon gap). */
.sl-modal-tab { display: inline-flex; align-items: center; gap: 8px; }
.sl-modal-content { overflow-y: auto; padding: 24px 32px; }
.sl-modal-content :deep([data-sec]) { scroll-margin-top: 20px; }
/* The page: the head fills the shell's 48px bar (its own 32 inset), the body is the pop-up's two
   panes on grey-50, and the sections stop growing at the pop-up's width so charts keep their shape. */
.sl-page-head { flex: 1; padding-right: 0; }
.sl-page-frame { background: var(--gray-50); }
/* The filter row stays at the top while the sections scroll under it. */
.sl-page-frame .sl-modal-content > .sl-page-filters { position: sticky; top: -24px; z-index: 5; display: flex; align-items: center; gap: 8px; margin: -24px auto 0; padding: 24px 0 16px; background: var(--gray-50); }
/* Up to three platform logos, overlapping, on white rings (the live product's platform button). */
.sl-logo-stack { display: inline-flex; align-items: center; justify-content: flex-end; min-width: 48px; }
.sl-logo { width: 20px; height: 20px; border-radius: 50%; background: var(--base-white); box-shadow: 0 0 0 2px var(--base-white); display: inline-grid; place-items: center; }
.sl-logo + .sl-logo { margin-left: -6px; }
.sl-logo :deep(svg) { width: 16px; height: 16px; }
/* Labels laid in one grid cell so the button keeps the width of its longest label (b1 V1). */
.sl-reserve { display: inline-grid; text-align: left; }
.sl-reserve > * { grid-area: 1 / 1; }
.sl-reserve-ghost { visibility: hidden; }
/* The Refreshing tag's dot pulses while the new range loads. */
.sl-refresh-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--primary-600); animation: sl-pulse 1s ease-in-out infinite; }
@keyframes sl-pulse { 50% { opacity: .35; } }
@media (prefers-reduced-motion: reduce) { .sl-refresh-dot { animation: none; } }
/* The section list starts on the bar's 32px line, so its icons sit under Back. */
@media (min-width: 1101px) { .sl-page-frame .sl-modal-nav { padding-left: 24px; } }
.sl-page-frame .sl-modal-content > * { max-width: 1000px; margin-left: auto; margin-right: auto; }
/* Below 1100px the section list moves above the sections as a row, so the sections keep their width. */
@media (max-width: 1100px) {
  .sl-modal-body { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); }
  .sl-modal-nav { min-width: 0; padding: 0 16px; border-right: 0; border-bottom: 1px solid var(--gray-200); overflow-x: auto; overflow-y: hidden; }
  .sl-modal-head { flex-wrap: wrap; row-gap: 8px; }
}
</style>
