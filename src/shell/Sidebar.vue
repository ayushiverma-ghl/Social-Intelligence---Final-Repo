<script setup>
import { ref, computed } from 'vue'
import { ChevronRightIcon, ChevronLeftIcon, SearchMdIcon, ZapIcon, ArrowLeftIcon, Settings01Icon, Building02Icon } from '@gohighlevel/ghl-icons/24/outline'

const props = defineProps({
  variant: { type: String, default: 'main-nav' },
  navSections: { type: Array, default: () => [] },
  sections: { type: Array, default: () => [] },
  onBack: Function,
  onOpenSwitcher: Function,
  onCollapsedChange: Function,
  // The sub-account this page is for. Defaults keep every other page in the shell
  // rendering exactly as before.
  accountLabel: { type: String, default: 'Headquarters 1800-PLUMBER-200..' },
  accountInitials: { type: String, default: 'HQ' },
})

const collapsed = ref(false)

function toggleCollapsed() {
  collapsed.value = !collapsed.value
  props.onCollapsedChange?.(collapsed.value)
}

const isSettings = props.variant === 'settings'
// One list for both variants: settings sections carry a label, main-nav sections a divider.
const groups = computed(() => isSettings ? props.sections : props.navSections)

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2'
const itemClass = (active) => [
  collapsed.value
    ? 'size-9 mx-auto flex items-center justify-center rounded-lg'
    : 'flex gap-2 items-center px-2 py-2 rounded-lg w-full text-left',
  active ? 'bg-gray-800' : 'hover:bg-gray-800/50',
  'transition-colors', FOCUS,
]
</script>

