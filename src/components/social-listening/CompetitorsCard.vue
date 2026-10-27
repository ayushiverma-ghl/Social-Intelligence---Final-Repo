<script setup>
// Competitors card, simplified design (21 Oct, Sujit: "even if I add one, you can still show those
// chips so they can click to further add… I expected two more to come here").
//   0 tracked  the dashed suggestion rows, as before. Top line: Add competitor.
//   1–2        the leaderboard (you + tracked), and the suggestions still left sit right under it
//              as rows with an empty bar and a Track button. Top line: Track both while two are
//              left, Edit competitors after. Footer: Not on the list? Track any brand.
//   3          the limit: full leaderboard, no suggestions, a quiet note, Next step in the footer.
// Track shows a loader, then Added, then the row slides into its rank (one TransitionGroup holds
// ranked rows and suggestions, keyed by name, so the same row moves). Removing a suggested brand
// puts it back in the suggestions.
import { computed, reactive } from 'vue'
import { PlusIcon, XCloseIcon, PieChart01Icon, CheckIcon } from '@gohighlevel/ghl-icons/24/outline'
import { useSocialListening } from '../../composables/useSocialListening.js'
import { spaceInText } from '../../data/socialListening.js'
import { FIG } from './figures.js'
import CardHead from './CardHead.vue'
import CountUp from './CountUp.vue'
import ChartTip from './ChartTip.vue'

const { state, account, spaceData, competitorRows, addCompetitor, removeCompetitor, maxCompetitors, patchAccount, toast, peek } = useSocialListening()

const tracked = computed(() => account.value.competitors || [])
const space = computed(() => spaceInText(account.value.space))
const room = computed(() => Math.max(0, maxCompetitors.value - tracked.value.length))
// The industry's three, minus the ones you track, never more than there is room for.
const pool = computed(() => (spaceData.value.competitors || []).slice(0, 3))
const left = computed(() => pool.value.filter((n) => !tracked.value.includes(n)).slice(0, room.value))
// Letters only, so "Tint & Tone Studio" reads TT, not T&.
const initials = (n) => n.split(/\s+/).filter((w) => /^[\p{L}\p{N}]/u.test(w)).map((w) => w[0]).join('').slice(0, 2).toUpperCase()

