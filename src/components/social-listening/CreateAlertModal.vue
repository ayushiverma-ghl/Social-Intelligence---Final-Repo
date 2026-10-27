<script setup>
import { computed, h, onMounted, reactive, ref, resolveComponent } from 'vue'
import {
  Bell01Icon, BellOff01Icon, ChevronLeftIcon, ChevronDownIcon, ClockIcon, Copy01Icon,
  DotsVerticalIcon, Edit02Icon, InfoCircleIcon, PlusIcon, Trash01Icon, ArrowUpIcon,
  ArrowRightIcon, LinkExternal01Icon,
} from '@gohighlevel/ghl-icons/24/outline'
import { NETWORK_ICONS } from './networkIcons.js'
import { useSocialListening } from '../../composables/useSocialListening.js'

const { state, account, toast, saveSearchAsTopic, simple, listenTo, peek } = useSocialListening()

const MAX_ALERTS = 3

// Sample movement for the email preview. Fixed rather than derived from the dashboard so the
// preview reads the same on every open; it is labelled a preview, not a forecast.
// `bad: true` marks the one metric where going up is the thing to worry about.
const METRICS = [
  { key: 'volume', label: 'Topic volume', from: '1,240', to: '1,824', unit: 'mentions', pct: 47, spark: '0,16 10,14 18,14 26,10 34,9 42,6 50,4 56,0' },
  { key: 'impressions', label: 'Reach', from: '890K', to: '1.17M', pct: 32, spark: '0,15 12,13 22,12 32,9 42,7 56,2' },
  { key: 'negative', label: 'Negative sentiment', from: '210', to: '269', pct: 28, bad: true, spark: '0,14 12,13 22,12 32,10 44,8 56,4' },
  { key: 'positive', label: 'Positive sentiment', from: '58%', to: '68%', pct: 18, spark: '0,12 10,14 20,10 30,11 42,6 56,4' },
  { key: 'engagements', label: 'Interactions', from: '5.1K', to: '5.7K', pct: 12, spark: '0,13 12,15 22,10 34,10 44,8 56,7' },
  { key: 'sov', label: 'Share of industry posts', from: '6.2%', to: '6.7%', pct: 8, spark: '0,14 10,14 18,6 26,12 34,4 56,4' },
]
const ALL_KEYS = METRICS.map((m) => m.key)

// The glance tiles open this modal with a metric already in mind.
const FROM_TILE = { mentions: 'volume', sentiment: 'negative', competitor: 'sov' }

const SENSITIVITY = [
  { key: 'major', title: 'Big spikes only', pct: 50 },
  { key: 'balanced', title: 'Balanced', pct: 25 },
  { key: 'all', title: 'Catch everything', pct: 10 },
]
const TEMPLATES = [
  { value: 'default', label: 'Social intelligence default' },
  { value: 'newsletter', label: 'Brand, newsletter' },
  { value: 'minimal', label: 'Brand, minimal' },
  { type: 'divider', key: 'd1' },
  { value: 'new', label: 'Create a template in Email Builder' },
]

// Topic menu and detail bar pass a topic; the dashboard tiles don't, so the alert is about
// the account's own mentions.
const subject = computed(() => state.alertTopic || account.value.short)
const topic = computed(() => state.alertTopic && (state.topicsByAccount[state.accountId] || []).find((t) => t.title === state.alertTopic))
const storeKey = computed(() => `${state.accountId}|${subject.value}`)
if (!state.alertsBy[storeKey.value]) state.alertsBy[storeKey.value] = []
const alerts = computed(() => state.alertsBy[storeKey.value])

