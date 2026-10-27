<script setup>
// Shared card header (21 Oct, b2 V5 "32 chip, two-line post header", approved by Ayushi).
//
// Top line: a 32px icon tile with a 16px glyph, then the 14 grey eyebrow; the card's controls
// sit on the same line, top-aligned with the tile (Sujit, 19 Oct: controls start on the top line).
// The row is 36 tall (HLButton sm), so a card with or without a control puts its heading in the
// same place. Heading 8 below the row, an optional sub line 4 below the heading.
//
// Tile spec mirrors HighRise HLFeatureIcon sm (32 box, glyph = box / 2, 8 radius). HLFeatureIcon
// is not exported in 4.8.5, so the tile is a token-coloured span around HLIcon (exported):
// gray-100 / gray-600, or the purple AI gradient for the AI summary only (purple = AI).
defineProps({
  icon: { type: [Object, Function], required: true },
  ai: { type: Boolean, default: false },
  eyebrow: { type: String, default: '' },
  heading: { type: String, required: true },
  sub: { type: String, default: '' },
  subClass: { type: [String, Array], default: '' },
  // A legend (not a button) on the top line: centre it on the tile instead of top-aligning.
  centerControls: { type: Boolean, default: false },
})
</script>

<template>
  <div class="cardhead">
    <div class="flex items-start justify-between gap-4 h-9">
      <div class="flex items-center gap-2 min-w-0 h-8">
        <span
          :class="['cardhead-tile shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
            ai ? 'bg-gradient-to-br from-accent-purple to-accent-pink text-white' : 'bg-gray-100 text-gray-600']"
          aria-hidden="true"
        >
          <HLIcon :size="16"><component :is="icon" /></HLIcon>
        </span>
        <HLText size="md" weight="medium" class="text-gray-500 truncate min-w-0"><slot name="eyebrow">{{ eyebrow }}</slot></HLText>
      </div>
      <div v-if="$slots.controls" :class="['shrink-0 flex items-center gap-2', centerControls && 'h-8']"><slot name="controls" /></div>
    </div>
    <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900 mt-2!">{{ heading }}</HLText>
    <HLText v-if="sub" size="md" :class="['text-gray-600 mt-1!', subClass]">{{ sub }}</HLText>
  </div>
</template>
