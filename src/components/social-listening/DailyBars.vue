<script setup>
// Mentions each day as bars (WBR 12 Oct, 4E). Khoi: the line chart was "so large… not a lot of
// information". Seven points read better as seven bars, and 64px is enough to compare them.
// Today is the darker bar. Past 14 points only the first and last labels show.
import { computed } from 'vue'
import { fmtNum } from '../../data/socialListening.js'

const props = defineProps({
  series: { type: Array, required: true },
  labels: { type: Array, required: true },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
})
const H = 64
const max = computed(() => Math.max(...props.series, 1))
const dense = computed(() => props.series.length > 14)
</script>

<template>
  <div class="border border-gray-200 rounded-lg px-4 pt-3.5 pb-3">
    <HLText size="lg" weight="semibold" class="text-gray-900">{{ title }}</HLText>
    <HLText size="md" class="text-gray-500">{{ subtitle }}</HLText>
    <div class="flex items-end gap-2 mt-3" :class="dense ? 'gap-1' : 'gap-4'" role="img" :aria-label="`${title}: ${series.map((v, i) => `${labels[i]} ${v}`).join(', ')}`">
      <div v-for="(v, i) in series" :key="i" class="flex-1 flex flex-col items-center gap-1.5 min-w-0">
        <HLText v-if="!dense" html-tag="span" size="md" class="text-gray-500 tabular-nums">{{ fmtNum(v) }}</HLText>
        <span
          class="block w-full max-w-22 rounded-t-md"
          :class="i === series.length - 1 ? 'bg-chart-strong' : 'bg-chart-soft'"
          :style="{ height: Math.max(4, Math.round((v / max) * H)) + 'px' }"
        />
        <HLText
          v-if="!dense || i === 0 || i === series.length - 1" html-tag="span" size="md"
          :class="i === series.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-400'" class="whitespace-nowrap"
        >{{ i === series.length - 1 ? 'Today' : labels[i] }}</HLText>
      </div>
    </div>
  </div>
</template>
