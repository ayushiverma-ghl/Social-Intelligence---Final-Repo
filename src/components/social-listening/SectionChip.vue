<script setup>
// The section glyph for a card header.
//
// Every card now uses `inline`: the chip sits in the eyebrow row and the card takes an even
// `p-5`. It used to sit out of flow in a 64px left gutter so the eyebrow, heading, figure and
// rows shared one text column — but the review called that out ("you should probably not
// indent it like this, so it comes out naturally as a graph"), and the argument against the
// gutter was already in this file: a card whose body spans its full width has nothing to
// align to, so only the cost of the indent landed. That is true of all five cards.
//
// Decorative by design: the eyebrow beside it names the section in words, so the glyph adds
// nothing for a screen reader and is hidden from it.
//
// Which glyph each card gets is the I1 lexicon — a metric wears the same glyph here as it
// does in the AI insights stat row. See design_specifications_social_listening_2026.
// `onTint` and the out-of-flow 32px gutter variant are gone: every caller in src passes
// `inline` and none passed `onTint`. `inline` is still declared so those callers do not leak
// it onto the span as an attribute; it no longer changes anything.
//
// 24px box, 14px glyph. The AI insights stat row uses the same spec, so there is one chip
// size on the page.
//
// `ai` is the purple treatment, opt-in for one reason: purple means AI is speaking, not
// "this is a section". Only AI insights qualifies — the other four mark measured data and
// stay blue. It matches the Ask AI button in the top bar, which has always been this gradient.
defineProps({
  icon: { type: [Object, Function], required: true },
  inline: { type: Boolean, default: false },
  ai: { type: Boolean, default: false },
  // 14 Oct: the AI chip as a violet tint, the same shape and weight as the blue section chips.
  soft: { type: Boolean, default: false },
  // out15 W07: 'md' is the overview CardHead tile, a 32px box with a 16px glyph, for section
  // headers that sit beside it (the insights pop-up). The default stays the 24px row chip.
  size: { type: String, default: 'sm' },
})
</script>

<template>
  <span
    :class="[size === 'md' ? 'w-8 h-8' : 'w-6 h-6', 'shrink-0 rounded-lg flex items-center justify-center',
      ai ? (soft ? 'bg-accent-purple-light text-accent-purple' : 'bg-gradient-to-br from-accent-purple to-accent-pink text-white') : 'bg-gray-100 text-gray-600']"
    aria-hidden="true"
  >
    <component :is="icon" :class="size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5'" />
  </span>
</template>
