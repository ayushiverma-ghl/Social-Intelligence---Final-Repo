<script setup>
import { computed } from 'vue'
import { ArrowRightIcon } from '@gohighlevel/ghl-icons/24/outline'
import { FORMATS, FORMAT_COPY, fmtNum, midSentence, trendChange, nicheKeywords } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'

const { state, account, spaceData, metrics, period, competitorRows, simple } = useSocialListening()

// Three things to do this week. Deliberately actions, not observations — AI Insights, the
// mentions chart and the two cards below already say what is happening, and a fourth
// restatement at the top is the repetition the copy doc keeps flagging.
//
// Each tile's left block draws the actual figure rather than an icon standing for it, so
// the tile reads before a word is read. One accent at two opacities: no new palette.

// The format the data actually recommends, not whichever one the user last clicked in the
// post card — otherwise the tile changes meaning when someone browses formats.
const topFormat = computed(() => {
  const nets = account.value.connectedNetworks || []
  const pool = nets.length ? FORMATS.filter(f => f.networks.some(n => nets.includes(n))) : FORMATS
  return (pool.length ? pool : FORMATS).slice().sort((a, b) => b.base - a.base)[0]
})

// Straight from the shared rebased shares, so this tile and the Competitors card below it
// can never quote different numbers for the same thing.
const rival = computed(() => {
  const ranked = [...competitorRows.value.comps].sort((a, b) => b.value - a.value)
  return ranked[0] || null
})

function openAlert(metric) {
  state.alertMetric = metric
  state.modal = 'alert'
}
// Sujith: the composer is the wrong destination — "a quick video could be like anything",
// so it isn't a post type the planner can take. Hand off to Ask AI instead.
function askAI(topic, prompt) {
  state.askAI = { prompt, topic }
}

const tiles = computed(() => {
  const m = metrics.value
  const niche = midSentence(account.value.space || 'your niche')
  const fastest = spaceData.value.trends
    .map(t => ({ label: t.label, change: trendChange(t.label, t.value) }))
    .reduce((a, b) => (b.change > a.change ? b : a))
  const r = rival.value

  // Counts the niche, like the Mentions card it sits above. It used to read the account's
  // own `dVolume` and `down` — "Mentions down 18%, fewer people talking than the week
  // before" — which was the account's story on a page where nothing measures the account.
  // Hidden behind `showTiles` and so never seen, but wrong rather than merely unused.
  const kw = nicheKeywords(account.value.space, state.range)
  const top = kw[0] || null
  const mentionsTile = top
    ? { chart: 'mentions',
        title: `${top.term} is the biggest topic`,
        detail: `${fmtNum(top.value)} mentions ${period.value}, more than anything else in ${niche}.`,
        cta: 'Alert me', onClick: () => openAlert('mentions') }
    : { chart: 'empty', title: 'Pick a niche',
        detail: 'Then this shows what your industry is talking about.',
        cta: 'Choose niche', onClick: () => { state.modal = 'space' } }

  const formatTile = {
    chart: 'format',
    ai: true, // hands off to Ask AI rather than setting an alert — see the CTA colour
    title: `${topFormat.value.label} is working`,
    detail: `Saved more than any other format ${period.value}.`,
    // Generic label, specific payload — his note was that the wording shouldn't change
    // per tile, not that the prompt shouldn't.
    cta: 'Ask AI',
    onClick: () => askAI(fastest.label,
      `Create a ${topFormat.value.label.toLowerCase()} post about ${midSentence(fastest.label)} for a ${niche} audience`),
  }

  // Names the leader rather than a gap to you. The card below dropped its "you" row on the
  // 28 Sep call, so a tile quoting "their share to your share" would be citing a figure
  // nothing on the page draws any more.
  const rivalTile = r
    ? { chart: 'competitor', title: `${r.name} is leading`,
        detail: `${r.value}% of the brands you track, more than any other.`,
        cta: 'Alert me', onClick: () => openAlert('competitor') }
    : { chart: 'empty', title: 'No competitors tracked',
        detail: 'Add one to see who leads your niche.',
        cta: 'Add a competitor', onClick: () => { state.modal = 'competitor' } }

  return simple.value ? simpleTiles(fastest, r) : [mentionsTile, formatTile, rivalTile]
})

// Simplified design: plainer copy, one verb per CTA ("Get alerts"), and the format tile
// follows the format picked in the post card and quotes its stat.
function simpleTiles(fastest, r) {
  const trend = spaceData.value.trends[0]
  const fmt = FORMATS.find(f => f.key === state.format) || topFormat.value
  const copy = FORMAT_COPY[fmt.key]
  const industry = midSentence(account.value.space || 'your industry')
  return [
    trend
      ? { chart: 'mentions',
          title: `${trend.label} ${/s$/.test(trend.label) ? 'are' : 'is'} the biggest topic`,
          detail: 'Get an alert if that changes.',
          cta: 'Get alerts', onClick: () => openAlert('mentions') }
      : { chart: 'empty', title: 'Pick your industry',
          detail: 'Then this shows what people are talking about.',
          cta: 'Pick industry', onClick: () => { state.modal = 'space' } },
    { chart: 'format', ai: true,
      title: `${fmt.label} works best right now`,
      detail: `${copy.stat} ${copy.statUnit}.`,
      cta: 'Get post ideas',
      onClick: () => askAI(fastest.label,
        `Create a ${fmt.label.toLowerCase()} post about ${midSentence(fastest.label)} for a ${industry} audience`) },
    r
      ? { chart: 'competitor', title: `${r.name} is leading`,
          detail: `${r.value}% among the brands you track.`,
          cta: 'Get alerts', onClick: () => openAlert('competitor') }
      : { chart: 'empty', title: 'No competitors yet',
          detail: 'Add one to see who leads your industry.',
          cta: 'Add competitor', onClick: () => { state.modal = 'competitor' } },
  ]
}
</script>

