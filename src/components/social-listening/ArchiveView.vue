<script setup>
import { ArrowLeftIcon, ArrowUpIcon, MinusIcon, ChevronRightIcon } from '@gohighlevel/ghl-icons/24/outline'
import { SNAPSHOT_ARCHIVE } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'

const { state, account, toast, simple } = useSocialListening()

// Tone is carried by an icon as well as the colour, so an "up" month doesn't rely on green
// alone to read differently from a flat one.
const TONE = {
  up: { icon: ArrowUpIcon, class: 'text-positive-strong', label: 'Up' },
  flat: { icon: MinusIcon, class: 'text-gray-600', label: 'Mixed' },
}

function open() {
  state.view = 'recipient'
  if (simple.value) toast("Opened the client's snapshot")
  else toast('Opened snapshot', 'Showing it exactly as the client saw it.')
}
</script>

<template>
  <div>
    <div class="mb-4">
      <HLButton variant="text" size="xs" @click="state.view = 'dashboard'">
        <template #iconLeft><ArrowLeftIcon /></template>
        Back to Social listening
      </HLButton>
    </div>

    <HLText html-tag="h1" size="2xl" weight="semibold" class="text-gray-900 mb-1!">Past snapshots</HLText>
    <HLText size="md" class="text-gray-600 mb-5!">Every month sent for {{ account.short }}, newest first.</HLText>

    <div class="border border-gray-200 rounded-xl overflow-hidden bg-white max-w-160">
      <div v-if="!SNAPSHOT_ARCHIVE.length" class="sl-empty px-6 py-8 flex justify-center">
        <HLEmpty id="archive-empty" size="sm" icon="default" title="No snapshots sent yet" description="Each month you send lands here, newest first." />
      </div>
      <!-- A real button per row (the whole row opens the snapshot). HLButton can't hold a
           two-line row, so this stays a native button with its own focus ring. -->
      <button
        v-for="(s, i) in SNAPSHOT_ARCHIVE"
        :key="s.period"
        type="button"
        @click="open"
        :class="['w-full flex items-center gap-4 text-left px-5 py-4 hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-primary-600 focus-visible:-outline-offset-2', i !== SNAPSHOT_ARCHIVE.length - 1 ? 'border-b border-gray-200' : '']"
      >
        <HLText html-tag="span" size="lg" weight="semibold" class="w-20 shrink-0 text-gray-900">{{ s.period }}</HLText>
        <span class="flex-1 min-w-0">
          <HLText html-tag="span" size="lg" weight="medium" :class="['flex items-center gap-1.5', (TONE[s.tone] || TONE.flat).class]">
            <component :is="(TONE[s.tone] || TONE.flat).icon" class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span class="sr-only">{{ (TONE[s.tone] || TONE.flat).label }}:</span>
            {{ s.headline }}
          </HLText>
          <HLText html-tag="span" size="md" class="block text-gray-500 mt-0.5!">{{ s.sent }}</HLText>
        </span>
        <HLText html-tag="span" size="md" weight="medium" class="flex items-center gap-1 text-primary-600 shrink-0">
          Open
          <ChevronRightIcon class="w-3.5 h-3.5" aria-hidden="true" />
        </HLText>
      </button>
      <HLText html-tag="div" size="md" class="px-5 py-3 bg-gray-50 border-t border-gray-200 text-gray-500">Snapshots are kept for 24 months.</HLText>
    </div>
  </div>
</template>
