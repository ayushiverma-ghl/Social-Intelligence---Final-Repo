<script setup>
import { PieChart01Icon, ArrowRightIcon } from '@gohighlevel/ghl-icons/24/outline'
import { useSocialListening } from '../../composables/useSocialListening.js'

const { state } = useSocialListening()
</script>

<template>
  <!-- Competitor Landscape has no screen behind it yet. Saying so is better than building a
       placeholder that looks like a feature — and the overview's Competitors card already
       answers most of the question, so this sends people there rather than apologising.
       PieChart01, not SearchMd: a metric keeps its glyph wherever it appears, and that is
       the mark Competitors wears on the overview and in the AI insights row. -->
  <!-- HLEmpty inside the card, rather than a hand-built icon/heading/copy/button stack.
       HLEmpty sets its own title and description type (16 / 14), which is HighRise's and is
       left alone. The Coming soon tag rides in the header slot beside the glyph, which is
       the only slot above the title. -->
  <div class="bg-white border border-gray-200 rounded-xl py-14 px-6 flex justify-center">
    <HLEmpty
      id="competitor-landscape-soon"
      size="sm"
      title="Competitor landscape"
      description="Your share of the conversation, sentiment and engagement against the brands you track, over time rather than just today."
    >
      <template #header>
        <div class="flex flex-col items-center gap-3">
          <span class="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center" aria-hidden="true">
            <PieChart01Icon class="w-5 h-5" />
          </span>
          <HLTag size="sm" color="blue">Coming soon</HLTag>
        </div>
      </template>
      <template #actions>
        <HLButton variant="primary" color="blue" size="md" @click="state.tab = 'overview'">
          See how you compare now
          <template #iconRight><ArrowRightIcon /></template>
        </HLButton>
      </template>
    </HLEmpty>
  </div>
</template>
