<script setup>
import { computed, h, ref, resolveComponent, watch } from 'vue'
import { useHLNotification, transformNotificationOpts } from '@platform-ui/highrise'
import {
  Rocket01Icon, LayoutAlt01Icon, MessageCircle01Icon, CalendarIcon,
  User01Icon, CreditCard01Icon, Send01Icon, RefreshCw01Icon, Globe01Icon, Star01Icon,
  TrendUp01Icon, Grid01Icon, Tablet01Icon, Settings01Icon, PlusIcon,
  BookmarkIcon, BookmarkCheckIcon, BellRinging01Icon, ChevronDownIcon, CalendarIcon as RangeIcon,
  RefreshCcw01Icon, Share07Icon, Download01Icon, DotsHorizontalIcon,
} from '@gohighlevel/ghl-icons/24/outline'
import { NETWORK_ICONS } from '../components/social-listening/networkIcons.js'
import AppShell from '../shell/AppShell.vue'
import Canvas from '../shell/Canvas.vue'
import { useSocialListening, setNotifier } from '../composables/useSocialListening.js'
import { QUICK_SEARCH_SECTIONS, SIMPLE_SECTION_ORDER, SECTION_NAMES, RANGES, quickSearchResult, TOPIC_SHOWN_LIMIT } from '../data/socialListening.js'
import { Headphones01Icon, Briefcase01Icon } from '@gohighlevel/ghl-icons/24/outline'
import TopicPanel from '../components/social-listening/TopicPanel.vue'
import TrendsHome from '../components/social-listening/TrendsHome.vue'
import RenameTopicModal from '../components/social-listening/RenameTopicModal.vue'
import FacebookSourcesModal from '../components/social-listening/FacebookSourcesModal.vue'
import YourTopicsPage from '../components/social-listening/YourTopicsPage.vue'
import IndustryTopicsPage from '../components/social-listening/IndustryTopicsPage.vue'
import TrendsPage from '../components/social-listening/TrendsPage.vue'
import StopListeningModal from '../components/social-listening/StopListeningModal.vue'

import DashboardOverview from '../components/social-listening/DashboardOverview.vue'
import TriageTable from '../components/social-listening/TriageTable.vue'
import InsightsTab from '../components/social-listening/InsightsTab.vue'
import TrendsTab from '../components/social-listening/TrendsTab.vue'
import TopicDetail from '../components/social-listening/TopicDetail.vue'
import ComingSoon from '../components/social-listening/ComingSoon.vue'
import AnalyzingOverlay from '../components/social-listening/AnalyzingOverlay.vue'
import DemoControls from '../components/social-listening/DemoControls.vue'

import SpacePickerModal from '../components/social-listening/SpacePickerModal.vue'
import ConnectSocialModal from '../components/social-listening/ConnectSocialModal.vue'
import ConnectedAccountsModal from '../components/social-listening/ConnectedAccountsModal.vue'
import CompetitorModal from '../components/social-listening/CompetitorModal.vue'
import CreateTopicModal from '../components/social-listening/CreateTopicModal.vue'
import CreateAlertModal from '../components/social-listening/CreateAlertModal.vue'
import RemoveTopicModal from '../components/social-listening/RemoveTopicModal.vue'
import AskAIPanel from '../components/social-listening/AskAIPanel.vue'

const { state, account, detail, closeDetail, isSavedTerm, saveSearchAsTopic,
        search, toast, refreshDetail, refreshing, simple } = useSocialListening()

// Every toast in the app goes through HighRise's notification (an HLAlert in notification
// form), so tone maps to its alert type and actions render as HighRise text buttons.
const TONE_TYPE = { positive: 'success', info: 'info', warning: 'warning', negative: 'error' }
// The SSR state check renders this page without HLContentWrap, so there is no provider to
// find; toasts then stay queued in state.toasts instead of throwing.
let notification = null
try { notification = useHLNotification() } catch { notification = null }
const HLButton = resolveComponent('HLButton')
if (notification) setNotifier(({ title, body, tone, actions }) => {
  let n = null
  n = notification.create(transformNotificationOpts({
    title,
    description: body,
    type: TONE_TYPE[tone] || 'success',
    duration: actions ? 7000 : 3600,
    action: actions ? () => h('div', { class: 'flex gap-3' }, actions.map((a) => h(HLButton, { variant: 'text', color: 'blue', size: 'xs', onClick: () => { a.run(); n?.destroy() } }, () => a.label))) : undefined,
  }))
})

