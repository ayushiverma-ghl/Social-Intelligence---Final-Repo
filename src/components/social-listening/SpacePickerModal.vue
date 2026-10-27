<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { SearchMdIcon, Edit05Icon } from '@gohighlevel/ghl-icons/24/outline'
import { SPACE_NAMES, cleanIndustryName } from '../../data/socialListening.js'
import { industryIcon } from './industryIcons.js'
import { useSocialListening } from '../../composables/useSocialListening.js'

const { state, account, analyze, simple } = useSocialListening()

// Shortest string we'll accept as a niche of its own — below this, a stray
// keystroke would read as an invitation to save nonsense.
const MIN_CUSTOM = 3

const show = ref(false)
const query = ref('')
// Opened from the landing's Change, the account's own industry starts selected.
// out9 q13: a typed-in industry reopens in its own field, not as an invisible selection.
const typedBefore = account.value.space && !SPACE_NAMES.includes(account.value.space) ? account.value.space : ''
const selected = ref(typedBefore ? null : (account.value.space || account.value.knownIndustry || null))
const listEl = ref(null)
const customEl = ref(null)

// Other is a real choice with its own field, not a shortcut back to the search box. The
// search box filters the list; this names a niche that is not in it. Two jobs, two inputs,
// and the one you are using is the one that has focus.
const otherMode = ref(!!typedBefore)
const customName = ref(typedBefore)

// The parent mounts this behind a v-if, so `show` has to start false and flip
// on mount — otherwise HLModal has no closed state to transition from.
onMounted(async () => {
  show.value = true
  // The current niche can sit 20 rows down; bring it into view rather than
  // making someone scroll to find out what's already set.
  await nextTick()
  setTimeout(() => {
    const list = listEl.value
    const row = list?.querySelector('[data-selected="true"]')
    // Scroll the list itself rather than calling scrollIntoView, which walks every ancestor
    // scroller and can drag the page behind the modal with it.
    if (list && row) list.scrollTop = row.offsetTop - (list.clientHeight / 2) + (row.offsetHeight / 2)
  }, 80)
})

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return SPACE_NAMES
  return SPACE_NAMES.filter((name) => name.toLowerCase().includes(q))
})

// out9 q12/q13: saved without emoji or doubled spaces, first letter capitalised.
const custom = computed(() => cleanIndustryName(customName.value))
const MAX_CUSTOM = 60

// Already stocked under another name: typing it picks that card instead of blocking.
const dupMatch = computed(() => SPACE_NAMES.find((name) => name.toLowerCase() === custom.value.toLowerCase()) || null)
const isDuplicate = computed(() => !!dupMatch.value)
// At least three letters: "12345" or "&&&" isn't an industry.
const letters = computed(() => (custom.value.match(/\p{L}/gu) || []).length)

const canAddCustom = computed(() => letters.value >= MIN_CUSTOM && !isDuplicate.value)

// One value leaves this modal whichever way it was chosen.
const chosen = computed(() => (otherMode.value ? (dupMatch.value || (canAddCustom.value ? custom.value : null)) : selected.value))

// Choosing Other puts the cursor in its field. `autofocus` can't do this: the browser ignores
// it on an element inserted while something else (the search box) already has focus.
async function chooseOther() {
  otherMode.value = true
  selected.value = null
  await nextTick()
  customEl.value?.$el?.querySelector('input')?.focus()
}

// Picking a listed niche puts Other away and empties its field, so the two can never both
// look chosen — and so a half-typed niche does not sit under a different selection.
function choose(name) {
  selected.value = name
  if (simple.value) document.activeElement?.blur?.()
  otherMode.value = false
  customName.value = ''
}

// One radio group carries both kinds of choice; OTHER is its value for the Other row.
const OTHER = '__other__'
const groupValue = computed(() => (otherMode.value ? (dupMatch.value || OTHER) : selected.value))
function onPick(v) {
  if (v === OTHER) chooseOther()
  else choose(v)
}

// Why the custom niche can't be saved yet, shown as the field's own feedback.
const customFeedback = computed(() => {
  if (!custom.value) return null
  if (isDuplicate.value) return `${dupMatch.value} is in the list, so it’s selected above.`
  if (letters.value < MIN_CUSTOM) return `Use at least ${MIN_CUSTOM} letters, like “Pet grooming”.`
  if (customName.value.length >= MAX_CUSTOM) return `${MAX_CUSTOM} characters is the most. Keep it short, like “Pet grooming”.`
  return null
})

// analyze() starts the setup; the modal closes itself so its leave animation plays.
function commit() {
  if (!chosen.value) return
  analyze(chosen.value)
  show.value = false
}
</script>

