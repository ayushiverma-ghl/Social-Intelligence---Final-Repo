<script setup>
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import TopBar from './TopBar.vue'
import BackToolbar from './BackToolbar.vue'
import VerticalTabs from './VerticalTabs.vue'
import SubAccountSwitcher from './SubAccountSwitcher.vue'
import NotificationsDrawer from './NotificationsDrawer.vue'
import HelpDrawer from './HelpDrawer.vue'

const props = defineProps({
  layout: { type: String, default: 'default' },
  sidebar: { type: String, default: 'main-nav' },
  sidebarProps: { type: Object, default: () => ({}) },
  topbar: { type: String, default: 'tabbed' },
  topbarProps: { type: Object, default: () => ({}) },
  backToolbar: { type: Object, default: null },
  verticalTabs: { type: Object, default: null },
})

const activeOverlay = ref(null)
const sidebarCollapsed = ref(false)

function closeOverlay() { activeOverlay.value = null }
</script>

<template>
  <!-- Fullscreen layout -->
  <div v-if="layout === 'fullscreen'" class="flex flex-col h-screen overflow-hidden bg-gray-50">
    <BackToolbar v-if="backToolbar" v-bind="backToolbar" />
    <div class="flex flex-1 min-h-0">
      <VerticalTabs v-if="verticalTabs" v-bind="verticalTabs" />
      <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
        <slot />
      </div>
    </div>
  </div>

  <!-- Default layout -->
  <div v-else class="flex h-screen overflow-hidden bg-gray-50">
    <Sidebar
      v-if="sidebar"
      :variant="sidebar"
      v-bind="sidebarProps"
      :on-open-switcher="() => activeOverlay = 'accounts'"
      :on-collapsed-change="(v) => sidebarCollapsed = v"
    />
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <TopBar
        :variant="topbar"
        v-bind="topbarProps"
        :title-icon="sidebar === 'settings' ? null : topbarProps.titleIcon"
        :on-open-notifications="() => activeOverlay = 'notifications'"
        :on-open-help="() => activeOverlay = 'help'"
      >
        <template v-if="$slots['topbar-actions']" #actions>
          <slot name="topbar-actions" />
        </template>
      </TopBar>
      <BackToolbar v-if="backToolbar" v-bind="backToolbar">
        <template v-if="$slots['back-filters']" #filters>
          <slot name="back-filters" />
        </template>
        <template v-if="$slots['back-actions']" #actions>
          <slot name="back-actions" />
        </template>
      </BackToolbar>
      <main class="flex-1 flex min-h-0">
        <VerticalTabs v-if="verticalTabs" v-bind="verticalTabs" />
        <div class="flex-1 flex flex-col min-h-0">
          <slot />
        </div>
      </main>
    </div>

    <SubAccountSwitcher
      v-if="activeOverlay === 'accounts'"
      :on-close="closeOverlay"
      :sidebar-width="sidebarCollapsed ? 64 : 280"
    />
    <NotificationsDrawer
      v-if="activeOverlay === 'notifications'"
      :on-close="closeOverlay"
    />
    <HelpDrawer
      v-if="activeOverlay === 'help'"
      :on-close="closeOverlay"
    />
  </div>
</template>