const NAV_SECTIONS = [
  {
    items: [
      { icon: Rocket01Icon, label: 'Launchpad' },
      { icon: LayoutAlt01Icon, label: 'Dashboard' },
      { icon: MessageCircle01Icon, label: 'Conversations' },
      { icon: CalendarIcon, label: 'Calendars' },
      { icon: User01Icon, label: 'Contacts' },
      { icon: TrendUp01Icon, label: 'Opportunities' },
      { icon: CreditCard01Icon, label: 'Payments' },
    ],
  },
  {
    items: [
      { icon: Send01Icon, label: 'Marketing', active: true },
      { icon: RefreshCw01Icon, label: 'Automation' },
      { icon: Globe01Icon, label: 'Sites' },
      { icon: Star01Icon, label: 'Reputation' },
      { icon: TrendUp01Icon, label: 'Reporting' },
      { icon: Grid01Icon, label: 'App marketplace' },
      { icon: Tablet01Icon, label: 'Mobile app' },
    ],
  },
]

const SECTION_TABS = ['Social planner', 'Emails', 'Snippets', 'Countdown timer', 'Brand boards', 'Ad manager']
// Sentence case like its siblings ("Social planner", "Brand boards"): a feature name in this
// shell, not a trademark, so the page title below uses the same casing.
const SUB_TABS = ['Planner', 'Content', 'Comments', 'Statistics', 'Social intelligence']

// Sentence case, matching the two tab rows above this one in the same shell.
// Quick search folded into Insights on 30 Sep; Social trends and Competitor landscape took
// the short names at the same time.
const PAGE_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'insights', label: 'Insights' },
  { key: 'trends', label: 'Trends' },
  { key: 'competitors', label: 'Competitors' },
]
// Sujeet's simplified design: Insights is Explore (Explore until 6 Oct, then Topics, then Explore
// topics for part of 8 Oct, and back to Explore), and there is no Competitors tab.
// 26 Oct (Harsh): Trends is a tab again, before Competitors (soon). Short labels (Ayushi): the
// page is already called Social intelligence.
const PAGE_TABS_SIMPLE = [
  { key: 'overview', label: 'Overview' },
  { key: 'insights', label: 'Explore' },
  { key: 'trends', label: 'Trends' },
  // Back as a 4th tab (Shivam, 5 Oct), but disabled: a Coming soon chip and a one-line pitch
  // on hover rather than a whole empty page.
  { key: 'competitors', label: 'Competitors', soon: true },
]
const COMPETITORS_PITCH = 'Monitor your competitors, see how they are performing, and compare them with your brand.'
// Sujith (6 Oct): Coming soon is a badge on the label, the way the product shows it elsewhere,
// not a pill beside it that reads as a second tab. 7 Oct: cut to "Soon" and pulled in tight to
// the corner, so the label and the badge read as one tab from a distance. 7 Oct review pick 6A:
// a small grey pill inline on the label's baseline, so it never sits above the tab line.
function soonTab(label) {
  const HLTooltip = resolveComponent('HLTooltip')
  const HLText = resolveComponent('HLText')
  return () => h(HLTooltip, { trigger: 'hover', placement: 'bottom' }, {
    trigger: () => h('span', { class: 'inline-flex items-center gap-1.5' }, [
      h('span', label),
      h(HLText, { htmlTag: 'span', size: 'md', weight: 'medium', class: 'text-gray-500 bg-gray-100 rounded-full px-2' }, () => 'Soon'),
    ]),
    default: () => h(HLText, { htmlTag: 'span', size: 'sm' }, () => COMPETITORS_PITCH),
  })
}
const pageTabs = computed(() => (simple.value ? PAGE_TABS_SIMPLE : PAGE_TABS))
watch(simple, (on) => { if (on && state.tab === 'competitors') state.tab = 'overview' })
// Motion (rise-ins, lifts, count-ups) is the simplified design's; the class switches it on.
watch(simple, (on) => { if (typeof document !== 'undefined') document.documentElement.classList.toggle('sl-motion', on) }, { immediate: true })
const viewTransition = computed(() => (simple.value ? 'sl-view' : 'sl-none'))

