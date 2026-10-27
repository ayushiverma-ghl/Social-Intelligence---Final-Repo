<script setup>
import { ref, computed, h, onMounted, resolveComponent } from 'vue'
import { XCloseIcon, PaperclipIcon, Settings01Icon, AlertTriangleIcon } from '@gohighlevel/ghl-icons/24/outline'

// HLDrawer owns the mask, the slide, Esc, focus trapping and the dialog role. AppShell still
// mounts this with v-if, so it opens on mount and tells AppShell once the leave has finished.
const HLBadge = resolveComponent('HLBadge')

const TABS = ['All', 'Alerts', 'Archive']

const MOCK_NOTIFICATIONS = [
  { id: 1, online: true, name: 'Rachel Chen', action: 'joined your sub-account', context: 'Social listening', time: '2h ago', read: false },
  { id: 2, online: false, name: 'Mike Kumar', action: 'is requesting admin access', context: 'Kickboxing Studio', time: '4h ago', read: false, actions: true },
  { id: 3, online: false, name: 'Sara Liu', action: 'uploaded a contact list', context: 'Fitness Studio', time: '1d ago', read: false, attachment: { name: 'contacts_export.csv', size: '2.4 MB' } },
  { id: 4, online: false, name: 'James Brown', action: 'updated the funnel settings', context: 'Main Account', time: '2d ago', read: true },
  { id: 5, online: false, name: 'Amy Park', action: 'commented on your campaign', context: 'Newsletter', time: '3d ago', read: true, snippet: 'Looks great. Can we also add a follow-up sequence for new leads?' },
]

const MOCK_ALERTS = [
  { id: 'a1', severity: 'error', title: 'Payment method is missing', body: "Add your client's card to avoid a break in service.", cta: 'Resolve', time: '1h ago', read: false },
  { id: 'a2', severity: 'warning', title: 'New tax categories available', body: 'Unlock new tax categories and global taxes. Reconfigure automatic taxes by 1 Sept 2026.', cta: 'Reconfigure taxes', time: '3h ago', read: false },
  { id: 'a3', severity: 'warning', title: 'Billing address is missing', body: 'Add it in your billing dashboard, under the Payments tab.', cta: 'Update', time: '1d ago', read: true },
]

const EMPTY_COPY = {
  All: { title: 'All caught up', body: 'New notifications will show up here.' },
  Alerts: { title: 'No alerts right now', body: "We'll let you know when something needs attention." },
  Archive: { title: 'Nothing in your archive', body: 'Notifications you archive will live here.' },
}

const props = defineProps({ onClose: Function })

const show = ref(false)
const activeTab = ref('All')
const notifications = ref(MOCK_NOTIFICATIONS.map(n => ({ ...n })))
const alerts = ref(MOCK_ALERTS.map(a => ({ ...a })))

onMounted(() => { show.value = true })

function markAllRead() {
  notifications.value = notifications.value.map(n => ({ ...n, read: true }))
  alerts.value = alerts.value.map(a => ({ ...a, read: true }))
}

function handleAction(id, accepted) {
  notifications.value = notifications.value.map(n =>
    n.id === id
      ? { ...n, read: true, actions: false, actionResult: accepted ? 'Accepted' : 'Declined' }
      : n
  )
}

const unreadNotifCount = computed(() => notifications.value.filter(n => !n.read).length)
const unreadAlertCount = computed(() => alerts.value.filter(a => !a.read).length)
const tabCounts = computed(() => ({ All: unreadNotifCount.value, Alerts: unreadAlertCount.value, Archive: 0 }))
// The tab label with its unread count. A render function, so the count stays live: HLTabs
// reads its tabs once, but calls this every time it draws them.
const tabLabel = (tab) => () => h('span', { class: 'flex items-center gap-1.5' }, [
  tab,
  tabCounts.value[tab] > 0
    ? h(HLBadge, { id: `shell-notif-count-${tab.toLowerCase()}`, value: tabCounts.value[tab], color: 'primary', size: 'sm' })
    : null,
])

const visibleNotifs = computed(() => activeTab.value === 'All' ? notifications.value : [])
const visibleAlerts = computed(() => activeTab.value === 'Alerts' ? alerts.value : [])
const isEmpty = computed(() => visibleNotifs.value.length === 0 && visibleAlerts.value.length === 0)
const emptyCopy = computed(() => EMPTY_COPY[activeTab.value] ?? EMPTY_COPY.All)
</script>

