<script setup>
// Saved topics on the Insights landing, once there is at least one.
//
// Every figure comes from quickSearchResult, the same call the detail view makes, so a topic
// never reads one number here and another a click later. Nothing about a topic's numbers is
// stored on the topic.
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, h, resolveComponent } from 'vue'
import {
  PlusIcon, DotsVerticalIcon, SearchMdIcon, Grid01Icon, ListIcon, ChevronDownIcon, ChevronUpIcon,
  SwitchVertical01Icon, EyeIcon, Edit02Icon, Bell01Icon, BellRinging01Icon, PauseCircleIcon,
  PlayCircleIcon, Trash01Icon, ArrowUpIcon, ArrowDownIcon,
} from '@gohighlevel/ghl-icons/24/outline'
import { fmtNum, quickSearchResult, TOPIC_LIMIT } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'
import { NETWORK_ICONS } from './networkIcons.js'

// The table's cells are render functions (HLDataTable takes columns, not slots), so the HL
// components they use are resolved here rather than written as template tags.
const HLButton = resolveComponent('HLButton')
const HLDropdown = resolveComponent('HLDropdown')
const HLInput = resolveComponent('HLInput')
const HLTag = resolveComponent('HLTag')
const HLTooltip = resolveComponent('HLTooltip')
const HLText = resolveComponent('HLText')
const HLEllipsis = resolveComponent('HLEllipsis')

const { state, account, range, openTopic, renameTopic, togglePause, runSearch, simple } = useSocialListening()

const raw = computed(() => state.topicsByAccount[account.value.id] || [])

// 7 Oct review, 3C: a topic made a moment ago arrives in the list tinted blue, then settles.
// Keyed on its creation time, and only for a few seconds, so a later re-sort doesn't replay it.
const freshAt = ref(null)
let freshTimer = 0
function markFresh() {
  const t = raw.value.find((x) => x.createdAt && Date.now() - x.createdAt < 3000)
  if (!t) return
  freshAt.value = t.createdAt
  clearTimeout(freshTimer)
  freshTimer = setTimeout(() => { freshAt.value = null }, 3000)
}
watch(() => raw.value.length, markFresh, { immediate: true })
onBeforeUnmount(() => clearTimeout(freshTimer))

const rows = computed(() => raw.value.map((t) => {
  const r = t.collecting ? null : quickSearchResult(t.term || t.title, state.range, account.value.space)
  const live = r && !r.empty
  return {
    ...t,
    mentions: live ? r.mentions : 0,
    delta: live ? r.delta : 0,
    pos: live ? r.pos : 0, neu: live ? r.neu : 0, neg: live ? r.neg : 0, net: live ? r.net : 0,
    platform: live && r.platforms[0] ? r.platforms[0] : null,
    engagement: live ? r.engagement.total : 0,
    niche: live && r.niche ? r.niche : null,
    live,
  }
}))

// ---- stats row: every saved topic added together ----
const totals = computed(() => {
  const live = rows.value.filter((t) => t.live)
  const m = live.reduce((n, t) => n + t.mentions, 0)
  const part = (k) => live.reduce((n, t) => n + Math.round(t.mentions * t[k] / 100), 0)
  const w = (k) => (m ? live.reduce((n, t) => n + t[k] * t.mentions, 0) / m : 0)
  const niche = live.find((t) => t.niche)?.niche || null
  return { m, pos: part('pos'), neu: part('neu'), neg: part('neg'), delta: +w('delta').toFixed(1), net: Math.round(w('net')), niche }
})
const pct = (n) => (totals.value.m ? Math.round((n / totals.value.m) * 100) : 0)

// Net sentiment is a signed score out of 100, written the same way everywhere in this file:
// sign-aware and without a unit. The stats row said "+56 pts" while the cards said "+58"
// and the niche line hard-coded its "+".
const signed = (n) => (n > 0 ? `+${n}` : String(n))