<template>
  <!-- 21 Oct (pick 10 V1): HighRise modal header (16 semibold title, left-aligned, close top
       right) and the industries as HighRise radio cards (HLRadioCard, compact, icon slot) in a
       3-across grid. The icon circles are grey, not primary: blue isn't decorative here. -->
  <HLModal
    v-if="simple"
    v-model:show="show"
    id="niche-modal"
    :width="940"
    :show-header-icon="false"
    :show-icon="false"
    footer-divider
    @after-leave="state.modal = null"
  >
    <template #header>
      <div class="flex flex-col gap-1">
        <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">Choose your industry</HLText>
        <HLText size="lg" class="text-gray-600">Pick the closest match, or type your own. Your insights update to match it.</HLText>
      </div>
    </template>

    <div ref="listEl" class="sl-ind-scroll">
      <HLRadioGroup id="niche-cards" :value="groupValue" @update:value="onPick">
        <div class="sl-ind-grid">
          <HLRadioCard
            v-for="name in results" :key="name" :value="name" :title="name" compact
            :checked="(selected === name && !otherMode) || (otherMode && dupMatch === name)" :data-selected="(selected === name && !otherMode) || (otherMode && dupMatch === name)"
            :icon-size="'32px'" width="100%" @change="choose(name)"
          >
            <template #icon><component :is="industryIcon(name)" /></template>
          </HLRadioCard>
        </div>
      </HLRadioGroup>
    </div>
    <div class="sl-ind-own">
      <HLText size="md" weight="medium" class="text-gray-700">Not listed? Type your own</HLText>
      <HLInput
        id="niche-custom" v-model="customName" size="md" :maxlength="MAX_CUSTOM" show-count placeholder="e.g., Pet grooming, kids’ dance classes" aria-label="Your industry"
        @focus="otherMode = true; selected = null" @keydown.enter.prevent="commit"
      >
        <template #prefix><Edit05Icon class="w-4 h-4 text-gray-400" /></template>
      </HLInput>
      <!-- out9 q13: the line's space is kept, so the modal doesn't jump when feedback appears. -->
      <HLText size="md" :class="['text-gray-500 min-h-5', !(otherMode && customFeedback) && 'invisible']" role="status">{{ (otherMode && customFeedback) || '\u00a0' }}</HLText>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2 px-4 py-3">
        <HLButton variant="secondary" size="sm" @click="show = false">Cancel</HLButton>
        <HLButton id="niche-choose" variant="primary" color="blue" size="sm" :disabled="!chosen" @click="commit">Choose</HLButton>
      </div>
    </template>
  </HLModal>

  <HLModal
    v-else
    v-model:show="show"
    id="niche-modal"
    :width="520"
    :show-header-icon="false"
    :show-icon="false"
    footer-divider
    @after-leave="state.modal = null"
  >
    <!-- Plain content in the header slot, not HLHeaderLite — nesting a header component
         inside the component's own header stacked two sets of chrome. Titled for the button
         that finishes it, "Set niche". -->
    <template #header>
      <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">{{ simple ? 'Pick your industry' : `Set ${account.short}'s niche` }}</HLText>
      <HLText size="md" class="text-gray-500">{{ simple ? 'Choose the closest match, or type your own.' : 'Pick the industry closest to this account, or type your own.' }}</HLText>
    </template>

    <HLInput
      id="niche-search"
      v-model="query"
      size="md"
      clearable
      autofocus
      :placeholder="simple ? 'Search industries' : 'Search a niche'"
    >
      <template #prefix>
        <SearchMdIcon class="w-4 h-4 text-gray-400" />
      </template>
    </HLInput>

    <!-- Search first, then one radio list: a niche is one choice. HLRadioGroup lays radios
         inline, so the column is a wrapper inside it. The selected row used to say so three
         ways at once (a bullet dot, a tinted row and a trailing tick); the radio alone
         carries it. -->
    <!-- px-1.5 inside, -mx-1.5 outside: a scroller clips sideways too, and the radios sit on
         its left edge, so the circle and its focus ring were cut off. The padding gives them
         room; the negative margin keeps them lined up with the search field. -->
    <div ref="listEl" class="sl-niche-list mt-2 max-h-[278px] overflow-y-auto px-2 -mx-2">
      <HLRadioGroup id="niche-list" :value="groupValue" size="sm" @update:value="onPick">
        <div class="flex flex-col">
          <div v-for="name in results" :key="name" :data-selected="selected === name" class="py-1.5">
            <HLRadio :id="`niche-${name}`" :value="name" :label="name" size="sm" />
          </div>

          <!-- Permanently the last row, where every list of choices puts Other. A radio like
               the rest, because it is a choice like the rest — the field it opens is what
               makes it different, not the row. -->
          <div :data-selected="otherMode" class="py-1.5 mt-1.5 pt-2.5 border-t border-gray-200">
            <HLRadio id="niche-other" :value="OTHER" label="Other" size="sm" />
          </div>
        </div>
      </HLRadioGroup>

      <HLText v-if="!results.length" size="md" class="pt-2.5 text-gray-500">
        Nothing matches “{{ query.trim() }}”. Pick Other above to add it.
      </HLText>
    </div>

    <!-- Outside the scroller on purpose. Other is the last row, so this still reads as
         sitting directly under it — but the list is capped at 278px, and a field inside it
         would open below the fold on a short window and have to be scrolled to. -->
    <HLForm v-if="otherMode" ref="customEl" class="mt-2" @submit.prevent>
      <HLFormItem
        :label="simple ? 'Your industry' : 'Your niche'"
        :show-label="false"
        :show-feedback="!!customFeedback"
        :feedback="customFeedback || undefined"
      >
        <HLInput id="niche-custom" v-model="customName" size="md" :placeholder="simple ? 'Type your industry' : 'Type your niche here'" @keydown.enter.prevent="commit" />
      </HLFormItem>
    </HLForm>

    <HLText v-if="query.trim() && results.length" size="md" class="mt-2! text-gray-500">
      {{ simple ? `${results.length} of ${SPACE_NAMES.length} industries` : `Showing ${results.length} of ${SPACE_NAMES.length}. Clear the field to browse everything.` }}
    </HLText>

    <template #footer>
      <div class="flex justify-end gap-2 px-4 py-3">
        <HLButton variant="secondary" size="sm" @click="show = false">Cancel</HLButton>
        <HLButton variant="primary" color="blue" size="sm" :disabled="!chosen" @click="commit">{{ simple ? 'Save' : 'Set niche' }}</HLButton>
      </div>
    </template>
  </HLModal>
