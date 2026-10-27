<script setup>
// The 3-step loader, copied from the reference prototype (social-listening-rose), option S1 of
// the 7 Oct loader review. It fills the topic detail view while a search or a topic loads.
//
// Deliberately not the orbit: the orbit means something is being set up, this one means a
// topic that already exists is being read. Timing is the reference's: the second step at
// 600ms, the third at 1200ms, and TopicDetail swaps in the content at 1800ms, so the third
// step is still running when it goes. Colours are the nearest tokens to the reference's
// (#EEF4FF -> primary-50, #C7D7FD -> primary-100, #16A34A -> positive).
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { SearchMdIcon, BarChart07Icon, Stars02Icon, CheckIcon } from '@gohighlevel/ghl-icons/24/outline'

defineProps({ query: { type: String, required: true } })

const STEPS = [
  { icon: SearchMdIcon, label: 'Scanning platforms…' },
  { icon: BarChart07Icon, label: 'Analyzing sentiment…' },
  { icon: Stars02Icon, label: 'Compiling insights…' },
]
const at = ref(0)
const timers = []
onMounted(() => {
  timers.push(setTimeout(() => { at.value = 1 }, 600))
  timers.push(setTimeout(() => { at.value = 2 }, 1200))
})
onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<template>
  <div class="flex-1 flex flex-col items-center justify-center gap-8 px-8">
    <div class="relative w-32 h-32 flex items-center justify-center" aria-hidden="true">
      <span class="absolute inset-0 rounded-full bg-primary-50 animate-ping opacity-40 motion-reduce:animate-none" />
      <span class="absolute inset-2 rounded-full bg-primary-50 animate-ping opacity-30 [animation-delay:0.3s] motion-reduce:animate-none" />
      <span class="absolute inset-5 rounded-full bg-primary-50 animate-ping opacity-25 [animation-delay:0.6s] motion-reduce:animate-none" />
      <div class="relative w-16 h-16 rounded-full bg-white border border-primary-100 shadow-(--shadow-sm) flex items-center justify-center">
        <SearchMdIcon class="w-6 h-6 text-primary-600" />
      </div>
    </div>

    <div class="flex flex-col items-center gap-2 text-center">
      <HLText size="2xl" weight="semibold" class="text-gray-900">Listening for "<span class="text-primary-600">{{ query }}</span>"</HLText>
      <HLText size="md" class="text-gray-500 max-w-sm">Pulling mentions, sentiment, and trends across every connected platform.</HLText>
    </div>

    <ol class="flex flex-col gap-2.5 min-w-[220px] m-0 p-0 list-none" aria-live="polite">
      <li v-for="(s, i) in STEPS" :key="s.label" class="flex items-center gap-2.5">
        <span
          :class="[
            'w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors',
            i < at ? 'bg-positive text-white' : i === at ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-300',
          ]"
        >
          <CheckIcon v-if="i < at" class="w-3 h-3" />
          <component :is="s.icon" v-else class="w-2.75 h-2.75" />
        </span>
        <HLText
          html-tag="span"
          size="md"
          :weight="i < at ? 'medium' : i === at ? 'semibold' : 'regular'"
          :class="['transition-colors', i < at ? 'text-gray-600' : i === at ? 'text-gray-900' : 'text-gray-400']"
        >{{ s.label }}</HLText>
        <span v-if="i === at" class="flex gap-0.5 ml-1" aria-hidden="true">
          <span class="w-1 h-1 rounded-full bg-primary-600 animate-pulse" />
          <span class="w-1 h-1 rounded-full bg-primary-600 animate-pulse [animation-delay:0.15s]" />
          <span class="w-1 h-1 rounded-full bg-primary-600 animate-pulse [animation-delay:0.3s]" />
        </span>
      </li>
    </ol>
  </div>
</template>
