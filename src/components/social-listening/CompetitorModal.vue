<script setup>
// Add competitors — type a brand, press enter.
//
// Settled on the 28 Sep call. Sujith: "in the competition, when you try to add it, don't
// show the radios… it should be like a search and add. Maybe the bottom one that you have —
// type a brand. That is all you need." So the checklist of niche suggestions is gone and
// the field that used to sit under it is the whole modal.
//
// The suggestions could not stay in any case. Shivam: "we cannot give a pre-populated" —
// competitors resolve from the account's own domain, and where we cannot resolve one the
// answer is a blank state, not a guess from the niche. Our list was a guess from the niche.
//
// The field says "Type a brand name", not "Search". Sujith asked for search and Shivam ruled
// out the system suggesting competitors; whether it can MATCH what you are already typing is
// a different question and nobody has answered it. Until someone does, a search affordance
// with no index behind it promises something this control cannot do.
import { computed, onMounted, ref } from 'vue'
import { XCloseIcon } from '@gohighlevel/ghl-icons/24/outline'
import { useSocialListening } from '../../composables/useSocialListening.js'

// The cap is per design: 3 simplified, 4 current.
const { state, account, addCompetitor, removeCompetitor, maxCompetitors, simple } = useSocialListening()

const show = ref(false)
onMounted(() => { show.value = true })

const added = computed(() => account.value.competitors || [])
const full = computed(() => added.value.length >= maxCompetitors.value)

// Case-insensitive, because "hubspot" and "HubSpot" are one competitor and two queries.
const duplicate = computed(() => {
  const v = state.compDraft.trim().toLowerCase()
  return !!v && added.value.some((c) => c.toLowerCase() === v)
})

// One line under the field, in HLFormItem's feedback slot, for whichever of these applies.
// Duplicate is a warning (the field says why Add did nothing); full is plain help text.
// out9 q15: you could add yourself, or a single letter, as a competitor.
const isSelf = computed(() => {
  const v = state.compDraft.trim().toLowerCase()
  return !!v && [account.value.name, account.value.short].some((n) => String(n || '').toLowerCase() === v)
})
const tooShort = computed(() => !!state.compDraft.trim() && (state.compDraft.match(/[\p{L}\p{N}]/gu) || []).length < 2)
const feedback = computed(() => {
  if (isSelf.value) return { text: 'That’s your business. Track a brand you compete with.', status: 'warning' }
  if (tooShort.value) return { text: 'Type at least 2 letters.', status: undefined }
  if (duplicate.value) return { text: `“${state.compDraft.trim()}” is already on the list.`, status: 'warning' }
  if (full.value) return {
    text: `${maxCompetitors.value} of ${maxCompetitors.value} tracked, the most you can track. Remove one to track another.`,
    status: undefined,
  }
  return null
})
const canAdd = computed(() => !!state.compDraft.trim() && !full.value && !duplicate.value && !isSelf.value && !tooShort.value)

function submit() {
  if (!canAdd.value) return
  addCompetitor(state.compDraft.trim())
  state.compDraft = ''
}
</script>

<template>
  <HLModal
    v-model:show="show"
    id="competitor-modal"
    :width="520"
    :show-header-icon="false"
    :show-icon="false"
    footer-divider
    @after-leave="state.modal = null; state.compDraft = ''"
  >
    <template #header>
      <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">Track competitors</HLText>
      <HLText size="md" class="text-gray-500">Track up to {{ maxCompetitors }} brands to compare against.</HLText>
    </template>

    <!-- The same field-plus-Add row as the alert modal's recipients. Enter still adds; the
         button is there so adding doesn't depend on knowing that. -->
    <HLForm @submit.prevent>
      <HLFormItem
        label="Brand name"
        :show-feedback="!!feedback"
        :feedback="feedback?.text"
        :validation-status="feedback?.status"
      >
        <div class="flex gap-2 w-full">
          <div class="flex-1 min-w-0">
            <HLInput
              id="competitor-name"
              v-model="state.compDraft"
              size="md"
              autofocus
              :disabled="full"
              placeholder="e.g., Bright Path Marketing"
              @keydown.enter.prevent="submit"
            />
          </div>
          <HLButton variant="secondary" size="md" :disabled="!canAdd" @click="submit">Track</HLButton>
        </div>
      </HLFormItem>
    </HLForm>

    <!-- A row per brand, so a long name never wraps against a short one. Removal sits at
         the right where it does in every other list in this product. -->
    <!-- Simplified: a count over the list, so the cap is visible before it is hit. -->
    <div v-if="simple && added.length" class="flex items-center justify-between mt-3">
      <HLText size="md" weight="medium" class="text-gray-500">Tracking</HLText>
      <HLText size="md" weight="medium" class="text-gray-500 tabular-nums">{{ added.length }} of {{ maxCompetitors }}</HLText>
    </div>

    <div v-if="added.length" :class="simple ? 'mt-1' : 'mt-2'">
      <div
        v-for="(name, i) in added" :key="name"
        :class="['sl-enter flex items-center justify-between gap-3 py-2',
          i !== added.length - 1 ? 'border-b border-gray-200' : '']"
      >
        <HLText html-tag="span" size="lg" weight="medium" class="text-gray-900 truncate">{{ name }}</HLText>
        <HLTooltip trigger="hover">
          <template #trigger>
            <HLButton variant="ghost" size="xs" :aria-label="`Stop tracking ${name}`" @click="removeCompetitor(name)">
              <template #iconLeft><XCloseIcon /></template>
            </HLButton>
          </template>
          Stop tracking
        </HLTooltip>
      </div>
    </div>

    <template #footer>
      <!-- Adding commits immediately, so Cancel would close without cancelling. Done is the
           only honest control here, and a single dismiss is secondary like every other. -->
      <div class="flex justify-end gap-2 px-4 py-3">
        <HLButton variant="secondary" size="sm" @click="show = false">Done</HLButton>
      </div>
    </template>
  </HLModal>
</template>
