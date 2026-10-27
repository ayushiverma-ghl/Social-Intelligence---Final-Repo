<script setup>
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
      { icon: LayoutAlt01Icon, label: 'Dashboard', active: true },
      { icon: MessageCircle01Icon, label: 'Conversations' },
      { icon: CalendarIcon, label: 'Calendars' },
      { icon: User01Icon, label: 'Contacts' },
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
</script>

<template>
  <AppShell
    sidebar="main-nav"
    :sidebar-props="{ navSections: NAV_SECTIONS }"
    topbar="simple"
    :topbar-props="{ title: 'Dashboard' }"
  >
    <Canvas :level="1">
      <div class="mb-5">
        <h1 class="text-hr-2xl font-semibold text-gray-900">Overview</h1>
        <p class="text-hr-md text-gray-500 mt-0.5">
          A product that uses a single-row topbar. No section tabs needed.
        </p>
      </div>
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-4 gap-4">
          <div v-for="label in ['Revenue', 'New contacts', 'Open deals', 'Conversion']" :key="label" class="border border-gray-200 rounded-lg p-4">
            <p class="text-hr-sm font-medium text-gray-500 mb-1">{{ label }}</p>
            <div class="h-5 w-20 bg-gray-100 rounded" />
          </div>
        </div>
        <div class="border border-gray-200 rounded-lg p-4 h-56 flex items-center justify-center">
          <span class="text-hr-md text-gray-400">Main chart</span>
        </div>
      </div>
    </Canvas>
  </AppShell>
</template>
