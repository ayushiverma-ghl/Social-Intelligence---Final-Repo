<script setup>
import { computed, h, resolveComponent } from 'vue'
import { ACCOUNTS, fmtNum } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'

// Cells are render functions (HLDataTable takes columns, not slots), so the HL components
// they use are resolved here rather than written as template tags.
const HLButton = resolveComponent('HLButton')
const HLCheckbox = resolveComponent('HLCheckbox')
const HLAvatar = resolveComponent('HLAvatar')
const HLTag = resolveComponent('HLTag')
const HLText = resolveComponent('HLText')

const { state, acct, selectAccount, toast, simple } = useSocialListening()

// Status is an HLTag with its label, so it never rests on colour alone. The dot used to be
// built with statusClass.replace('text-', 'bg-'), a class Tailwind never saw and so never
// generated.
const STATUS = {
  setup: { label: 'Setting up', color: 'warning' },
  reconnect: { label: 'Reconnect', color: 'error' },
  new: { label: 'New', color: 'primary' },
  quiet: { label: 'Quiet', color: 'gray' },
}

const rows = computed(() => {
  let list = ACCOUNTS.map((a) => {
    const full = acct(a.id)
    const seed = full.id.charCodeAt(0) + full.id.length
    const flagged = state.quietWeek ? false : (!full.space ? true : seed % 2 === 1)
    let status, change
    if (!full.space) { status = 'setup'; change = 'No niche picked yet' }
    else if (full.stale) { status = 'reconnect'; change = 'Social connection expired. Mentions have stopped.' }
    else if (flagged) { status = 'new'; change = full.connected ? 'Mentions up. Something is driving it.' : 'Trends moved. No social account connected yet.' }
    else { status = 'quiet'; change = 'Nothing new since your last visit' }
    const volume = full.space && full.connected ? 820 + seed * 14 : null
    return { ...full, status, change, flagged, volume }
  })

  const q = state.triageQuery.toLowerCase()
  if (q) list = list.filter((r) => r.name.toLowerCase().includes(q))
  if (state.triageFilter === 'flagged') list = list.filter((r) => r.flagged)
  if (state.triageFilter === 'setup') list = list.filter((r) => !r.space || r.stale)
  list.sort((a, b) => Number(b.flagged) - Number(a.flagged))
  return list
})

const total = ACCOUNTS.length
const flaggedCount = computed(() => ACCOUNTS.filter((a) => { const f = acct(a.id); return !f.space || (f.id.charCodeAt(0) + f.id.length) % 2 === 1 }).length)
const allQuiet = computed(() => state.quietWeek && !state.triageQuery && state.triageFilter === 'all')

const bulkCount = computed(() => state.bulk.length)
const allSelected = computed(() => rows.value.length > 0 && rows.value.every((r) => state.bulk.includes(r.id)))
const someSelected = computed(() => !allSelected.value && rows.value.some((r) => state.bulk.includes(r.id)))
function toggleBulk(id) {
  const i = state.bulk.indexOf(id)
  if (i > -1) state.bulk.splice(i, 1)
  else state.bulk.push(id)
}
function toggleAll() {
  state.bulk = allSelected.value ? [] : rows.value.map((r) => r.id)
}
function markReviewed() {
  if (simple.value) toast(`Marked ${state.bulk.length} accounts as reviewed`)
  else toast(state.bulk.length + ' accounts marked reviewed', 'They drop out of the Changed filter until something moves again.')
  state.bulk = []
}

const FILTERS = [
  { key: 'all', label: `All ${total}` },
  { key: 'flagged', label: 'Changed' },
  { key: 'setup', label: 'Needs attention' },
]

