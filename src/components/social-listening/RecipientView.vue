<script setup>
import { computed } from 'vue'
import { ArrowLeftIcon } from '@gohighlevel/ghl-icons/24/outline'
import { useSocialListening } from '../../composables/useSocialListening.js'
import { sentimentReading, SENTIMENT_LABEL } from '../../data/socialListening.js'

const { state, account, metrics, spaceData, fmtNum, toast, simple } = useSocialListening()

const declining = computed(() => !!metrics.value.down)

function back() {
  state.view = 'dashboard'
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
    <div class="w-full max-w-[720px] flex items-center gap-3 mb-5">
      <HLButton variant="secondary" size="xs" @click="back">
        <template #iconLeft><ArrowLeftIcon /></template>
        Back to Social listening
      </HLButton>
      <HLText html-tag="span" size="md" class="text-gray-500">Recipient view. This is the read-only page the client opens. No agency chrome, no other accounts.</HLText>
    </div>

    <div class="w-full max-w-[720px] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-(--shadow-lg)">
      <div class="bg-gray-900 px-8 py-6 flex items-center gap-3">
        <HLAvatar :name="account.name" size="sm" class="shrink-0" />
        <div>
          <HLText size="2xl" weight="semibold" class="text-white">{{ account.name }}</HLText>
          <!-- The client sees their agency here, never a name baked into the prototype. -->
          <HLText size="md" class="text-gray-400 mt-0.5!">Monthly snapshot · prepared by your agency</HLText>
        </div>
      </div>

      <div class="px-8 py-7">
        <HLText html-tag="h1" size="2xl" weight="semibold" class="text-gray-900 mb-4!">{{ account.short }}: social listening, last 30 days</HLText>

        <div :class="['inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 mb-6', declining ? 'bg-negative-light' : 'bg-positive-light']">
          <span :class="['w-2 h-2 rounded-full', declining ? 'bg-negative' : 'bg-positive']" />
          <HLText html-tag="span" size="md" weight="semibold" :class="[declining ? 'text-negative-strong' : 'text-positive-strong']">
            {{ declining ? 'Mentions and sentiment both fell this month' : 'Mentions and sentiment both grew this month' }}
          </HLText>
        </div>

        <div class="grid grid-cols-3 gap-5 mb-7">
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <HLText size="md" weight="medium" class="text-gray-500">Mentions</HLText>
            <HLText size="2xl" weight="semibold" class="text-gray-900 tabular-nums mt-1!">{{ fmtNum(metrics.volume) }}</HLText>
          </div>
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <HLText size="md" weight="medium" class="text-gray-500">{{ SENTIMENT_LABEL }}</HLText>
            <HLText size="2xl" weight="semibold" class="text-gray-900 mt-1!">{{ sentimentReading(metrics.sentiment) }}</HLText>
          </div>
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <HLText size="md" weight="medium" class="text-gray-500">Share of conversation</HLText>
            <HLText size="2xl" weight="semibold" class="text-gray-900 tabular-nums mt-1!">{{ metrics.share || 0 }}%</HLText>
          </div>
        </div>

        <div class="flex flex-col gap-3 text-gray-600 max-w-[65ch]">
          <HLText v-if="!declining" size="md">Mentions of {{ account.short }} grew {{ metrics.dVolume }} this month, driven mainly by posts on “{{ spaceData.trends[0].label }}”.</HLText>
          <HLText v-if="!declining" size="md">Sentiment improved, which means more of what people said about you was positive than last month.</HLText>
          <HLText v-if="declining" size="md">Mentions of {{ account.short }} fell {{ metrics.dVolume }} this month. Restarting a weekly posting cadence is the fastest way to recover.</HLText>
          <HLText v-if="account.competitors.length" size="md">Against {{ account.competitors.join(' and ') }}, you now hold {{ metrics.share || 0 }}% of the conversation in your category.</HLText>
          <HLText size="md">Next month we're leading with the format that's earning the most engagement in your niche this month.</HLText>
        </div>
      </div>

      <div class="border-t border-gray-200 bg-gray-50 px-8 py-4 flex items-center justify-between gap-3">
        <HLText html-tag="span" size="md" class="text-gray-500">Questions go straight back to your account manager</HLText>
        <HLButton variant="primary" color="blue" size="sm" @click="simple ? toast('Sent to your account manager') : toast('Question sent', 'Your account manager will see it with this snapshot attached.')">
          Reply with a question
        </HLButton>
      </div>
    </div>
  </div>
</template>
