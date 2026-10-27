<script setup>
// 27 Oct (developers): turning Facebook on in the results page's platform filter opens its sources
// setup, as in the live product: up to 20 public Pages to monitor (competitors or partners), found
// by name or pasted as a URL or ID. Monitoring them uses the approved Meta app access, separate
// from the account's own connected Pages.
import { computed, onMounted, ref } from 'vue'
import { SearchMdIcon, InfoCircleIcon, XCloseIcon } from '@gohighlevel/ghl-icons/24/outline'
import { useSocialListening } from '../../composables/useSocialListening.js'
import { NETWORK_ICONS } from './networkIcons.js'

const { state, toast } = useSocialListening()
const MAX = 20
const term = state.fbSources
const saved = state.fbPagesBy[term] || []
const pages = ref([...saved])
const query = ref('')
const show = ref(false)
onMounted(() => { show.value = true })
const changed = computed(() => pages.value.join('|') !== saved.join('|'))
const full = computed(() => pages.value.length >= MAX)
function pretty(raw) {
  const t = raw.trim()
  const m = t.match(/facebook\.com\/(?:pg\/)?([^/?#]+)/i)
  const name = m ? m[1] : t
  return name.replace(/[-_.]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
function add() {
  const name = pretty(query.value)
  if (!name || full.value || pages.value.includes(name)) { query.value = ''; return }
  pages.value = [...pages.value, name]
  query.value = ''
}
function remove(name) { pages.value = pages.value.filter((p) => p !== name) }
let didSave = false
function save() { didSave = true; show.value = false }
function afterLeave() {
  if (didSave) {
    state.fbPagesBy = { ...state.fbPagesBy, [term]: pages.value }
    toast(pages.value.length ? `Monitoring ${pages.value.length} public ${pages.value.length === 1 ? 'Page' : 'Pages'} on Facebook` : 'No public Pages monitored on Facebook')
  }
  state.fbSources = null
}
</script>

<template>
  <HLModal v-model:show="show" id="fb-sources-modal" :width="520" :show-header-icon="false" :show-icon="false" footer-divider @after-leave="afterLeave">
    <template #header>
      <div class="flex items-center gap-3">
        <component :is="NETWORK_ICONS.facebook" class="w-8 h-8 shrink-0" aria-hidden="true" />
        <div class="flex flex-col gap-1 min-w-0">
          <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">Facebook sources</HLText>
          <HLText size="lg" class="text-gray-600 truncate">What Facebook monitors for {{ term.trim() ? `“${term}”` : 'this topic' }}</HLText>
        </div>
      </div>
    </template>

    <div class="flex flex-col gap-2">
      <HLText html-tag="label" for="fb-sources-search" size="md" weight="medium" class="text-gray-700">Public Pages to monitor <span class="text-gray-500 font-normal">(optional)</span></HLText>
      <HLInput
        id="fb-sources-search" v-model="query" size="md" :disabled="full" :prefix-icon="SearchMdIcon"
        placeholder="Search by name, or paste a Facebook Page URL or ID" @keydown.enter.prevent="add"
      />
      <HLText v-if="!pages.length" size="md" class="text-gray-600">No public Pages yet. Search to add competitor or partner Pages.</HLText>
      <div v-else id="fb-sources-list" class="flex flex-wrap gap-2 pt-1">
        <HLTag v-for="p in pages" :key="p" size="md" round :interactive="false">
          <span class="inline-flex items-center gap-1">
            {{ p }}
            <button type="button" class="sl-fb-x" :aria-label="`Remove ${p}`" @click="remove(p)"><XCloseIcon class="w-3.5 h-3.5" /></button>
          </span>
        </HLTag>
      </div>
      <div class="flex items-center gap-3 pt-2">
        <span class="flex-1"><HLProgress id="fb-sources-count" :percentage="(pages.length / MAX) * 100" :show-indicator="false" :height="4" :border-radius="2" rail-color="var(--color-gray-100)" color="var(--color-chart-strong)" /></span>
        <HLText size="md" class="text-gray-500 tabular-nums">{{ pages.length }} / {{ MAX }}</HLText>
      </div>
      <div class="flex items-start gap-2 pt-2">
        <InfoCircleIcon class="w-4 h-4 text-gray-500 shrink-0 mt-0.5" aria-hidden="true" />
        <HLText size="md" class="text-gray-600">Public Page monitoring uses our approved Meta app access, separately from your own connected Pages.</HLText>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2 px-4 py-3">
        <HLButton id="fb-sources-cancel" variant="secondary" size="sm" @click="show = false">Cancel</HLButton>
        <HLButton id="fb-sources-save" variant="primary" color="blue" size="sm" :disabled="!changed" @click="save">Save changes</HLButton>
      </div>
    </template>
  </HLModal>
</template>

<style scoped>
.sl-fb-x { display: inline-grid; place-items: center; color: var(--gray-500); border-radius: 4px; }
.sl-fb-x:hover { color: var(--gray-900); }
.sl-fb-x:focus-visible { outline: 2px solid var(--primary-600); outline-offset: 1px; }
</style>
