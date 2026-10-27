<script setup>
import { computed, ref } from 'vue'
import { Settings01Icon, RefreshCcw01Icon } from '@gohighlevel/ghl-icons/24/outline'
import { useSocialListening } from '../../composables/useSocialListening.js'

const sl = useSocialListening()
const { state, setStage, resetAccount } = sl
const open = ref(false)

// 21 Oct (Sujith): "Other teams may not know which version is the latest. Keep the latest version
// as the default and group the previous iterations under a single switch."
// Ayushi: one control with two states, Current design and Older designs, plus Start over.
// Current design always shows the latest version of every card.
// 27 Oct (developers): one design, so the panel only switches the account's state. The card
// layouts are fixed at the final picks.
const LATEST = { mentionsLayout: 'tabs', mentionsTabs: 'compact', mentionsSize: 'half', trendsStyle: 3, trendCardPad: 12, alertLayout: 'flyout' }
Object.assign(state, LATEST)

const STAGES = [
  { day: 'landing', label: 'No industry' },
  { day: 0, label: 'New' },
  { day: 15, label: 'Growing' },
  { day: 45, label: 'Problem' },
  { day: 90, label: 'Steady' },
]
const stage = computed(() => (!sl.account.value.space ? STAGES[0] : [...STAGES.slice(1)].reverse().find((s) => state.day >= s.day) || STAGES[1]))
</script>

<template>
  <div class="fixed right-5 bottom-5 z-[2500] flex flex-col items-end gap-3">
    <Transition name="sl-panel">
      <div
        v-if="open"
        id="demo-controls-panel"
        role="region"
        aria-label="Demo controls"
        class="w-[420px] max-h-[calc(100vh-112px)] overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-(--shadow-lg) p-4 flex flex-col gap-4"
      >
        <div class="flex flex-col gap-2">
          <HLText size="md" weight="medium" class="text-gray-500">Account state</HLText>
          <div class="sl-demo-segment">
            <HLRadioGroup id="demo-stage" :value="stage.day" size="xs" @update:value="setStage">
              <HLContentSwitcher v-for="s in STAGES" :id="`demo-stage-${s.day}`" :key="s.day" :value="s.day" :label="s.label" size="xs" />
            </HLRadioGroup>
          </div>
        </div>

        <div class="flex">
          <HLButton id="demo-start-over" variant="text" color="gray" size="xs" @click="resetAccount()">
            <template #iconLeft><RefreshCcw01Icon /></template>
            Start over
          </HLButton>
        </div>
      </div>
    </Transition>

    <HLButton
      variant="secondary"
      size="md"
      class="shadow-(--shadow-lg)"
      :aria-expanded="open"
      aria-controls="demo-controls-panel"
      @click="open = !open"
    >
      <template #iconLeft><Settings01Icon /></template>
      Demo
    </HLButton>
  </div>
</template>
