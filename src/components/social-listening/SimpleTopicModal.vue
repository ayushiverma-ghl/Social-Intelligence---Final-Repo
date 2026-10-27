<script setup>
// "Create a topic" in the one-page design (15 Oct, audit 9). One field, then the results: the
// name opens the same insights pop-up a search does, and Start listening there saves it. So
// there is one way to save a topic, and one name for it.
//
// Sources, words to leave out and the noise filters wait under "More options". The prototype
// doesn't filter results by them yet, so they are held here and not passed on.
import { computed, onMounted, ref } from 'vue'
import { SearchMdIcon, ChevronDownIcon, ChevronUpIcon, CheckIcon, LayersThree01Icon } from '@gohighlevel/ghl-icons/24/outline'
import { NETWORK_ICONS } from './networkIcons.js'
import { TOPIC_SOURCES } from './topicSources.js'
import { useSocialListening } from '../../composables/useSocialListening.js'

const { state, peek, listenTo, isSavedTerm } = useSocialListening()

const show = ref(false)
onMounted(() => { show.value = true })

const term = ref('')
const more = ref(false)
const allNets = ref(true)
const nets = ref([])
const ignoreText = ref('')
const noise = ref([])
const NOISE = ['Sweepstakes', 'Sales listings', 'Coupons', 'Cryptocurrency']
// 15 Oct: the platform names used everywhere else; Telegram appears nowhere else in the product.
const RENAME = { 'X (Twitter)': 'X', Web: 'Blogs' }
const SOURCES = TOPIC_SOURCES.filter((s) => s.key !== 'telegram' && s.name !== 'Telegram').map((s) => ({ ...s, name: RENAME[s.name] || s.name }))

const toggle = (list, k) => { list.value = list.value.includes(k) ? list.value.filter((x) => x !== k) : [...list.value, k] }
function toggleNet(k) {
  allNets.value = false
  toggle(nets, k)
  if (!nets.value.length) allNets.value = true
}
function pickAll() { allNets.value = true; nets.value = [] }

const already = computed(() => !!term.value.trim() && isSavedTerm(term.value.trim()))
const canGo = computed(() => !!term.value.trim() && !already.value)
let next = ''
function go() {
  if (!canGo.value) return
  next = term.value.trim()
  show.value = false
}
// 19 Oct (Sujit): the button says Create topic, so it creates it: listening starts and the
// pop-up opens on the saved topic.
function afterLeave() {
  state.modal = null
  if (!next) return
  if (!isSavedTerm(next)) listenTo(next)
  peek(next)
}
</script>

<template>
  <HLModal
    v-model:show="show"
    id="topic-modal"
    :width="560"
    :show-header-icon="false"
    :show-icon="false"
    footer-divider
    @after-leave="afterLeave"
  >
    <template #header>
      <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">Create a topic</HLText>
      <HLText size="md" class="text-gray-600 mt-0.5!">Name a brand, topic or hashtag. We’ll check it every 6 hours.</HLText>
    </template>

    <!-- 19 Oct spacing pass: three groups by space alone (no rule), labels 10px over their controls. -->
    <div class="flex flex-col gap-7 pt-1 pb-2">
      <div class="flex flex-col gap-2.5">
        <HLText html-tag="label" for="topic-term" size="md" weight="medium" class="text-gray-700">Topic</HLText>
        <HLInput
          id="topic-term" v-model="term" size="md" :prefix-icon="SearchMdIcon" :maxlength="100"
          placeholder="A brand, topic or hashtag" autofocus @keydown.enter="go"
        />
        <HLText v-if="already" id="topic-already" size="md" class="text-warning-strong">You’re already listening to “{{ term.trim() }}”.</HLText>
      </div>
      <HLButton id="topic-more" class="self-start -ml-1" variant="text" color="blue" size="xs" :aria-expanded="more" @click="more = !more">
        {{ more ? 'Fewer options' : 'More options' }}
        <template #iconRight><component :is="more ? ChevronUpIcon : ChevronDownIcon" /></template>
      </HLButton>

      <template v-if="more">
        <div class="flex flex-col gap-2.5 pt-1">
          <HLText size="md" weight="medium" class="text-gray-700">Sources</HLText>
          <div class="flex flex-wrap gap-2.5" role="group" aria-label="Sources">
            <button type="button" :class="['sl-opt', allNets && 'is-on']" :aria-pressed="allNets" @click="pickAll">
              <LayersThree01Icon class="w-4 h-4 text-gray-500" aria-hidden="true" />All platforms<CheckIcon v-if="allNets" class="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              v-for="src in SOURCES" :key="src.key" type="button" :class="['sl-opt', nets.includes(src.key) && 'is-on']"
              :aria-pressed="nets.includes(src.key)" @click="toggleNet(src.key)"
            >
              <span class="sl-opt-logo" aria-hidden="true"><component :is="NETWORK_ICONS[src.key] || src.icon || NETWORK_ICONS.web" class="w-4 h-4" /></span>{{ src.name }}<CheckIcon v-if="nets.includes(src.key)" class="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div class="flex flex-col gap-2.5">
          <HLText html-tag="label" for="topic-ignore" size="md" weight="medium" class="text-gray-700">Leave out posts that mention</HLText>
          <HLInput id="topic-ignore" v-model="ignoreText" size="md" placeholder="Coupons, giveaways…" />
        </div>
        <div class="flex flex-col gap-2.5">
          <HLText size="md" weight="medium" class="text-gray-700">Also skip</HLText>
          <div class="flex flex-wrap gap-2.5" role="group" aria-label="Also skip">
            <button
              v-for="n in NOISE" :key="n" type="button" :class="['sl-opt', noise.includes(n) && 'is-on']"
              :aria-pressed="noise.includes(n)" @click="toggle(noise, n)"
            >
              <CheckIcon v-if="noise.includes(n)" class="w-3.5 h-3.5" aria-hidden="true" />{{ n }}
            </button>
          </div>
        </div>
      </template>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2 px-4 py-3">
        <HLButton id="topic-cancel" variant="secondary" size="sm" @click="show = false">Cancel</HLButton>
        <HLButton id="topic-go" variant="primary" color="blue" size="sm" :disabled="!canGo" @click="go">Create topic</HLButton>
      </div>
    </template>
  </HLModal>
</template>

<style scoped>
.sl-opt {
  display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 12px; border-radius: 9999px; cursor: pointer;
  border: 1px solid var(--color-gray-200); background: #fff; font-size: 13px; line-height: 18px; font-weight: 500; color: var(--color-gray-700);
}
.sl-opt:hover { border-color: var(--color-gray-300); }
.sl-opt-logo { width: 20px; height: 20px; margin-left: -6px; border-radius: 9999px; display: grid; place-items: center; background: var(--color-gray-50); flex-shrink: 0; }
.sl-opt.is-on { background: var(--color-white); border-color: var(--color-primary-600); box-shadow: 0 0 0 1px var(--color-primary-600); color: var(--color-gray-900); }
.sl-opt:focus-visible { outline: 2px solid var(--color-primary-600); outline-offset: 2px; }
</style>
