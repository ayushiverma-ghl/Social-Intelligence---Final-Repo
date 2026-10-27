<script setup>
// 26 Oct (Harsh): Trends as a tab. The 21 Oct Trending now pop-up's body (every source, top 12 as
// cards, the side list following the scroll) in a frame that fills the rest of the window, so the
// sections scroll inside it like the insights page. 27 Oct (developers): the six sources only.
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useSocialListening } from '../../composables/useSocialListening.js'
import TrendsScroll from './TrendsScroll.vue'
import { trendSources } from './trendsData.js'

const { state, range, toast } = useSocialListening()
const TREND_ORDER = ['google', 'pinterest', 'wikipedia', 'yt-videos', 'yt-keywords', 'yt-channels']
const list = computed(() => [...trendSources(state.range)].sort((a, b) => TREND_ORDER.indexOf(a.key) - TREND_ORDER.indexOf(b.key)))
const unitLabel = (u) => u.charAt(0).toUpperCase() + u.slice(1)
function exportTrends() {
  const cell = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"'
  const csv = [['Source', 'Rank', 'Trend', 'Volume', 'Unit', 'Change vs last week'].map(cell).join(',')]
    .concat(list.value.flatMap((s) => s.rows.map((r, i) => [s.label, i + 1, r.term, r.value, unitLabel(s.unit), r.isNew ? 'New' : `${r.change}%`].map(cell).join(','))))
    .join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  a.download = 'trends.csv'
  a.click()
  URL.revokeObjectURL(a.href)
  toast(`Downloaded ${list.value.reduce((n, s) => n + s.rows.length, 0)} trends`)
}

// The frame runs from its top to the bottom of the window, less the canvas's own bottom inset.
const frame = ref(null)
const height = ref(560)
function fit() {
  const el = frame.value
  if (!el) return
  height.value = Math.max(480, Math.round(window.innerHeight - el.getBoundingClientRect().top - 40))
}
// Measured again once the tab's fade-in has settled (it starts a few pixels low).
let settle
onMounted(() => { nextTick(fit); settle = setTimeout(fit, 400); window.addEventListener('resize', fit) })
onBeforeUnmount(() => { clearTimeout(settle); window.removeEventListener('resize', fit) })
</script>

<template>
  <div id="trends-home" class="flex flex-col gap-4">
    <div class="flex items-center gap-4 h-9">
      <HLText size="md" class="text-gray-600 flex-1 min-w-0">
        What’s rising on Google, Pinterest, Wikipedia and YouTube · {{ range.label }}
      </HLText>
      <HLButton id="trends-home-export" variant="secondary" size="sm" @click="exportTrends">Export</HLButton>
    </div>
    <div ref="frame" class="sl-trends-frame" :style="{ height: height + 'px' }">
      <TrendsScroll :sources="list" more />
    </div>
  </div>
</template>

<style scoped>
/* The pop-up's two panes in a bordered frame: white source list, grey-50 behind the cards. */
.sl-trends-frame { display: flex; flex-direction: column; border: 1px solid var(--gray-200); border-radius: 12px; overflow: hidden; background: var(--gray-50); }
</style>
