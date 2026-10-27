<script setup>
import { computed, onMounted, ref } from 'vue'
import { ChevronLeftIcon } from '@gohighlevel/ghl-icons/24/outline'
import { NETWORKS } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'
import { NETWORK_ICONS } from './networkIcons.js'

const { state, pickNetwork, submitConnectLink } = useSocialListening()

// The parent mounts this behind a v-if, so `show` starts false and flips on mount.
const show = ref(false)
onMounted(() => { show.value = true })

const canConnect = computed(() => !!(state.connectLink || '').trim())

function connect() {
  if (!canConnect.value) return
  if (submitConnectLink()) show.value = false
}
function back() {
  state.connectPick = null
  state.connectError = null
}
// Everything this modal leaves in shared state is cleared once it has animated out. Clearing
// only state.modal used to carry the last pick and its error into the next open.
function cleanup() {
  state.modal = null
  state.connectPick = null
  state.connectError = null
  state.connectLink = ''
}
</script>

<template>
  <HLModal
    v-model:show="show"
    id="connect-modal"
    :width="520"
    :show-header-icon="false"
    :show-icon="false"
    footer-divider
    @after-leave="cleanup"
  >
    <!-- Back sits in the header, the same control the alert modal uses to leave its form. -->
    <template #header>
      <div class="flex items-start gap-3">
        <HLButton v-if="state.connectPick" variant="secondary" size="sm" aria-label="Back to platforms" @click="back">
          <template #iconLeft><ChevronLeftIcon /></template>
        </HLButton>
        <div class="flex-1 min-w-0">
          <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">{{ state.connectPick ? `Connect ${state.connectPick.label}` : 'Connect a social account' }}</HLText>
          <HLText size="md" class="text-gray-500">This lets us watch your own posts alongside the niche. Everything else already works without it.</HLText>
        </div>
      </div>
    </template>

    <!-- Picking a platform moves straight on to its link, so each tile is a button, not a
         radio waiting for a confirm. -->
    <div v-if="!state.connectPick" class="grid grid-cols-2 gap-2">
      <HLButton
        v-for="n in NETWORKS"
        :key="n.key"
        variant="secondary"
        size="md"
        full-width
        class="sl-net-tile"
        @click="pickNetwork(n)"
      >
        <template #iconLeft><component :is="NETWORK_ICONS[n.key]" /></template>
        {{ n.label }}
      </HLButton>
    </div>

    <!-- The title names the platform and its mark sits in the field, so the summary row that
         used to repeat both (with a "Change" link doing Back's job) is gone. -->
    <div v-else>
      <HLForm @submit.prevent>
        <HLFormItem
          label="Profile link or handle"
          :show-feedback="!!state.connectError"
          :feedback="state.connectError || undefined"
          :validation-status="state.connectError ? 'error' : undefined"
          :feedback-line-clamp="3"
        >
          <HLInput
            id="connect-link"
            v-model="state.connectLink"
            size="md"
            autofocus
            :placeholder="`https://${state.connectPick.domain}/yourbusiness`"
            @update:model-value="state.connectError = null"
            @keydown.enter.prevent="connect"
          >
            <template #prefix><component :is="NETWORK_ICONS[state.connectPick.key]" class="w-4 h-4" /></template>
          </HLInput>
        </HLFormItem>
      </HLForm>
    </div>

    <template #footer>
      <!-- Skip is always there, since connecting is optional. Once a platform is picked the
           commit joins it: secondary actions first, the one primary last. -->
      <div class="flex justify-end gap-2 px-4 py-3">
        <HLButton variant="secondary" size="sm" @click="show = false">Skip for now</HLButton>
        <template v-if="state.connectPick">
          <HLButton v-if="state.connectError" variant="secondary" size="sm" @click="back">Pick another</HLButton>
          <HLButton variant="primary" color="blue" size="sm" :disabled="!canConnect" @click="connect">Connect</HLButton>
        </template>
      </div>
    </template>
  </HLModal>
</template>

<!-- Unscoped: HLModal teleports. Platform tiles read as a list of choices, so their label
     sits at the start beside the mark rather than centred in the button. -->
<style>
.hr-v-4-8-5 .hr-button.sl-net-tile { justify-content: flex-start; }
</style>