<template>
  <HLDrawer
    id="shell-notifications"
    :show="show"
    placement="right"
    :width="400"
    @update:show="(v) => { show = v }"
    @after-leave="onClose?.()"
  >
    <HLDrawerContent id="shell-notifications-content" show-header header-style="padding: 16px 20px" body-content-style="padding: 0">
      <template #header>
        <div class="flex items-center justify-between gap-3 w-full">
          <!-- The drawer header is already the dialog heading, so this is a span. -->
          <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900">Notifications</HLText>
          <div class="flex items-center gap-1">
            <HLButton variant="text" color="gray" size="xs" @click="markAllRead">Mark all as read</HLButton>
            <HLTooltip trigger="hover">
              <template #trigger>
                <HLButton variant="ghost" size="xs" aria-label="Close notifications" @click="show = false">
                  <template #iconLeft><XCloseIcon /></template>
                </HLButton>
              </template>
              Close
            </HLTooltip>
          </div>
        </div>
      </template>

      <!-- Tabs -->
      <div class="px-5 border-b border-gray-200">
        <HLTabs id="shell-notif-tabs" :value="activeTab" type="line" no-border @update:value="(v) => { activeTab = v }">
          <HLTab v-for="tab in TABS" :key="tab" :name="tab" :tab="tabLabel(tab)" />
          <template #end-actions>
            <HLTooltip trigger="hover">
              <template #trigger>
                <HLButton variant="ghost" size="xs" aria-label="Notification settings">
                  <template #iconLeft><Settings01Icon /></template>
                </HLButton>
              </template>
              Notification settings
            </HLTooltip>
          </template>
        </HLTabs>
      </div>

      <!-- Empty state -->
      <div v-if="isEmpty" class="sl-empty py-12 px-6">
        <HLEmpty
          :id="`shell-notif-empty-${activeTab.toLowerCase()}`" size="sm" icon="default"
          :title="emptyCopy.title" :description="emptyCopy.body"
        />
      </div>

      <!-- Items -->
      <ul v-else class="divide-y divide-gray-100">
        <!-- Notifications -->
        <li
          v-for="n in visibleNotifs"
          :key="n.id"
          :class="['flex gap-3 px-5 py-4', n.read ? 'bg-gray-50' : 'bg-white']"
        >
          <!-- Avatar -->
          <div class="relative shrink-0">
            <HLAvatar :id="`shell-notif-avatar-${n.id}`" size="md" :name="n.name" />
            <span v-if="n.online" class="absolute bottom-0 right-0 size-2.5 rounded-full bg-positive border-2 border-white">
              <span class="sr-only">Online</span>
            </span>
          </div>
          <div class="flex flex-col gap-1.5 flex-1 min-w-0">
            <HLText size="lg" class="text-gray-600">
              <span class="font-semibold text-gray-900">{{ n.name }}</span>
              {{ ' ' + n.action }}
            </HLText>
            <HLText html-tag="span" size="sm" class="text-gray-500">{{ n.time }} · {{ n.context }}</HLText>
            <HLText v-if="n.snippet" size="md" class="text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              {{ n.snippet }}
            </HLText>
            <div v-if="n.attachment" class="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              <PaperclipIcon class="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <HLText html-tag="span" size="md" weight="medium" class="text-gray-600 truncate">{{ n.attachment.name }}</HLText>
              <HLText html-tag="span" size="sm" class="text-gray-500 shrink-0">{{ n.attachment.size }}</HLText>
            </div>
            <div v-if="n.actions && !n.actionResult" class="flex gap-2 mt-0.5">
              <HLButton variant="primary" color="blue" size="sm" @click="handleAction(n.id, true)">Accept</HLButton>
              <HLButton variant="secondary" size="sm" @click="handleAction(n.id, false)">Decline</HLButton>
            </div>
            <div v-if="n.actionResult">
              <HLTag size="sm" :color="n.actionResult === 'Accepted' ? 'success' : 'gray'" :interactive="false">{{ n.actionResult }}</HLTag>
            </div>
          </div>
          <span v-if="!n.read" class="size-2 rounded-full bg-primary-600 shrink-0 mt-2">
            <span class="sr-only">Unread</span>
          </span>
        </li>

        <!-- Alerts -->
        <li
          v-for="a in visibleAlerts"
          :key="a.id"
          :class="['flex gap-3 px-5 py-4', a.read ? 'bg-gray-50' : 'bg-white']"
        >
          <!-- HLFeatureIcon isn't exported by HighRise 4.8.5, so the severity mark is a tokenised chip. -->
          <div :class="`size-10 rounded-full flex items-center justify-center shrink-0 ${a.severity === 'error' ? 'bg-negative-light text-negative-strong' : 'bg-warning-light text-warning-strong'}`">
            <AlertTriangleIcon class="w-4 h-4" />
            <span class="sr-only">{{ a.severity === 'error' ? 'Error' : 'Warning' }}</span>
          </div>
          <div class="flex flex-col gap-1.5 flex-1 min-w-0">
            <HLText size="lg" weight="semibold" class="text-gray-900">{{ a.title }}</HLText>
            <HLText size="md" class="text-gray-600">{{ a.body }}</HLText>
            <HLText html-tag="span" size="sm" class="text-gray-500">System alert · {{ a.time }}</HLText>
            <div class="mt-0.5">
              <HLButton variant="secondary" size="sm">{{ a.cta }}</HLButton>
            </div>
          </div>
          <span v-if="!a.read" class="size-2 rounded-full bg-primary-600 shrink-0 mt-2">
            <span class="sr-only">Unread</span>
          </span>
        </li>
      </ul>
    </HLDrawerContent>
  </HLDrawer>
</template>
