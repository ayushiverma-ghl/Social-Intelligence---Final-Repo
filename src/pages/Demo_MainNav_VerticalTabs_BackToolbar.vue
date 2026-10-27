<script setup>
import { ref } from 'vue'
import {
  Rocket01Icon, LayoutAlt01Icon, MessageCircle01Icon, CalendarIcon,
  User01Icon, CreditCard01Icon, Send01Icon, RefreshCw01Icon, Globe01Icon, Star01Icon,
  TrendUp01Icon, Grid01Icon, Tablet01Icon,
} from '@gohighlevel/ghl-icons/24/outline'
import AppShell from '../shell/AppShell.vue'
import Canvas from '../shell/Canvas.vue'

const NAV_SECTIONS = [
  {
    items: [
      { icon: Rocket01Icon, label: 'Launchpad' },
      { icon: LayoutAlt01Icon, label: 'Dashboard' },
      { icon: MessageCircle01Icon, label: 'Conversations' },
      { icon: CalendarIcon, label: 'Calendars' },
      { icon: User01Icon, label: 'Contacts', active: true },
      { icon: TrendUp01Icon, label: 'Opportunities' },
      { icon: CreditCard01Icon, label: 'Payments' },
    ],
  },
  {
    items: [
      { icon: Send01Icon, label: 'Marketing' },
      { icon: RefreshCw01Icon, label: 'Automation' },
      { icon: Globe01Icon, label: 'Sites' },
      { icon: Star01Icon, label: 'Reputation' },
      { icon: TrendUp01Icon, label: 'Reporting' },
      { icon: Grid01Icon, label: 'App marketplace' },
      { icon: Tablet01Icon, label: 'Mobile app' },
    ],
  },
]

const VERTICAL_TABS = ['Overview', 'Activity', 'Notes', 'Files', 'Integrations']
const activeTab = ref('Overview')
</script>

<template>
  <AppShell
    sidebar="main-nav"
    :sidebar-props="{ navSections: NAV_SECTIONS }"
    topbar="simple"
    :topbar-props="{ title: 'Contacts' }"
    :back-toolbar="{ onBack: () => activeTab = 'Overview', label: 'Sarah Johnson' }"
    :vertical-tabs="{ tabs: VERTICAL_TABS, activeTab: activeTab, onTabChange: (v) => activeTab = v }"
  >
    <Canvas :level="1">
      <div class="mb-5">
        <h1 class="text-hr-2xl font-semibold text-gray-900">{{ activeTab }}</h1>
        <p class="text-hr-md text-gray-500 mt-0.5">
          Contact details and {{ activeTab.toLowerCase() }} information for Sarah Johnson.
        </p>
      </div>
      <div class="flex flex-col gap-4">
        <div class="border border-gray-200 rounded-lg p-6 h-40 flex items-center justify-center">
          <span class="text-hr-md text-gray-400">{{ activeTab }} content</span>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div v-for="label in ['Contact info', 'Tags', 'Source']" :key="label" class="border border-gray-200 rounded-lg p-4">
            <p class="text-hr-sm font-medium text-gray-500 mb-1">{{ label }}</p>
            <div class="h-5 w-16 bg-gray-100 rounded" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="label in ['Recent conversations', 'Assigned workflows']" :key="label" class="border border-gray-200 rounded-lg p-4 h-36 flex items-center justify-center">
            <span class="text-hr-md text-gray-400">{{ label }}</span>
          </div>
        </div>
      </div>
    </Canvas>
  </AppShell>
</template>
