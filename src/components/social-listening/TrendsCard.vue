<script setup>
// Trends on the Overview. 21 Oct (pick 17): one block at half width next to Competitors. One row per
// source (Google, Pinterest, YouTube) with its fastest climber this week, the rows ranked by weekly
// change; the source's icon leads each row. A row opens the insights pop-up; hover offers Listen.
// "View all" opens every source in the pop-up. Three styles, from the review guide (state.trendsStyle):
//   1 the change in the sub line ("YouTube · 408K views · ↑ 153%")
//   2 the same with a rank number before the source icon
//   3 the change as a right-aligned green figure; hover swaps it for + Listen (default)
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { TrendUp01Icon, ArrowUpIcon } from '@gohighlevel/ghl-icons/24/outline'
import { TOPIC_SHOWN_LIMIT } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'
import CardHead from './CardHead.vue'
import TrendRow from './TrendRow.vue'
import TrendsLimitNotice from './TrendsLimitNotice.vue'
import { trendSources, SOURCE_ICONS } from './trendsData.js'

const { state, range, account } = useSocialListening()
const style = computed(() => state.trendsStyle || 3)
// The card reads each source's real top 12; past that the list is sample data for the Trends tab.
const sources = computed(() => trendSources(state.range).map((s) => ({ ...s, rows: s.rows.filter((r) => !r.sample) })))
const fastest = (s) => s.rows.reduce((a, r) => (r.change > a.change ? r : a), s.rows[0])
const SHOWN = ['google', 'pinterest', 'yt-videos']
// out9 q05: a source whose feed came back empty is left out (it used to crash the whole page),
// and the sub line says which one is missing.
const lead = computed(() => SHOWN
  .map((k) => sources.value.find((s) => s.key === k)).filter((s) => s && s.rows.length)
  .map((s) => ({ s, r: fastest(s), icon: SOURCE_ICONS[s.platform] }))
  .sort((a, b) => b.r.change - a.r.change))
// Round 7 (Competitors grows): the rows keep their rhythm instead of spreading apart; extra
// height is filled with the next fastest climbers across the same three sources.
// 21 Oct deploy audit (card bottom inset = top inset = 25 in every state): each row is its content
// (38) plus 12 above and below (HLSpace md), so 62 rule to rule, and the list hangs 12 into the
// card's bottom padding, so the last row's text sits on the padding line. With the header → list gap
// at 16 (HLSpace lg) three rows make this card exactly as tall as Competitors with nothing tracked.
// When Competitors is taller, rows are added until this card is at least as tall; the card then sets
// the row's height and Competitors takes the few pixels left over above its footer rule, so neither
// card ends with an empty strip under its last line.
const ROW_H = 62
const MIN_ROWS = 3
const fit = ref(MIN_ROWS)
const rest = computed(() => lead.value.flatMap((t) => t.s.rows
  .filter((r) => !r.isNew && r !== t.r).map((r) => ({ s: t.s, r, icon: t.icon })))
  .sort((a, b) => b.r.change - a.r.change))
