<script setup>
// A chart's hover readout (Sujeet, 5 Oct). The first line names the point, the rest are its
// figures. Simplified design only: in the current design it renders its content untouched.
import { useSocialListening } from '../../composables/useSocialListening.js'

defineProps({
  lines: { type: Array, default: () => [] },
  placement: { type: String, default: 'top' },
})
const { simple } = useSocialListening()
</script>

<template>
  <HLTooltip v-if="simple && lines.length" trigger="hover" :placement="placement" :delay="60">
    <template #trigger><slot /></template>
    <div class="flex flex-col gap-0.5">
      <HLText size="md" weight="semibold" class="text-gray-900">{{ lines[0] }}</HLText>
      <HLText v-for="(l, i) in lines.slice(1)" :key="i" size="md" class="text-gray-600 tabular-nums">{{ l }}</HLText>
    </div>
  </HLTooltip>
  <slot v-else />
</template>