const show = ref(false)
// 15 Oct (audit 10): opened from the insights pop-up, the alert docks to the pop-up's right edge
// as a panel under its header, instead of a second modal stacked on the first. The email
// preview stays out of the narrow panel.
// 19 Oct (Sujit): HighLevel has no drawer inside a modal. Two layouts, switched from Demo
// controls: a flyout from the button that asked for it (the 440px form, a fixed footer, the
// email preview behind a tab, a click outside to dismiss), or the form taking over the pop-up's
// body with Back, the email preview beside it.
// 19 Oct (Sujit, keep the existing one): a third, the 15 Oct side panel docked under the pop-up's
// header. It slides in from the right and is 880 wide: the old 440 form, the email preview beside it.
const inPopup = computed(() => simple.value && !!(state.peekTopic || state.peekSearch))
const layout = computed(() => (!inPopup.value ? 'modal' : state.alertLayout === 'form' ? 'cover' : state.alertLayout === 'panel' ? 'panel' : 'flyout'))
const docked = computed(() => layout.value === 'flyout' || layout.value === 'panel')
const isPanel = computed(() => layout.value === 'panel')
const paneTab = ref('form')
const opener = document.activeElement
function dock() {
  const m = document.querySelector('.sl-modal')
  const head = m && m.querySelector('.sl-modal-head')
  if (!m || !head) return
  const r = m.getBoundingClientRect()
  // 21 Oct: the pop-up is HLModal now, so its header band runs from the modal's top to the top of
  // the HighRise body (.hr-dialog__content) and its 1px rule, not just the row of buttons.
  const body = m.querySelector('.hr-dialog__content')
  const headH = body ? body.getBoundingClientRect().top + body.clientTop - r.top : head.offsetHeight
  const root = document.documentElement.style
  if (layout.value === 'flyout') {
    const btn = (opener && m.contains(opener) && opener.closest('button')) || m.querySelector('#sl-modal-alerts') || head
    const b = btn.getBoundingClientRect()
    const top = b.bottom + 8
    root.setProperty('--sl-fly-top', `${top}px`)
    root.setProperty('--sl-fly-right', `${Math.max(16, window.innerWidth - b.right)}px`)
    // out15 W08: 640 at most (was 600), still 24 clear of the pop-up's bottom edge, so at 1440×900
    // the form shows down to the "How often" helper above the fixed footer, even with a long topic
    // name wrapping the subtitle.
    root.setProperty('--sl-fly-h', `${Math.min(640, r.bottom - top - 24)}px`)
    return
  }
  if (layout.value === 'panel') {
    root.setProperty('--sl-dock-top', `${r.top + headH}px`)
    root.setProperty('--sl-dock-right', `${window.innerWidth - r.right}px`)
    root.setProperty('--sl-dock-h', `${r.height - headH}px`)
    return
  }
  if (layout.value === 'cover') {
    root.setProperty('--sl-cov-top', `${r.top + headH}px`)
    root.setProperty('--sl-cov-left', `${r.left}px`)
    root.setProperty('--sl-cov-w', `${r.width}px`)
    root.setProperty('--sl-cov-h', `${r.height - headH}px`)
    return
  }
}
onMounted(() => { if (inPopup.value) dock(); show.value = true })

// Nothing to list yet means straight to the form: an empty list with one button on it is a
// step that only asks you to press the button.
const step = ref(alerts.value.length ? 'list' : 'form')
const editingId = ref(null)
const confirmingId = ref(null)

const blank = () => ({
  name: '',
  metrics: state.alertMetric && FROM_TILE[state.alertMetric] && !state.alertTopic ? [FROM_TILE[state.alertMetric]] : [...ALL_KEYS],
  sensitivity: 'balanced',
  frequency: 'daily',
  recipients: [],
  template: 'default',
})
const draft = reactive(blank())
const recipientDraft = ref('')
const recipientError = ref('')

const sens = computed(() => SENSITIVITY.find((s) => s.key === draft.sensitivity))
const watched = computed(() => METRICS.filter((m) => draft.metrics.includes(m.key)))
const moved = computed(() => watched.value.filter((m) => m.pct >= sens.value.pct).sort((a, b) => b.pct - a.pct))
const mover = computed(() => moved.value[0])
const rest = computed(() => watched.value.filter((m) => m !== mover.value))

const metricsLabel = (keys) => keys.length === ALL_KEYS.length ? 'All metrics' : keys.length === 1 ? METRICS.find((m) => m.key === keys[0]).label : `${keys.length} metrics`
// The same choice as it reads mid-sentence: "when any metric moves", not "when all metrics moves".
const metricsPhrase = (keys) => keys.length === ALL_KEYS.length ? 'any metric' : keys.length === 1 ? METRICS.find((m) => m.key === keys[0]).label.toLowerCase() : `any of ${keys.length} metrics`
const cadence = (a) => a.frequency === 'daily' ? 'daily at 9:00 AM' : 'weekly on Monday'
const autoName = (a) => `${metricsLabel(a.metrics)}, ${a.frequency}`
const people = (a) => 1 + a.recipients.length
const peopleLabel = (a) => a.recipients.length ? `you + ${a.recipients.length}` : 'you'

