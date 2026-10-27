<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../shell/AppShell.vue'
import Canvas from '../shell/Canvas.vue'

const router = useRouter()
const VERTICAL_TABS = ['Overview', 'Contacts', 'Sequences', 'Stats', 'Settings']
const activeTab = ref('Overview')
</script>

<template>
  <AppShell
    layout="fullscreen"
    :back-toolbar="{ onBack: () => router.push('/'), label: 'Spring Email Campaign' }"
    :vertical-tabs="{ tabs: VERTICAL_TABS, activeTab: activeTab, onTabChange: (v) => activeTab = v, label: 'Campaign' }"
  >
    <Canvas :level="1">
      <div class="mb-5">
        <h1 class="text-hr-2xl font-semibold text-gray-900">{{ activeTab }}</h1>
        <p class="text-hr-md text-gray-500 mt-0.5">
          {{ activeTab }} details for Spring Email Campaign.
        </p>
      </div>
      <div class="flex flex-col gap-4">
        <div class="border border-gray-200 rounded-lg p-6 h-40 flex items-center justify-center">
          <span class="text-hr-md text-gray-400">{{ activeTab }} content</span>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div v-for="label in ['Sent', 'Open rate', 'Click rate']" :key="label" class="border border-gray-200 rounded-lg p-4">
            <p class="text-hr-sm font-medium text-gray-500 mb-1">{{ label }}</p>
            <div class="h-5 w-16 bg-gray-100 rounded" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="label in ['Audience', 'Schedule']" :key="label" class="border border-gray-200 rounded-lg p-4 h-36 flex items-center justify-center">
            <span class="text-hr-md text-gray-400">{{ label }}</span>
          </div>
        </div>
      </div>
    </Canvas>
  </AppShell>
</template>