// One delta pattern: arrow icon plus the absolute value, coloured by direction. A change of
// exactly zero is neither, so it gets no arrow and no colour.
function Delta(props) {
  const d = props.value
  const size = props.size || 'md'
  if (!d) return h(HLText, { htmlTag: 'span', size, class: 'text-gray-500 tabular-nums' }, () => '0%')
  const up = d > 0
  return h(HLText, { htmlTag: 'span', size, class: ['inline-flex items-center gap-0.5 tabular-nums', up ? 'text-positive-strong' : 'text-negative-strong'] }, () => [
    h(up ? ArrowUpIcon : ArrowDownIcon, { class: 'w-3.5 h-3.5 shrink-0', 'aria-hidden': 'true' }),
    h('span', { class: 'sr-only' }, up ? 'Up ' : 'Down '),
    `${Math.abs(d)}%`,
  ])
}
Delta.props = ['value', 'size']

const atLimit = computed(() => TOPIC_LIMIT != null && raw.value.length >= TOPIC_LIMIT)

// ---- filter, sort, page ----
const filter = ref('')
// 14 Oct (7B): the simplified design opens on the card grid.
const view = ref(simple.value ? 'grid' : 'list')
const sortKey = ref('mentions')
const sortDir = ref('desc')
function sortBy(k) {
  if (sortKey.value === k) sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
  else { sortKey.value = k; sortDir.value = k === 'title' ? 'asc' : 'desc' }
}
const filtered = computed(() => {
  const q = filter.value.trim().toLowerCase()
  if (!q) return rows.value
  return rows.value.filter((t) => t.title.toLowerCase().includes(q) || (t.keywords || []).some((k) => k.toLowerCase().includes(q)))
})
const sorted = computed(() => {
  const dir = sortDir.value === 'asc' ? 1 : -1
  const k = sortKey.value
  return filtered.value.slice().sort((a, b) => (k === 'title' ? a.title.localeCompare(b.title) : a[k] - b[k]) * dir)
})
const PAGE = 15
const page = ref(1)
const pages = computed(() => Math.max(1, Math.ceil(sorted.value.length / PAGE)))
const shown = computed(() => sorted.value.slice((page.value - 1) * PAGE, page.value * PAGE))
watch([filter, sortKey, sortDir], () => { page.value = 1 })
watch(pages, (n) => { if (page.value > n) page.value = n })

// A short first-load beat, so the skeleton has a real moment to exist in.
const loading = ref(true)
let loadTimer = null
onMounted(() => { loadTimer = setTimeout(() => { loading.value = false }, 450) })
onBeforeUnmount(() => clearTimeout(loadTimer))

// Networks and keywords follow one rule in both views: the first few, then "+N" for the rest.
// The grid showed three networks with no count while the list showed four and a count.
const NETS_SHOWN = 3
const KEYWORDS_SHOWN = 2

// ---- row menu (HLDropdown) ----
function menuOptions(t) {
  return [
    { key: 'open', label: 'Open topic', type: 'icon', icon: EyeIcon, iconPlacement: 'left' },
    { key: 'rename', label: 'Rename', type: 'icon', icon: Edit02Icon, iconPlacement: 'left' },
    { key: 'alert', label: t.alert ? 'Edit alert' : 'Create alert', type: 'icon', icon: Bell01Icon, iconPlacement: 'left' },
    { key: 'pause', label: t.paused ? 'Resume listening' : 'Pause listening', type: 'icon', icon: t.paused ? PlayCircleIcon : PauseCircleIcon, iconPlacement: 'left' },
    { key: 'd', type: 'divider' },
    { key: 'remove', label: 'Remove topic', type: 'icon', icon: Trash01Icon, iconPlacement: 'left', class: 'sl-danger-option' },
  ]
}
function onMenu(key, t) {
  if (key === 'open') open(t)
  if (key === 'rename') startRename(t)
  if (key === 'alert') alertFor(t)
  if (key === 'pause') togglePause(t.title)
  if (key === 'remove') removeFor(t)
}

