<script setup>
// The orbit loader, copied from the reference prototype (social-listening-rose), option O1 of
// the 7 Oct loader review. It plays in two places: after a niche is picked (AnalyzingOverlay)
// and after "Create topic" (CreateTopicModal step 3).
//
// Sizes and timing are the reference's own. Its two near-token colours are mapped to the
// nearest token (#C7D7FD ring -> primary-100, #EEF4FF track -> primary-50). The centre tile's
// 16px radius and blue glow stay literal on purpose: they are what makes it read as the same
// loader, and the radius and shadow scales have nothing close.
//
// It runs itself: +20% every 500ms, one status line per tick, and a platform lights once the
// bar passes its share of the ring. Callers hand off 3s after mount, 500ms after 100%.
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Stars02Icon } from '@gohighlevel/ghl-icons/24/outline'

const props = defineProps({
  title: { type: String, required: true },
  lines: { type: Array, required: true },
})

// The reference always shows these six, in this order, whatever was picked. White marks on
// the brand colour, so they are drawn here rather than taken from the full-colour misc set.
const PLATFORMS = [
  { id: 'facebook', color: '#1877F2', d: 'M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.2-1.5 1.5-1.5h1.6V4.9c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.4v7h3.1z' },
  { id: 'x', color: '#0F172A', d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z' },
  { id: 'instagram', color: '#E1306C' },
  { id: 'youtube', color: '#FF0000', d: 'M23.5 6.2c-.3-1-1-1.8-2-2C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.5.6c-1 .3-1.7 1.1-2 2C0 8.2 0 12 0 12s0 3.8.5 5.8c.3 1 1 1.8 2 2 2 .5 9.5.5 9.5.5s7.5 0 9.5-.5c1-.3 1.7-1.1 2-2 .5-2 .5-5.8.5-5.8s0-3.8-.5-5.8zM9.5 15.6V8.4l6.4 3.6-6.4 3.6z' },
  { id: 'linkedin', color: '#0A66C2', d: 'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z' },
  { id: 'reddit', color: '#FF4500', d: 'M22 11.8c0-1.1-.9-2-2-2-.5 0-1 .2-1.4.6-1.4-.9-3.2-1.5-5.2-1.6l1-4.2 3 .7c0 .9.7 1.6 1.6 1.6.9 0 1.6-.7 1.6-1.6 0-.9-.7-1.6-1.6-1.6-.6 0-1.2.4-1.4.9L14.2 4c-.1 0-.2 0-.3.1-.1.1-.1.2-.1.3l-1.1 4.6c-2.1 0-4 .6-5.4 1.6-.4-.4-.9-.6-1.5-.6-1.1 0-2 .9-2 2 0 .8.5 1.5 1.1 1.8 0 .2-.1.4-.1.6 0 2.9 3.4 5.3 7.5 5.3s7.5-2.4 7.5-5.3c0-.2 0-.4-.1-.6.7-.3 1.2-1 1.2-1.8zM7 13.4c0-.7.6-1.3 1.3-1.3.7 0 1.3.6 1.3 1.3 0 .7-.6 1.3-1.3 1.3-.7 0-1.3-.6-1.3-1.3zm8 3.7c-1 1-2.6 1-3 1s-2 0-3-1c-.1-.1-.1-.3 0-.4.1-.1.3-.1.4 0 .6.6 2 .9 2.6.9.6 0 2-.2 2.6-.9.1-.1.3-.1.4 0 .1.1.1.3 0 .4zm-.3-2.4c-.7 0-1.3-.6-1.3-1.3 0-.7.6-1.3 1.3-1.3.7 0 1.3.6 1.3 1.3 0 .7-.6 1.3-1.3 1.3z' },
]
const NODES = PLATFORMS.map((p, t) => {
  const a = (t / PLATFORMS.length * 360 - 90) * Math.PI / 180
  return { ...p, x: Math.round(Math.cos(a) * 78), y: Math.round(Math.sin(a) * 78) }
})

const pct = ref(0)
const line = ref(0)
const lit = (t) => pct.value >= (t + 1) / PLATFORMS.length * 100 - 4

let timer = null
onMounted(() => {
  let e = 0
  timer = setInterval(() => {
    e++
    pct.value = e * 20
    line.value = Math.min(e - 1, props.lines.length - 1)
    if (e >= 5) clearInterval(timer)
  }, 500)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 px-6 gap-8 min-h-[440px]">
    <div class="relative flex items-center justify-center w-[200px] h-[200px]" aria-hidden="true">
      <div class="absolute inset-[22px] rounded-full border-2 border-dashed border-primary-100 animate-spin [animation-duration:10s] motion-reduce:animate-none" />
      <div
        v-for="(n, t) in NODES"
        :key="n.id"
        class="absolute w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500"
        :style="{
          left: `calc(50% + ${n.x}px - 18px)`,
          top: `calc(50% + ${n.y}px - 18px)`,
          backgroundColor: n.color,
          transform: `scale(${lit(t) ? 1 : 0.75})`,
          opacity: lit(t) ? 1 : 0.35,
          boxShadow: lit(t) ? `0 0 0 3px ${n.color}35, 0 2px 8px ${n.color}40` : 'none',
        }"
      >
        <svg v-if="n.id === 'instagram'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none" /></svg>
        <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path :d="n.d" /></svg>
      </div>
      <div class="absolute inset-[44px] rounded-full border-[3px] border-primary-50 border-t-primary-600 animate-spin [animation-duration:0.85s] motion-reduce:animate-none" />
      <div class="relative z-10 w-16 h-16 rounded-[16px] bg-white flex items-center justify-center shadow-[0_4px_16px_rgba(21,94,239,0.18)]">
        <Stars02Icon class="w-6 h-6 text-primary-600" />
      </div>
    </div>

    <!-- Polite live region, so a screen reader hears each status line land. -->
    <div class="text-center flex flex-col gap-2" aria-live="polite">
      <HLText size="2xl" weight="semibold" class="text-gray-900">{{ title }}</HLText>
      <HLText size="lg" weight="regular" class="text-gray-500 min-h-5">{{ lines[line] }}</HLText>
    </div>

    <div class="flex flex-col items-center gap-2 w-72">
      <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div class="h-full bg-primary-600 rounded-full transition-all duration-500" :style="{ width: `${pct}%` }" />
      </div>
      <HLText size="md" weight="regular" class="text-gray-400 tabular-nums">{{ pct }}% complete</HLText>
    </div>
  </div>
</template>