<template>
  <!-- Each tile is a 108px figure block beside its text; at three across below 900 the text
       column drops under 150px and every title wraps to three lines. -->
  <!-- Real buttons, not HLCard: HLCard is not clickable and has no focus handling, and each
       tile is one action. Kept native so the whole tile is the hit area, with a visible
       focus ring to make up for what HLButton would have given. -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <button
      v-for="(t, i) in tiles" :key="t.title"
      type="button"
      :style="{ '--i': i + 1 }"
      class="sl-enter sl-lift flex items-stretch text-left bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
      @click="t.onClick()"
    >
      <span
        :class="['w-[108px] shrink-0 flex items-center justify-center border-r border-gray-200',
          t.chart === 'format' ? 'bg-accent-purple-light' : 'bg-primary-25']"
      >
        <!-- Illustrations, not charts. The old blocks held hardcoded paths that looked like
             this account's data and never saw it — a 9% rise drew the same line as a 40% one.
             These illustrate the subject instead, which is a thing a drawing can honestly do.
             One drawing per subject: direction lives in the title, where it is accurate. -->
        <!-- Decorative: the title beside it says the same thing in words. -->
        <svg width="92" height="68" viewBox="0 0 96 72" aria-hidden="true" focusable="false">
          <template v-if="t.chart === 'mentions'">
            <ellipse cx="48" cy="46" rx="36" ry="23" fill="var(--color-primary-600)" opacity=".07" />
            <circle cx="48" cy="40" r="13" fill="var(--color-primary-600)" />
            <circle cx="48" cy="35" r="4.6" fill="var(--color-white)" />
            <path d="M40.5 48a8 8 0 0115 0z" fill="var(--color-white)" />
            <rect x="6" y="14" width="28" height="18" rx="6" fill="var(--color-primary-600)" opacity=".3" />
            <path d="M12 30l-2 7 8-5z" fill="var(--color-primary-600)" opacity=".3" />
            <rect x="58" y="8" width="32" height="20" rx="6" fill="var(--color-primary-600)" />
            <path d="M84 26l3 7-9-4z" fill="var(--color-primary-600)" />
            <rect x="65" y="16" width="18" height="3.2" rx="1.6" fill="var(--color-white)" opacity=".9" />
          </template>

          <template v-else-if="t.chart === 'format'">
            <ellipse cx="48" cy="44" rx="36" ry="24" fill="var(--color-accent-purple)" opacity=".08" />
            <rect x="22" y="8" width="42" height="56" rx="8" fill="var(--color-accent-purple)" opacity=".22" />
            <rect x="28" y="12" width="42" height="56" rx="8" fill="var(--color-accent-purple)" />
            <rect x="35" y="20" width="28" height="20" rx="4" fill="var(--color-white)" opacity=".28" />
            <path d="M45 26l9 5-9 5z" fill="var(--color-white)" />
            <rect x="35" y="46" width="28" height="3.4" rx="1.7" fill="var(--color-white)" opacity=".45" />
            <rect x="35" y="53" width="17" height="3.4" rx="1.7" fill="var(--color-white)" opacity=".28" />
            <path d="M66 4h14a4 4 0 014 4v22l-11-7-11 7V8a4 4 0 014-4z" fill="var(--color-accent-pink)" />
          </template>

          <template v-else-if="t.chart === 'competitor'">
            <ellipse cx="48" cy="46" rx="36" ry="22" fill="var(--color-primary-600)" opacity=".07" />
            <rect x="14" y="26" width="32" height="34" rx="5" fill="var(--color-primary-600)" />
            <rect x="50" y="40" width="32" height="20" rx="5" fill="var(--color-primary-600)" opacity=".24" />
            <circle cx="30" cy="14" r="8" fill="var(--color-primary-600)" opacity=".55" />
            <circle cx="66" cy="30" r="7" fill="var(--color-primary-600)" opacity=".3" />
            <rect x="24" y="38" width="12" height="3.4" rx="1.7" fill="var(--color-white)" opacity=".8" />
            <rect x="8" y="62" width="80" height="3" rx="1.5" fill="var(--color-primary-600)" opacity=".18" />
          </template>

          <template v-else>
            <ellipse cx="48" cy="46" rx="36" ry="22" fill="var(--color-gray-400)" opacity=".12" />
            <rect x="14" y="26" width="32" height="34" rx="5" fill="var(--color-gray-300)" />
            <rect x="50" y="40" width="32" height="20" rx="5" fill="none" stroke="var(--color-gray-300)" stroke-width="2" stroke-dasharray="4 3" />
            <path d="M66 46v8M62 50h8" stroke="var(--color-gray-400)" stroke-width="2.2" stroke-linecap="round" />
            <rect x="8" y="62" width="80" height="3" rx="1.5" fill="var(--color-gray-300)" opacity=".5" />
          </template>
        </svg>
      </span>
      <span class="flex-1 min-w-0 px-4 py-3">
        <HLText html-tag="span" size="lg" weight="semibold" class="block text-gray-900">{{ t.title }}</HLText>
        <HLText html-tag="span" size="md" class="block text-gray-600 mt-1!">{{ t.detail }}</HLText>
        <!-- Purple marks the CTA that opens AI; blue marks the ones that act on your data.
             Two verbs then read as two kinds of action rather than as inconsistency. -->
        <HLText html-tag="span" size="md" weight="semibold" :class="['flex items-center gap-1 mt-2!', t.ai ? 'text-accent-purple' : 'text-primary-600']">
          {{ t.cta }}<ArrowRightIcon class="w-3.5 h-3.5" aria-hidden="true" />
        </HLText>
      </span>
    </button>
  </div>
</template>
