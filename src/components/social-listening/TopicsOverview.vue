<script setup>
// Saved topics on Overview, for someone who has come back (Harsh, 6 Oct): the industry is the
// top of the page, this is what they chose to follow. Shown from three saved topics up; with
// one or two it would only repeat the Topics tab (Shivam's rule, being written up).
//
// Sujith's version, picked from six on 6 Oct: the top five by mentions as bars. Hover a bar for
// its figures, click it to open the topic.
//
// Figures come from quickSearchResult, the call the topic itself makes, so this card and the
// topic never disagree. They are as of each topic's last refresh. Nothing refreshes on its own,
// because every refresh is a paid fetch (Shivam), except a topic with an alert, which the alert
// checks daily. So a topic with an alert carries a bell, and Refresh only fetches the rest.
import { computed, ref } from 'vue'
import { BookmarkIcon, RefreshCcw01Icon, ArrowUpIcon, BellRinging01Icon } from '@gohighlevel/ghl-icons/24/outline'
import { quickSearchResult, fmtNum } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'
import SectionChip from './SectionChip.vue'
import ChartTip from './ChartTip.vue'
import CountUp from './CountUp.vue'

const { state, account, range, openTopic, refreshTopics, toast, simple } = useSocialListening()

const MIN_TOPICS = 3
const SHOWN = 5

const saved = computed(() => (state.topicsByAccount[account.value.id] || []).filter((t) => !t.collecting))
const top = computed(() => saved.value.map((t) => {
  const r = quickSearchResult(t.term || t.title, state.range, account.value.space)
  if (!r || r.empty) return null
  return {
    title: t.title, refreshedAt: t.refreshedAt || Date.now(), alert: !!t.alert,
    mentions: r.mentions, delta: r.delta, pos: r.pos, platform: r.platforms[0] || null,
  }
}).filter(Boolean).sort((a, b) => b.mentions - a.mentions).slice(0, SHOWN))
const show = computed(() => saved.value.length >= MIN_TOPICS && top.value.length > 0)
const maxMentions = computed(() => Math.max(...top.value.map((t) => t.mentions), 1))

function ago(ts) {
  const h = Math.floor((Date.now() - ts) / 3600e3)
  if (h < 1) return 'just now'
  if (h < 24) return h === 1 ? '1 hour ago' : `${h} hours ago`
  const d = Math.floor(h / 24)
  return d === 1 ? '1 day ago' : `${d} days ago`
}
const tipLines = (t) => [
  t.title, `${fmtNum(t.mentions)} mentions`, `Up ${t.delta}%`, `${t.pos}% positive`,
  t.platform ? `Most on ${t.platform.label}` : '',
  t.alert ? 'Alert on · checked daily' : `Updated ${ago(t.refreshedAt)}`,
].filter(Boolean)

// Alerted topics refresh themselves; the rest wait for a click.
const manual = computed(() => top.value.filter((t) => !t.alert))
const alerted = computed(() => top.value.length - manual.value.length)
const oldestManual = computed(() => (manual.value.length ? Math.min(...manual.value.map((t) => t.refreshedAt)) : null))
const refreshing = ref(false)
function refresh() {
  const titles = manual.value.map((t) => t.title)
  if (refreshing.value || !titles.length) return
  refreshing.value = true
  setTimeout(() => {
    refreshTopics(titles)
    refreshing.value = false
    if (simple.value) toast(titles.length === 1 ? `“${titles[0]}” is up to date` : `Your ${titles.length} topics are up to date`)
    else toast(titles.length === 1 ? 'Topic refreshed' : 'Topics refreshed', titles.length === 1 ? `“${titles[0]}” is up to date.` : `${titles.length} topics are up to date.`)
  }, 700)
}
</script>

<template>
  <section v-if="show" id="sl-overview-topics" class="sl-enter sl-card bg-white border border-gray-200 rounded-xl p-5 flex flex-col" :style="{ '--i': 4 }">
    <div class="flex items-center gap-2">
      <SectionChip :icon="BookmarkIcon" inline />
      <HLText size="md" weight="medium" class="text-gray-500">Your topics · {{ range.label }}</HLText>
    </div>
    <div class="flex items-start justify-between gap-4 mt-0.5">
      <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">How your saved topics are doing</HLText>
      <HLButton id="sl-overview-topics-all" variant="secondary" size="xs" @click="state.tab = 'insights'">See all {{ saved.length }}</HLButton>
    </div>
    <HLText size="md" class="text-gray-600 mt-1!">Your biggest topics by mentions. Select one to open it.</HLText>

    <div class="grid gap-4 mt-5" :style="{ gridTemplateColumns: `repeat(${top.length}, minmax(0, 1fr))` }">
      <ChartTip v-for="(t, i) in top" :key="t.title" :lines="tipLines(t)">
        <!-- A column is a chart mark that opens its topic: the whole column is the target. -->
        <button
          type="button" :aria-label="`Open ${t.title}: ${fmtNum(t.mentions)} mentions, up ${t.delta}%${t.alert ? ', alert on' : ''}`"
          class="group w-full flex flex-col items-stretch gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-primary-600 focus-visible:outline-offset-2"
          @click="openTopic(t.title)"
        >
          <!-- The figure rides on its bar, so each number reads as that bar's. -->
          <span class="h-44 flex flex-col items-center justify-end border-b border-gray-200">
            <HLText html-tag="span" size="md" weight="semibold" class="text-gray-900 tabular-nums mb-1.5!"><CountUp :value="t.mentions" /></HLText>
            <span
              class="sl-grow-y block w-full max-w-18 rounded-t-lg bg-linear-to-t from-primary-600 to-primary-300 group-hover:from-primary-700 group-hover:to-primary-400 transition-colors"
              :style="{ height: Math.max(10, Math.round((t.mentions / maxMentions) * 140)) + 'px', '--i': i }"
            />
          </span>
          <HLText html-tag="span" size="md" weight="medium" class="text-gray-900 text-center line-clamp-2 group-hover:text-primary-600 transition-colors">
            <BellRinging01Icon v-if="t.alert" class="inline w-3.5 h-3.5 text-primary-600 -mt-0.5 mr-1" aria-hidden="true" />{{ t.title }}
          </HLText>
          <HLText html-tag="span" size="md" weight="semibold" class="inline-flex items-center justify-center gap-0.5 tabular-nums text-positive-strong">
            <ArrowUpIcon class="w-3.5 h-3.5" aria-hidden="true" />{{ t.delta }}%
          </HLText>
        </button>
      </ChartTip>
    </div>

    <div class="mt-auto pt-4">
      <div class="flex items-center gap-3 flex-wrap pt-3.5 border-t border-gray-200">
        <HLText size="md" class="text-gray-600 flex-1 min-w-0">
          <template v-if="alerted">
            <BellRinging01Icon class="inline w-3.5 h-3.5 text-primary-600 -mt-0.5 mr-1" aria-hidden="true" />{{ alerted }} with an alert {{ alerted === 1 ? 'is' : 'are' }} checked daily.
          </template>
          <template v-if="oldestManual">{{ alerted ? ' The rest are' : 'These are' }} as of their last refresh, the oldest {{ ago(oldestManual) }}.</template>
        </HLText>
        <HLButton v-if="manual.length" id="sl-overview-topics-refresh" variant="text" color="blue" size="xs" :loading="refreshing" @click="refresh">
          <template #iconLeft><RefreshCcw01Icon /></template>
          Refresh {{ alerted ? `the other ${manual.length}` : `these ${manual.length}` }}
        </HLButton>
      </div>
    </div>
  </section>
</template>