// ---- topic detail: Option B ----
// Opening a search or a topic swaps the shell for the vertical-tabs + back-toolbar template:
// a title-only top bar, the back bar carrying the controls, and the sections down the left.
// The two tab rows and the page header go, because someone reading a topic needs the data,
// not four rows of navigation above it.
const SECTION_TABS_CURRENT = QUICK_SEARCH_SECTIONS.map((s) => ({ id: s.id, label: s.alt || s.label }))
const SECTION_TABS_SIMPLE = SIMPLE_SECTION_ORDER.map((s) => ({ id: s.id, label: SECTION_NAMES[s.id] || s.label }))
const detailShell = computed(() => {
  const d = detail.value
  if (!d) return null
  const SECTION_TABS_DETAIL = simple.value ? SECTION_TABS_SIMPLE : SECTION_TABS_CURRENT
  return {
    backToolbar: { onBack: closeDetail, label: d.kind === 'search' ? `“${d.title}”` : d.title },
    verticalTabs: {
      tabs: SECTION_TABS_DETAIL.map((t) => t.label),
      activeTab: (SECTION_TABS_DETAIL.find((t) => t.id === state.detailSection) || SECTION_TABS_DETAIL[0]).label,
      onTabChange: (label) => { state.detailJump = SECTION_TABS_DETAIL.find((t) => t.label === label)?.id || null },
      // The listening loader's beat (S1, 7 Oct): the tabs pulse as skeletons until it ends.
      loading: state.detailLoading || !!d.pending,
    },
  }
})
const detailSaved = computed(() => detail.value && isSavedTerm(detail.value.term))
const savedCount = computed(() => (state.topicsByAccount[state.accountId] || []).length)
// A search saved as a topic is that topic from then on, even though the view is still the
// search result: without this the bell only appeared after leaving and re-opening it.
const detailTopic = computed(() => {
  if (!detail.value) return null
  if (detail.value.kind === 'topic') return detail.value.topic
  const k = (detail.value.term || '').trim().toLowerCase()
  return (state.topicsByAccount[state.accountId] || []).find((t) => (t.term || t.title).trim().toLowerCase() === k) || null
})

// ---- the detail toolbar ----
//
// The source filter. Its options are the platforms this result actually came back with, so
// the list never offers a source with nothing behind it. `state.detailPlatform` is shared
// with the Messages section's own pill row: one filter, two places to reach it, and no way
// for the two to show different answers.
const PLATFORM_KEY = { Facebook: 'facebook', Instagram: 'instagram', LinkedIn: 'linkedin', X: 'x', Reddit: 'reddit', YouTube: 'youtube' }
// A search carries its stored result; a topic derives one, the same way TopicDetail does.
// Sourcing the list from one place is what stops the dropdown offering Reddit on a topic
// whose sections never mention it.
const detailResult = computed(() => {
  const d = detail.value
  if (!d) return null
  return d.kind === 'search' ? search.value?.result : quickSearchResult(d.term, state.range, account.value.space)
})
const detailPlatforms = computed(() => {
  const list = detailResult.value?.platforms || []
  return list.map((p) => ({ label: p.label, key: PLATFORM_KEY[p.label] || String(p.label).toLowerCase() }))
})
// `null` is all of them. Resolving it here rather than storing the list is what keeps the
// selection sane when you move between topics with different sources behind them.
const allPlatformLabels = computed(() => detailPlatforms.value.map((p) => p.label))
const selectedPlatforms = computed(() => state.detailPlatforms ?? allPlatformLabels.value)
const isPlatformOn = (label) => selectedPlatforms.value.includes(label)
const allPlatformsOn = computed(() => selectedPlatforms.value.length === allPlatformLabels.value.length)

function togglePlatform(label, on) {
  const next = new Set(selectedPlatforms.value)
  on ? next.add(label) : next.delete(label)
  // Back to null when everything is on, so the "all" state stays the one that follows the
  // term rather than a list that happens to match today.
  const list = allPlatformLabels.value.filter((l) => next.has(l))
  state.detailPlatforms = list.length === allPlatformLabels.value.length ? null : list
}
const selectAllPlatforms = () => { state.detailPlatforms = null }
const clearPlatforms = () => { state.detailPlatforms = [] }

// Three marks, matching the stack in the reference. Past three the group stops reading as a
// set of logos and starts reading as a row of dots.
// Not HLAvatarGroup: it renders a photo (src) or initials (name), and an option's `value` is a
// badge on top, not the avatar. The brand marks are icon components, so the group printed
// "IN FA X +3" instead of the logos.
const platformStack = computed(() => detailPlatforms.value.filter((p) => isPlatformOn(p.label)).slice(0, 3))
const platformLabel = computed(() => {
  const n = selectedPlatforms.value.length
  if (!n) return 'No platforms'
  if (allPlatformsOn.value) return 'All platforms'
  return n === 1 ? selectedPlatforms.value[0] : n + ' platforms'
})

