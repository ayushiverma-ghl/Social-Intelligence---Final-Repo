<script setup>
// 19 Oct: Stop listening asks first, from the Your topics row menu and from the insights pop-up.
// Confirming removes the topic; the toast that follows carries Undo.
import { computed, onMounted, ref } from 'vue'
import { useSocialListening } from '../../composables/useSocialListening.js'

const { state, removeTopic } = useSocialListening()
const show = ref(false)
onMounted(() => { show.value = true })
const title = computed(() => state.confirmStop)
const alerts = computed(() => (state.alertsBy[`${state.accountId}|${title.value}`] || []).length)
let confirmed = false
function stop() { confirmed = true; show.value = false }
function afterLeave() {
  const t = title.value
  state.confirmStop = null
  if (!confirmed) return
  if (state.peekTopic === t) { state.peekTopic = null; state.detailPlatforms = null }
  removeTopic(t)
}
</script>

<template>
  <HLModal v-model:show="show" id="stop-listening-modal" :width="440" :show-header-icon="false" :show-icon="false" @after-leave="afterLeave">
    <template #header>
      <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">Stop listening to “{{ title }}”?</HLText>
    </template>
    <HLText size="lg" class="text-gray-600">
      We’ll stop checking it<template v-if="alerts"> and turn off its {{ alerts }} {{ alerts === 1 ? 'alert' : 'alerts' }}</template>. You can listen again any time.
    </HLText>
    <template #footer>
      <div class="flex items-center justify-end gap-2 px-4 py-3">
        <HLButton id="stop-listening-keep" variant="secondary" size="sm" @click="show = false">Keep listening</HLButton>
        <HLButton id="stop-listening-confirm" variant="primary" color="red" size="sm" @click="stop">Stop listening</HLButton>
      </div>
    </template>
  </HLModal>
</template>
