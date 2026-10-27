<script setup>
// HLTabs down the left. It reads its HLTab children once, when it mounts, so the key
// remounts it if the list itself changes; the active tab is a prop and updates in place.
defineProps({
  tabs: Array,
  activeTab: String,
  onTabChange: Function,
  label: String,
  // Pulsing bars in place of the tabs while the page behind them loads, one per tab.
  loading: Boolean,
})
const SKELETON_WIDTHS = ['w-3/5', 'w-4/5', 'w-3/4', 'w-2/3', 'w-3/5', 'w-4/5', 'w-[88%]', 'w-2/3']
</script>

<template>
  <aside class="sl-vertical-tabs flex flex-col w-50 shrink-0 overflow-y-auto">
    <div v-if="label" class="px-4 pt-4 pb-2">
      <HLText html-tag="span" size="sm" weight="medium" class="text-gray-500">{{ label }}</HLText>
    </div>
    <div v-if="loading" class="p-4 flex flex-col gap-0.5" aria-hidden="true">
      <div v-for="(tab, i) in tabs" :key="tab" class="px-3 py-2">
        <div
          :class="['h-3 rounded-full animate-pulse motion-reduce:animate-none', SKELETON_WIDTHS[i % SKELETON_WIDTHS.length], i === 0 ? 'bg-gray-200' : 'bg-gray-100']"
          :style="{ animationDelay: `${i * 0.1}s` }"
        />
      </div>
    </div>
    <div v-else class="p-4">
      <HLTabs
        :key="(tabs || []).join('|')"
        id="shell-vertical-tabs"
        :value="activeTab"
        placement="left"
        type="line"
        :max-visible-tabs="(tabs || []).length"
        @update:value="(v) => onTabChange?.(v)"
      >
        <HLTab v-for="tab in tabs" :key="tab" :name="tab" :tab="tab" />
      </HLTabs>
    </div>
  </aside>
</template>
