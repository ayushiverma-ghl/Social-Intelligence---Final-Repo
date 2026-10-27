<script setup>
import { onMounted, ref } from 'vue'
import { useSocialListening } from '../../composables/useSocialListening.js'
import { NETWORK_ICONS } from './networkIcons.js'

const { state, account, NETWORKS, pickNetwork, disconnectNetwork, simple } = useSocialListening()

// The parent mounts this behind a v-if, so `show` starts false and flips on mount —
// otherwise HLModal has no closed state to transition from.
const show = ref(false)
onMounted(() => { show.value = true })

function isConnected(key) {
  return account.value.connectedNetworks.includes(key)
}
// Connect hands over to the connect modal. This one animates out first and the swap happens
// in after-leave, so the two never both sit on screen and neither is cut off mid-transition.
let next = null
function connect(n) {
  pickNetwork(n)
  next = 'connect'
  show.value = false
}
</script>

<template>
  <HLModal
    v-model:show="show"
    id="accounts-modal"
    :width="520"
    :show-header-icon="false"
    :show-icon="false"
    footer-divider
    @after-leave="state.modal = next"
  >
    <!-- Header is title + subtext only, like the other modals; HLModal supplies the padding. -->
    <template #header>
      <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">{{ simple ? 'Connect your accounts' : 'Connected accounts' }}</HLText>
      <!-- 15 Oct (review 12): say what connecting adds. -->
      <HLText size="md" class="text-gray-500">{{ simple ? `Connect the accounts ${account.name} posts from. We use them to find mentions and to compare your posts with the industry.` : `${account.short}: connect as many platforms as you post to.` }}</HLText>
    </template>

    <div class="flex flex-col">
      <div
        v-for="(n, i) in NETWORKS" :key="n.key"
        :class="['flex items-center justify-between py-3 first:pt-0 last:pb-0', i !== NETWORKS.length - 1 ? 'border-b border-gray-200' : '']"
      >
        <span class="flex items-center gap-2.5">
          <component :is="NETWORK_ICONS[n.key]" class="w-5 h-5 shrink-0" />
          <HLText html-tag="span" size="lg" weight="medium" class="text-gray-900">{{ n.label }}</HLText>
        </span>
        <!-- Disconnect was a bare text link while Connect was a button, so the two row
             states had different control types and their right edges didn't line up.
             It is red because it is the destructive one, and the toast carries Undo. -->
        <span v-if="isConnected(n.key)" class="flex items-center gap-2.5">
          <HLTag size="sm" color="success" round :interactive="false">Connected</HLTag>
          <HLButton variant="secondary" color="red" size="sm" @click="disconnectNetwork(n.key)">Disconnect</HLButton>
        </span>
        <HLButton v-else variant="secondary" size="sm" @click="connect(n)">Connect</HLButton>
      </div>
    </div>

    <template #footer>
      <!-- A single dismiss, so it reads Done like the other one-button footers. -->
      <div class="flex justify-end gap-2 px-4 py-3">
        <HLButton variant="secondary" size="sm" @click="show = false">Done</HLButton>
      </div>
    </template>
  </HLModal>
</template>