const pool = computed(() => [...lead.value, ...rest.value])
const rows = computed(() => pool.value.slice(0, Math.max(lead.value.length, fit.value)))
const cardBody = ref(null)
const list = ref(null)
// Room left under the last row's text inside the padding line (0 once this card sets the height).
function slack() {
  const body = cardBody.value; const l = list.value
  if (!body || !l) return 0
  const pad = parseFloat(getComputedStyle(body).paddingBottom) || 0
  return Math.round(body.getBoundingClientRect().bottom - pad - (l.getBoundingClientRect().bottom - 12))
}
// out14 F01 (21 Oct): both cards stretch to the row's height, so they always end level. Each card's
// natural height is measured without its stretch: Competitors' spare height sits above its footer
// rule (mt-auto), Trending's under its last row. Trending takes the fewest whole rows that reach
// Competitors' natural height, so Trending never ends on an empty band; whatever is left (< one row)
// is the one gap above Competitors' footer rule.
const bodyOf = (card) => card?.querySelector(':scope > .hr-card-content > div') || card?.firstElementChild
function natural(card) {
  const body = bodyOf(card); if (!body) return 0
  const b = body.getBoundingClientRect(); const pb = parseFloat(getComputedStyle(body).paddingBottom) || 0
  const foot = body.querySelector('[data-comp-foot]')
  let spare = 0
  if (foot && foot.previousElementSibling) spare = foot.getBoundingClientRect().top - foot.previousElementSibling.getBoundingClientRect().bottom
  else if (card.id === 'trends-card' && list.value) spare = b.bottom - pb - (list.value.getBoundingClientRect().bottom - 12)
  else { const last = body.lastElementChild; const inner = last?.lastElementChild || last; if (inner) spare = b.bottom - pb - inner.getBoundingClientRect().bottom }
  return card.getBoundingClientRect().height - Math.max(0, spare)
}
function grow() {
  const me = cardBody.value?.closest('#trends-card'); const comp = document.getElementById('competitors-card')
  if (!me || !comp || !list.value) return
  // Side by side only; stacked (below lg) each card keeps its own height.
  if (Math.abs(me.getBoundingClientRect().top - comp.getBoundingClientRect().top) > 2) return
  const d = natural(comp) - natural(me)
  // From the rows on screen, not fit (a resize can land before the last change has rendered).
  const shown = list.value.children.length
  const next = Math.max(MIN_ROWS, Math.min(pool.value.length, shown + Math.ceil((d - 0.5) / ROW_H)))
  if (next !== fit.value) { fit.value = next; nextTick(() => requestAnimationFrame(grow)) }
}
// Start again from three rows (the card next door may have got shorter), then grow to fit.
let raf = 0
function refit() {
  cancelAnimationFrame(raf)
  fit.value = MIN_ROWS
  nextTick(() => { raf = requestAnimationFrame(grow) })
}
let ro; let roComp; let lastW = 0
onMounted(() => {
  ro = new ResizeObserver(([e]) => {
    const w = Math.round(e.contentRect.width)
    if (w !== lastW) { lastW = w; refit() } else grow()
  })
  ro.observe(cardBody.value)
  const comp = document.getElementById('competitors-card')
  // Both cards are stretched, so the card's own box doesn't change when its content does: watch
  // the content blocks inside Competitors (re-attached when they change) and refit after the
  // board's move transition settles.
  if (comp) {
    roComp = new ResizeObserver(() => grow())
    const watchKids = () => { roComp.disconnect(); roComp.observe(comp); const body = bodyOf(comp); if (body) [...body.children].forEach((k) => roComp.observe(k)) }
    watchKids()
    mo = new MutationObserver(() => { watchKids(); clearTimeout(settle); settle = setTimeout(grow, 600) })
    mo.observe(comp, { childList: true, subtree: true })
  }
})
let mo; let settle = 0
onBeforeUnmount(() => { ro && ro.disconnect(); roComp && roComp.disconnect(); mo && mo.disconnect(); clearTimeout(settle); cancelAnimationFrame(raf) })
watch(() => [(account.value.competitors || []).join('|'), state.range, state.trendsStyle, state.topicsByAccount[state.accountId]?.length], refit)
const atLimit = computed(() => (state.topicsByAccount[state.accountId] || []).length >= TOPIC_SHOWN_LIMIT)
const missing = computed(() => SHOWN.map((k) => sources.value.find((s) => s.key === k)).filter((s) => s && !s.rows.length).map((s) => s.short))
const listWords = (l) => (l.length < 2 ? l.join('') : `${l.slice(0, -1).join(', ')} and ${l[l.length - 1]}`)
const subLine = computed(() => {
  if (!missing.value.length) return 'Fastest rising on each source.'
  if (!lead.value.length) return ''
  return `Fastest rising on ${listWords(lead.value.map((t) => t.s.short))}. ${listWords(missing.value)} ${missing.value.length > 1 ? 'are' : 'is'} updating.`
})
// 26 Oct: View all opens the Trends tab on its first source.
function viewAll() { state.trendsPeekSource = 'google'; state.tab = 'trends' }
</script>

