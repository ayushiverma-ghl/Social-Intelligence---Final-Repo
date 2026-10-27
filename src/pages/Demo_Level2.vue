<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Rocket01Icon, LayoutAlt01Icon, MessageCircle01Icon, CalendarIcon,
  User01Icon, CreditCard01Icon, Send01Icon, RefreshCw01Icon, Globe01Icon, Star01Icon,
  TrendUp01Icon, Grid01Icon, Tablet01Icon, Share01Icon, Download01Icon,
  Settings01Icon, PlusIcon,
} from '@gohighlevel/ghl-icons/24/outline'
import AppShell from '../shell/AppShell.vue'
import Canvas from '../shell/Canvas.vue'

const router = useRouter()

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
        <button class="size-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          <RefreshCw01Icon class="w-3.5 h-3.5" />
        </button>
        <button class="size-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          <Settings01Icon class="w-3.5 h-3.5" />
        </button>
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

    <Canvas :level="2" :on-back="() => router.push('/ref/main-nav-tabbed')" title="&quot;HighLevel&quot;">
      <template #toolbar>
        <div class="flex items-center gap-1.5">
          <button class="size-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
            <RefreshCw01Icon class="w-3.5 h-3.5" />
          </button>
          <button class="size-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
            <Share01Icon class="w-3.5 h-3.5" />
          </button>
          <button class="size-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
            <Download01Icon class="w-3.5 h-3.5" />
          </button>
        </div>
      </template>

      <div class="flex flex-col gap-8">
        <div class="grid grid-cols-5 gap-3">
          <div v-for="label in ['Total mentions', 'Positive', 'Neutral', 'Negative', 'Net sentiment']" :key="label" class="border border-gray-200 rounded-lg p-4">
            <p class="text-hr-sm font-medium text-gray-500 mb-1">{{ label }}</p>
            <div class="h-6 w-14 bg-gray-100 rounded" />
          </div>
        </div>
        <div>
          <p class="text-hr-sm font-medium text-gray-400 mb-4">Sentiment analysis</p>
          <div class="grid grid-cols-3 gap-4">
            <div class="border border-gray-200 rounded-lg p-4 h-48 flex items-center justify-center">
              <span class="text-hr-md text-gray-400">Sentiment donut</span>
            </div>
            <div class="col-span-2 border border-gray-200 rounded-lg p-4 h-48 flex items-center justify-center">
              <span class="text-hr-md text-gray-400">Sentiment over time</span>
            </div>
          </div>
        </div>
        <div>
          <p class="text-hr-sm font-medium text-gray-400 mb-4">Platform intelligence</p>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="label in ['Mentions by platform', 'Platform trends over time']" :key="label" class="border border-gray-200 rounded-lg p-4 h-48 flex items-center justify-center">
              <span class="text-hr-md text-gray-400">{{ label }}</span>
            </div>
          </div>
        </div>
      </div>
    </Canvas>
  </AppShell>
</template>
