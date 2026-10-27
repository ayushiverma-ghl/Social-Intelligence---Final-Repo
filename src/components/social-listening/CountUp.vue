<script setup>
// A figure that counts up to its value when it changes (Sujeet, 5 Oct). Simplified design only,
// and never under reduced motion: otherwise it renders the value as it is.
import { ref, watch, onBeforeUnmount } from 'vue'
import { useSocialListening } from '../../composables/useSocialListening.js'

const props = defineProps({
  value: { type: Number, default: 0 },
  decimals: { type: Number, default: 0 },
  suffix: { type: String, default: '' },
  duration: { type: Number, default: 800 },
})
const { simple } = useSocialListening()
const fmt = (v) => Number(v).toLocaleString('en-US', { minimumFractionDigits: props.decimals, maximumFractionDigits: props.decimals })
const shown = ref(fmt(props.value) + props.suffix)
let raf = 0
let from = 0

function run(to) {
  cancelAnimationFrame(raf)
  const reduced = typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!simple.value || reduced || !Number.isFinite(to)) { shown.value = fmt(to) + props.suffix; from = to; return }
  const start = performance.now()
  const base = from
  const step = (now) => {
    const t = Math.min(1, (now - start) / props.duration)
    const eased = 1 - (1 - t) ** 3
    const v = base + (to - base) * eased
    shown.value = fmt(props.decimals ? v : Math.round(v)) + props.suffix
    if (t < 1) raf = requestAnimationFrame(step)
    else from = to
  }
  raf = requestAnimationFrame(step)
}
watch(() => props.value, run, { immediate: true })
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>{{ shown }}</template>
