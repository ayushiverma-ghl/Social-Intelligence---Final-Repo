<script setup>
import { computed, onMounted, ref } from 'vue'
import { CheckIcon } from '@gohighlevel/ghl-icons/24/outline'
import { useSocialListening } from '../../composables/useSocialListening.js'
import { sentimentReading, SENTIMENT_LABEL } from '../../data/socialListening.js'

const { state, account, metrics, spaceData, fmtNum } = useSocialListening()

// The parent mounts this behind a v-if, so `show` starts false and flips on mount.
const show = ref(false)
onMounted(() => { show.value = true })

const declining = computed(() => !!metrics.value.down)

const DELIVERY = [
  { key: 'email', label: 'Email', note: 'To the client contact on file' },
  { key: 'link', label: 'Shareable link', note: 'Anyone with the link can view' },
  { key: 'pdf', label: 'PDF', note: 'Download and attach it yourself' },
]

const sendLabel = computed(() => (state.deliver === 'pdf' ? 'Download PDF' : state.deliver === 'link' ? 'Create link' : 'Send email'))

function send() {
  const method = state.deliver
  state.sent = {
    method,
    title: method === 'pdf' ? 'PDF ready' : method === 'link' ? 'Link created' : 'Sent to ' + account.value.short,
    body: method === 'pdf'
      ? 'Saved as ' + account.value.short.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-social-listening.pdf.'
      : method === 'link'
        ? 'Anyone with this link can view the snapshot. It stops working if you revoke it.'
        : "The snapshot went to the client contact on file. You'll see when they open it.",
    // The agency's own domain, never the platform's: clients see this link.
    detail: method === 'link' ? 'app.youragency.com/s/' + account.value.id + '-snapshot' : method === 'email' ? 'hello@' + account.value.id + '.com · just now' : '1.2 MB · 1 page',
  }
}

// Every exit animates out first; where it goes next is applied once the modal has left.
let nextView = null
function leave(view = null) {
  nextView = view
  show.value = false
}
function cleanup() {
  state.modal = null
  state.sent = null
  if (nextView) state.view = nextView
}
</script>

<template>
  <!-- The two states share HLModal's header, body and footer slots, so this has the close X
       and the spacing of every other modal instead of chrome of its own. -->
  <HLModal
    v-model:show="show"
    id="share-modal"
    :width="520"
    :show-header-icon="false"
    :show-icon="false"
    footer-divider
    @after-leave="cleanup"
  >
    <template #header>
      <div v-if="state.sent" class="flex items-start gap-3">
        <span class="w-9 h-9 rounded-lg bg-positive-light text-positive-strong flex items-center justify-center shrink-0">
          <CheckIcon class="w-5 h-5" />
        </span>
        <div class="flex-1 min-w-0">
          <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">{{ state.sent.title }}</HLText>
          <HLText size="md" class="text-gray-500">{{ state.sent.body }}</HLText>
        </div>
      </div>
      <template v-else>
        <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">Share with client</HLText>
        <HLText size="md" class="text-gray-500">This is exactly what {{ account.short }} receives.</HLText>
      </template>
    </template>

    <template v-if="!state.sent">
      <!-- The preview keeps its own card border, which is what says "this is what the client
           sees". -->
      <div class="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-(--shadow-xs)">
        <div class="bg-primary-25 px-5 py-4 border-b border-gray-200">
          <HLText size="md" weight="medium" class="text-gray-500 mb-1!">{{ account.name }} · Monthly snapshot</HLText>
          <HLText size="2xl" weight="semibold" class="text-gray-900">{{ account.short }}: social listening, last 30 days</HLText>
        </div>
        <div class="px-5 py-5">
          <div :class="['inline-flex items-center gap-2 rounded-lg px-3 py-2 mb-4', declining ? 'bg-negative-light' : 'bg-positive-light']">
            <span :class="['w-2 h-2 rounded-full', declining ? 'bg-negative' : 'bg-positive']" />
            <HLText html-tag="span" size="md" weight="semibold" :class="[declining ? 'text-negative-strong' : 'text-positive-strong']">
              {{ declining ? 'Mentions and sentiment both fell this month' : 'Mentions and sentiment both grew this month' }}
            </HLText>
          </div>
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div>
              <HLText size="md" weight="medium" class="text-gray-500">Mentions</HLText>
              <HLText size="2xl" weight="semibold" class="text-gray-900 tabular-nums mt-0.5!">{{ fmtNum(metrics.volume) }}</HLText>
            </div>
            <div>
              <HLText size="md" weight="medium" class="text-gray-500">{{ SENTIMENT_LABEL }}</HLText>
              <HLText size="lg" weight="semibold" class="text-gray-900 mt-0.5!">{{ sentimentReading(metrics.sentiment) }}</HLText>
            </div>
            <div>
              <HLText size="md" weight="medium" class="text-gray-500">Share of conversation</HLText>
              <HLText size="2xl" weight="semibold" class="text-gray-900 tabular-nums mt-0.5!">{{ metrics.share || 0 }}%</HLText>
            </div>
          </div>
          <HLText size="md" class="text-gray-600">
            {{ declining
              ? `Mentions fell ${metrics.dVolume?.replace('vs prev','') || ''}this month. The plan for next month is to restart a weekly cadence and reply to every open mention within a day.`
              : `Mentions grew ${metrics.dVolume?.replace('vs prev','') || ''}this month, driven mainly by posts on “${spaceData.trends[0].label}”. Next month we're doubling down on what worked.`
            }}
          </HLText>
        </div>
      </div>

      <HLForm class="mt-4" @submit.prevent>
        <HLFormItem label="How should it go out?" :show-feedback="false">
          <div class="sl-cards w-full">
            <HLRadioGroup id="share-delivery" v-model:value="state.deliver" radio-card-group width="equal" size="sm">
              <HLRadioCard
                v-for="d in DELIVERY"
                :id="`share-delivery-${d.key}`"
                :key="d.key"
                :value="d.key"
                :title="d.label"
                :description="d.note"
                compact
              />
            </HLRadioGroup>
          </div>
        </HLFormItem>
      </HLForm>
    </template>

    <HLText v-else html-tag="div" size="md" class="inline-block bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-gray-600 font-mono">{{ state.sent.detail }}</HLText>

    <template #footer>
      <div class="flex justify-end gap-2 px-4 py-3">
        <template v-if="!state.sent">
          <HLButton variant="secondary" size="sm" @click="leave()">Cancel</HLButton>
          <HLButton variant="primary" color="blue" size="sm" @click="send">{{ sendLabel }}</HLButton>
        </template>
        <template v-else>
          <HLButton variant="secondary" size="sm" @click="leave()">Done</HLButton>
          <HLButton variant="secondary" size="sm" @click="leave('archive')">View past snapshots</HLButton>
          <HLButton variant="primary" color="blue" size="sm" @click="leave('recipient')">See what the client sees</HLButton>
        </template>
      </div>
    </template>
  </HLModal>
</template>