const columns = [
  {
    id: 'select', size: 5, minSize: 48,
    header: () => h(HLCheckbox, {
      id: 'triage-select-all', size: 'sm', checked: allSelected.value, indeterminate: someSelected.value,
      'aria-label': allSelected.value ? 'Clear selection' : 'Select all accounts',
      'onUpdate:checked': toggleAll,
    }),
    cellFormatter: ({ row }) => h(HLCheckbox, {
      id: `triage-select-${row.original.id}`, size: 'sm', checked: state.bulk.includes(row.original.id),
      'aria-label': `Select ${row.original.name}`,
      'onUpdate:checked': () => toggleBulk(row.original.id),
    }),
  },
  {
    id: 'client', size: 30, minSize: 220, header: 'Client', meta: { headerAlign: 'start' },
    cellFormatter: ({ row }) => h('span', { class: 'flex items-center gap-2 min-w-0' }, [
      // HighRise picks the avatar colour from the name, with initials it has contrast-checked.
      // The account tints (TINT_CLASSES) are dark fills meant for white initials; HLAvatar's
      // initials are dark, so passing them made the initials unreadable.
      // HLAvatar derives initials from `name` (first letter of the first and last word), which
      // would turn ProFix Plumbing into "PP"; the account's own initials go in spaced so it
      // prints them as-is. Decorative: the name is right beside it.
      h(HLAvatar, { size: 'xs', name: row.original.initials.split('').join(' '), class: 'shrink-0', 'aria-hidden': 'true' }),
      h(HLText, { htmlTag: 'span', size: 'lg', weight: 'medium', class: 'text-gray-900 truncate' }, () => row.original.name),
    ]),
  },
  {
    id: 'status', size: 13, minSize: 116, header: 'Status', meta: { headerAlign: 'start' },
    // Wrapped: a table cell is a grid, which would stretch the tag to the column width.
    cellFormatter: ({ row }) => h('span', { class: 'flex' }, [
      h(HLTag, { size: 'sm', color: STATUS[row.original.status].color, interactive: false }, () => STATUS[row.original.status].label),
    ]),
  },
  {
    id: 'change', size: 30, minSize: 220, header: 'What changed', meta: { headerAlign: 'start' },
    cellFormatter: ({ row }) => h(HLText, { htmlTag: 'span', size: 'md', class: 'text-gray-500 truncate' }, () => row.original.change),
  },
  {
    id: 'mentions', size: 11, minSize: 96, header: 'Mentions', meta: { headerAlign: 'end' },
    cellFormatter: ({ row }) => h(HLText, { htmlTag: 'span', size: 'lg', class: 'block w-full text-right tabular-nums text-gray-900' },
      () => row.original.volume ? fmtNum(row.original.volume) : h('span', { class: 'text-gray-400' }, '–')),
  },
  {
    id: 'open', size: 11, minSize: 88, header: () => h('span', { class: 'sr-only' }, 'Actions'),
    cellFormatter: ({ row }) => h('div', { class: 'flex justify-end w-full' }, [
      h(HLButton, { variant: 'secondary', size: 'xs', 'aria-label': `Open ${row.original.name}`, onClick: () => selectAccount(row.original.id) }, () => 'Open'),
    ]),
  },
]
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-4 flex-wrap">
      <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">Weekly sweep</HLText>
      <HLText size="md" class="text-gray-500">
        {{ state.quietWeek ? `Nothing changed across your ${total} accounts this week.` : `${flaggedCount} of ${total} accounts changed this week. The rest are quiet.` }}
      </HLText>
      <div class="ml-auto flex items-center gap-2">
        <div class="w-48 shrink-0"><HLInput id="triage-filter" v-model="state.triageQuery" size="xs" clearable placeholder="Filter accounts" /></div>
        <HLRadioGroup id="triage-segment" :value="state.triageFilter" size="xs" @update:value="(v) => (state.triageFilter = v)">
          <HLContentSwitcher v-for="f in FILTERS" :id="`triage-segment-${f.key}`" :key="f.key" :value="f.key" :label="f.label" size="xs" />
        </HLRadioGroup>
      </div>
    </div>

    <div v-if="bulkCount" class="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mb-2.5">
      <HLText html-tag="span" size="lg" weight="medium" class="text-gray-900">{{ bulkCount }} account{{ bulkCount === 1 ? '' : 's' }} selected</HLText>
      <div class="ml-auto flex items-center gap-2">
        <HLButton variant="ghost" size="xs" @click="state.bulk = []">Clear</HLButton>
        <HLButton variant="secondary" size="xs" @click="markReviewed">Mark reviewed</HLButton>
      </div>
    </div>

    <div class="sl-table border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div v-if="allQuiet" class="sl-empty px-6 py-10 flex justify-center">
        <HLEmpty
          id="triage-all-quiet" size="sm" icon="success"
          title="Nothing needs you this week"
          :description="`All ${total} accounts are collecting normally and none moved enough to flag.`"
        />
      </div>
      <HLDataTableWrapper v-else id="triage-table-wrap" responsive-column-width max-width="100%">
        <HLDataTable
          id="triage-table"
          :data="rows"
          :columns="columns"
          :page-size="total"
          row-height="56px"
          max-height="none"
          highlight-selected-row
          :selected-rows="state.bulk"
          :vertical-borders="false"
          :column-hover="false"
          :column-resizing="false"
          :column-reordering="false"
        >
          <template #no-data>
            <div class="sl-empty py-6">
              <HLEmpty
                id="triage-no-match" size="sm" icon="default"
                :title="state.triageQuery ? `No accounts match “${state.triageQuery}”` : 'No accounts in this view'"
                description="Try a different name, or switch the filter back to all accounts."
              />
            </div>
          </template>
        </HLDataTable>
      </HLDataTableWrapper>
    </div>
  </div>
</template>
