<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { SearchMdIcon, ArrowLeftIcon, Pin01Icon } from '@gohighlevel/ghl-icons/24/outline'

// Hand-positioned rather than HLPopover: the trigger lives in Sidebar and the open state in
// AppShell, and the panel sits beside the sidebar at whatever width it has collapsed to.
// Everything inside it is HighRise; the frame uses HighRise's lg elevation.
const ENTER_MS = 200
const EXIT_MS = 150
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'

const RECENT_ACCOUNTS = [
  { id: 1, name: 'Conor Consulting Group', address: 'PVR Gardens Road, Hyderabad, Telangana', active: true },
  { id: 2, name: 'Bluepeak Marketing Agency', address: '1801 N. Lamar, Suite 250, Dallas, TX', active: false },
]

const ALL_ACCOUNTS = [
  { id: 2, name: 'Bluepeak Marketing Agency', address: '1801 N. Lamar, Suite 250, Dallas, TX', pinned: true },
  { id: 1, name: 'Conor Consulting Group', address: 'PVR Gardens Road, Hyderabad, Telangana', pinned: true },
  { id: 3, name: 'Abhishek Chauhan 123', address: 'Mumbai, Maharashtra', pinned: false },
  { id: 4, name: "Richa's Kickboxing Studio", address: 'Los Angeles, CA', pinned: false },
  { id: 5, name: 'TechStart Labs', address: 'Austin, TX', pinned: false },
]

const props = defineProps({
  onClose: Function,
  sidebarWidth: { type: Number, default: 280 },
})

const query = ref('')
const visible = ref(false)

onMounted(() => {
  requestAnimationFrame(() => { visible.value = true })

  function handleKey(e) {
    if (e.key === 'Escape') handleClose()
  }
  document.addEventListener('keydown', handleKey)
  onUnmounted(() => document.removeEventListener('keydown', handleKey))
})

function handleClose() {
  visible.value = false
  setTimeout(props.onClose, EXIT_MS)
}

const filtered = computed(() => {
  const q = query.value.trim()
  return q ? ALL_ACCOUNTS.filter(a => a.name.toLowerCase().includes(q.toLowerCase())) : null
})

const isCurrent = (a) => a.active ?? a.id === 1
const rowClass = (a) => [
  'w-full flex items-center gap-3 px-3 py-3 rounded-lg border text-left transition-colors',
  'focus-visible:outline-2 focus-visible:outline-primary-600 focus-visible:outline-offset-2',
  isCurrent(a) ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:bg-gray-50',
]
</script>

<template>
  <div class="fixed inset-0 z-40" @click="handleClose" />
  <div
    role="dialog"
    aria-label="Switch sub-account"
    class="fixed z-50 top-15 w-100 max-h-[calc(100vh-5rem)] bg-white rounded-xl shadow-(--shadow-lg) border border-gray-200 flex flex-col overflow-hidden origin-top-left"
    :style="{
      left: sidebarWidth + 8 + 'px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0) scale(1)' : 'translateX(-8px) scale(0.98)',
      transition: `opacity ${visible ? ENTER_MS : EXIT_MS}ms ${EASE}, transform ${visible ? ENTER_MS : EXIT_MS}ms ${EASE}`,
    }"
  >
    <!-- Search -->
    <div class="p-3 border-b border-gray-200">
      <HLInput
        id="shell-account-search"
        v-model="query"
        size="sm"
        clearable
        autofocus
        :prefix-icon="SearchMdIcon"
        placeholder="Search for a sub-account"
      />
    </div>

    <!-- Switch to agency view -->
    <div class="px-2 py-2 border-b border-gray-200">
      <HLButton variant="text" color="blue" size="sm">
        <template #iconLeft><ArrowLeftIcon /></template>
        Switch to agency view
      </HLButton>
    </div>

    <!-- Content -->
    <div class="flex flex-col overflow-y-auto">
      <!-- Filtered results -->
      <template v-if="filtered !== null">
        <div class="flex flex-col gap-2 p-3">
          <div v-if="filtered.length === 0" class="sl-empty py-4">
            <HLEmpty
              id="shell-account-no-match" size="sm" icon="default"
              :title="`No sub-accounts match “${query.trim()}”`"
              description="Check the spelling, or search by another part of the name."
            />
          </div>
          <template v-else>
            <button v-for="a in filtered" :key="a.id" type="button" :aria-current="isCurrent(a) ? 'true' : undefined" :class="rowClass(a)">
              <HLAvatar :id="`shell-account-${a.id}`" size="sm" :name="a.name" class="shrink-0" />
              <span class="flex flex-col flex-1 min-w-0">
                <HLText html-tag="span" size="lg" weight="medium" class="text-gray-900 truncate">{{ a.name }}</HLText>
                <HLText html-tag="span" size="md" class="text-gray-500 truncate">{{ a.address }}</HLText>
              </span>
              <Pin01Icon class="w-3.5 h-3.5 shrink-0" :class="a.pinned ? 'text-primary-600' : 'text-gray-400'" aria-hidden="true" />
              <span v-if="a.pinned" class="sr-only">Pinned</span>
            </button>
          </template>
        </div>
      </template>

      <!-- Default view -->
      <template v-else>
        <div class="px-4 pt-4 pb-2">
          <HLText html-tag="span" size="sm" weight="medium" class="text-gray-500">Recent</HLText>
        </div>
        <div class="flex flex-col gap-2 px-3 pb-3">
          <button v-for="a in RECENT_ACCOUNTS" :key="a.id" type="button" :aria-current="isCurrent(a) ? 'true' : undefined" :class="rowClass(a)">
            <HLAvatar :id="`shell-recent-${a.id}`" size="sm" :name="a.name" class="shrink-0" />
            <span class="flex flex-col flex-1 min-w-0">
              <HLText html-tag="span" size="lg" weight="medium" class="text-gray-900 truncate">{{ a.name }}</HLText>
              <HLText html-tag="span" size="md" class="text-gray-500 truncate">{{ a.address }}</HLText>
            </span>
          </button>
        </div>

        <HLDivider class="!m-0" />

        <div class="px-4 pt-4 pb-2">
          <HLText html-tag="span" size="sm" weight="medium" class="text-gray-500">All sub-accounts</HLText>
        </div>
        <div class="flex flex-col gap-2 px-3 pb-3">
          <button v-for="a in ALL_ACCOUNTS" :key="a.id" type="button" :aria-current="isCurrent(a) ? 'true' : undefined" :class="rowClass(a)">
            <HLAvatar :id="`shell-all-${a.id}`" size="sm" :name="a.name" class="shrink-0" />
            <span class="flex flex-col flex-1 min-w-0">
              <HLText html-tag="span" size="lg" weight="medium" class="text-gray-900 truncate">{{ a.name }}</HLText>
              <HLText html-tag="span" size="md" class="text-gray-500 truncate">{{ a.address }}</HLText>
            </span>
            <Pin01Icon class="w-3.5 h-3.5 shrink-0" :class="a.pinned ? 'text-primary-600' : 'text-gray-400'" aria-hidden="true" />
            <span v-if="a.pinned" class="sr-only">Pinned</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