const summary = (a) => {
  const s = SENSITIVITY.find((x) => x.key === a.sensitivity)
  return `${metricsLabel(a.metrics)} · ±${s.pct}% · ${cadence(a)} · ${peopleLabel(a)}`
}

const metricOptions = computed(() => [
  { key: 'all', label: 'All metrics', selected: draft.metrics.length === ALL_KEYS.length },
  { key: 'd', type: 'divider' },
  ...METRICS.map((m) => ({ key: m.key, label: m.label, selected: draft.metrics.includes(m.key) })),
])
function toggleMetric(key) {
  if (key === 'all') {
    draft.metrics = draft.metrics.length === ALL_KEYS.length ? [] : [...ALL_KEYS]
    return
  }
  draft.metrics = draft.metrics.includes(key) ? draft.metrics.filter((k) => k !== key) : ALL_KEYS.filter((k) => k === key || draft.metrics.includes(k))
}

// Render functions don't see global components by name, so HLTag is resolved once here.
const HLTag = resolveComponent('HLTag')
const HLText = resolveComponent('HLText')
function templateRenderer(option) {
  if (option.value === 'new') {
    return h('span', { class: 'flex items-center gap-2 w-full text-primary-600 font-medium' }, [
      h(PlusIcon, { class: 'w-4 h-4' }), 'Create a template',
      h(HLText, { htmlTag: 'span', size: 'md', class: 'ml-auto flex items-center gap-1 text-gray-500' }, () => ['Email Builder', h(LinkExternal01Icon, { class: 'w-3.5 h-3.5' })]),
    ])
  }
  return h('span', { class: 'flex items-center gap-2 w-full' }, [
    option.label,
    option.value === 'default' ? h(HLTag, { size: 'md', color: 'gray', round: true, interactive: false, class: 'ml-auto' }, () => 'Default') : null,
  ])
}
function pickTemplate(v) {
  // Email Builder is a different product. Leaving mid-draft would drop the alert, so for
  // now it says where it would go and keeps the current template.
  if (v === 'new') {
    if (simple.value) toast('Build it in Email Builder, then pick it here', '', 'info')
    else toast('Opens Email Builder', 'Templates you build there show up in this list.', 'info')
    return
  }
  draft.template = v
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
function addRecipient() {
  const v = recipientDraft.value.trim().toLowerCase()
  if (!v) return
  if (!EMAIL.test(v)) { recipientError.value = 'Enter a full email address, like name@company.com.'; return }
  if (draft.recipients.includes(v)) { recipientError.value = `${v} is already on this alert.`; return }
  draft.recipients.push(v)
  recipientDraft.value = ''
  recipientError.value = ''
}

const canSave = computed(() => draft.metrics.length > 0)
const atLimit = computed(() => alerts.value.length >= MAX_ALERTS)
// Named for the button that finishes it: "Create alert" in the title and on the primary.
const title = computed(() => editingId.value ? 'Edit alert' : 'Create alert')
const saveNote = computed(() => state.alertSavesSearch && !editingId.value)

function openNew() {
  if (atLimit.value) return
  Object.assign(draft, blank())
  editingId.value = null
  recipientDraft.value = ''
  recipientError.value = ''
  step.value = 'form'
}
function openEdit(a) {
  Object.assign(draft, { ...a, metrics: [...a.metrics], recipients: [...a.recipients] })
  editingId.value = a.id
  recipientDraft.value = ''
  recipientError.value = ''
  step.value = 'form'
}
function back() {
  // First alert: there is no list to go back to, so back means leave.
  if (!alerts.value.length) show.value = false
  else step.value = 'list'
}

function syncTopic() {
  if (topic.value) topic.value.alert = alerts.value.length > 0
}

let nextId = Date.now()
function save() {
  if (!canSave.value) return
  // out9 q16: an address typed but not added was dropped without a word. It's added now, or the
  // field says what's wrong and the alert waits.
  if (recipientDraft.value.trim()) {
    addRecipient()
    if (recipientError.value) return
  }
  const record = { ...draft, metrics: [...draft.metrics], recipients: [...draft.recipients], name: draft.name.trim() || autoName(draft) }
  if (editingId.value) {
    const i = alerts.value.findIndex((a) => a.id === editingId.value)
    alerts.value.splice(i, 1, { ...alerts.value[i], ...record })
    if (simple.value) toast(`Changes to “${record.name}” saved`)
    else toast('Alert saved', `“${record.name}” is updated.`)
  } else {
    if (state.alertSavesSearch) {
      // 15 Oct: from the insights pop-up the search lives in peekSearch, not the old search
      // page, so saveSearchAsTopic() found nothing and the alert's topic was never saved.
      if (simple.value && state.peekSearch) { listenTo(state.peekSearch); peek(state.peekSearch) }
      else saveSearchAsTopic()
      state.alertSavesSearch = false
    }
    alerts.value.push({ ...record, id: ++nextId, on: true })
    if (simple.value) toast(`We’ll email ${people(record) === 1 ? 'you' : `${people(record)} people`} when “${subject.value}” moves ${sens.value.pct}% or more.`)
    else toast('Alert created', `We’ll email ${people(record) === 1 ? 'you' : `${people(record)} people`} when ${metricsPhrase(record.metrics)} moves ±${sens.value.pct}% or more.`)
  }
  syncTopic()
  step.value = 'list'
}

const menuOptions = [
  { key: 'edit', label: 'Edit', type: 'icon', icon: Edit02Icon, iconPlacement: 'left' },
  { key: 'duplicate', label: 'Duplicate', type: 'icon', icon: Copy01Icon, iconPlacement: 'left' },
  { key: 'd', type: 'divider' },
  { key: 'delete', label: 'Delete', type: 'icon', icon: Trash01Icon, iconPlacement: 'left', class: 'sl-danger-option' },
]
function onMenu(key, a) {
  if (key === 'edit') openEdit(a)
  if (key === 'delete') confirmingId.value = a.id
  if (key === 'duplicate') {
    if (atLimit.value) { if (simple.value) toast(`You've reached ${MAX_ALERTS} alerts`, 'Delete one to add another.', 'info'); else toast('Alert limit reached', `A topic can have ${MAX_ALERTS} alerts. Delete one to add another.`, 'info'); return }
    const i = alerts.value.findIndex((x) => x.id === a.id)
    alerts.value.splice(i + 1, 0, { ...a, metrics: [...a.metrics], recipients: [...a.recipients], id: ++nextId, name: `${a.name} (copy)` })
  }
}
function remove(a) {
  const list = alerts.value
  const i = list.findIndex((x) => x.id === a.id)
  list.splice(i, 1)
  confirmingId.value = null
  syncTopic()
  if (!list.length) step.value = 'list'
  // Undo puts it back where it was. `list` is captured because the modal may be closed by then.
  toast(...(simple.value ? [`Deleted “${a.name}”`, ''] : ['Alert deleted', `“${a.name}” won't email anyone.`]), 'positive', [
    { label: 'Undo', run: () => { list.splice(Math.min(i, list.length), 0, a); syncTopic() } },
  ])
}
function toggle(a, v) {
  a.on = v
  if (simple.value) toast(v ? `Emails back on for “${a.name}”` : `Paused emails for “${a.name}”`)
  else toast(v ? 'Alert on' : 'Alert paused', v ? `“${a.name}” will email again from the next check.` : `“${a.name}” won't email until you turn it back on.`)
}
</script>

<template>
  <HLModal
    v-model:show="show"
    id="alert-modal"
    :class="{ 'sl-flyout': layout === 'flyout', 'sl-cover': layout === 'cover', 'sl-docked sl-panel': isPanel }"
    :width="isPanel ? 880 : docked ? 440 : step === 'form' ? 960 : 560"
    :show-header-icon="false"
    :show-icon="false"
    footer-divider
    :mask-closable="layout === 'flyout' || step !== 'form'"
    :close-on-esc="step !== 'form'"
    @after-leave="state.modal = null; state.alertTopic = null; state.alertMetric = null; state.alertSavesSearch = false"
  >
    <template #header>
      <div class="flex items-start gap-3">
        <HLButton v-if="step === 'form' && !docked" variant="secondary" size="sm" aria-label="Back" @click="back">
          <template #iconLeft><ChevronLeftIcon /></template>
        </HLButton>
        <span v-else class="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
          <Bell01Icon class="w-5 h-5" />
        </span>
        <div class="flex-1 min-w-0">
          <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">{{ step === 'form' ? title : 'Alerts' }}</HLText>
          <HLText size="md" class="text-gray-500">{{ step === 'form' ? `Get an email when “${subject}” moves` : `for “${subject}”` }}</HLText>
        </div>
        <HLText v-if="step === 'list'" size="md" class="text-gray-500 mt-2! mr-2! whitespace-nowrap tabular-nums">
          <span class="font-semibold text-gray-900">{{ alerts.length }}</span> of {{ MAX_ALERTS }} alerts
        </HLText>
      </div>
    </template>

    <!-- 21 Oct (pick 11 V2): the flyout has no rule under its header; the footer's is the only line. -->
    <div :class="step === 'form' && layout !== 'flyout' && 'border-t border-gray-200'">
      <div v-if="layout === 'flyout' && step === 'form'" class="sl-alert-tabs">
        <HLTabs id="alert-pane-tabs" :value="paneTab" type="line" no-border @update:value="(v) => (paneTab = v)">
          <HLTab name="form" tab="Settings" />
          <HLTab name="preview" tab="Email preview" />
        </HLTabs>
      </div>

      <!-- Step 1 · the topic's alerts -->
      <div v-if="step === 'list'" class="flex flex-col gap-2 pt-4">
        <div v-if="!alerts.length" class="sl-empty py-4 flex justify-center">
          <HLEmpty id="alert-list-empty" size="sm" icon="default" title="No alerts on this topic yet" description="Create one to get an email when it moves." />
        </div>
        <div
          v-for="a in alerts"
          :key="a.id"
          :class="['flex items-center gap-3 rounded-xl border px-4 py-4', confirmingId === a.id ? 'border-negative/40 bg-negative-light' : 'border-gray-200']"
        >
          <template v-if="confirmingId === a.id">
            <span class="w-9 h-9 rounded-lg bg-white text-negative-strong flex items-center justify-center shrink-0"><Trash01Icon class="w-4 h-4" /></span>
            <div class="flex-1 min-w-0">
              <HLText size="lg" weight="semibold" class="text-gray-900">Delete “{{ a.name }}”?</HLText>
              <HLText size="md" class="text-gray-600 mt-0.5!">{{ a.recipients.length ? `You and ${a.recipients.length} other${a.recipients.length > 1 ? 's' : ''} will stop getting this email.` : 'You will stop getting this email.' }}</HLText>
            </div>
            <HLButton variant="secondary" size="sm" @click="confirmingId = null">Keep</HLButton>
            <HLButton variant="primary" color="red" size="sm" @click="remove(a)">Delete</HLButton>
          </template>
          <template v-else>
            <span :class="['w-9 h-9 rounded-lg flex items-center justify-center shrink-0', a.on ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-400']">
              <component :is="a.on ? Bell01Icon : BellOff01Icon" class="w-4 h-4" />
            </span>
            <div class="flex-1 min-w-0">
              <HLText size="lg" weight="semibold" :class="['truncate', a.on ? 'text-gray-900' : 'text-gray-500']">{{ a.name }}</HLText>
              <HLText size="md" class="text-gray-500 mt-0.5! truncate">{{ summary(a) }}</HLText>
            </div>
            <HLToggle :value="a.on" :checked-value="true" :unchecked-value="false" size="sm" :aria-label="a.on ? 'Pause alert' : 'Turn alert on'" @update:value="(v) => toggle(a, v)" />
            <HLDropdown :options="menuOptions" placement="bottom-end" trigger="click" :width="176" :show-search="false" @select="(k) => onMenu(k, a)">
              <HLButton variant="ghost" size="xs" :aria-label="`More actions for ${a.name}`">
                <template #iconLeft><DotsVerticalIcon /></template>
              </HLButton>
            </HLDropdown>
          </template>
        </div>

        <HLButton variant="secondary" size="md" full-width class="sl-dashed" :disabled="atLimit" @click="openNew">
          <template #iconLeft><PlusIcon /></template>
          New alert
        </HLButton>
        <HLText v-if="atLimit" size="md" class="text-gray-500">A topic can have {{ MAX_ALERTS }} alerts. Delete or edit one to change what you're told about.</HLText>
      </div>

      <!-- Step 2 · new / edit, with the email it will send -->
      <div v-else :class="['sl-alert-panes', !docked && 'grid grid-cols-[minmax(0,1fr)_440px]', isPanel && 'grid grid-cols-[440px_minmax(0,1fr)]']">
        <HLForm v-show="layout !== 'flyout' || paneTab === 'form'" class="p-4 self-start" @submit.prevent>
          <HLFormItem label="Alert name" :show-feedback="false">
            <HLInput id="alert-name" v-model="draft.name" :placeholder="autoName(draft)" size="md" />
          </HLFormItem>

          <HLFormItem label="What to watch" :show-feedback="false">
            <div class="sl-full w-full">
            <HLDropdown
              :options="metricOptions"
              multiple
              show-checkbox
              :close-on-select="false"
              placement="bottom-start"
              trigger="click"
              :width="480"
              :show-search="false"
              @select="toggleMetric"
            >
              <HLInput id="alert-metrics" class="cursor-pointer" readonly :model-value="draft.metrics.length ? (draft.metrics.length === ALL_KEYS.length ? `All ${ALL_KEYS.length} metrics` : watched.map((m) => m.label).join(', ')) : ''" placeholder="Pick at least one metric" size="md">
                <template #suffix><ChevronDownIcon class="w-4 h-4 text-gray-500" /></template>
              </HLInput>
            </HLDropdown>
            </div>
          </HLFormItem>

          <HLFormItem :label="simple ? 'How sensitive' : 'How sensitive?'" :show-feedback="false">
            <div class="sl-cards w-full">
              <HLRadioGroup id="alert-sensitivity" v-model:value="draft.sensitivity" radio-card-group width="equal" size="sm">
                <HLRadioCard
                  v-for="s in SENSITIVITY"
                  :id="`alert-sens-${s.key}`"
                  :key="s.key"
                  :value="s.key"
                  :title="s.title"
                  :description="s.key === 'balanced' ? `±${s.pct}% · recommended` : `±${s.pct}%`"
                  compact
                />
              </HLRadioGroup>
                          </div>
          </HLFormItem>

          <HLFormItem :label="simple ? 'How often' : 'How often?'" :show-feedback="false">
            <div class="sl-cards w-full">
              <HLRadioGroup id="alert-frequency" v-model:value="draft.frequency" radio-card-group width="equal" size="sm">
                <HLRadioCard id="alert-freq-daily" value="daily" title="Daily" compact />
                <HLRadioCard id="alert-freq-weekly" value="weekly" title="Weekly" compact />
              </HLRadioGroup>
              <HLText size="md" class="flex items-center gap-2 text-gray-500 mt-2!"><ClockIcon class="w-3.5 h-3.5 shrink-0" />{{ draft.frequency === 'daily' ? 'Checked every morning at 9:00 AM.' : 'Checked every Monday at 9:00 AM.' }} No email when nothing crosses the line.</HLText>
            </div>
          </HLFormItem>

          <HLFormItem :label="`Send to · ${people(draft)} ${people(draft) === 1 ? 'person' : 'people'}`" :show-feedback="!!recipientError" :feedback="recipientError" :validation-status="recipientError ? 'error' : undefined">
            <div class="w-full">
              <div class="flex gap-2">
                <div class="flex-1 min-w-0">
                  <HLInput id="alert-recipient" v-model="recipientDraft" placeholder="name@company.com" size="md" @keydown.enter.prevent="addRecipient" @update:model-value="recipientError = ''" />
                </div>
                <HLButton variant="secondary" size="md" @click="addRecipient">Add</HLButton>
              </div>
              <div class="flex flex-wrap gap-2 mt-2">
                <HLTag size="md" color="gray" round :interactive="false">You</HLTag>
                <HLTag v-for="r in draft.recipients" :key="r" size="md" round closable @close="draft.recipients = draft.recipients.filter((x) => x !== r)">{{ r }}</HLTag>
              </div>
            </div>
          </HLFormItem>

          <HLFormItem label="Email template" :show-feedback="false">
            <HLSelect
              id="alert-template"
              :value="draft.template"
              :options="TEMPLATES"
              :option-renderer="templateRenderer"
              size="md"
              @update:value="pickTemplate"
            />
          </HLFormItem>
        </HLForm>

        <!-- The email this alert sends, built from the fields on the left. Scrolls in its own pane
             so nothing in it is cut off at the modal's edge. -->
        <aside v-if="!docked || isPanel || paneTab === 'preview'" :class="['bg-gray-50 p-4 flex flex-col gap-3 overflow-y-auto min-w-0', docked && !isPanel ? '' : 'border-l border-gray-200 max-h-[calc(100vh-240px)]', (layout === 'cover' || isPanel) && 'max-h-none!']">
          <!-- 21 Oct (HighRise pass): the live dot is HLBadge dot success; the frame is HLCard. -->
          <HLText size="md" weight="medium" class="flex items-center gap-2 text-gray-500">
            <HLBadge id="alert-preview-live" dot color="success" size="xs" />Email preview · updates as you edit
          </HLText>
          <HLCard id="alert-preview-card" class="sl-email-card">
            <!-- HLCard's header slot draws the gray-200 rule under the sender. -->
            <template #header>
            <div class="p-4">
              <HLText size="2xl" weight="semibold" class="text-gray-900">
                {{ moved.length ? `${moved.length} ${moved.length === 1 ? 'metric' : 'metrics'} moved on “${subject}”` : `No email today for “${subject}”` }}
              </HLText>
              <div class="flex items-center gap-2 mt-2 text-gray-500">
                <HLAvatar :name="'Social intelligence'" size="xs" />
                <HLText size="md" class="min-w-0"><span class="font-semibold text-gray-900">Social intelligence</span> &lt;alerts@youragency.com&gt;<br>to {{ draft.recipients.length ? `you, ${draft.recipients.join(', ')}` : 'you' }}</HLText>
                <HLText html-tag="span" size="md" class="ml-auto! shrink-0">9:00 AM</HLText>
              </div>
            </div>
            </template>

            <div class="p-4 flex flex-col gap-4">
              <template v-if="!draft.metrics.length">
                <HLText size="md" class="text-gray-500">Pick at least one metric to see what this alert would send.</HLText>
              </template>
              <template v-else-if="!moved.length">
                <HLText size="md" class="text-gray-600">None of the {{ watched.length }} metrics you watch moved {{ sens.pct }}% or more, so this alert would stay quiet today. Try a more sensitive setting to see what it would catch.</HLText>
              </template>
              <template v-else>
                <HLText size="md" class="text-gray-600">
                  <span class="font-semibold text-gray-900">{{ moved.length }} of {{ watched.length }}</span> metrics you watch moved on <span class="font-semibold text-gray-900">“{{ subject }}”</span> since {{ draft.frequency === 'daily' ? 'yesterday' : 'last week' }}, at {{ sens.title.toLowerCase() }} sensitivity (±{{ sens.pct }}%).
                </HLText>

                <div class="rounded-lg border border-negative/30 bg-negative-light p-3">
                  <HLText size="md" weight="semibold" class="text-negative-strong">Biggest mover</HLText>
                  <HLText size="lg" weight="medium" class="text-gray-900 mt-1!">{{ mover.label }}</HLText>
                  <div class="flex items-end justify-between gap-3 mt-1">
                    <HLText size="2xl" weight="semibold" class="text-gray-900 tabular-nums">{{ mover.to }}<HLText v-if="mover.unit" html-tag="span" size="md" class="text-gray-500 ml-1!">{{ mover.unit }}</HLText></HLText>
                    <svg viewBox="0 0 56 18" class="w-24 h-8 fill-none stroke-negative" stroke-width="1.5" aria-hidden="true"><polyline :points="mover.spark" /></svg>
                  </div>
                  <HLText size="md" class="text-gray-600 mt-2!"><span class="font-semibold text-negative-strong">Up {{ mover.pct }}%</span> from {{ mover.from }} the {{ draft.frequency === 'daily' ? 'day' : 'week' }} before</HLText>
                  <div class="bg-white border border-gray-200 rounded-lg px-3 py-2 mt-3 text-gray-600">
                    <HLText size="md" class="flex items-center gap-2"><component :is="NETWORK_ICONS.instagram" class="w-4 h-4" /><span class="font-semibold text-gray-900">Instagram</span> drove 62% of the lift</HLText>
                    <HLText size="md" class="mt-2!">“Switched to a white label dashboard and clients stopped asking for reports.”</HLText>
                    <HLText size="md" class="text-gray-500 mt-1!"><span class="font-semibold text-gray-900">@brightpathmktg</span> · 4.2K interactions · 312 shares</HLText>
                  </div>
                </div>

                <div v-if="rest.length">
                  <div v-for="m in rest" :key="m.key" class="grid grid-cols-[minmax(0,1fr)_auto_56px_48px] gap-2 items-center py-2 border-t border-gray-200 tabular-nums">
                    <HLText html-tag="span" size="md" class="text-gray-900 truncate">{{ m.label }}</HLText>
                    <HLText html-tag="span" size="md" class="text-gray-500 inline-flex items-center gap-1">{{ m.from }}<ArrowRightIcon class="w-3.5 h-3.5 text-gray-400" aria-hidden="true" /><span class="sr-only">to</span>{{ m.to }}</HLText>
                    <svg viewBox="0 0 56 18" :class="['w-14 h-[18px] fill-none', m.bad ? 'stroke-negative' : 'stroke-positive']" stroke-width="1.5" aria-hidden="true"><polyline :points="m.spark" /></svg>
                    <HLText html-tag="span" size="md" weight="semibold" :class="['inline-flex items-center justify-end', m.pct < sens.pct ? 'text-gray-500' : m.bad ? 'text-negative-strong' : 'text-positive-strong']"><ArrowUpIcon class="w-3.5 h-3.5" />{{ m.pct }}%</HLText>
                  </div>
                </div>

                <!-- A picture of the email's button, not a control: nothing in the modal should
                     look clickable and do nothing. -->
                <div class="pointer-events-none" aria-hidden="true">
                  <HLButton variant="primary" color="blue" size="sm" full-width tabindex="-1">Open in Social intelligence</HLButton>
                </div>
              </template>
              <HLText size="md" class="text-gray-500 text-center">You’re getting this because of the “{{ draft.name.trim() || autoName(draft) }}” alert. Manage alerts</HLText>
            </div>
          </HLCard>
        </aside>
      </div>
    </div>

    <template #footer>
      <!-- 19 Oct spacing pass: the note gets its own line above the buttons instead of wrapping beside them. -->
      <div class="flex flex-wrap items-center gap-x-2 gap-y-3 px-4 py-4">
        <template v-if="step === 'form'">
          <HLText size="md" class="basis-full min-w-0 text-gray-500 truncate">
            <template v-if="canSave && saveNote && simple">Also starts listening to “{{ subject }}”</template>
            <template v-else-if="canSave && saveNote">Also saves “{{ subject }}” as a topic · emails <span class="font-medium text-gray-900">{{ people(draft) === 1 ? 'you' : `${people(draft)} people` }}</span></template>
            <template v-else-if="canSave">Emails <span class="font-medium text-gray-900">{{ people(draft) === 1 ? 'you' : `${people(draft)} people` }}</span> when <span class="font-medium text-gray-900">{{ metricsPhrase(draft.metrics) }}</span> moves ±{{ sens.pct }}%</template>
            <template v-else>Pick at least one metric to watch</template>
          </HLText>
          <HLButton class="ml-auto!" variant="secondary" size="sm" @click="back">Cancel</HLButton>
          <HLButton variant="primary" color="blue" size="sm" :disabled="!canSave" @click="save">{{ editingId ? 'Save changes' : 'Create alert' }}</HLButton>
        </template>
        <template v-else>
          <span class="flex-1" />
          <HLButton variant="secondary" size="sm" @click="show = false">Done</HLButton>
        </template>
      </div>
    </template>
  </HLModal>
</template>