<template>
  <HLCard id="trends-card" :data-style="style" class="sl-trends-card sl-enter sl-card sl-hrcard" style="--i: 4">
  <div ref="cardBody" class="p-6 flex-1 min-h-0 flex flex-col">
    <!-- 21 Oct (b2 V5): the shared card header, 32 tile, 8 to the heading, View all on the top line
         top-aligned with the tile. Content starts 25 from the top and ends 25 from the bottom. -->
    <CardHead :icon="TrendUp01Icon" heading="What the internet is talking about" :sub="subLine">
      <template #eyebrow>Trending now<span class="sl-trends-range"> · {{ range.label }}</span></template>
      <template #controls>
        <!-- Round 6 (Ayushi: "Add competitor and View all look different… all CTA sizes and CTA text
             sizes should be consistent"): every card-level CTA is HLButton secondary sm as HighRise
             draws it. An icon only where it adds meaning (+ to add, a chevron on a menu); "View all"
             is text only, here and on Your topics, so its thin expand-arrows glyph no longer makes it
             read smaller than "+ Add competitor". -->
        <HLButton id="trends-view-all" class="shrink-0" variant="secondary" size="sm" @click="viewAll">View all</HLButton>
      </template>
    </CardHead>
    <div v-if="atLimit" class="mt-4"><TrendsLimitNotice /></div>

    <!-- out9 q05: every source came back empty. -->
    <div v-if="!lead.length" class="flex-1 flex items-center justify-center py-6">
      <HLEmpty
        id="trends-empty" size="sm" :custom-icon="TrendUp01Icon" custom-icon-bg-color="var(--color-gray-100)" custom-icon-color="var(--color-gray-600)"
        title="Trends are updating" description="Google, Pinterest and YouTube trends will show here in a few minutes."
      />
    </div>
    <div v-else ref="list" class="sl-trends-list flex flex-col mt-4 -mx-2 -mb-3">
      <TrendRow v-for="(t, i) in rows" :key="t.s.key + t.r.term" :row="t.r" :icon="t.icon" :source="t.s.short" :show-change="style !== 3">
        <template v-if="style === 2" #lead>
          <HLText html-tag="span" size="md" class="text-gray-500 tabular-nums w-3 text-right shrink-0 -mr-1">{{ i + 1 }}</HLText>
        </template>
        <!-- a20: the change reads like every other on the page, 13 semibold with the arrow icon. -->
        <HLText v-if="style === 3" html-tag="span" size="md" weight="semibold" class="sl-trends-chg inline-flex items-center text-positive-strong tabular-nums whitespace-nowrap shrink-0">
          <ArrowUpIcon class="w-3.5 h-3.5" aria-hidden="true" />{{ t.r.change }}%
        </HLText>
      </TrendRow>
    </div>
  </div>
</HLCard>
</template>

<style scoped>
.sl-trends-card { container: trendscard / inline-size; }
/* Drop the range from the eyebrow when the card is narrow (half width at 1280) instead of truncating it. */
@container trendscard (max-width: 400px) { .sl-trends-range { display: none; } }
/* The ↑% already says it's rising, so the arrow mark goes; hover still offers + Listen. */
.sl-trends-card :deep(.sl-trow-rest) { display: none; }
/* f01: the meta line is the card's last line; a 16px line box (= the glyph box) keeps the measured bottom inset at 24. */
.sl-trends-list :deep(.sl-trow-meta) { line-height: 16px; }
.sl-trends-list :deep(.sl-trow .hr-text-lg) { line-height: 22px; }
/* Rows: content + 12 above and below (62 rule to rule). The hover fill still reaches 8 past the text
   on each side; the rule between rows is drawn on the text column (25 from the card edge), so no
   line runs past the header's left and right edges. */
.sl-trends-list > :deep(.sl-trow) { flex: none; min-height: 0; margin: 0; padding: 12px 8px; border-bottom: 0; position: relative; }
.sl-trends-list > :deep(.sl-trow:not(:last-child))::after { content: ''; position: absolute; left: 8px; right: 8px; bottom: 0; height: 1px; background: var(--color-gray-100); pointer-events: none; }
.sl-trends-card :deep(.sl-trow:hover .sl-trends-chg), .sl-trends-card :deep(.sl-trow:focus-within .sl-trends-chg) { display: none; }
</style>