function open(t) {
  if (renaming.value === t.title) return
  // WBR 12 Oct (5B): the simplified design opens a saved topic in the side panel.
  if (simple.value) { state.peekTopic = t.title; return }
  openTopic(t.title)
}
function alertFor(t) {
  state.alertTopic = t.title
  state.modal = 'alert'
}
function removeFor(t) {
  state.removeTopicTitle = t.title
  state.modal = 'removeTopic'
}

// ---- rename in place ----
const renaming = ref(null)
const draft = ref('')
function startRename(t) {
  renaming.value = t.title
  draft.value = t.title
  view.value = 'list'
  nextTick(() => {
    const el = document.querySelector(`[id="rename-${CSS.escape(t.title)}"] input, input[id="rename-${CSS.escape(t.title)}"]`)
    el?.focus()
    el?.select()
  })
}
function commitRename() {
  if (renaming.value) renameTopic(renaming.value, draft.value)
  renaming.value = null
}
// The Save-as-topic toast offers Rename. Watched, because this list is usually already on
// screen when the request arrives.
function takeRenameRequest() {
  if (!state.renameRequest) return
  const t = raw.value.find((x) => x.title === state.renameRequest)
  state.renameRequest = null
  if (t) startRename(t)
}
watch(() => state.renameRequest, takeRenameRequest)
onMounted(takeRenameRequest)

// ---- list view: the HighRise data table ----
// Sorting stays ours (the table gets rows already sorted and paged). Headers are HighRise's
// own; a sortable one carries an icon-only ghost button that shows the current order and is
// the keyboard route, and a click anywhere on the header cell sorts too (column-clicked).
const SORTABLE = ['title', 'mentions', 'delta']
function sortButton(k, label) {
  // A functional component, so the table re-renders it when the sort changes.
  return () => {
    const active = sortKey.value === k
    const icon = !active ? SwitchVertical01Icon : sortDir.value === 'asc' ? ChevronUpIcon : ChevronDownIcon
    const tip = active ? `Sorted ${sortDir.value === 'asc' ? 'ascending' : 'descending'}` : 'Sort'
    // Wrapped in a span: the table puts v-show on this, which needs an element root.
    return h('span', { class: 'inline-flex -my-0.5' }, [h(HLTooltip, { trigger: 'hover' }, {
      trigger: () => h(HLButton, {
        variant: 'ghost', size: '3xs',
        'aria-label': active ? `${label()}, ${tip.toLowerCase()}` : `Sort by ${label()}`,
        onClick: (e) => { e.stopPropagation(); sortBy(k) },
      }, { iconLeft: () => h(icon, { class: active ? 'text-primary-600' : 'text-gray-400' }) }),
      default: () => tip,
    })])
  }
}
function onHeaderClick(id) { if (SORTABLE.includes(id)) sortBy(id) }
// Follows the header's range control rather than always saying 7 days.
const mentionsLabel = () => `${range.value.days}-day mentions`
const stop = (e) => e.stopPropagation()

function kebab(t) {
  return h('div', { class: 'flex justify-end w-full', onClick: stop }, [
    h(HLDropdown, {
      options: menuOptions(t), placement: 'bottom-end', trigger: 'click', width: 216, showSearch: false,
      onSelect: (k) => onMenu(k, t),
    }, {
      // The span gives the dropdown a plain element to anchor on, with the tooltip inside it.
      default: () => h('span', { class: 'inline-flex' }, [
        h(HLTooltip, { trigger: 'hover' }, {
          trigger: () => h(HLButton, { variant: 'ghost', size: 'xs', 'aria-label': `Actions for ${t.title}` }, { iconLeft: () => h(DotsVerticalIcon) }),
          default: () => 'Actions',
        }),
      ]),
    }),
  ])
}

