<script setup>
import { ArrowLeftIcon, DotsHorizontalIcon } from '@gohighlevel/ghl-icons/24/outline'

defineProps({
  onBack: Function,
  title: String,
  onSave: Function,
  onPublish: Function,
})
</script>

<template>
  <header class="bg-white h-14 flex items-center px-4 gap-3 border-b border-gray-200 shadow-(--shadow-xs) shrink-0 min-w-0">
    <HLButton variant="text" color="gray" size="xs" class="shrink-0" @click="onBack?.()">
      <template #iconLeft><ArrowLeftIcon /></template>
      Back
    </HLButton>
    <HLDivider vertical class="shrink-0" />
    <HLText html-tag="span" size="lg" weight="semibold" class="text-gray-900 flex-1 truncate min-w-0">{{ title }}</HLText>
    <div class="flex items-center gap-2 shrink-0">
      <HLButton variant="secondary" size="xs" @click="onSave?.()">Save</HLButton>
      <HLButton variant="primary" color="blue" size="xs" @click="onPublish?.()">Publish</HLButton>
      <HLTooltip trigger="hover">
        <template #trigger>
          <HLButton variant="secondary" size="xs" aria-label="More actions">
            <template #iconLeft><DotsHorizontalIcon /></template>
          </HLButton>
        </template>
        More actions
      </HLTooltip>
    </div>
  </header>
</template>
