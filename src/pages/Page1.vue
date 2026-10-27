<script setup>
import { useRouter } from 'vue-router'
import { LayoutAlt01Icon, ChevronRightIcon } from '@gohighlevel/ghl-icons/24/outline'
import LayoutThumb from './LayoutThumb.vue'

const router = useRouter()

const VARIANTS = [
  {
    path: '/ref/main-nav-simple',
    layoutType: 'sidebar-simple',
    category: 'Main Nav',
    title: 'Simple',
    description: 'Sidebar with icons and labels, top bar with a page title. The default starting point for most features.',
  },
  {
    path: '/ref/main-nav-tabbed',
    layoutType: 'sidebar-tabbed',
    category: 'Main Nav',
    title: 'Tabbed',
    description: 'Two-level tabbed top bar, with section tabs and sub-tabs like Marketing → Social Planner.',
  },
  {
    path: '/ref/main-nav-tabbed-vertical-tabs',
    layoutType: 'sidebar-tabbed-vtabs',
    category: 'Main Nav',
    title: 'Tabbed + Vertical Tabs',
    description: 'Tabbed top bar plus a vertical tab rail inside the canvas for a third level of navigation.',
  },
  {
    path: '/ref/main-nav-vertical-tabs-back-toolbar',
    layoutType: 'sidebar-vtabs-back',
    category: 'Main Nav',
    title: 'Vertical Tabs + Back',
    description: 'Sidebar nav with horizontal section tabs and a back toolbar for drilling into a detail view.',
  },
  {
    path: '/ref/level2',
    layoutType: 'level2',
    category: 'Detail',
    title: 'Level 2 Panel',
    description: 'A list on the left, a detail panel slides in on the right with its own back navigation.',
  },
  {
    path: '/ref/fullscreen-builder',
    layoutType: 'fullscreen-builder',
    category: 'Fullscreen',
    title: 'Builder',
    description: 'No sidebar. Full canvas with a slim builder bar at top for Save and Publish actions.',
  },
  {
    path: '/ref/fullscreen-vertical-tabs-back-toolbar',
    layoutType: 'fullscreen-vtabs-back',
    category: 'Fullscreen',
    title: 'Vertical Tabs + Back',
    description: 'Full-canvas layout with a tab row and back toolbar. No sidebar chrome.',
  },
  {
    path: '/ref/settings-tabbed',
    layoutType: 'settings-tabbed',
    category: 'Settings',
    title: 'Tabbed',
    description: 'Settings sidebar with a tabbed top bar. Use for product settings with multiple sections.',
  },
  {
    path: '/ref/settings-vertical-tabs',
    layoutType: 'settings-vtabs',
    category: 'Settings',
    title: 'Vertical Tabs',
    description: 'Settings sidebar with a vertical tab column inside the canvas for secondary navigation.',
  },
  {
    path: '/ref/settings-vertical-tabs-back-toolbar',
    layoutType: 'settings-vtabs-back',
    category: 'Settings',
    title: 'Vertical Tabs + Back',
    description: 'Settings sidebar with vertical tabs and a back toolbar for drilled-in settings views.',
  },
]

const CATEGORY_STYLE = {
  'Main Nav':   'bg-primary-50 text-primary-700',
  'Detail':     'bg-accent-purple-light text-accent-purple',
  'Fullscreen': 'bg-positive-light text-positive-strong',
  'Settings':   'bg-gray-100 text-gray-600',
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Header -->
    <div class="bg-white border-b border-[#EAECF0]">
      <div class="max-w-5xl mx-auto px-8 py-8">
        <div class="flex items-start justify-between">

          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded-[6px] bg-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <LayoutAlt01Icon class="w-4 h-4 text-white" />
            </div>
            <div>
              <p class="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">HighLevel · Template</p>
              <h1 class="text-hr-2xl font-semibold text-gray-900 leading-none">App Shell V2</h1>
              <p class="text-hr-md text-gray-400 mt-1.5 max-w-sm">Pick a layout pattern. Replace this page with your home screen when you're ready to build.</p>
            </div>
          </div>

          <div class="flex items-center gap-1 mt-0.5">
            <span class="text-hr-sm font-semibold text-gray-700">{{ VARIANTS.length }}</span>
            <span class="text-hr-sm text-gray-400">variants</span>
          </div>

        </div>
      </div>
    </div>

    <!-- Grid -->
    <div class="max-w-5xl mx-auto px-8 py-8">
      <div class="grid grid-cols-3 gap-5">
        <div
          v-for="variant in VARIANTS"
          :key="variant.path"
          class="bg-white border border-[#EAECF0] rounded-[12px] overflow-hidden flex flex-col cursor-pointer group hover:border-primary-300 hover:shadow-md transition-all duration-150"
          @click="router.push(variant.path)"
        >
          <!-- Layout Thumbnail -->
          <LayoutThumb :type="variant.layoutType" />

          <!-- Divider -->
          <div class="h-px bg-[#EAECF0]" />

          <!-- Card Body -->
          <div class="p-4 flex flex-col gap-3 flex-1">

            <!-- Category badge -->
            <span
              class="self-start text-[11px] font-medium px-2 py-0.5 rounded-full"
              :class="CATEGORY_STYLE[variant.category]"
            >
              {{ variant.category }}
            </span>

            <!-- Title + description -->
            <div class="flex flex-col gap-1.5 flex-1">
              <h2 class="text-hr-lg font-medium text-gray-900 leading-none">{{ variant.title }}</h2>
              <p class="text-hr-md text-gray-400 leading-relaxed">{{ variant.description }}</p>
            </div>

            <!-- Preview link -->
            <div class="flex items-center gap-1 text-hr-md font-medium text-primary-600 group-hover:text-primary-700 pt-1">
              <span>Preview</span>
              <ChevronRightIcon class="w-3.5 h-3.5 transition-transform duration-100 group-hover:translate-x-0.5" />
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>