// The bell is this topic's alerts, not the product's notifications. The shell's own bell sits
// a row above and goes to the notifications drawer; this one goes to the alert this topic has
// or does not have yet, which is the action the old "Create alert" button carried.
const alertCount = computed(() => (state.alertsBy[`${state.accountId}|${detailTopic.value?.title || detail.value?.title}`] || []).length)

// Share copies a link. It deliberately does not open ShareModal: that flow hangs off Save
// snapshot, which was removed on request, and a toolbar glyph is not the place to put it back.
function shareDetail() {
  const url = window.location.origin + window.location.pathname + '?topic=' + encodeURIComponent(detail.value?.term || '')
  const done = () => (simple.value ? toast('Link copied for your team') : toast('Link copied', 'Anyone with access to this sub-account can open it.'))
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(done).catch(done)
  else done()
}

// Export writes the posts behind this topic, which is the one table on the screen that is a
// list of records rather than a derived figure. Everything else here is a share of something
// and would export as a single row.
function exportDetail() {
  const rows = detailResult.value?.messages || []
  if (!rows.length) { if (simple.value) toast('Nothing to export in this date range', '', 'warning'); else toast('Nothing to export', 'This topic has no posts in the selected window.', 'warning'); return }
  const esc = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"'
  const csv = [['Author', 'Handle', 'Platform', 'Posted', 'Sentiment', 'Post'].map(esc).join(',')]
    .concat(rows.map((m) => [m.who, m.handle, m.platform, m.ago, m.tone, m.text].map(esc).join(',')))
    .join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  a.download = String(detail.value?.term || 'topic').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-posts.csv'
  a.click()
  URL.revokeObjectURL(a.href)
  if (simple.value) toast(`Downloaded ${rows.length} posts`)
  else toast('Export ready', rows.length + ' posts saved as CSV.')
}
// An unsaved search can take an alert too. An alert has to belong to a topic, so creating
// one saves the search; opening the modal and cancelling leaves it unsaved.
function alertForDetail() {
  state.alertTopic = detailTopic.value?.title || detail.value?.title || null
  state.alertSavesSearch = !detailTopic.value
  state.modal = 'alert'
}

const detailMoreOptions = [
  { key: 'refresh', label: 'Refresh', type: 'icon', icon: RefreshCcw01Icon, iconPlacement: 'left' },
  { key: 'copy', label: 'Copy link', type: 'icon', icon: Share07Icon, iconPlacement: 'left' },
  { key: 'export', label: 'Export posts', type: 'icon', icon: Download01Icon, iconPlacement: 'left' },
]
function onDetailMore(key) {
  if (key === 'refresh') refreshDetail()
  else if (key === 'copy') shareDetail()
  else if (key === 'export') exportDetail()
}

// HLSelect takes { label, value }; RANGES carries the sentence phrasing alongside.
const rangeOptions = computed(() => RANGES.map((r) => ({ label: r.label, value: r.key })))

// A description of what this is, not a count of how old the account is. The day count was
// mine — it existed to stop "Day 7" colliding with the old range pills, and those are gone.
// It also changed six ways, so the sentence explaining the product was never the same twice.
const subline = computed(() => simple.value
  ? (account.value.space ? 'See what people in your industry are talking about, and what to post next.' : '')
  : (account.value.space
    ? 'See what your industry is talking about, and what to post next.'
    : 'Pick a niche to see what your industry is talking about.'))

// How fresh the page is. There is no Refresh control beside it: nothing on this page is
// fetched, so a button could only rewrite this string.
const lastUpdated = ref('4 minutes ago')

// The day-7 connect nudge (1 Oct). It was a full-width alert above AI insights that couldn't
// be closed; Sujith found it intrusive. Now it points at the Connect socials button that was
// already here: a small popover the first time the page opens on day 7 or later, then a dot
// on the button until an account is connected. The copy only asks. What connecting adds is
// still open with Shivam, so nothing here promises it.
const needsConnect = computed(() =>
  state.day >= 7 && !!account.value.space && !account.value.connected && state.role !== 'viewer')
// The simplified design keeps only the dot.
const connectNudgeOpen = computed(() =>
  !simple.value && needsConnect.value && !state.connectNudgeClosed[state.accountId] && !state.modal && !state.analyzing)
function closeConnectNudge() { state.connectNudgeClosed[state.accountId] = true }
function openConnect() { closeConnectNudge(); state.modal = 'accounts' }