<template>
  <aside
    :class="`relative flex flex-col h-screen bg-gray-900 px-2 py-4 shrink-0 transition-[width] duration-200 ${collapsed ? 'w-16' : 'w-70'}`"
    aria-label="Main navigation"
  >
    <div class="flex flex-col flex-1 justify-between min-h-0">
      <div class="flex flex-col gap-3 flex-1 min-h-0">

        <!-- Logo. Whitelabel: a sub-account sees its agency's brand here, never the platform's.
             This neutral mark is a placeholder for the logo the agency uploads. -->
        <div :class="`h-10 flex items-center ${collapsed ? 'justify-center' : 'px-2'}`">
          <span role="img" aria-label="Agency logo" class="size-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
            <Building02Icon class="w-5 h-5 text-gray-400" />
          </span>
        </div>

        <!-- Subaccount switcher -->
        <HLTooltip trigger="hover" placement="right" :disabled="!collapsed">
          <template #trigger>
            <button
              type="button"
              aria-haspopup="dialog"
              :aria-label="`Switch sub-account, current: ${accountLabel}`"
              @click="onOpenSwitcher?.()"
              :class="[collapsed
                ? 'size-9 mx-auto rounded-lg border border-gray-700 flex items-center justify-center hover:border-gray-600'
                : 'w-full flex items-center gap-2 border border-gray-700 rounded-lg px-2 py-2 hover:border-gray-600 text-left',
                'transition-colors', FOCUS]"
            >
              <HLAvatar v-if="collapsed" id="shell-account-avatar" size="xs" :round="false" :name="accountInitials" />
              <template v-else>
                <HLText html-tag="span" size="md" weight="medium" class="flex-1 text-gray-300 truncate">{{ accountLabel }}</HLText>
                <ChevronRightIcon class="w-3.5 h-3.5 text-gray-500 shrink-0" />
              </template>
            </button>
          </template>
          {{ accountLabel }}
        </HLTooltip>

        <!-- Search + Quick action -->
        <div :class="collapsed ? 'flex flex-col gap-2 items-center' : 'flex gap-2 items-center'">
          <HLTooltip trigger="hover" placement="right" :disabled="!collapsed">
            <template #trigger>
              <button
                type="button"
                aria-label="Search"
                aria-keyshortcuts="Meta+K"
                :class="[collapsed
                  ? 'size-9 rounded-lg border border-gray-700 flex items-center justify-center hover:border-gray-600'
                  : 'flex flex-1 h-9 items-center justify-between border border-gray-700 rounded-lg pl-2 pr-1 hover:border-gray-600',
                  'transition-colors', FOCUS]"
              >
                <SearchMdIcon v-if="collapsed" class="w-4 h-4 text-gray-500" />
                <template v-else>
                  <span class="flex gap-2 items-center">
                    <SearchMdIcon class="w-3.5 h-3.5 text-gray-500" />
                    <HLText html-tag="span" size="md" class="text-gray-500">Search</HLText>
                  </span>
                  <HLText html-tag="kbd" size="sm" weight="medium" class="bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded-lg font-sans">⌘K</HLText>
                </template>
              </button>
            </template>
            Search
          </HLTooltip>
          <HLTooltip trigger="hover" :placement="collapsed ? 'right' : 'bottom'">
            <template #trigger>
              <button type="button" aria-label="Quick action" :class="['size-9 shrink-0 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors', FOCUS]">
                <ZapIcon class="w-4 h-4 text-gray-300" />
              </button>
            </template>
            Quick action
          </HLTooltip>
        </div>

        <!-- Settings variant: Go back ribbon -->
        <HLTooltip v-if="isSettings" trigger="hover" placement="right" :disabled="!collapsed">
          <template #trigger>
            <button
              type="button"
              aria-label="Go back"
              @click="onBack?.()"
              :class="[collapsed
                ? 'size-9 mx-auto bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600'
                : '-ml-2 w-fit flex items-center gap-2 bg-gray-700 rounded-r-lg pl-3 pr-8 py-3 hover:bg-gray-600',
                'transition-colors', FOCUS]"
            >
              <ArrowLeftIcon class="w-5 h-5 text-gray-300" />
              <HLText v-if="!collapsed" html-tag="span" size="lg" weight="medium" class="text-gray-300">Go back</HLText>
            </button>
          </template>
          Go back
        </HLTooltip>

        <!-- Nav items -->
        <nav class="flex flex-col gap-1 flex-1 overflow-y-auto" :aria-label="isSettings ? 'Settings' : 'Sections'">
          <div v-for="(section, i) in groups" :key="i" class="flex flex-col gap-1">
            <div v-if="isSettings && !collapsed && section.label" class="px-2 pb-1">
              <HLText html-tag="span" size="sm" weight="medium" class="text-gray-500">{{ section.label }}</HLText>
            </div>
            <div v-if="(isSettings ? collapsed : true) && i > 0" :class="`h-px bg-gray-800 my-2 ${collapsed ? 'mx-3' : ''}`" />
            <HLTooltip v-for="item in section.items" :key="item.label" trigger="hover" placement="right" :disabled="!collapsed">
              <template #trigger>
                <button
                  type="button"
                  :aria-current="item.active ? 'page' : undefined"
                  :aria-label="collapsed ? item.label : undefined"
                  :class="itemClass(item.active)"
                >
                  <component :is="item.icon" class="w-5 h-5 shrink-0" :class="item.active ? 'text-white' : 'text-gray-400'" />
                  <HLText v-if="!collapsed" html-tag="span" size="lg" weight="medium" :class="item.active ? 'text-white' : 'text-gray-300'">
                    {{ item.label }}
                  </HLText>
                </button>
              </template>
              {{ item.label }}
            </HLTooltip>
          </div>
        </nav>
      </div>

      <!-- Bottom: Settings -->
      <div v-if="!isSettings" class="flex flex-col gap-2 mt-2">
        <div :class="`h-px bg-gray-800 ${collapsed ? 'mx-3' : ''}`" />
        <HLTooltip trigger="hover" placement="right" :disabled="!collapsed">
          <template #trigger>
            <button type="button" :aria-label="collapsed ? 'Settings' : undefined" :class="itemClass(false)">
              <Settings01Icon class="w-5 h-5 text-gray-400" />
              <HLText v-if="!collapsed" html-tag="span" size="lg" weight="medium" class="text-gray-300">Settings</HLText>
            </button>
          </template>
          Settings
        </HLTooltip>
      </div>
    </div>

    <!-- Collapse toggle -->
    <button
      type="button"
      :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      :aria-expanded="!collapsed"
      @click="toggleCollapsed"
      :class="['absolute bottom-6 -right-3 bg-accent-green rounded-full size-6 flex items-center justify-center shadow-(--shadow-sm) hover:bg-accent-green-dark transition-colors', FOCUS]"
    >
      <ChevronRightIcon v-if="collapsed" class="w-3.5 h-3.5 text-gray-900" />
      <ChevronLeftIcon v-else class="w-3.5 h-3.5 text-gray-900" />
    </button>
  </aside>
</template>
