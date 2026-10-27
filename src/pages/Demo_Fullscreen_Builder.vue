<script setup>
import { useRouter } from 'vue-router'
import BuilderBar from '../shell/BuilderBar.vue'

const router = useRouter()
const CANVAS_SHADOW = 'shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)]'
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-50 overflow-hidden">
    <BuilderBar
      :on-back="() => router.push('/')"
      title="Welcome email · Onboarding sequence"
      :on-save="() => {}"
      :on-publish="() => {}"
    />
    <main class="flex-1 flex min-h-0 p-4 gap-4">

      <!-- Canvas area -->
      <div :class="`flex-1 bg-white rounded-xl ${CANVAS_SHADOW} flex flex-col overflow-hidden`">
        <div class="border-b border-gray-200 px-6 py-3 flex items-center gap-3 shrink-0">
          <span class="text-hr-md font-medium text-gray-500">Desktop</span>
          <div class="w-px h-4 bg-gray-200" />
          <span class="text-hr-md font-medium text-gray-700">Mobile</span>
        </div>
        <div class="flex-1 flex items-center justify-center bg-gray-50">
          <div class="w-[600px] flex flex-col gap-0">
            <div class="bg-primary-600 rounded-t-lg h-16 flex items-center justify-center">
              <span class="text-white text-hr-md font-medium">Header / logo</span>
            </div>
            <div class="bg-white border-x border-gray-200 px-8 py-10 flex flex-col gap-4">
              <div class="h-5 w-3/4 bg-gray-100 rounded" />
              <div class="h-3 w-full bg-gray-100 rounded" />
              <div class="h-3 w-5/6 bg-gray-100 rounded" />
              <div class="h-3 w-4/5 bg-gray-100 rounded" />
              <div class="mt-2 h-9 w-36 bg-primary-600 rounded-lg" />
            </div>
            <div class="bg-gray-50 border border-gray-200 rounded-b-lg h-10 flex items-center justify-center">
              <span class="text-hr-sm text-gray-400">Footer</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Properties panel -->
      <div :class="`w-[280px] shrink-0 bg-white rounded-xl ${CANVAS_SHADOW} flex flex-col overflow-hidden`">
        <div class="border-b border-gray-200 px-4 py-3 shrink-0">
          <p class="text-hr-lg font-semibold text-gray-900">Properties</p>
        </div>
        <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div v-for="section in ['Content', 'Style', 'Settings']" :key="section">
            <p class="text-hr-sm font-medium text-gray-400 mb-2">{{ section }}</p>
            <div class="flex flex-col gap-2">
              <div v-for="i in [1, 2, 3]" :key="i" class="border border-gray-200 rounded-lg p-3">
                <div class="h-3 w-1/2 bg-gray-100 rounded mb-2" />
                <div class="h-7 w-full bg-gray-50 border border-gray-200 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