const shareRows = computed(() => {
  if (!tracked.value.length) return []
  return [...competitorRows.value.comps, { name: account.value.name, value: competitorRows.value.you, you: true }]
    .sort((a, b) => b.value - a.value)
})
const yourShare = computed(() => competitorRows.value.you || 0)
const yourRank = computed(() => shareRows.value.findIndex((r) => r.you) + 1)
const ordinal = (n) => (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th')
const pts = (n) => `${n} ${n === 1 ? 'point' : 'points'}`
const competitorLine = computed(() => {
  const rows = shareRows.value
  if (!rows.length) return ''
  const lead = rows[0]
  const place = `You’re ${yourRank.value}${ordinal(yourRank.value)} of ${rows.length}.`
  if (lead.you) return rows[1] ? `${place} You lead ${rows[1].name} by ${pts(lead.value - rows[1].value)}.` : place
  return `${place} ${lead.name} leads.`
})
const leader = computed(() => shareRows.value.find((r) => !r.you) || null)

// One list for the board: ranked rows, the suggestions label, the suggestions (or the limit note).
const items = computed(() => {
  const ranked = shareRows.value.map((r, i) => ({ key: r.name, kind: 'row', ...r, rank: i + 1 }))
  // d02 (21 Oct): the limit note no longer ends the board; it sits in the footer group (below).
  if (!left.value.length) return ranked
  return [...ranked, { key: '__label', kind: 'label' }, ...left.value.map((n) => ({ key: n, kind: 'suggest', name: n, value: 0 }))]
})

// name -> 'loading' | 'added' while a Track is in flight.
const pending = reactive({})
const busy = computed(() => Object.keys(pending).length > 0)
const LOAD_MS = 700
const ADDED_MS = 500
function track(names) {
  const add = names.filter((n) => !tracked.value.includes(n) && !pending[n]).slice(0, room.value)
  if (!add.length) return
  add.forEach((n) => { pending[n] = 'loading' })
  setTimeout(() => {
    add.forEach((n) => { pending[n] = 'added' })
    setTimeout(() => {
      if (add.length === 1) addCompetitor(add[0])
      else {
        patchAccount(state.accountId, { competitors: [...tracked.value, ...add] })
        toast(`${add.length} competitors added`)
      }
      add.forEach((n) => { delete pending[n] })
    }, ADDED_MS)
  }, LOAD_MS)
}
const bulkWord = computed(() => (left.value.length === 3 ? 'all 3' : 'both'))
const openModal = () => { state.modal = 'competitor' }
</script>

<template>
  <HLCard id="competitors-card" class="sl-enter sl-card sl-hrcard" style="--i: 3">
  <div class="p-6 flex-1 min-h-0 flex flex-col">
    <!-- 21 Oct (b2 V5): the shared card header, 32 tile, 8 to the heading; with nothing tracked the
         sub line says what to do. Content starts 25 from the top and ends 25 from the bottom.
         The top line holds the card's one action: Add (nothing tracked), Track both (two
         suggestions left, one click), then Edit. -->
    <CardHead :icon="PieChart01Icon" eyebrow="Competitors" heading="Who leads among your competitors" :sub="tracked.length ? '' : 'Track up to 3 competitors to see how you compare.'">
      <template #controls>
        <!-- One rule for card actions: HighRise secondary sm, label only (no leading icon), like View all. -->
        <HLButton v-if="!tracked.length" id="add-competitor" variant="secondary" size="sm" @click="openModal">Add competitor</HLButton>
        <HLButton v-else-if="left.length > 1" id="track-suggested" variant="secondary" size="sm" :disabled="busy" @click="track(left)">Track {{ bulkWord }}</HLButton>
        <HLButton v-else id="edit-competitors" variant="secondary" size="sm" @click="openModal">Edit competitors</HLButton>
      </template>
    </CardHead>

    <template v-if="tracked.length">
      <div class="flex items-baseline gap-2 flex-wrap mt-4">
        <HLText html-tag="span" v-bind="FIG.card" class="text-gray-900 tabular-nums"><CountUp :value="yourShare" suffix="%" /></HLText>
        <!-- out9 q09: "your share" sat 900px from the AI summary's "Your share 13% of all posts" with
             a different number. This one is a share of the tracked set, so it names that base. -->
        <HLText html-tag="span" size="md" class="text-gray-500">of mentions among these {{ shareRows.length }} brands</HLText>
      </div>
      <HLText size="md" class="text-gray-600 mt-2!">{{ competitorLine }}</HLText>

      <TransitionGroup tag="div" name="sl-board" class="relative flex flex-col mt-2">
        <div v-for="it in items" :key="it.key" class="sl-board-item">
          <HLText v-if="it.kind === 'label'" size="md" weight="medium" class="text-gray-500 pt-4 pb-1">Suggested for {{ space }}</HLText>
          <!-- Ranked rows carry the hover readout; a suggestion has no figure yet, and its readout
               covered the board while you reached for Track. -->
          <ChartTip
            v-else
            :lines="it.kind === 'row'
              ? [it.you ? 'You' : it.name, `${it.value}% among the brands you track`, `Ranked ${it.rank} of ${shareRows.length}`]
              : []"
          >
            <!-- Same grid for a ranked row and a suggestion, so a tracked suggestion keeps its bar
                 and the bar fills in place as the row moves up. -->
            <div
              :id="it.kind === 'suggest' ? `suggest-row-${initials(it.name)}` : undefined"
              :class="['sl-board-row grid grid-cols-[20px_minmax(0,168px)_minmax(0,1fr)_48px_36px] items-center gap-3 sl-row-hover', it.kind === 'suggest' ? 'h-11' : 'h-9', it.kind === 'suggest' && !pending[it.name] ? 'cursor-pointer' : '']"
              @click="it.kind === 'suggest' && track([it.name])"
            >
              <HLText html-tag="span" size="md" :weight="it.you ? 'semibold' : 'regular'" :class="['text-right tabular-nums', it.you ? 'text-gray-900' : 'text-gray-500']">
                {{ it.kind === 'row' ? it.rank : '' }}
              </HLText>
              <HLText html-tag="span" size="md" :weight="it.you ? 'semibold' : 'regular'" :class="['min-w-0 truncate', it.kind === 'suggest' ? 'text-gray-600' : 'text-gray-900']">
                {{ it.you ? 'You' : it.name }}
              </HLText>
              <HLProgress
                :id="`competitor-share-${it.name}`"
                class="sl-board-bar"
                :percentage="it.value"
                :show-indicator="false"
                :height="10"
                :border-radius="5"
                :fill-border-radius="4"
                rail-color="var(--color-gray-100)"
                :color="it.you ? 'var(--color-chart-strong)' : 'var(--color-chart-soft)'"
                :aria-label="it.kind === 'row' ? `${it.you ? 'You' : it.name}, ${it.value}% of the brands you track` : `${it.name}, not tracked yet`"
              />
              <template v-if="it.kind === 'row'">
                <HLText html-tag="span" size="md" weight="semibold" class="text-gray-900 text-right tabular-nums">{{ it.value }}%</HLText>
                <HLTooltip v-if="!it.you" trigger="hover">
                  <template #trigger>
                    <HLButton :id="`remove-competitor-${it.name}`" variant="ghost" size="sm" :aria-label="`Stop tracking ${it.name}`" @click.stop="removeCompetitor(it.name)">
                      <template #iconLeft><XCloseIcon /></template>
                    </HLButton>
                  </template>
                  Stop tracking {{ it.name }}
                </HLTooltip>
                <span v-else aria-hidden="true" />
              </template>
              <div v-else class="col-span-2 flex justify-end">
                <!-- Keyed by phase so each phase is a fresh button: no click focus ring, no spinner
                     fading out behind "Added". -->
                <HLButton
                  :key="pending[it.name] || 'idle'"
                  :id="`track-${initials(it.name)}`"
                  :class="['sl-track-btn', pending[it.name] === 'added' ? 'is-added' : '']"
                  variant="secondary" size="sm"
                  :loading="pending[it.name] === 'loading'"
                  :aria-label="`Track ${it.name}`"
                  @click.stop="track([it.name])"
                >
                  <template v-if="pending[it.name] === 'added'" #iconLeft><CheckIcon /></template>
                  {{ pending[it.name] === 'added' ? 'Tracking' : 'Track' }}
                </HLButton>
              </div>
            </div>
          </ChartTip>
        </div>
      </TransitionGroup>

      <!-- d02 (21 Oct): the footer group is anchored to the card's bottom padding line. When the
           card is stretched to Trending everywhere's height, the spare height sits between the board
           and this group (one gap), not as a strip under the limit note above the rule. Inside the
           group: note, 12, rule, 12, next step (HLSpace md). -->
      <div data-comp-foot class="mt-auto pt-4 flex flex-col gap-3">
        <!-- f02 (21 Oct final): the "3 of 3 tracked" note is gone. It was the 30px that left the
             card between whole Trending rows (421 vs 392/454); without it the pair ends level.
             The limit still shows where it matters: Edit competitors and the add flow. -->
        <!-- out14 (21 Oct): the limit note is back (approved; Sujit wants limits up front), first in
             the footer group, 12 above the rule. -->
        <HLText v-if="!room" id="competitor-limit" size="md" class="text-gray-500">
          {{ maxCompetitors }} of {{ maxCompetitors }} tracked, the most you can track. Remove one to track another.
        </HLText>
        <div class="flex items-center gap-3 pt-3 border-t border-gray-200">
          <template v-if="room">
            <HLText size="md" class="text-gray-600 min-w-0 flex-1">Not on the list?</HLText>
            <HLButton id="competitor-any-brand" class="shrink-0" variant="text" color="blue" size="xs" @click="openModal">Track any brand</HLButton>
          </template>
          <template v-else-if="leader">
            <HLText size="md" class="text-gray-600 min-w-0 flex-1">
              <span class="font-semibold text-gray-900">Next step:</span> {{ leader.name.length <= 14 ? 'See what your top competitor is posting.' : `See what ${leader.name} is posting.` }}
            </HLText>
            <HLButton id="competitor-next-search" class="shrink-0" variant="text" color="blue" size="xs" @click="peek(leader.name)">{{ leader.name.length <= 14 ? `Search ${leader.name}` : 'Search it' }}</HLButton>
          </template>
        </div>
      </div>
    </template>

    <!-- 0 tracked: unchanged. Dashed rows, the whole row is the button. -->
    <div v-else id="competitor-suggestions" class="flex flex-col flex-1">
      <!-- out9 q01: a typed-in industry has no suggestions we can stand behind, so none are shown. -->
      <!-- d02 (21 Oct): the centred HLEmpty left a 70px band under it once the card took Trending
           everywhere's height. Same anatomy as the suggestions instead: a label, then the three open
           slots as the dashed HLButton rows, each opening Add competitor. Same height, 25 at the bottom. -->
      <template v-if="!left.length">
        <HLText id="competitor-no-suggestions" size="md" weight="medium" class="text-gray-500 mt-4!">No suggestions for {{ space }} yet</HLText>
        <div class="flex flex-col gap-2 mt-2">
          <HLButton
            v-for="i in maxCompetitors" :key="i" :id="`competitor-slot-${i}`" class="sl-dashed sl-suggest-btn"
            variant="secondary" size="lg" full-width :aria-label="`Add competitor ${i} of ${maxCompetitors}`" @click="openModal"
          >
            <span class="flex items-center gap-2 min-w-0 flex-1">
              <HLText html-tag="span" size="md" weight="medium" class="text-gray-500 min-w-0 truncate text-left">Add a brand you compete with</HLText>
            </span>
            <template #iconRight><PlusIcon /></template>
          </HLButton>
        </div>
      </template>
      <HLText v-if="left.length" size="md" weight="medium" class="text-gray-500 mt-4!">Suggested for {{ space }}</HLText>
      <div v-if="left.length" class="flex flex-col gap-2 mt-2">
        <!-- Round 7 (HighRise only): each suggestion is HLButton secondary lg (44) full width with the
             dashed border (.sl-dashed on HighRise's border element), the monogram an HLAvatar xs. -->
        <HLButton
          v-for="n in left" :key="n" :id="`suggest-add-${initials(n)}`" class="sl-dashed sl-suggest-btn"
          variant="secondary" size="lg" full-width :aria-label="`Add ${n} as a competitor`" @click="addCompetitor(n)"
        >
          <span class="flex items-center gap-2 min-w-0 flex-1">
            <HLAvatar :name="n" size="xs" :round="false" preferred-initials-bg-color="var(--gray-100)" aria-hidden="true" />
            <HLText html-tag="span" size="md" weight="medium" class="text-gray-700 min-w-0 truncate text-left">{{ n }}</HLText>
          </span>
          <template #iconRight><PlusIcon /></template>
        </HLButton>
      </div>
    </div>
  </div>
</HLCard>
</template>

<style scoped>
/* The suggestion button's content runs the full width: monogram + name left, + on the right edge. */
/* out15 F02: HighRise lg pads 10/18; these rows sit on the 12/16 scale (44 tall: 12 + 20 + 12). */
.sl-suggest-btn.sl-suggest-btn { padding: 12px 16px !important; }
.sl-suggest-btn :deep(.hr-button__content) { width: 100%; justify-content: space-between; }
.sl-suggest-btn :deep(.hr-button__content-default-slot) { flex: 1; min-width: 0; display: flex; }
/* d04 (21 Oct): HLAvatar xs prints its initials at 12 (--hr-font-size-sm), off the 13/14/16 scale.
   13 (--hr-font-size-md) fits two letters in the 24px tile; this monogram only. */
.sl-suggest-btn :deep(.hr-avatar__container), .sl-suggest-btn :deep(.hr-avatar__text) { font-size: var(--hr-font-size-md); }

/* The board: rows slide to their rank, the label and the note fade. */
.sl-board-item { background: var(--color-white); }
.sl-board-move { position: relative; z-index: 1; transition: transform .45s cubic-bezier(.2, .7, .2, 1); }
.sl-board-enter-active, .sl-board-leave-active { transition: opacity .25s ease; }
.sl-board-enter-from, .sl-board-leave-to { opacity: 0; }
.sl-board-leave-active { position: absolute; left: 0; right: 0; }
/* The bar grows to its share once the row is tracked, and the others rebase with it. */
.sl-board-bar :deep(*) { transition: width .5s ease .15s; }
/* "Added" stays put for a beat before the row moves; it isn't a second click target. */
.sl-track-btn.is-added { pointer-events: none; }
.sl-track-btn { min-width: 100px; }
</style>
