<script setup>
// Removing a topic deletes its history, which nothing else on this page does. It used to be
// window.confirm; this says what goes with it and offers the reversible alternative.
import { computed, onMounted, ref } from 'vue'
import { fmtNum, quickSearchResult } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'

const { state, account, removeTopic, togglePause } = useSocialListening()

const show = ref(false)
onMounted(() => { show.value = true })

const topic = computed(() => (state.topicsByAccount[state.accountId] || []).find((t) => t.title === state.removeTopicTitle))
const mentions = computed(() => {
  if (!topic.value || topic.value.collecting) return 0
  const r = quickSearchResult(topic.value.term || topic.value.title, state.range, account.value.space)
  return r.empty ? 0 : r.mentions
})

function remove() {
  if (topic.value) removeTopic(topic.value.title)
  show.value = false
}
function pause() {
  if (topic.value && !topic.value.paused) togglePause(topic.value.title)
  show.value = false
}
function done() {
  state.removeTopicTitle = null
  state.modal = null
}
</script>

<template>
  <!-- type="error" gives HighRise's own red header icon, so the hand-built chip, its pt-2
       nudge and the 52px body indent that lined text up under it are gone. -->
  <HLModal
    v-model:show="show"
    id="remove-topic-modal"
    :width="520"
    type="error"
    :show-icon="false"
    footer-divider
    @after-leave="done"
  >
    <template #header>
      <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">Remove “{{ topic?.title }}”?</HLText>
    </template>

    <HLText size="md" class="text-gray-600">
      This stops listening and deletes
      <template v-if="mentions">its {{ fmtNum(mentions) }} mentions</template>
      <template v-else>its history</template>
      and any alerts.
      <template v-if="!topic?.paused">To keep the history, pause the topic instead.</template>
    </HLText>

    <template #footer>
      <div class="flex justify-end gap-2 px-4 py-3">
        <HLButton variant="secondary" size="sm" @click="show = false">Cancel</HLButton>
        <HLButton v-if="!topic?.paused" variant="secondary" size="sm" @click="pause">Pause instead</HLButton>
        <HLButton variant="primary" color="red" size="sm" @click="remove">Remove topic</HLButton>
      </div>
    </template>
  </HLModal>
</template>
