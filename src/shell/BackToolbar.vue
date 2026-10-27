<script setup>
import { ArrowLeftIcon } from '@gohighlevel/ghl-icons/24/outline'

defineProps({
  onBack: Function,
  label: String,
})
</script>

<template>
  <!-- 48px, the one toolbar height the shell uses (TopBar simple, tabbed row 2, Canvas level 2). -->
  <div class="h-12 border-b border-gray-200 px-4 flex items-center gap-3 shrink-0 bg-white min-w-0">
    <HLButton variant="text" color="gray" size="xs" class="shrink-0" @click="onBack?.()">
      <template #iconLeft><ArrowLeftIcon /></template>
      Back
    </HLButton>
    <template v-if="label">
      <HLDivider vertical class="shrink-0" />
      <!-- The label is often a term someone typed, so it truncates rather than pushing the
           actions off the bar. -->
      <HLText size="lg" weight="semibold" class="text-gray-900 truncate min-w-14" :title="label">{{ label }}</HLText>
    </template>
    <!-- Filters sit with the title, not with the actions: they say what you are looking at,
         and the right-hand group says what you can do about it. -->
    <template v-if="$slots.filters">
      <HLDivider vertical class="shrink-0" />
      <div class="flex items-center shrink-0">
        <slot name="filters" />
      </div>
    </template>
    <template v-if="$slots.actions">
      <div class="flex-1 min-w-4" />
      <!-- The actions keep their size; when the bar runs out of room the label is what gives
           way (it truncates). Not a scrolling group: that would clip the alert badge. -->
      <div class="flex items-center gap-2 shrink-0">
        <slot name="actions" />
      </div>
    </template>
  </div>
</template>
