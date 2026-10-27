<script setup>
// 19 Oct: one trend in a list. Rank, the term with its volume under it, and New or a rising
// arrow. On hover the mark gives way to a "+ Listen" text action (L2, no box); a trend you
// listen to says so. The row opens
// the insights pop-up.
import { computed } from 'vue'
import { ArrowUpRightIcon, Headphones01Icon } from '@gohighlevel/ghl-icons/24/outline'
import { TOPIC_SHOWN_LIMIT } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'
import { shortNum } from './trendsData.js'
import TrendDetailsTip from './TrendDetailsTip.vue'

const props = defineProps({ row: { type: Object, required: true }, rank: { type: Number, default: 0 }, showChange: Boolean, icon: { type: [Object, Function], default: null }, source: { type: String, default: '' } })
const { state, peek, listenTo, isSavedTerm, toast, removeTopicQuietly } = useSocialListening()
const listening = computed(() => isSavedTerm(props.row.term))
const atLimit = computed(() => (state.topicsByAccount[state.accountId] || []).length >= TOPIC_SHOWN_LIMIT)
function listen() {
  const t = props.row.term
  listenTo(t)
  toast(`You’re now listening to “${t}”`, 'It’s in Your topics. We check it every 6 hours.', 'positive', [{ label: 'Undo', run: () => removeTopicQuietly(t) }])
}
</script>

<template>
  <div class="sl-trow" role="button" tabindex="0" :aria-label="`See what people say about ${row.term}`" @click="peek(row.term)" @keydown.enter="peek(row.term)">
    <slot name="lead" />
    <component :is="icon" v-if="icon" class="w-5 h-5 shrink-0" aria-hidden="true" />
    <HLText v-else html-tag="span" size="md" class="text-gray-500 tabular-nums w-4 text-right shrink-0">{{ rank }}</HLText>
    <span class="min-w-0 flex-1">
      <TrendDetailsTip :row="row"><HLText html-tag="span" size="lg" weight="medium" class="block text-gray-900 truncate sl-trow-name">{{ row.term }}</HLText></TrendDetailsTip>
      <HLText html-tag="span" size="md" class="sl-trow-meta block text-gray-500 tabular-nums">
        <template v-if="source">{{ source }} · </template>{{ shortNum(row.value) }} {{ row.unit }}<template v-if="showChange"> · <span class="text-positive-strong font-semibold">↑ {{ row.change }}%</span></template>
      </HLText>
    </span>
    <!-- Round 7: "New" is an HLTag (gray), not hand-styled text in the meta line. md, so it is 13px like every tag (xs drew 11px). -->
    <HLTag v-if="row.isNew && !listening" class="sl-trow-new shrink-0" size="md" color="gray" :interactive="false">New</HLTag>
    <slot />
    <span class="sl-trow-rest">
      <HLText v-if="listening" html-tag="span" size="md" class="inline-flex items-center gap-1 text-gray-500"><Headphones01Icon class="w-4 h-4" />Listening</HLText>
      <ArrowUpRightIcon v-else class="w-4 h-4 text-positive-strong" aria-label="Rising" />
    </span>
    <span class="sl-trow-hover">
      <HLText v-if="listening" html-tag="span" size="md" class="inline-flex items-center gap-1 text-gray-500"><Headphones01Icon class="w-4 h-4" />Listening</HLText>
      <HLButton v-else variant="text" color="blue" size="xs" :disabled="atLimit" :aria-label="atLimit ? 'Listen. All 50 topics are in use' : `Listen to ${row.term}`" @click.stop="listen" @keydown.enter.stop>
        Listen
      </HLButton>
    </span>
  </div>
</template>

<style scoped>
.sl-trow { display: flex; align-items: center; gap: 12px; min-height: 60px; margin: 0 -8px; padding: 8px; border-radius: 8px; border-bottom: 1px solid var(--color-gray-100); cursor: pointer; }
.sl-trow:last-child { border-bottom: 0; }
.sl-trow:hover { background: var(--color-gray-50); }
.sl-trow:focus-visible { outline: 2px solid var(--color-primary-600); outline-offset: -2px; }
.sl-trow-rest { display: inline-flex; align-items: center; flex-shrink: 0; }
.sl-trow-hover { display: none; align-items: center; gap: 8px; flex-shrink: 0; }
.sl-trow:hover .sl-trow-rest, .sl-trow:focus-within .sl-trow-rest { display: none; }
.sl-trow:hover .sl-trow-hover, .sl-trow:focus-within .sl-trow-hover { display: inline-flex; }
</style>
