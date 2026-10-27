<script setup>
import { Stars01Icon, Announcement01Icon, Bell01Icon, HelpCircleIcon } from '@gohighlevel/ghl-icons/24/outline'
import OverflowTabRow from './OverflowTabRow.vue'

const props = defineProps({
  variant: { type: String, default: 'tabbed' },
  title: { type: String, default: 'App Title' },
  titleIcon: { type: Object, default: null },
  sectionTabs: { type: Array, default: () => [] },
  activeSection: { type: String, default: '' },
  onSectionTabChange: Function,
  subTabs: { type: Array, default: () => [] },
  activeSubTab: { type: String, default: '' },
  onSubTabChange: Function,
  onOpenNotifications: Function,
  onOpenHelp: Function,
  // Optional: pages that have an Ask AI surface pass a handler. Without one the
  // button behaves exactly as before.
  onAskAI: Function,
  askAIActive: { type: Boolean, default: false },
})

// The global icons, once. They were written out twice, one copy per variant.
const ICONS = [
  { key: 'announcements', icon: Announcement01Icon, label: 'Announcements', dot: true },
  { key: 'notifications', icon: Bell01Icon, label: 'Notifications', run: () => props.onOpenNotifications?.() },
  { key: 'help', icon: HelpCircleIcon, label: 'Help', run: () => props.onOpenHelp?.() },
]
</script>

<template>
  <header class="bg-white w-full flex flex-col shrink-0">

    <!-- Row 1: title (+ section tabs on the tabbed variant) + global icons. On the simple
         variant this is the only row, so it takes the shell's 48px toolbar height and the
         bottom edge. -->
    <div
      :class="['flex items-center gap-4 px-4',
        variant === 'simple' ? 'h-12 border-b border-gray-200 shadow-(--shadow-xs)' : 'pt-2 pb-1']"
    >
      <div class="flex flex-1 self-stretch items-center gap-3 min-w-0">
        <div class="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <component v-if="titleIcon" :is="titleIcon" class="w-3.5 h-3.5 text-gray-500" />
          <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900">{{ title }}</HLText>
        </div>
        <OverflowTabRow
          v-if="variant !== 'simple'"
          :tabs="sectionTabs"
          :active-tab="activeSection"
          :on-tab-change="onSectionTabChange"
          text-size="lg"
        />
      </div>

      <div class="flex items-center gap-1 shrink-0">
        <svg width="0" height="0" class="absolute" aria-hidden="true">
          <defs>
            <linearGradient id="shell-ai-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="var(--color-accent-purple)" />
              <stop offset="100%" stop-color="var(--color-accent-pink)" />
            </linearGradient>
          </defs>
        </svg>
        <!-- Ask AI stays hand-built: it is the product's one AI entry point and carries the
             gradient treatment no HLButton variant has. It is still a real button with a
             visible focus ring and a pressed state. No shortcut hint: ⌘K belongs to the
             sidebar's search, and showing it on both promised two things from one key. -->
        <button
          type="button"
          :aria-pressed="askAIActive"
          :class="['group relative h-8 pl-3 pr-3 mr-1 flex items-center gap-1.5 rounded-full border transition-colors overflow-hidden',
            'hover:border-accent-purple hover:shadow-(--shadow-sm)',
            'focus-visible:outline-2 focus-visible:outline-accent-purple focus-visible:outline-offset-2',
            askAIActive ? 'border-accent-purple shadow-(--shadow-sm)' : 'border-accent-purple-border']"
          @click="onAskAI?.()"
        >
          <span class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-accent-purple/15 to-transparent pointer-events-none" />
          <Stars01Icon class="sl-ai-icon w-3.5 h-3.5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
          <HLText html-tag="span" size="lg" weight="medium" class="relative z-10 bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent">Ask AI</HLText>
        </button>

        <HLTooltip v-for="it in ICONS" :key="it.key" trigger="hover" placement="bottom">
          <template #trigger>
            <HLBadge v-if="it.dot" :id="`shell-${it.key}-dot`" dot color="error" size="3xs" :offset="[-7, 7]">
              <HLButton variant="ghost" size="xs" :aria-label="it.label + ', new'" @click="it.run?.()">
                <template #iconLeft><component :is="it.icon" class="text-gray-500" /></template>
              </HLButton>
            </HLBadge>
            <HLButton v-else variant="ghost" size="xs" :aria-label="it.label" @click="it.run?.()">
              <template #iconLeft><component :is="it.icon" class="text-gray-500" /></template>
            </HLButton>
          </template>
          {{ it.label }}
        </HLTooltip>

        <!-- The signed-in user. A button so it can take the profile menu; it has none yet. -->
        <button
          type="button"
          aria-label="Your profile"
          class="ml-1 flex rounded-full focus-visible:outline-2 focus-visible:outline-primary-600 focus-visible:outline-offset-2"
        >
          <HLAvatar id="shell-user-avatar" size="sm" name="SS" />
        </button>
      </div>
    </div>

    <!-- Row 2: sub-tabs + optional actions -->
    <div v-if="variant !== 'simple'" class="flex items-center gap-4 px-4 h-12 border-b border-gray-200 shadow-(--shadow-xs)">
      <div class="flex flex-1 self-stretch items-center gap-2 min-w-0">
        <OverflowTabRow
          :tabs="subTabs"
          :active-tab="activeSubTab"
          :on-tab-change="onSubTabChange"
          text-size="lg"
          indicator-bottom="bottom-0"
        />
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-2 shrink-0">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<style scoped>
/* The gradient is an SVG paint server, so it has to be a stroke; `color: url(...)` did nothing. */
.sl-ai-icon :deep(path) { stroke: url(#shell-ai-gradient); }
</style>
