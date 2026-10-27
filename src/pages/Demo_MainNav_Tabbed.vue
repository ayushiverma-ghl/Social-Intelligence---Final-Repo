<script setup>
import { ref } from 'vue'
import {
  Rocket01Icon, LayoutAlt01Icon, MessageCircle01Icon, CalendarIcon,
  User01Icon, CreditCard01Icon, Send01Icon, RefreshCw01Icon, Globe01Icon, Star01Icon,
  TrendUp01Icon, Grid01Icon, Tablet01Icon, Settings01Icon, PlusIcon,
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
      { icon: User01Icon, label: 'Contacts' },
      { icon: TrendUp01Icon, label: 'Opportunities' },
      { icon: CreditCard01Icon, label: 'Payments' },
    ],
  },
  {
    items: [
      { icon: Send01Icon, label: 'Marketing', active: true },
      { icon: RefreshCw01Icon, label: 'Automation' },
      { icon: Globe01Icon, label: 'Sites' },
      { icon: Star01Icon, label: 'Reputation' },
      { icon: TrendUp01Icon, label: 'Reporting' },
      { icon: Grid01Icon, label: 'App marketplace' },
      { icon: Tablet01Icon, label: 'Mobile app' },
    ],
  },
]

const SECTION_TABS = ['Social planner', 'Emails', 'Snippets', 'Countdown timer', 'Brand boards', 'Ad manager']
const SUB_TABS = ['Planner', 'Content', 'Comments', 'Statistics', 'Social listening']

const activeSubTab = ref('Social listening')
</script>

<template>
  <AppShell
    sidebar="main-nav"
    :sidebar-props="{ navSections: NAV_SECTIONS }"
    topbar="tabbed"
    :topbar-props="{
      title: 'Marketing',
      sectionTabs: SECTION_TABS,
      activeSection: 'Social planner',
      subTabs: SUB_TABS,
      activeSubTab: activeSubTab,
      onSubTabChange: (v) => activeSubTab = v,
    }"
  >
    <template #topbar-actions>
      <div class="flex items-center gap-1.5">
        <HLButton variant="secondary" size="xs">
          <template #iconLeft><RefreshCw01Icon /></template>
        </HLButton>
        <HLButton variant="secondary" size="xs">
          <template #iconLeft><Settings01Icon /></template>
        </HLButton>
        <HLButton variant="secondary" size="xs">
          <template #iconLeft><PlusIcon /></template>
          Socials
        </HLButton>
        <HLButton variant="primary" color="blue" size="xs">
          <template #iconLeft><PlusIcon /></template>
          New post
        </HLButton>
      </div>
    </template>

    <Canvas :level="1">
      <div class="mb-5">
        <h1 class="text-hr-2xl font-semibold text-gray-900">Social listening</h1>
        <p class="text-hr-md text-gray-500 mt-0.5">
          Monitor brand mentions and trends across social platforms in real time.
        </p>
      </div>
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-3 gap-4">
          <div v-for="[label, val] in [['Total mentions', '182'], ['Avg sentiment', '68%'], ['Active topics', '4']]" :key="label" class="border border-gray-200 rounded-lg p-4">
            <p class="text-hr-sm font-medium text-gray-500 mb-1">{{ label }}</p>
            <p class="text-hr-display-xs font-semibold text-gray-900">{{ val }}</p>
          </div>
        </div>
        <div class="border border-gray-200 rounded-lg p-4 h-48 flex items-center justify-center">
          <span class="text-hr-md text-gray-400">Chart placeholder</span>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="label in ['Trending topics', 'Recent mentions']" :key="label" class="border border-gray-200 rounded-lg p-4 h-36 flex items-center justify-center">
            <span class="text-hr-md text-gray-400">{{ label }}</span>
          </div>
        </div>
      </div>
    </Canvas>
  </AppShell>
</template>
