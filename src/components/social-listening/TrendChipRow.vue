<script setup>
// 26 Oct (Sujit): the trending keywords stay on one line. As many as fit show, and the rest sit
// behind a "+N" chip (HLButton secondary xs, like the keywords) instead of wrapping to a second
// line. "+N" opens the rest in a HighRise dropdown (option A).
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ArrowUpIcon, Headphones01Icon } from '@gohighlevel/ghl-icons/24/outline'
import { useSocialListening } from '../../composables/useSocialListening.js'

const props = defineProps({ items: { type: Array, required: true }, center: Boolean })
const emit = defineEmits(['pick'])
const { isSavedTerm } = useSocialListening()

const GAP = 8
const row = ref(null)
const moreEl = ref(null)
const fits = ref(props.items.length)
let widths = []
function measure() {
  const el = row.value
  if (!el) return
  if (!widths.length || widths.length !== props.items.length) widths = [...el.querySelectorAll('.sl-trend-tag')].map((c) => c.offsetWidth)
  const avail = el.clientWidth
  const total = widths.reduce((a, w) => a + w, 0) + GAP * (widths.length - 1)
  if (total <= avail) { fits.value = widths.length; return }
  const more = (moreEl.value?.$el || moreEl.value)?.offsetWidth || 48
  let used = 0
  let k = 0
  for (const w of widths) { const next = used + (k ? GAP : 0) + w; if (next + GAP + more > avail) break; used = next; k++ }
  fits.value = Math.max(1, k)
}
let ro
onMounted(() => { nextTick(measure); ro = new ResizeObserver(measure); if (row.value) ro.observe(row.value) })
onBeforeUnmount(() => ro && ro.disconnect())
watch(() => props.items.map((t) => t.term).join('|'), () => { widths = []; fits.value = props.items.length; nextTick(measure) })

const shown = computed(() => props.items.slice(0, fits.value))
const rest = computed(() => props.items.slice(fits.value))
const restOptions = computed(() => rest.value.map((t) => ({ key: t.term, label: `${t.term} · ↑ ${t.delta}%` })))
</script>

<template>
  <div ref="row" :class="['sl-chip-row flex flex-nowrap overflow-hidden gap-2 min-w-0', center && 'justify-center']">
    <HLButton
      v-for="t in shown" :key="t.term" variant="secondary" size="xs" class="sl-trend-tag shrink-0"
      :class="{ 'is-listening': isSavedTerm(t.term) }"
      :aria-label="`${isSavedTerm(t.term) ? 'Listening to' : 'Search'} ${t.term}, up ${t.delta}%`" @click="emit('pick', t.term)"
    >
      <template v-if="isSavedTerm(t.term)" #iconLeft><Headphones01Icon /></template>
      <span class="inline-flex items-center gap-2 whitespace-nowrap">
        <span>{{ t.term }}</span>
        <span class="text-positive-strong tabular-nums inline-flex items-center gap-1"><ArrowUpIcon class="w-3.5 h-3.5" aria-hidden="true" />{{ t.delta }}%</span>
      </span>
    </HLButton>
    <HLDropdown v-if="rest.length" trigger="click" placement="bottom-start" :width="280" :options="restOptions" :show-search="false" @select="(k) => emit('pick', k)">
      <HLButton id="trend-more" ref="moreEl" variant="secondary" size="xs" class="shrink-0" :aria-label="`${rest.length} more trending ${rest.length === 1 ? 'keyword' : 'keywords'}`">+{{ rest.length }}</HLButton>
    </HLDropdown>
  </div>
</template>

<style scoped>
/* The row's width never comes from its chips: a one-line row of five would otherwise widen every
   flex parent up to the shell (none of which can shrink below their content). */
.sl-chip-row { contain: inline-size; }
</style>
