<script setup>
// Social trends: what the niche is searching for, before it reaches your mentions.
//
// The PM's prototype lists global trends — "napoli vs milan", "bank holiday", "atlético
// nacional" — from Google Trends, Pinterest and Wikipedia. Every other tab in this product
// is framed by the account's niche, so that version shows Serie A results to a hair salon.
// These three columns are the same layout, filtered to the niche. Option T2 of three.
//
// Wikipedia pageviews became Instagram hashtags: a social source in a social tab, and one
// that has a brand mark — Wikipedia has none in the icon set, so one of three columns could
// never have carried a logo.
//
// Worth knowing before investing further: Sujith called this tab "an unused spot" and Shivam
// said it "will become legacy", kept for now only because nobody knows the current usage.
// The one thing it has to do well is hand a term to Quick search, which is the trend-to-topic
// conversion Sujith asked for on the call.
import { computed } from 'vue'
import { TrendUp01Icon, ArrowUpRightIcon, ChevronRightIcon, SearchMdIcon } from '@gohighlevel/ghl-icons/24/outline'
import { nicheTrends, platformTrends, fmtNum } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'
import SectionChip from './SectionChip.vue'
import { NETWORK_ICONS } from './networkIcons.js'
// Google and Pinterest are sources here, not connectable networks, so they are not in
// NETWORK_ICONS — that map is keyed by listening source.
import { GoogleIcon } from '@gohighlevel/ghl-icons/24/misc'
import { Globe01Icon } from '@gohighlevel/ghl-icons/24/outline'

const { state, account, runSearch, simple, peek } = useSocialListening()

// Simplified (Shivam, 5 Oct): platform trends regardless of industry, so the tab never waits on a niche.
const data = computed(() => (simple.value ? platformTrends(state.range) : nicheTrends(account.value.space, state.range)))

const SOURCE_ICONS = {
  google: GoogleIcon,
  pinterest: NETWORK_ICONS.pinterest,
  instagram: NETWORK_ICONS.instagram,
  youtube: NETWORK_ICONS.youtube,
  wikipedia: Globe01Icon,
}

// A trend is a term, so exploring one is a search — the same path Quick search owns, rather
// than a second place that knows how to fetch a result.
function explore(term) {
  if (simple.value) { peek(term); return }
  state.tab = 'insights'
  runSearch(term)
}
</script>

