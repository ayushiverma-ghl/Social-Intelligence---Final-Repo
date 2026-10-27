<script setup>
// 26 Oct (Sujith, 23 Oct call): right after Start listening, the topic can be renamed in place.
// Same shape as StopListeningModal: a 440 HLModal, one field, Cancel and Save.
import { computed, onMounted, ref } from 'vue'
import { useSocialListening } from '../../composables/useSocialListening.js'

const { state, renameTopic, toast } = useSocialListening()
const show = ref(false)
const from = state.renaming
const name = ref(from || '')
onMounted(() => { show.value = true })
const taken = computed(() => (state.topicsByAccount[state.accountId] || []).some((t) => t.title !== from && t.title.trim().toLowerCase() === name.value.trim().toLowerCase()))
const canSave = computed(() => !!name.value.trim() && name.value.trim() !== from && !taken.value)
let saved = false
function save() { if (!canSave.value) return; saved = true; show.value = false }
function afterLeave() {
  state.renaming = null
  if (!saved) return
  const next = name.value.trim()
  renameTopic(from, next)
  if (state.peekTopic === from) state.peekTopic = next
  toast(`Renamed to “${next}”`)
}
</script>

<template>
  <HLModal v-model:show="show" id="rename-topic-modal" :width="440" :show-header-icon="false" :show-icon="false" @after-leave="afterLeave">
    <template #header>
      <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">Rename topic</HLText>
    </template>
    <div class="flex flex-col gap-2">
      <HLInput id="rename-topic-input" v-model="name" size="md" :maxlength="100" autofocus @keydown.enter="save" />
      <HLText v-if="taken" size="md" class="text-negative-strong" role="status">You already have a topic with this name.</HLText>
    </div>
    <template #footer>
      <div class="flex items-center justify-end gap-2 px-4 py-3">
        <HLButton id="rename-topic-cancel" variant="secondary" size="sm" @click="show = false">Cancel</HLButton>
        <HLButton id="rename-topic-save" variant="primary" color="blue" size="sm" :disabled="!canSave" @click="save">Save</HLButton>
      </div>
    </template>
  </HLModal>
</template>
