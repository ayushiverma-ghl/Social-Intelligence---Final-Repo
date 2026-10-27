<script setup>
import { ref } from 'vue'
import {
  Building02Icon, CalendarIcon, Users01Icon, Dataflow01Icon,
  Phone01Icon, Mail01Icon, CreditCard01Icon,
  LayoutAlt04Icon, Code02Icon, Award01Icon, Image01Icon, Link02Icon, Settings01Icon,
} from '@gohighlevel/ghl-icons/24/outline'
import AppShell from '../shell/AppShell.vue'
import Canvas from '../shell/Canvas.vue'

const SECTIONS = [
  {
    label: 'My Business',
    items: [
      { icon: Building02Icon, label: 'Business profile' },
      { icon: CalendarIcon, label: 'Calendars' },
      { icon: Users01Icon, label: 'My staff' },
      { icon: Dataflow01Icon, label: 'Pipelines' },
    ],
  },
  {
    label: 'Business Services',
    items: [
      { icon: Mail01Icon, label: 'Email services' },
      { icon: Phone01Icon, label: 'Phone system', active: true },
      { icon: CreditCard01Icon, label: 'Payments' },
    ],
  },
  {
    label: 'Other Settings',
    items: [
      { icon: LayoutAlt04Icon, label: 'Custom fields' },
      { icon: Code02Icon, label: 'Custom values' },
      { icon: Award01Icon, label: 'Memberships' },
      { icon: Image01Icon, label: 'Media' },
      { icon: Link02Icon, label: 'URL redirects' },
    ],
  },
]

const TABS = ['General', 'Billing', 'Security', 'Integrations', 'API keys']
const ABBREVS = ['API', 'URL', 'ID', 'SMS', 'MFA', 'UI', 'UX']

function lowerLabel(str) {
  let result = str.toLowerCase()
  for (const abbr of ABBREVS) {
    result = result.replace(new RegExp(`\\b${abbr.toLowerCase()}\\b`, 'g'), abbr)
  }
  return result
}

const activeTab = ref('General')
</script>

<template>
  <AppShell
    sidebar="settings"
    :sidebar-props="{ sections: SECTIONS, onBack: () => {} }"
    topbar="simple"
    :topbar-props="{ title: 'Phone system', titleIcon: Settings01Icon }"
    :vertical-tabs="{ tabs: TABS, activeTab: activeTab, onTabChange: (v) => activeTab = v }"
  >
    <Canvas :level="1">
      <div class="mb-5">
        <h1 class="text-hr-2xl font-semibold text-gray-900">{{ activeTab }}</h1>
        <p class="text-hr-md text-gray-500 mt-0.5">
          Manage your {{ lowerLabel(activeTab) }} settings and preferences.
        </p>
      </div>
      <div class="flex flex-col gap-4">
        <div class="border border-gray-200 rounded-lg p-6 h-40 flex items-center justify-center">
          <span class="text-hr-md text-gray-400">{{ activeTab }} content</span>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div v-for="label in ['Setting 1', 'Setting 2', 'Setting 3']" :key="label" class="border border-gray-200 rounded-lg p-4">
            <p class="text-hr-sm font-medium text-gray-500 mb-1">{{ label }}</p>
            <div class="h-5 w-16 bg-gray-100 rounded" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="label in ['Details', 'Advanced']" :key="label" class="border border-gray-200 rounded-lg p-4 h-36 flex items-center justify-center">
            <span class="text-hr-md text-gray-400">{{ label }}</span>
          </div>
        </div>
      </div>
    </Canvas>
  </AppShell>
</template>
