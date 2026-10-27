<script setup>
import { ArrowLeftIcon } from '@gohighlevel/ghl-icons/24/outline'

const props = defineProps({
  level: { type: Number, default: 1 },
  onBack: Function,
  backLabel: { type: String, default: 'Back' },
  title: String,
  // 23 Oct: a page that lays out and scrolls its own panes (the insights page) takes the body
  // without padding or scrolling.
  flush: Boolean,
})

// HighRise's own lg elevation, which is the value the arbitrary shadow here used to spell out.
const CANVAS_SHADOW = 'shadow-(--shadow-lg)'
</script>

<template>
  <template v-if="level === 2">
    <div class="flex-1 flex flex-col min-h-0 bg-gray-50 p-4">
      <div :class="`bg-white rounded-xl ${CANVAS_SHADOW} flex flex-col flex-1 overflow-hidden`">
        <!-- 48px, the one toolbar height the shell uses (TopBar simple, tabbed row 2, BackToolbar). -->
        <div class="h-12 border-b border-gray-200 px-8 flex items-center gap-3 shrink-0 min-w-0">
          <slot name="bar">
          <HLButton variant="text" color="gray" size="xs" class="shrink-0" @click="onBack?.()">
            <template #iconLeft><ArrowLeftIcon /></template>
            {{ backLabel }}
          </HLButton>
          <template v-if="title">
            <HLDivider vertical class="shrink-0" />
            <HLText size="lg" weight="semibold" class="text-gray-900 truncate min-w-0">{{ title }}</HLText>
          </template>
          <template v-if="$slots.toolbar">
            <div class="flex-1" />
            <div class="flex items-center gap-2 shrink-0">
              <slot name="toolbar" />
            </div>
          </template>
          </slot>
        </div>
        <div :class="flush ? 'relative flex-1 min-h-0 flex flex-col overflow-hidden' : 'relative flex-1 overflow-y-auto px-8 py-6'">
          <slot />
        </div>
      </div>
    </div>
  </template>

  <template v-else>
    <!-- relative: an absolutely positioned descendant with no positioned ancestor (the sr-only
         "Up"/"Down" labels on deltas) takes the page as its containing block, escapes this
         scroller's clipping and stretches the document past the window. -->
    <div class="relative flex-1 overflow-auto bg-gray-50 p-4 flex flex-col">
      <div :class="`bg-white rounded-xl ${CANVAS_SHADOW} px-8 py-6 flex-1`">
        <slot />
      </div>
    </div>
  </template>
</template>