<template>
  <!-- .sl-empty sets the 16px title; see the style block in TopicDetail.vue. -->
  <div v-if="!data" class="bg-white border border-gray-200 rounded-xl py-14 px-6 flex justify-center sl-empty">
    <HLEmpty
      id="sl-trends-empty" size="md" icon="default"
      title="Pick a niche to see what's rising"
      description="These are the terms climbing in your industry. We need to know which industry first."
    >
      <template #actions>
        <HLButton variant="primary" color="blue" size="md" @click="state.modal = 'space'">Pick a niche</HLButton>
      </template>
    </HLEmpty>
  </div>

  <div v-else class="flex flex-col gap-4">
    <!-- Simplified (Shivam and Sujith, 6 Oct): nothing added on top of the source lists, since
         the tab is going away. One line says what a trend is here, for as long as it stays. -->
    <HLText v-if="simple" id="sl-trends-intro" size="lg" class="text-gray-600">
      Trends are what people search, save, read and watch most right now on Google, Pinterest, Wikipedia and YouTube, in every industry.
    </HLText>
    <div v-else class="bg-white border border-gray-200 rounded-xl p-5">
      <div class="flex items-center gap-2">
        <SectionChip :icon="TrendUp01Icon" inline />
        <HLText size="md" weight="medium" class="text-gray-500">{{ simple ? 'Platform trends' : 'Social trends' }}</HLText>
      </div>
      <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900 mt-0.5!">{{ simple ? 'What is trending across platforms' : `What's rising in ${account.space}` }}</HLText>
      <div class="flex items-baseline gap-2.5 mt-4 flex-wrap">
        <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900 tabular-nums">{{ data.climbing }}</HLText>
        <HLText html-tag="span" size="md" class="text-gray-500">terms climbing {{ data.range.phrase }}</HLText>
        <HLText html-tag="span" size="md" class="text-gray-400" aria-hidden="true">·</HLText>
        <!-- Neutral, not green: "new" is a count, not a gain, and green beside the figure
             read as a delta. -->
        <HLText html-tag="span" size="md" class="text-gray-500"><b class="font-semibold text-gray-900 tabular-nums">{{ data.fresh }}</b> are new</HLText>
      </div>
      <!-- The distinction that makes this tab worth having: it is the market before it
           reaches you, where every other tab measures what already has. -->
      <HLText size="md" class="text-gray-600 mt-2.5!">
        <template v-if="simple">What people search, save, read and watch on Google, Pinterest, Wikipedia and YouTube. Not tied to your industry.</template>
        <template v-else>Pulled from what people search on Google, save on Pinterest and tag on Instagram, not from your own mentions. This is the wider market before it reaches you.</template>
      </HLText>
      <!-- Inside the card, under a rule, like every other Next step. It used to sit loose on
           the page at px-1, which made the same words a different object. The button is the
           step itself, through the same search a row click runs. -->
      <div class="flex items-center gap-3 flex-wrap mt-4 pt-3.5 border-t border-gray-200">
        <HLText size="md" class="text-gray-600">
          <span class="font-semibold text-gray-900">Next step:</span>
          “{{ data.top.term }}” is the biggest of these. Search it to see who's driving it.
        </HLText>
        <HLButton class="ml-auto" variant="text" size="xs" @click="explore(data.top.term)">
          <template #iconLeft><SearchMdIcon /></template>
          Search “{{ data.top.term }}”
        </HLButton>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div v-for="src in data.sources" :key="src.key" class="bg-white border border-gray-200 rounded-xl p-5">
        <div class="flex items-center gap-2.5 pb-3 border-b border-gray-200">
          <component :is="SOURCE_ICONS[src.icon]" class="w-4 h-4 shrink-0" />
          <HLText html-tag="h2" size="lg" weight="semibold" class="text-gray-900">{{ src.label }}</HLText>
        </div>

        <!-- Raw buttons on purpose: a row is a rank, a term, a count and a mark, which is a
             list item that opens something rather than an HLButton. -->
        <button
          v-for="(row, i) in src.rows" :key="row.term"
          @click="explore(row.term)"
          :class="['w-full text-left grid grid-cols-[18px_1fr_auto] gap-3 items-center py-2.5 group rounded-lg focus-visible:outline-2 focus-visible:outline-primary-600 focus-visible:-outline-offset-2',
            i !== src.rows.length - 1 ? 'border-b border-gray-100' : '']"
        >
          <HLText html-tag="span" size="md" class="text-gray-400 tabular-nums text-right">{{ i + 1 }}</HLText>
          <span class="min-w-0">
            <HLText html-tag="span" size="md" class="block text-gray-900 truncate group-hover:text-primary-600 transition-colors">{{ row.term }}</HLText>
            <HLText html-tag="span" size="md" class="block text-gray-500 tabular-nums">{{ fmtNum(row.value) }} {{ src.unit }}</HLText>
          </span>
          <!-- New, or rising: both say the row moved, only one says it arrived. Then a
               chevron on hover. Without the second mark the rows read as a
               list of readings rather than as fifteen things you can open. -->
          <span class="flex items-center gap-2">
            <HLTag v-if="row.isNew" size="sm" color="blue" :interactive="false">New</HLTag>
            <ArrowUpRightIcon v-else class="w-3.5 h-3.5 text-positive-strong" aria-label="Rising" />
            <ChevronRightIcon class="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity" aria-hidden="true" />
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