</template>

<!-- Unscoped: HLModal teleports. HLRadioGroup renders inline-block, which left the rule above
     Other only as wide as the longest niche; the list is a full-width column. -->
<style>
.hr-v-4-8-5 .sl-niche-list .hr-radio-group { display: block; width: 100%; }

/* 21 Oct (pick 10 V1): the radio-card grid. Unscoped like the rule above: HLModal teleports. */
.sl-ind-scroll { max-height: min(52vh, 470px); overflow-y: auto; }
.hr-v-4-8-5 .sl-ind-scroll .hr-radio-group { display: block; width: 100%; }
/* One row height for the grid, so a two-line name doesn't make its row taller than the rest. */
.sl-ind-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-auto-rows: 1fr; gap: 8px; }
.sl-ind-grid .hr-radio-card { --n-radio-card-width: 100% !important; --n-container-width: 100% !important; height: 100% !important; }
.sl-ind-grid .hr-radio-card-item-container { height: 100%; align-items: center !important; }
/* The card's own icon variables, set to grey so 21 icons don't read as decorative blue. */
.sl-ind-grid .hr-radio-card { --n-icon-background: var(--gray-100) !important; --n-icon-border: 4px solid var(--gray-50) !important; }
.sl-ind-grid .hr-radio-card-icon svg { color: var(--gray-600); }
.sl-ind-own { display: flex; flex-direction: column; gap: 8px; margin-top: 24px; }

/* 21 Oct (a10 V1, Ayushi: "the icons are way too small"): HighRise's radio card with a set icon
   size (iconSize prop, 32px since 26 Oct). HighRise draws the glyph at half the box, so it is set
   to 16px. #niche-modal outranks HighRise's namespaced, data-v scoped rules. */
#niche-modal .sl-ind-grid .hr-radio-card-icon svg { width: 16px; height: 16px; flex: none; color: var(--gray-700); }
/* 26 Oct (Sujit, "compact the chips a bit", V1): 32px icon circles and 8 / 12 inside, so rows are
   54px (the tallest name takes two lines) instead of 66. */
#niche-modal .sl-ind-grid .hr-radio-card { --n-radio-card-padding: 8px 12px !important; --n-container-gap: 8px !important; }
#niche-modal .sl-ind-grid .hr-radio-card-content { gap: 2px; }
/* HighRise's compact rule targets .hr-radio-card-container, which the card never renders, so a
   compact card kept an empty 18px radio column on its right: the dead space that made names wrap
   early. Two columns, as the compact rule intends. */
#niche-modal .sl-ind-grid .hr-radio-card-item-container { grid-template-columns: var(--n-icon-size) minmax(0, 1fr) !important; }
/* HLCard's content box hugs its children; full height lets the item container centre a one-line card. */
#niche-modal .sl-ind-grid .hr-card-content { height: 100%; }
/* Seven rows of 64px cards fit without the grid scrolling, so no row is cut in half. */
#niche-modal .sl-ind-scroll { max-height: min(60vh, 520px); }
/* The title token (--n-title-color, gray-700) never reaches the HLText inside, which renders
   gray-500, paler than the icon. Restore it. */
#niche-modal .sl-ind-grid .hr-radio-card-title, #niche-modal .sl-ind-grid .hr-radio-card-title * { color: var(--gray-700); }
</style>
