<script setup>
// "Create topic", from nothing. Rebuilt to the reference design (7 Oct): step 1 is a title and
// a two-column grid of sources, step 2 is keywords, ignore words and noise filters, and step 3
// is the orbit loader.
//
// The frame holds still between steps 1 and 2 (A1, 7 Oct topic-modal review). Both steps sit
// in one grid cell and the inactive one is hidden, so the body is always the taller step's
// height with no fixed pixel value, and the footer doesn't move when you press Next or Back.
// The loader step drops the header and footer, as the reference does (O1).
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'
import { CheckIcon, Hash02Icon } from '@gohighlevel/ghl-icons/24/outline'
import { TOPIC_SOURCES } from './topicSources.js'
import { useSocialListening } from '../../composables/useSocialListening.js'
import { TOPIC_SHOWN_LIMIT } from '../../data/socialListening.js'
import OrbitLoader from './OrbitLoader.vue'

const { state, createTopic, isSavedTerm } = useSocialListening()

// The parent mounts this behind a v-if, so `show` starts false and flips on mount —
// otherwise HLModal has no closed state to transition from.
const show = ref(false)
onMounted(() => { show.value = true })

// The reference's ten sources live in topicSources.js, shared with the Topics landing.
const SOURCES = TOPIC_SOURCES
const NOISE = ['Sweepstakes', 'Sales listings', 'Coupons', 'Cryptocurrency']

const step = ref(1)
const title = ref('')
const nets = ref(['facebook'])
const keywordsText = ref('')
const ignoreText = ref('')
const noise = ref([])

// 21 Oct (HighRise pass): sources are HLCheckboxGroup + HLCheckboxCard and the noise filters an
// HLCheckboxGroup of HLCheckbox, both bound to these arrays with v-model:value.
const words = (text) => text.split(',').map((w) => w.trim()).filter(Boolean)
const picked = computed(() => SOURCES.filter((s) => nets.value.includes(s.key)))
// 27 Oct (developers): Facebook can also watch public Pages. Ticking it opens that setup (the
// Facebook sources pop-up); the line under the sources reopens it.
const fbPages = computed(() => (state.fbPagesBy[title.value.trim() || ' '] || []).length)
function openFbSources() { state.fbSources = title.value.trim() || ' ' }
watch(nets, (now, was) => { if (now.includes('facebook') && !(was || []).includes('facebook')) openFbSources() })
// f2 (21 Oct): "Select all" on the sources label row; indeterminate while some are on.
const allOn = computed(() => nets.value.length === SOURCES.length)
const someOn = computed(() => nets.value.length > 0 && !allOn.value)
function toggleAll(v) { nets.value = v ? SOURCES.map((s) => s.key) : [] }
// out9 q04: Create a topic ignored the 50-topic limit (51 of 50) and took a name you already listen to.
const atLimit = computed(() => (state.topicsByAccount[state.accountId] || []).length >= TOPIC_SHOWN_LIMIT)
const takenTitle = computed(() => {
  const t = title.value.trim().toLowerCase()
  return !!t && ((state.topicsByAccount[state.accountId] || []).some((x) => x.title.trim().toLowerCase() === t) || isSavedTerm(t))
})
// 23 Oct: topics live on the Explore tab.
function manageTopics() { show.value = false; state.peekTopic = null; state.peekSearch = null; state.tab = 'insights' }
const canContinue = computed(() => !!title.value.trim() && nets.value.length > 0 && !atLimit.value && !takenTitle.value)
const canCreate = computed(() => words(keywordsText.value).length > 0)

// Step 3 is the orbit loader (O1, 7 Oct loader review), the same one a niche pick plays. As
// in the reference, the header and footer go while it runs and the topic lands after 3s.
const LOADER_LINES = [
  'Scanning platforms for mentions...',
  'Building your keyword index...',
  'Calibrating sentiment engine...',
  'Connecting data sources...',
  'Finalizing your topic...',
]
const loaderTitle = computed(() => `Setting up “${title.value.trim()}”`)
let saveTimer = null
onBeforeUnmount(() => clearTimeout(saveTimer))

function save() {
  if (!canContinue.value || !canCreate.value) return
  step.value = 3
  saveTimer = setTimeout(finish, 3000)
}
function finish() {
  const keywords = words(keywordsText.value)
  createTopic({
    title: title.value.trim(),
    term: keywords[0] || title.value.trim(),
    keywords,
    nets: nets.value,
    ignore: words(ignoreText.value),
    match: 'any',
  })
  show.value = false
}
</script>