// One path for choosing a page tab. HLTabs only emits when the value changes, so a click on
// the tab you're already on (the way back from the triage view) is caught separately.
// 26 Oct: the Trends tab opens at the top of its list; links from the Overview cards set the source themselves.
function selectTab(k) { if (k === 'trends' && state.tab !== 'trends') state.trendsPeekSource = null; state.tab = k; state.view = 'dashboard'; closeDetail() }
function onPageTabClick(e) {
  const el = e.target.closest?.('[data-name]')
  if (el && el.dataset.name === state.tab) selectTab(state.tab)
}

const showTriage = computed(() => state.tab === 'overview' && state.view === 'triage' && !account.value.solo)
// Save snapshot is gone from the header at every day.

</script>

<template>
  <!-- Save snapshot was the only way in to ShareModal, and ShareModal was the only way in to
       the archive and the client's recipient view. With it gone all three are unreachable, so
       their mounts come out rather than sitting here as branches nothing can take. The
       components themselves are untouched on disk: restoring the flow is these five lines and
       a button. -->
  <AppShell
    sidebar="main-nav"
    :sidebar-props="{ navSections: NAV_SECTIONS, accountLabel: account.name, accountInitials: account.initials }"
    :topbar="detailShell ? 'simple' : 'tabbed'"
    :back-toolbar="detailShell?.backToolbar || null"
    :vertical-tabs="detailShell?.verticalTabs || null"
    :topbar-props="{
      title: 'Marketing',
      sectionTabs: SECTION_TABS,
      activeSection: 'Social planner',
      subTabs: SUB_TABS,
      activeSubTab: 'Social intelligence',
      onSubTabChange: () => {},
      onAskAI: () => { state.askAI = { prompt: '', topic: '' } },
      askAIActive: !!state.askAI,
    }"
  >
    <!-- The source filter, beside the term.
         HLPopover holding HLCheckbox rows rather than HLDropdown: this is a multi-select with
         a header, and a dropdown's option list can carry neither the checkboxes nor the
         Select all / Clear all row. -->
    <template v-if="detailShell && detailPlatforms.length" #back-filters>
      <HLPopover trigger="click" placement="bottom-start" :show-arrow="false">
        <template #trigger>
          <HLButton variant="secondary" size="sm" :aria-label="'Filter by source, currently ' + platformLabel">
            <!-- Stacked marks, overlapping, showing what is selected rather than what exists.
                 In the label rather than #iconLeft, which is sized for a single 16px glyph. -->
            <span class="flex items-center gap-2">
              <span v-if="platformStack.length" class="flex items-center -space-x-1" aria-hidden="true">
                <span
                  v-for="pf in platformStack" :key="pf.key"
                  class="size-5 rounded-full bg-white ring-2 ring-white flex items-center justify-center overflow-hidden"
                >
                  <component :is="NETWORK_ICONS[pf.key]" v-if="NETWORK_ICONS[pf.key]" class="w-full h-full" />
                </span>
              </span>
              <!-- Logos only below 1100px: the label is in the button's aria-label, and its ~95px is
                   what Save as topic needs at laptop widths. -->
              <span class="max-[1099px]:hidden">{{ platformLabel }}</span>
            </span>
            <template #iconRight><ChevronDownIcon /></template>
          </HLButton>
        </template>

        <!-- HighRise's popover draws the card (border, radius, shadow); this is only its content. -->
        <div class="w-68 flex flex-col px-3 py-2">
          <div class="flex items-center justify-between gap-2 pb-1">
            <HLText html-tag="span" size="md" weight="medium" class="text-gray-500">Platforms</HLText>
            <span class="flex items-center gap-1">
              <HLButton variant="text" color="blue" size="xs" :disabled="allPlatformsOn" @click="selectAllPlatforms">Select all</HLButton>
              <HLDivider vertical />
              <HLButton variant="text" color="blue" size="xs" :disabled="!selectedPlatforms.length" @click="clearPlatforms">Clear all</HLButton>
            </span>
          </div>
          <label
            v-for="pf in detailPlatforms" :key="pf.key"
            class="flex items-center gap-3 py-2 cursor-pointer"
          >
            <HLCheckbox
              :id="`sl-platform-${pf.key}`"
              :checked="isPlatformOn(pf.label)"
              @update:checked="(v) => togglePlatform(pf.label, v)"
            />
            <component :is="NETWORK_ICONS[pf.key]" v-if="NETWORK_ICONS[pf.key]" class="w-5 h-5 shrink-0" />
            <HLText html-tag="span" size="lg" class="text-gray-900">{{ pf.label }}</HLText>
          </label>
        </div>
      </HLPopover>
    </template>

    <template v-if="detailShell" #back-actions>
      <div class="flex items-center gap-2">
        <!-- HLSelect, not a hand-rolled listbox. The previous version carried its own
             open state, its own outside-click close, its own option roles and its own
             keyboard handling, all of which the component already does. -->
        <HLSelect
          v-model:value="state.range"
          :options="rangeOptions"
          :menu-props="{ class: 'range-select-menu' }"
          size="xs"
          class="sl-range-select"
        />

        <!-- The icon row. Every one of these is named to a screen reader, because an icon
             with no text is a guess for anyone who cannot see the glyph.
             Below 1200px Refresh, Copy link and Export fold into a ⋯ menu: with all three out the
             bar needed ~830px against 820 at 1100, so Save as topic ran off the edge and the
             term collapsed to nothing. -->
        <div class="min-[1200px]:hidden">
          <HLDropdown
            id="sl-detail-more"
            trigger="click"
            placement="bottom-end"
            :options="detailMoreOptions"
            :show-search="false"
            @select="onDetailMore"
          >
            <HLButton variant="secondary" size="sm" aria-label="More actions">
              <template #iconLeft><DotsHorizontalIcon /></template>
            </HLButton>
          </HLDropdown>
        </div>
        <div class="hidden min-[1200px]:flex items-center gap-2">
          <HLTooltip trigger="hover">
            <template #trigger>
              <HLButton variant="secondary" size="sm" :loading="refreshing" aria-label="Refresh" @click="refreshDetail">
                <template #iconLeft><RefreshCcw01Icon /></template>
              </HLButton>
            </template>
            Refresh
          </HLTooltip>

          <HLTooltip trigger="hover">
            <template #trigger>
              <HLButton variant="secondary" size="sm" aria-label="Copy link" @click="shareDetail">
                <template #iconLeft><Share07Icon /></template>
              </HLButton>
            </template>
            Copy link
          </HLTooltip>

          <HLTooltip trigger="hover">
            <template #trigger>
              <HLButton variant="secondary" size="sm" aria-label="Export posts as CSV" @click="exportDetail">
                <template #iconLeft><Download01Icon /></template>
              </HLButton>
            </template>
            Export posts
          </HLTooltip>
        </div>

        <!-- Alerts on this topic. The count is the badge, so the bell says whether anything
             is watching before you click it. -->
        <HLTooltip v-if="detail" trigger="hover">
          <template #trigger>
            <HLBadge id="sl-detail-alert-badge" :value="alertCount" :show="alertCount > 0" size="xs" :offset="[-2, 2]" class="sl-alert-badge">
              <HLButton variant="secondary" size="sm" :aria-label="alertCount ? 'Edit alert' : 'Create alert'" @click="alertForDetail">
                <template #iconLeft><BellRinging01Icon /></template>
              </HLButton>
            </HLBadge>
          </template>
          {{ alertCount ? 'Edit alert' : 'Create alert' }}
        </HLTooltip>

        <!-- Saved reads as a state, not a button you are meant to press again. Green on the
             success tint, which is why the disabled grey version went. -->
        <!-- A topic is saved by definition, so it wears the same state a saved search does.
             Only an unsaved search gets the action. -->
        <!-- WBR 12 Oct (1D, 2A): one verb, listening. The count is shown openly while the limit
             is not enforced in beta. -->
        <template v-if="simple && !detailTopic && !detailSaved">
          <HLText html-tag="span" size="md" class="text-gray-500 whitespace-nowrap">{{ savedCount }} of {{ TOPIC_SHOWN_LIMIT }} topics</HLText>
          <HLButton variant="primary" color="blue" size="sm" @click="saveSearchAsTopic">
            <template #iconLeft><Headphones01Icon /></template>
            Start listening
          </HLButton>
        </template>
        <HLButton v-else-if="!detailTopic && !detailSaved" variant="primary" color="blue" size="sm" @click="saveSearchAsTopic">
          <template #iconLeft><BookmarkIcon /></template>
          Save as topic
        </HLButton>
        <HLTag v-else id="sl-detail-saved" size="lg" color="success" :interactive="false">
          <span class="inline-flex items-center gap-1.5">
            <Headphones01Icon v-if="simple" class="w-3.5 h-3.5" />
            <BookmarkCheckIcon v-else class="w-3.5 h-3.5" />
            {{ simple ? 'Listening' : 'Saved' }}
          </span>
        </HLTag>
      </div>
    </template>

    <template v-if="!detailShell" #topbar-actions>
      <div class="flex items-center gap-2">
        <!-- The Refresh button is gone. Every figure on this page is derived from the term,
             the range and the niche — pressing it could only ever rewrite this label, which
             is the definition of a control that cannot do its job. The timestamp stays. -->
        <HLText html-tag="span" size="md" class="text-gray-500 whitespace-nowrap mr-2!">Updated {{ lastUpdated }}</HLText>
        <!-- No settings screen exists yet, so this is labelled but has nothing to open.
             15 Oct (audit 2): hidden in the one-page design until there is something to set. -->
        <HLTooltip v-if="!simple" trigger="hover">
          <template #trigger>
            <HLButton variant="secondary" size="sm" aria-label="Settings">
              <template #iconLeft><Settings01Icon /></template>
            </HLButton>
          </template>
          Settings
        </HLTooltip>
        <!-- No Ask AI button here. The shell's own Ask AI sits one row above this, about
             40px away — two buttons, same label, same destination. Same duplication as the
             second Create alert Sujith called out on the Mentions card. -->
        <HLPopover id="connect-nudge" trigger="manual" :show="connectNudgeOpen" placement="bottom-end">
          <template #trigger>
            <HLBadge :show="needsConnect" dot border color="blue" size="2xs" :offset="[-3, 3]">
              <HLButton variant="secondary" size="sm" @click="openConnect"><template #iconLeft><PlusIcon /></template>{{ simple ? 'Connect accounts' : 'Connect socials' }}</HLButton>
            </HLBadge>
          </template>
          <div class="w-[260px] p-4 flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <HLText size="lg" weight="semibold" class="text-gray-900">Connect your socials</HLText>
              <HLText size="md" class="text-gray-600">Add the accounts you post from.</HLText>
            </div>
            <div class="flex justify-end gap-2">
              <HLButton id="connect-nudge-later" variant="secondary" size="sm" @click="closeConnectNudge">Not now</HLButton>
              <HLButton id="connect-nudge-go" variant="primary" color="blue" size="sm" @click="openConnect">Connect</HLButton>
            </div>
          </div>
        </HLPopover>
      </div>
    </template>

    <!-- 23 Oct (Sujith, Shivam): no insights pop-up. A search or a topic opens one level in, as a
         full page, over whatever it was opened from; Back returns there. -->
    <TopicPanel v-if="simple && (state.peekTopic || state.peekSearch)" page />
    <!-- 19 Oct: Trending everywhere, one level in from the Overview. -->
    <Canvas v-else-if="simple && state.trendsPage" :level="2" title="Trending now" :on-back="() => (state.trendsPage = false)">
      <template #toolbar><HLText size="md" class="text-gray-500">Updated 2 hours ago</HLText></template>
      <TrendsPage />
    </Canvas>
    <!-- 19 Oct: Your topics, one level in from the Overview. -->
    <Canvas v-else-if="simple && state.topicsPage" :level="2" title="Your topics" :on-back="() => (state.topicsPage = false)">
      <template #toolbar>
        <HLTooltip v-if="(state.topicsByAccount[state.accountId] || []).length >= 50" trigger="hover" placement="bottom-end">
          <template #trigger><HLButton id="topics-page-create" variant="secondary" size="sm" disabled>Create a topic</HLButton></template>
          All 50 topics are in use. Stop listening to one to add another.
        </HLTooltip>
        <HLButton v-else id="topics-page-create" variant="secondary" size="sm" @click="state.modal = 'topic'">Create a topic</HLButton>
      </template>
      <YourTopicsPage />
    </Canvas>
    <!-- 19 Oct (option D): every topic in the industry, one level in from Industry trends. -->
    <Canvas v-else-if="simple && state.industryPage" :level="2" title="Industry trends" :on-back="() => (state.industryPage = false)">
      <template #toolbar>
        <HLButton id="industry-page-picker" variant="secondary" size="sm" @click="state.modal = 'space'">
          <template #iconLeft><Briefcase01Icon /></template>
          {{ account.space }}
          <!-- 21 Oct CTA audit: a picker trigger is icon + label + chevron, like Industry on the Overview. -->
          <template #iconRight><ChevronDownIcon /></template>
        </HLButton>
      </template>
      <IndustryTopicsPage />
    </Canvas>
    <Canvas v-else :level="1">
      <!-- Before TopicDetail, so the v-else below still pairs with TopicDetail. -->
      <TopicPanel v-if="simple && state.trendsPeek" />
      <TopicDetail v-if="detailShell" />

      <!-- The white frame keeps filling the window; only the content inside it stops
           growing. Past ~1,880px the extra space is the frame's own white, so the grey
           backdrop never widens — capping the frame itself is what Sujith ruled out.

           px-8 here is on top of Canvas's own px-8, giving the content a 64px gutter
           instead of 32 — the frame was holding its content almost edge to edge next to
           the rest of the product. Canvas is shell infrastructure shared with other pages,
           so the extra inset belongs here rather than in it.

           1504 = 1440 of content + the 64 this element's own padding takes up, so the cap
           still describes the content and not the box around it. max-w-376 is 1504px on
           Tailwind's spacing scale. -->
      <div v-else :class="['flex flex-col gap-6 max-w-376 mx-auto w-full px-8', simple ? 'sl-enter' : '']">

        <!-- 23 Oct (Sujith, Shivam): the page title and one-liner (21 Oct, 13 V2) sit above the tabs. -->
        <div v-if="simple" id="si-intro" class="flex flex-col gap-2">
          <HLText id="si-title" html-tag="h1" type="display" size="xs" weight="semibold" class="text-gray-900">Social intelligence</HLText>
          <HLText size="md" class="text-gray-600">See what people are saying about you, your competitors and your industry across social media.</HLText>
        </div>

        <!-- Page header -->
        <div v-if="!simple" class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2">
              <!-- 24px, the hero step, not 16. At 16 the page title was the same size as every card
                   heading on every tab, so nothing on screen said you were looking at a page rather
                   than a card. -->
              <HLText html-tag="h1" size="2xl" weight="semibold" class="text-gray-900">Social intelligence</HLText>
              <HLTag color="blue" size="sm" round :interactive="false">Beta</HLTag>
            </div>
            <!-- gray-600, not gray-400: this is the sentence explaining the product, and it was the
                 lightest text on the page. Supporting prose is gray-600 across the page now;
                 gray-500 is for metadata and captions, gray-400 for axis labels only. -->
            <HLText v-if="subline" size="md" class="text-gray-600 mt-0.5!">{{ subline }}</HLText>
          </div>

        </div>

        <!-- Page tabs. The account switcher is gone: Sujith asked for it out, since it
             implies multi-account functionality the PM never scoped. -->
        <div :class="simple ? '' : '-mt-1'" @click="onPageTabClick">
          <!-- Keyed on the design: HLTabs reads its tabs once, at mount. -->
          <HLTabs id="sl-page-tabs" :key="state.design" :value="state.tab" type="line" @update:value="selectTab">
            <HLTab v-for="t in pageTabs" :key="t.key" :name="t.key" :tab="t.soon ? soonTab(t.label) : t.label" :disabled="!!t.soon" />
          </HLTabs>
        </div>

        <!-- The simplified design fades between tabs; sl-none is an unstyled no-op. -->
        <Transition :name="viewTransition" mode="out-in">
        <div :key="state.analyzing ? 'analyzing' : showTriage ? 'triage' : state.tab">
        <AnalyzingOverlay v-if="state.analyzing" />
        <template v-else>
          <TriageTable v-if="showTriage" />
          <DashboardOverview v-else-if="state.tab === 'overview'" />
          <!-- TrendsTab used to hold the search box as well, behind a `mode` prop. Quick
               search is now its own screen — eight sections, four of them locked — so
               TrendsTab is back to being only the trending list. -->
          <InsightsTab v-else-if="state.tab === 'insights'" />
          <TrendsHome v-else-if="simple && state.tab === 'trends'" />
          <TrendsTab v-else-if="state.tab === 'trends'" />
          <ComingSoon v-else-if="state.tab === 'competitors'" />
        </template>
        </div>
        </Transition>

      </div>
    </Canvas>
  </AppShell>

  <DemoControls />

  <!-- Modals -->
  <SpacePickerModal v-if="state.modal === 'space'" />
  <ConnectSocialModal v-if="state.modal === 'connect'" />
  <ConnectedAccountsModal v-if="state.modal === 'accounts'" />
  <CompetitorModal v-if="state.modal === 'competitor'" />
  <!-- 19 Oct (Ayushi, after Sujit): Create a topic is the production two-step modal in both designs, so
       developers reuse it and it scales as more networks arrive. -->
  <CreateTopicModal v-if="state.modal === 'topic'" />
  <CreateAlertModal v-if="state.modal === 'alert'" />
  <StopListeningModal v-if="state.confirmStop" />
  <RenameTopicModal v-if="state.renaming" />
  <FacebookSourcesModal v-if="state.fbSources" />
  <RemoveTopicModal v-if="state.modal === 'removeTopic'" />

  <AskAIPanel v-if="state.askAI" />
</template>