const baseColumns = [
  {
    id: 'title', size: 19, minSize: 160, meta: { headerAlign: 'start' },
    header: { text: 'Topic', filterComponent: sortButton('title', () => 'Topic') },
    cellFormatter: ({ row }) => {
      const t = row.original
      if (renaming.value === t.title) {
        return h('div', { class: 'w-full', onClick: stop }, [
          h(HLInput, {
            id: `rename-${t.title}`, modelValue: draft.value, 'onUpdate:modelValue': (v) => { draft.value = v },
            size: 'xs', autofocus: true, placeholder: 'Topic name',
            onKeydown: (e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') renaming.value = null },
            onBlur: commitRename,
          }),
          h(HLText, { size: 'md', class: 'text-gray-500 mt-0.5! whitespace-nowrap' }, () => 'Enter to save'),
        ])
      }
      // A long name ellipsises with its full text in a tooltip (Sujeet).
      return h(HLText, { htmlTag: 'span', size: 'lg', weight: 'medium', class: ['flex items-center gap-1.5 min-w-0 w-full', t.paused ? 'text-gray-500' : 'text-gray-900', freshAt.value && t.createdAt === freshAt.value ? 'sl-row-new' : ''] }, () => [
        h('span', { class: 'min-w-0 flex-1' }, [h(HLEllipsis, { tooltipVariant: 'dark' }, () => t.title)]),
        t.alert ? h(BellRinging01Icon, { class: 'w-3.5 h-3.5 text-primary-600 shrink-0', 'aria-label': 'Alert on' }) : null,
      ])
    },
  },
  {
    id: 'nets', size: 10, minSize: 104, meta: { headerAlign: 'start' }, header: 'Networks',
    cellFormatter: ({ row }) => {
      const nets = row.original.nets.filter((n) => NETWORK_ICONS[n])
      return h('span', { class: 'flex items-center gap-1.5' }, [
        ...nets.slice(0, NETS_SHOWN).map((n) => h(NETWORK_ICONS[n], { key: n, class: 'w-5 h-5 shrink-0' })),
        nets.length > NETS_SHOWN ? h(HLText, { htmlTag: 'span', size: 'md', class: 'text-gray-500 tabular-nums' }, () => `+${nets.length - NETS_SHOWN}`) : null,
      ])
    },
  },
  {
    id: 'keywords', size: 19, minSize: 180, meta: { headerAlign: 'start' }, header: 'Keywords',
    cellFormatter: ({ row }) => {
      const k = row.original.keywords || []
      return h('span', { class: 'flex items-center gap-1 min-w-0 overflow-hidden' }, [
        ...k.slice(0, KEYWORDS_SHOWN).map((w) => h(HLTag, { key: w, size: 'sm', color: 'blue', truncate: true, maxWidth: 88, interactive: false }, () => w)),
        k.length > KEYWORDS_SHOWN ? h(HLText, { htmlTag: 'span', size: 'md', class: 'text-gray-500 tabular-nums' }, () => `+${k.length - KEYWORDS_SHOWN}`) : null,
      ])
    },
  },
  {
    id: 'by', size: 12, minSize: 120, meta: { headerAlign: 'start' }, header: 'Created by',
    cellFormatter: ({ row }) => h(HLText, { htmlTag: 'span', size: 'lg', class: 'text-gray-600 truncate' }, () => row.original.by),
  },
  {
    id: 'created', size: 9, minSize: 84, meta: { headerAlign: 'start' }, header: 'Created',
    cellFormatter: ({ row }) => h(HLText, { htmlTag: 'span', size: 'lg', class: 'text-gray-500' }, () => row.original.created || '–'),
  },
  {
    id: 'mentions', size: 15, minSize: 168, meta: { headerAlign: 'end' },
    // A getter: the table reads the text at render time, so it follows the range.
    header: { get text() { return mentionsLabel() }, filterComponent: sortButton('mentions', mentionsLabel) },
    cellFormatter: ({ row }) => (row.original.live ? h(HLText, { htmlTag: 'span', size: 'lg', weight: 'medium', class: 'block w-full text-gray-900 tabular-nums text-right' }, () => fmtNum(row.original.mentions)) : collectingCell()),
  },
  {
    id: 'delta', size: 11, minSize: 112,
    meta: { headerAlign: 'end' },
    header: { text: 'Change', filterComponent: sortButton('delta', () => 'Change') },
    cellFormatter: ({ row }) => {
      const t = row.original
      return h('span', { class: 'flex w-full justify-end' }, [
        !t.live ? h(HLText, { htmlTag: 'span', size: 'lg', class: 'text-gray-400' }, () => '–')
          : t.paused ? h(HLTag, { size: 'sm', color: 'gray', interactive: false }, () => 'Paused')
            : h(Delta, { value: t.delta, size: 'lg' }),
      ])
    },
  },
  {
    id: 'actions', size: 5, minSize: 56,
    header: () => h('span', { class: 'sr-only' }, 'Actions'),
    cellFormatter: ({ row }) => kebab(row.original),
  },
]
// Still collecting (7 Oct review, 3C): a small moving bar in place of a dash. Rows are 48px, so
// it stays one line; when the first numbers land is on hover (and in the toast).
function collectingCell() {
  return h('span', { class: 'flex justify-end w-full' }, [h(HLTooltip, { trigger: 'hover' }, {
    trigger: () => h('span', { class: 'inline-flex items-center gap-2', role: 'status' }, [
      h('span', { class: 'sl-eq', 'aria-hidden': 'true' }, [h('i'), h('i'), h('i')]),
      h(HLText, { htmlTag: 'span', size: 'md', weight: 'semibold', class: 'text-primary-600' }, () => 'Collecting'),
    ]),
    default: () => h(HLText, { htmlTag: 'span', size: 'sm' }, () => 'First data in about an hour'),
  })])
}

// A cell with a formatter loses the table's own plain-text cell, so this is that cell rebuilt
// (HighRise 4.8.5: an inline-flex row holding a medium lg HLText around HLEllipsis).
function plainCell(text) {
  return h('div', { class: 'inline-flex items-center flex-nowrap gap-1 overflow-hidden', style: { justifyContent: 'end' } }, [
    h(HLText, { style: { flex: '1', minWidth: '0' }, weight: 'medium', size: 'lg' }, () => h(HLEllipsis, {}, () => text)),
  ])
}

// Simplified: plain-text columns hand the table a value instead of a cell, so it draws them
// in its own type. A topic still collecting has no value yet, so it gets the collecting cell.
const PLAIN = {
  by: { accessorFn: (t) => t.by || '–' },
  created: { accessorFn: (t) => t.created || '–' },
  mentions: {
    accessorFn: (t) => (t.live ? fmtNum(t.mentions) : '–'), meta: { headerAlign: 'end', align: 'end' },
    cellFormatter: ({ row, getValue }) => (row.original.live ? plainCell(getValue()) : collectingCell()),
  },
}
const plainColumns = baseColumns.map((c) => {
  if (!PLAIN[c.id]) return c
  const { cellFormatter, ...rest } = c
  return { ...rest, ...PLAIN[c.id] }
})
const columns = plainColumns
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-start gap-4">
      <div class="flex-1 min-w-0">
        <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">{{ raw.length }} {{ raw.length === 1 ? 'topic' : 'topics' }} we're listening to</HLText>
        <HLText size="md" class="text-gray-500 mt-0.5!">Updated every 6 hours · {{ range.short }}</HLText>
      </div>
      <HLText v-if="TOPIC_LIMIT != null" html-tag="span" size="md" class="text-gray-500 self-center">
        <b class="font-medium text-gray-900 tabular-nums">{{ raw.length }} of {{ TOPIC_LIMIT }}</b> topics
      </HLText>
      <HLTooltip trigger="hover" :disabled="!atLimit">
        <template #trigger>
          <span>
            <HLButton variant="secondary" size="xs" :disabled="atLimit" @click="state.modal = 'topic'">
              <template #iconLeft><PlusIcon /></template>
              Create topic
            </HLButton>
          </span>
        </template>
        You're tracking {{ TOPIC_LIMIT }} of {{ TOPIC_LIMIT }} topics. Remove or pause one to add another.
      </HLTooltip>
    </div>

    <!-- Stats row: all topics added together. Share of mentions under each sentiment rather
         than a per-sentiment change, because no per-sentiment history exists to compare to.
         Hand-built rather than HLStatistic: HLStatistic is a free-standing shadowed card with a
         display-size figure and its trend on the right, and five of them do not make this one
         divided row. -->
    <div v-if="loading" class="grid grid-cols-5 border border-gray-200 rounded-xl overflow-hidden bg-white" aria-busy="true">
      <div v-for="n in 5" :key="n" class="px-5 py-4 border-r border-gray-200 last:border-r-0 flex flex-col gap-3">
        <HLSkeleton :id="`topics-stat-skeleton-${n}`" :width="96" :height="12" />
        <HLSkeleton :id="`topics-stat-skeleton-fig-${n}`" :width="64" :height="24" />
        <HLSkeleton :id="`topics-stat-skeleton-sub-${n}`" :width="80" :height="12" />
      </div>
    </div>
    <div v-else class="grid grid-cols-5 border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div class="px-5 py-4 border-r border-gray-200">
        <HLText size="md" class="text-gray-600">Total mentions</HLText>
        <HLText size="2xl" weight="semibold" class="text-gray-900 tabular-nums mt-0.5!">{{ fmtNum(totals.m) }}</HLText>
        <HLText size="md" class="text-gray-500 flex items-center gap-1"><Delta :value="totals.delta" /> vs previous {{ range.days }} days</HLText>
      </div>
      <div class="px-5 py-4 border-r border-gray-200">
        <HLText size="md" class="text-gray-600">Positive</HLText>
        <HLText size="2xl" weight="semibold" class="text-gray-900 tabular-nums mt-0.5!">{{ fmtNum(totals.pos) }}</HLText>
        <HLText size="md" class="text-gray-500">{{ pct(totals.pos) }}% of mentions</HLText>
      </div>
      <div class="px-5 py-4 border-r border-gray-200">
        <HLText size="md" class="text-gray-600">Neutral</HLText>
        <HLText size="2xl" weight="semibold" class="text-gray-900 tabular-nums mt-0.5!">{{ fmtNum(totals.neu) }}</HLText>
        <HLText size="md" class="text-gray-500">{{ pct(totals.neu) }}% of mentions</HLText>
      </div>
      <div class="px-5 py-4 border-r border-gray-200">
        <HLText size="md" class="text-gray-600">Negative</HLText>
        <HLText size="2xl" weight="semibold" class="text-gray-900 tabular-nums mt-0.5!">{{ fmtNum(totals.neg) }}</HLText>
        <HLText size="md" class="text-gray-500">{{ pct(totals.neg) }}% of mentions</HLText>
      </div>
      <div class="px-5 py-4">
        <HLText size="md" class="text-gray-600">Net sentiment</HLText>
        <HLText size="2xl" weight="semibold" class="text-gray-900 tabular-nums mt-0.5!">{{ signed(totals.net) }}</HLText>
        <HLText size="md" class="text-gray-500">{{ totals.niche ? `Your niche sits at ${signed(totals.niche.sentiment)}` : 'Out of 100' }}</HLText>
      </div>
    </div>

    <!-- Tools -->
    <div class="flex items-center gap-3">
      <HLText size="md" class="text-gray-500 flex-1">{{ filtered.length }} of {{ raw.length }} topics</HLText>
      <HLRadioGroup id="topics-view" :value="view" size="xs" @update:value="(v) => (view = v)">
        <HLTooltip trigger="hover">
          <template #trigger>
            <HLContentSwitcher id="topics-view-grid" value="grid" only-icon aria-label="Grid view">
              <template #icon><Grid01Icon /></template>
            </HLContentSwitcher>
          </template>
          Grid view
        </HLTooltip>
        <HLTooltip trigger="hover">
          <template #trigger>
            <HLContentSwitcher id="topics-view-list" value="list" only-icon aria-label="List view">
              <template #icon><ListIcon /></template>
            </HLContentSwitcher>
          </template>
          List view
        </HLTooltip>
      </HLRadioGroup>
      <div class="w-60">
        <HLInput id="topics-filter" v-model="filter" size="xs" clearable placeholder="Filter topics">
          <template #prefix><SearchMdIcon class="w-4 h-4 text-gray-400" /></template>
        </HLInput>
      </div>
    </div>

    <!-- No match. In list view it shows inside the table instead. -->
    <div v-if="!loading && !filtered.length && view !== 'list'" class="sl-empty border border-gray-200 rounded-xl px-6 py-6 bg-white flex justify-center">
      <HLEmpty
        id="topics-no-match" size="sm" icon="default"
        :title="`No saved topics match “${filter.trim()}”`"
        description="Try a different word, or search for it to see what people are saying."
      >
        <template #actions>
          <div class="flex justify-center gap-2.5">
            <HLButton variant="secondary" size="xs" @click="filter = ''">Clear filter</HLButton>
            <HLButton variant="primary" color="blue" size="xs" @click="runSearch(filter)">
              <template #iconLeft><SearchMdIcon /></template>
              Search “{{ filter.trim() }}”
            </HLButton>
          </div>
        </template>
      </HLEmpty>
    </div>

    <!-- Grid: the topic cards -->
    <div v-else-if="view === 'grid' && !loading" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="t in shown" :key="t.title" role="button" tabindex="0"
        :aria-label="`Open ${t.title}`" @click="open(t)" @keydown.enter.self="open(t)"
        class="border border-gray-200 rounded-xl p-5 flex flex-col gap-3.5 bg-white cursor-pointer hover:border-gray-300 hover:shadow-(--shadow-xs) transition focus-visible:outline-2 focus-visible:outline-primary-600"
      >
        <div class="flex items-start gap-2.5">
          <div class="flex-1 min-w-0">
            <HLText size="2xl" weight="semibold" class="text-gray-900 flex items-center gap-1.5 min-w-0">
              <span class="truncate">{{ t.title }}</span>
              <BellRinging01Icon v-if="t.alert" class="w-3.5 h-3.5 text-primary-600 shrink-0" aria-label="Alert on" />
            </HLText>
            <div class="flex flex-wrap items-center gap-1 mt-1.5">
              <HLTag v-for="k in (t.keywords || []).slice(0, KEYWORDS_SHOWN)" :key="k" size="sm" color="blue" :interactive="false">{{ k }}</HLTag>
              <HLText v-if="(t.keywords || []).length > KEYWORDS_SHOWN" html-tag="span" size="md" class="text-gray-500 tabular-nums">+{{ t.keywords.length - KEYWORDS_SHOWN }}</HLText>
            </div>
          </div>
          <span class="flex items-center gap-1">
            <component :is="NETWORK_ICONS[n]" v-for="n in t.nets.filter((x) => NETWORK_ICONS[x]).slice(0, NETS_SHOWN)" :key="n" class="w-5 h-5" />
            <HLText v-if="t.nets.filter((x) => NETWORK_ICONS[x]).length > NETS_SHOWN" html-tag="span" size="md" class="text-gray-500 tabular-nums">+{{ t.nets.filter((x) => NETWORK_ICONS[x]).length - NETS_SHOWN }}</HLText>
          </span>
          <div class="-mr-1" @click.stop @keydown.enter.stop>
            <HLDropdown :options="menuOptions(t)" placement="bottom-end" trigger="click" :width="216" :show-search="false" @select="(k) => onMenu(k, t)">
              <span class="inline-flex">
                <HLTooltip trigger="hover">
                  <template #trigger>
                    <HLButton variant="ghost" size="xs" :aria-label="`Actions for ${t.title}`">
                      <template #iconLeft><DotsVerticalIcon /></template>
                    </HLButton>
                  </template>
                  Actions
                </HLTooltip>
              </span>
            </HLDropdown>
          </div>
        </div>
        <template v-if="t.live">
          <div>
            <p class="flex items-center gap-2">
              <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900 tabular-nums">{{ fmtNum(t.mentions) }}</HLText>
              <Delta :value="t.delta" />
              <HLTag v-if="t.paused" size="sm" color="gray" :interactive="false">Paused</HLTag>
            </p>
            <HLText size="md" class="text-gray-500 mt-1!">mentions · {{ range.short }}</HLText>
          </div>
          <HLTooltip trigger="hover">
            <template #trigger>
              <div class="flex h-2 rounded-full overflow-hidden gap-0.5" role="img" :aria-label="`${t.pos}% positive, ${t.neu}% neutral, ${t.neg}% negative`">
                <span class="bg-positive" :style="{ width: t.pos + '%' }" />
                <span class="bg-gray-300" :style="{ width: t.neu + '%' }" />
                <span class="bg-negative" :style="{ width: t.neg + '%' }" />
              </div>
            </template>
            {{ t.pos }}% positive, {{ t.neu }}% neutral, {{ t.neg }}% negative
          </HLTooltip>
          <div class="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-gray-200 pt-3.5">
            <div><HLText size="md" class="text-gray-500">Net sentiment</HLText><HLText size="lg" weight="medium" class="text-gray-900 tabular-nums">{{ signed(t.net) }}</HLText></div>
            <div><HLText size="md" class="text-gray-500">Top platform</HLText><HLText size="lg" weight="medium" class="text-gray-900">{{ t.platform ? `${t.platform.label} · ${t.platform.value}%` : '–' }}</HLText></div>
            <div><HLText size="md" class="text-gray-500">Engagements</HLText><HLText size="lg" weight="medium" class="text-gray-900 tabular-nums">{{ fmtNum(t.engagement) }}</HLText></div>
            <div><HLText size="md" class="text-gray-500">Share of niche</HLText><HLText size="lg" weight="medium" class="text-gray-900 tabular-nums">{{ t.niche ? t.niche.sharePct + '%' : '–' }}</HLText></div>
          </div>
        </template>
        <template v-else>
          <div><HLTag size="sm" color="warning" :interactive="false">Collecting</HLTag></div>
          <HLText size="md" class="text-gray-500 border-t border-gray-200 pt-3.5">Collecting the first mentions. This usually takes about an hour.</HLText>
        </template>
      </div>
    </div>

    <!-- List: the HighRise data table. Rows are pre-sorted and pre-paged here, so the table
         only renders; clicking a row opens the topic, and the kebab stops that click. -->
    <div v-else>
      <HLDataTableWrapper id="topics-table-wrap" responsive-column-width max-width="100%">
        <HLDataTable
          id="topics-table"
          :data="shown"
          :columns="columns"
          :loading="loading ? { status: true, skeletonRows: Math.min(3, raw.length || 3) } : false"
          :page-size="PAGE"
          :row-height="'48px'"
          max-height="none"
          row-clickable
          :vertical-borders="false"
          :column-hover="false"
          :column-resizing="false"
          :column-reordering="false"
          @table-row-clicked="(t) => open(t)"
          @update:column-clicked="onHeaderClick"
        >
          <template #no-data>
            <div class="flex justify-center py-6">
              <HLEmpty
                id="topics-no-match-table" size="sm" icon="default"
                :title="`No saved topics match “${filter.trim()}”`"
                description="Try a different word, or search for it to see what people are saying."
              >
                <template #actions>
                  <div class="flex justify-center gap-2.5">
                    <HLButton variant="secondary" size="xs" @click="filter = ''">Clear filter</HLButton>
                    <HLButton variant="primary" color="blue" size="xs" @click="runSearch(filter)">
                      <template #iconLeft><SearchMdIcon /></template>
                      Search “{{ filter.trim() }}”
                    </HLButton>
                  </div>
                </template>
              </HLEmpty>
            </div>
          </template>
        </HLDataTable>
      </HLDataTableWrapper>
    </div>

    <!-- Pagination: only once there is more than a page -->
    <div v-if="!loading && sorted.length > PAGE" class="flex justify-end">
      <HLPagination
        id="topics-pagination" size="md" :current-page="page" :item-count="sorted.length" :per-page="PAGE"
        :pages-to-display="5" :show-per-page-drop-down="false" show-current-range
        @update:page="(n) => (page = n)"
      />
    </div>
  </div>
</template>