<template>
  <HLModal
    v-model:show="show"
    id="topic-modal"
    :width="640"
    :show-header-icon="false"
    :show-icon="false"
    :footer-divider="step < 3"
    :show-header="step < 3"
    :show-footer="step < 3"
    :show-close="step < 3"
    :mask-closable="step < 3"
    :close-on-esc="step < 3"
    @after-leave="state.modal = null"
  >
    <template v-if="step < 3" #header>
      <div class="pb-4">
        <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">Create a topic</HLText>
        <HLText size="lg" weight="regular" class="text-gray-500 mt-1!">Choose what to listen for and where.</HLText>
        <!-- The reference's stepper: blue marks where you are, a tick marks a step done. -->
        <div class="flex items-center gap-4 mt-4">
          <div class="flex items-center gap-3 shrink-0">
            <span class="w-9 h-9 rounded-full flex items-center justify-center bg-primary-600 text-white shrink-0">
              <CheckIcon v-if="step > 1" class="w-3.5 h-3.5" />
              <HLText v-else html-tag="span" size="lg" weight="semibold" class="text-white">1</HLText>
            </span>
            <div>
              <HLText size="lg" weight="semibold" class="text-gray-900">Name and sources</HLText>
              <HLText size="md" class="text-gray-500 mt-1!">Choose a name and the sources to track</HLText>
            </div>
          </div>
          <span :class="['w-16 h-0.5 rounded-full shrink-0 transition-colors duration-300', step > 1 ? 'bg-primary-600' : 'bg-gray-200']" />
          <div class="flex items-center gap-3 min-w-0">
            <span :class="['w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors', step >= 2 ? 'bg-primary-600' : 'bg-gray-100']">
              <HLText html-tag="span" size="lg" weight="semibold" :class="step >= 2 ? 'text-white' : 'text-gray-400'">2</HLText>
            </span>
            <div>
              <HLText size="lg" weight="semibold" :class="step >= 2 ? 'text-gray-900' : 'text-gray-500'">Keywords and filters</HLText>
              <HLText size="md" :class="['mt-1!', step >= 2 ? 'text-gray-500' : 'text-gray-400']">Set keywords and refine your results</HLText>
            </div>
          </div>
        </div>
      </div>
    </template>

    <OrbitLoader v-if="step === 3" :title="loaderTitle" :lines="LOADER_LINES" />

    <!-- Both steps share one grid cell; see the note at the top. The hidden one is inert so
         neither a click nor Tab can reach it. -->
    <!-- -mx-4 reaches HLModal's 16px body inset, so the rule under the stepper runs edge to edge. -->
    <div v-else class="sl-topic-body -mx-4 px-4 pt-4">
    <div class="grid max-h-[60vh] overflow-y-auto px-1">
      <!-- ---------------- step 1 ---------------- -->
      <div :class="['[grid-area:1/1] self-start transition-opacity duration-200', step === 1 ? 'opacity-100' : 'opacity-0 invisible']" :inert="step !== 1 || undefined">
        <HLAlert
          v-if="atLimit" id="topic-limit" color="orange" role="status" :closable="false" max-width="none" class="mb-4"
          :title="`You’re listening to all ${TOPIC_SHOWN_LIMIT} topics.`" content="Stop listening to one to create another."
          :action-one="{ text: 'Manage topics', onActionClick: manageTopics }"
        />
        <HLForm class="sl-topic-form" @submit.prevent>
          <HLFormItem
            label="Title" :show-feedback="true" :validation-status="takenTitle ? 'warning' : undefined"
            :feedback="takenTitle ? `You already listen to “${title.trim()}”. Pick another name.` : undefined"
          >
            <HLInput id="topic-title" v-model="title" size="sm" autofocus :disabled="atLimit" placeholder="e.g., Pet grooming tips" />
          </HLFormItem>
          <HLFormItem :show-feedback="false">
            <template #label>
              <!-- f2 (21 Oct): count beside the label, "Select all" on the right, so it reads as pick-several. -->
              <span class="flex items-center justify-between gap-4 w-full">
                <span class="flex items-center gap-2">
                  <span>Select sources</span>
                  <HLText html-tag="span" size="md" class="text-gray-500 font-normal tabular-nums">{{ nets.length }} of {{ SOURCES.length }}</HLText>
                </span>
                <HLCheckbox id="topic-src-all" size="sm" :checked="allOn" :indeterminate="someOn" @update:checked="toggleAll">
                  <span class="font-normal text-gray-700">Select all</span>
                </HLCheckbox>
              </span>
            </template>
            <HLCheckboxGroup id="topic-sources" v-model:value="nets" class="w-full sl-topic-sources">
              <div class="grid grid-cols-2 gap-2 w-full">
                <HLCheckboxCard
                  v-for="s in SOURCES" :id="`topic-src-${s.key}`" :key="s.key" :value="s.key" :checked="nets.includes(s.key)"
                  :title="s.name" :description="s.desc" :width="300"
                >
                  <!-- The brand mark on its brand colour (logo hexes stay, as everywhere). -->
                  <template #icon>
                    <span class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :style="{ backgroundColor: s.color }">
                      <component :is="s.icon" v-if="s.icon" class="w-4 h-4 text-white" />
                      <svg v-else-if="s.key === 'instagram'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none" /></svg>
                      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path :d="s.d" /></svg>
                    </span>
                  </template>
                </HLCheckboxCard>
              </div>
            </HLCheckboxGroup>
            <HLText v-if="nets.includes('facebook')" id="topic-fb-pages" size="md" class="text-gray-600 mt-2!">
              Facebook public Pages: {{ fbPages ? fbPages : 'none yet' }} ·
              <HLButton id="topic-fb-pages-edit" class="sl-inline-link" variant="text" color="blue" size="xs" @click="openFbSources">{{ fbPages ? 'Edit' : 'Add Pages' }}</HLButton>
            </HLText>
          </HLFormItem>
        </HLForm>
      </div>

      <!-- ---------------- step 2 ---------------- -->
      <div :class="['[grid-area:1/1] self-start flex flex-col gap-4 transition-opacity duration-200', step === 2 ? 'opacity-100' : 'opacity-0 invisible']" :inert="step !== 2 || undefined">
        <div class="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
          <span class="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
            <Hash02Icon class="w-3.5 h-3.5 text-white" />
          </span>
          <div class="flex-1 min-w-0">
            <HLText size="md" weight="semibold" class="text-gray-900 truncate">{{ title.trim() }}</HLText>
            <HLText size="md" class="text-gray-500">{{ nets.length }} source{{ nets.length === 1 ? '' : 's' }} selected</HLText>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <span v-for="s in picked.slice(0, 4)" :key="s.key" class="w-5 h-5 rounded-full flex items-center justify-center" :style="{ backgroundColor: s.color }" :title="s.name">
              <component :is="s.icon" v-if="s.icon" class="w-2.5 h-2.5 text-white" />
              <svg v-else-if="s.key === 'instagram'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></svg>
              <svg v-else width="10" height="10" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path :d="s.d" /></svg>
            </span>
            <span v-if="picked.length > 4" class="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
              <HLText html-tag="span" size="md" weight="semibold" class="text-gray-500">+{{ picked.length - 4 }}</HLText>
            </span>
          </div>
        </div>

        <HLForm class="sl-topic-form" @submit.prevent>
          <HLFormItem label="Keywords to track" :show-feedback="false">
            <HLInput id="topic-keywords" v-model="keywordsText" size="sm" placeholder="e.g., dog grooming, #petgrooming" />
          </HLFormItem>
          <HLFormItem label="Keywords to ignore" :show-feedback="false">
            <HLInput id="topic-ignore" v-model="ignoreText" size="sm" placeholder="e.g., jobs, giveaway" />
          </HLFormItem>
          <HLFormItem :show-feedback="false">
            <template #label>
              <span class="block">Reduce noise <span class="text-gray-400 font-normal">(optional)</span></span>
              <HLText size="md" class="text-gray-500 mt-1! font-normal">Automatically exclude common spam categories from your results.</HLText>
            </template>
            <HLCheckboxGroup id="topic-noise" v-model:value="noise">
              <HLSpace :size="[16, 8]" wrap>
                <HLCheckbox v-for="n in NOISE" :id="`topic-noise-${n.toLowerCase().replace(/\s+/g, '-')}`" :key="n" :value="n" size="sm">{{ n }}</HLCheckbox>
              </HLSpace>
            </HLCheckboxGroup>
          </HLFormItem>
        </HLForm>
      </div>
    </div>
    </div>

    <template v-if="step < 3" #footer>
      <div class="flex items-center justify-between px-4 py-3">
        <HLButton v-if="step === 1" variant="secondary" size="sm" @click="show = false">Cancel</HLButton>
        <HLButton v-else variant="secondary" size="sm" @click="step = 1">Back</HLButton>
        <HLButton v-if="step === 1" variant="primary" color="blue" size="sm" :disabled="!canContinue" @click="step = 2">Next</HLButton>
        <HLButton v-else variant="primary" color="blue" size="sm" :disabled="!canCreate" @click="save">Create topic</HLButton>
      </div>
    </template>
  </HLModal>
</template>

<style scoped>
/* A text link inside a sentence, on the sentence's own line height (as on Explore). */
:deep(.sl-inline-link.hr-button) { height: auto !important; padding: 0 !important; vertical-align: baseline; font-size: inherit !important; }
/* HLForm puts 8 between items; this modal's groups sit 16 apart (HLSpace lg), as in the flyout. */
.sl-topic-body :deep(.sl-topic-form) { gap: 16px; }
/* HLCheckboxCard draws its description at sm (12); the page's type floor is 13, as the radio cards
   in the alert flyout already are. Tokens, not literals. */
.sl-topic-sources :deep(.hr-checkbox-card-description .hr-text) { font-size: var(--hr-font-size-md); line-height: var(--hr-line-height-md); }
</style>
