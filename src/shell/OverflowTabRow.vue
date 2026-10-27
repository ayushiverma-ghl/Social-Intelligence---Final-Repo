<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ChevronDownIcon } from '@gohighlevel/ghl-icons/24/outline'

// Not HLTabs. HLTabs overflows at a fixed tab count rather than at the available width, its
// overflow menu is an icon-only dots button that swaps the chosen tab into the row, and a
// pick from that menu never emits update:value. This row needs "More" to follow the width of
// the top bar and to show the active tab's name when it sits in the overflow, so it keeps its
// own measuring and hands the overflow list to HLDropdown.
const props = defineProps({
  tabs: Array,
  activeTab: String,
  onTabChange: Function,
  textSize: String,
  indicatorBottom: { type: String, default: null },
})

const wrapperRef = ref(null)
const visibleCount = ref(props.tabs.length)

function measure() {
  const wrapper = wrapperRef.value
  if (!wrapper) return

  const ghosts = Array.from(wrapper.querySelectorAll('[data-ghost-tab]'))
  const available = wrapper.offsetWidth

  const activeIdx = props.tabs.indexOf(props.activeTab)
  const activeGhostW = (activeIdx >= 0 && ghosts[activeIdx]) ? ghosts[activeIdx].offsetWidth : 0
  // Label + gap-1 + 14px chevron, so "More" has room for the active tab's name when it lands there.
  const MORE_W = Math.max(70, activeGhostW + 18)

  let used = 0
  let count = ghosts.length

  for (let i = 0; i < ghosts.length; i++) {
    const w = ghosts[i].offsetWidth + 4
    const willNeedMore = i < ghosts.length - 1
    if (used + w + (willNeedMore ? MORE_W : 0) > available) {
      count = i
      break
    }
    used += w
  }
  visibleCount.value = count
}

let ro = null

onMounted(() => {
  const wrapper = wrapperRef.value
  if (!wrapper) return
  ro = new ResizeObserver(measure)
  ro.observe(wrapper)
  measure()
})

onUnmounted(() => {
  ro?.disconnect()
})

watch([() => props.tabs.join('|'), () => props.activeTab], measure)

const visible = computed(() => props.tabs.slice(0, visibleCount.value))
const overflow = computed(() => props.tabs.slice(visibleCount.value))
const activeInOverflow = computed(() => overflow.value.includes(props.activeTab))
const overflowOptions = computed(() => overflow.value.map((t) => ({ key: t, label: t })))

// Same colours as HLTabs: gray-600 at rest, primary-700 when chosen. Weight is HLText's.
const tabClass = (on) => [
  'relative flex items-center justify-center self-stretch px-2 whitespace-nowrap transition-colors shrink-0 rounded-lg',
  'focus-visible:outline-2 focus-visible:outline-primary-600 focus-visible:-outline-offset-2',
  on ? 'text-primary-700' : 'text-gray-600 hover:text-gray-900',
]
</script>

<template>
  <div ref="wrapperRef" role="tablist" class="flex self-stretch items-center gap-1 min-w-0 flex-1 relative">

    <!-- Ghost row for measurement. Semibold, the wider of the two weights a tab can have,
         so a tab never outgrows its measured width when it becomes the active one. -->
    <div class="absolute top-0 left-0 flex items-center gap-1 opacity-0 pointer-events-none" aria-hidden="true">
      <HLText
        v-for="tab in tabs"
        :key="tab"
        html-tag="span"
        data-ghost-tab
        :size="textSize"
        weight="semibold"
        class="px-2 whitespace-nowrap"
      >
        {{ tab }}
      </HLText>
    </div>

    <!-- Visible tabs -->
    <button
      v-for="tab in visible"
      :key="tab"
      type="button"
      role="tab"
      :aria-selected="tab === activeTab"
      @click="onTabChange?.(tab)"
      :class="tabClass(tab === activeTab)"
    >
      <HLText html-tag="span" :size="textSize" :weight="tab === activeTab ? 'semibold' : 'medium'" class="translate-y-px">{{ tab }}</HLText>
      <span
        v-if="tab === activeTab && indicatorBottom"
        :class="`absolute ${indicatorBottom} left-0 right-0 h-0.5 bg-primary-700 rounded-full`"
      />
    </button>

    <!-- More -->
    <div v-if="overflow.length > 0" class="shrink-0 self-stretch flex items-center">
      <HLDropdown
        id="shell-tab-overflow"
        trigger="click"
        placement="bottom-start"
        :options="overflowOptions"
        :show-search="false"
        @select="(key) => onTabChange?.(key)"
      >
        <button
          type="button"
          role="tab"
          :aria-selected="activeInOverflow"
          aria-haspopup="menu"
          :class="[...tabClass(activeInOverflow), 'gap-1 h-full']"
        >
          <HLText html-tag="span" :size="textSize" :weight="activeInOverflow ? 'semibold' : 'medium'" class="translate-y-px">
            {{ activeInOverflow ? activeTab : 'More' }}
          </HLText>
          <ChevronDownIcon class="w-3.5 h-3.5 translate-y-px" />
          <span
            v-if="activeInOverflow && indicatorBottom"
            :class="`absolute ${indicatorBottom} left-0 right-0 h-0.5 bg-primary-700 rounded-full`"
          />
        </button>
      </HLDropdown>
    </div>
  </div>
</template>
