<script setup>
import { ArrowRightIcon, Hash01Icon, TrendUp01Icon, Trophy01Icon } from '@gohighlevel/ghl-icons/24/outline'
import { computed, onBeforeUnmount } from 'vue'
import { useSocialListening } from '../../composables/useSocialListening.js'
import sparklineArt from '../../assets/landing/sparkline.svg'
import avatarArt from '../../assets/landing/avatar.svg'

const { state, beat, simple } = useSocialListening()

// The three cards are the ones agreed on the review call. "What to post next" is gone —
// Sujith called it a secret sauce to hold back, and four cards on a screen whose only job
// is one click was one too many.
//
// Each card carries a small illustration of what it unlocks, Sujith's reference from 1 Oct:
// one main fragment per card with one or two chips floating over it, on a tinted plate (the
// same pattern as the design-kit modal). It replaces the grey shimmer rows, which didn't say
// what any card was for. The names and figures are illustrative and the same for every
// account; nothing here is measured. Decorative only: the title under each plate says what
// the card is, so the whole plate is aria-hidden.
//
// Copy is one line per card (variation B3). One line each is what keeps the three cards the
// same height without a min-height rule holding them there.
const CARDS = [
  { key: 'topics', title: 'What your niche talks about', line: 'The topics moving in your industry.' },
  // Mentions is niche-level and always will be (Sujith, 28 Sep).
  { key: 'mentions', title: 'What your industry is saying', line: 'Every mention we find, and how it felt.' },
  { key: 'compare', title: 'Who is leading your niche', line: 'The brands you track, ranked.' },
]
// Simplified design: plainer names, "industry" for "niche", and its own hero copy.
const SIMPLE_CARDS = [
  // Not "what people are talking about": the headline above says it (8.2).
  { key: 'topics', title: 'Trending topics', line: 'The topics growing fastest in your industry.' },
  { key: 'mentions', title: 'What people say', line: 'Every post we find, and how it felt.' },
  { key: 'compare', title: 'How you compare', line: 'You and your competitors, ranked.' },
]
// The headline's last words are picked out in blue (Sujit's reference, 8 Oct).
const SIMPLE_HERO = {
  headline: 'See what your industry is',
  accent: 'talking about',
  body: 'Pick your industry to see trending topics, what people are saying, and how you compare with competitors.',
  cta: 'Pick your industry',
}
const cards = computed(() => (simple.value ? SIMPLE_CARDS : CARDS))
const hero = computed(() => (simple.value ? SIMPLE_HERO : beat.value.zero))

const TOPICS = [
  { label: 'Short-form video', width: 86, bar: 'bg-primary-600', chip: 'bg-primary-50 text-primary-600' },
  { label: 'Pricing tips', width: 58, bar: 'bg-accent-purple', chip: 'bg-accent-purple-light text-accent-purple' },
  { label: 'Client results', width: 34, bar: 'bg-primary-200', chip: 'bg-gray-100 text-gray-500' },
]
const LEADERS = [
  { rank: 1, mark: 'bg-primary-600', line: 'w-24', score: 92 },
  { rank: 2, you: true, score: 87 },
  { rank: 3, mark: 'bg-accent-purple', line: 'w-16', score: 74 },
]
// The simplified hero's decoration (8 Oct, option A, open): six pieces placed off-axis around the
// copy, each at its own height and distance, so the two sides no longer mirror. No panel, lines
// or dot field: Sujit found the boxed version too boxy. Everything sits on a fixed 1120 × 540
// stage centred on the copy, so the pieces keep their distance from the words at any width. The
// stage scales down in steps on narrow canvases and is dropped below 780px. Decorative only.
const HERO_STICKERS = [
  { key: 'video', side: 'topic', label: 'Short-form video', growth: 38, x: 215, y: 92, r: -7 },
  { key: 'pricing', side: 'topic', label: 'Pricing tips', growth: 24, x: 180, y: 405, r: 4 },
  { key: 'spa', side: 'people', initials: 'PS', label: '"Best first visit"', x: 925, y: 172, r: 6 },
  { key: 'glow', side: 'people', initials: 'GS', label: '"Booked in 30s"', x: 860, y: 472, r: -3 },
]
// Two glass tiles: bars for topics, message lines for people.
const HERO_HUBS = [
  { key: 'topic', x: 118, y: 238, r: -8 },
  { key: 'people', x: 1000, y: 372, r: 7 },
]
// Simplified cards (8 Oct, the "box" version agreed with Sujit, lighter fill). Each card's art is
// one fixed 312 x 196 composition from his frame, with the review's fixes: Rising has the trend
// arrow, the chart sits off the bars, the quote fits two lines, every ranking row has a bar and a
// faded fourth row says the list goes on. The composition is centred in a borderless grey-blue box
// and scaled as a unit: down when the box is narrower than 312px, up to 1.12x on wide screens.
const BOX_TOPICS = [
  { label: 'Short-form video', chip: 'bg-primary-50', hash: 'text-primary-600', fill: 'bg-primary-600', w: 112 },
  { label: 'Pricing tips', chip: 'bg-accent-purple-light', hash: 'text-accent-purple', fill: 'bg-accent-purple', w: 80 },
  { label: 'Client results', chip: 'bg-gray-100', hash: 'text-gray-500', fill: 'bg-primary-200', w: 44 },
]
const BOX_RANKS = [
  { rank: 1, top: 12, mark: 'bg-primary-600', score: 92 },
  { rank: 3, top: 106, mark: 'bg-accent-purple', score: 74 },
  { rank: 4, top: 140, mark: 'bg-gray-200', score: 61, faded: true },
]
const BOX_MAX_SCALE = 1.12
const boxObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver((entries) => {
  for (const e of entries) e.target.style.setProperty('--k', Math.min(BOX_MAX_SCALE, e.target.getBoundingClientRect().width / 312).toFixed(4))
})
function observeBox(el) { if (el && boxObserver) boxObserver.observe(el) }
onBeforeUnmount(() => boxObserver?.disconnect())

// Fragments share one surface: white, gray-200 border, HighRise's large shadow.
const FRAG = 'absolute bg-white border border-gray-200 rounded-lg shadow-(--shadow-lg)'

function open() {
  state.modal = 'space'
}
</script>

<template>
  <div>
    <div v-if="simple" class="sl-hero">
      <div class="sl-hero-box relative isolate overflow-hidden grid place-items-center">
        <div class="sl-hero-stage" aria-hidden="true">
          <span
            v-for="hub in HERO_HUBS" :key="hub.key"
            :class="['sl-glass', hub.key === 'people' && 'sl-glass-violet']"
            :style="{ left: hub.x + 'px', top: hub.y + 'px', '--r': hub.r + 'deg' }"
          >
            <span v-if="hub.key === 'topic'" class="flex items-end gap-1.5 h-7.5">
              <span v-for="h in [12, 20, 30]" :key="h" class="sl-bar w-2 rounded-full" :style="{ height: h + 'px' }" />
            </span>
            <span v-else class="grid gap-1.5 w-10">
              <span class="h-1.25 rounded-full sl-violet-fill" />
              <span class="h-1.25 w-[70%] rounded-full sl-violet-fill-soft" />
              <span class="h-1.25 rounded-full sl-violet-fill" />
            </span>
          </span>

          <span
            v-for="(s, si) in HERO_STICKERS" :key="s.key"
            class="sl-stk"
            :style="{ left: s.x + 'px', top: s.y + 'px', '--r': s.r + 'deg', '--i': si }"
          >
            <span :class="['w-6 h-6 rounded-full grid place-items-center shrink-0', s.side === 'topic' ? 'bg-primary-50 text-primary-600' : 'bg-accent-purple-light text-accent-purple']">
              <Hash01Icon v-if="s.side === 'topic'" class="w-3.5 h-3.5" />
              <HLText v-else html-tag="span" size="md" weight="semibold">{{ s.initials }}</HLText>
            </span>
            <HLText html-tag="span" size="md" weight="semibold" class="text-gray-900">{{ s.label }}</HLText>
            <span v-if="s.growth" class="flex items-center gap-0.5 text-positive-strong">
              <TrendUp01Icon class="w-3.5 h-3.5" /><HLText html-tag="span" size="md" weight="semibold">{{ s.growth }}%</HLText>
            </span>
          </span>
        </div>

        <div class="sl-hero-copy relative z-10 max-w-[600px] px-4 text-center">
          <HLText html-tag="h2" type="display" size="xs" weight="semibold" class="text-gray-900 text-balance">{{ hero.headline }} <span class="text-primary-600">{{ hero.accent }}</span></HLText>
          <HLText size="2xl" class="text-gray-600 mt-3! max-w-[500px] mx-auto! text-pretty">{{ hero.body }}</HLText>
          <!-- 27 Oct (developers): the oct-5 landing for an account with no industry, one button that
               opens Choose your industry. -->
          <div class="mt-8">
            <HLButton id="landing-pick-industry" variant="primary" color="blue" size="md" @click="open">
              {{ hero.cta }}
              <template #iconRight><ArrowRightIcon /></template>
            </HLButton>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="max-w-[720px] mx-auto text-center py-8">
      <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900 mb-2.5!">
        {{ hero ? hero.headline : 'Your insights start with your niche' }}
      </HLText>
      <!-- 62ch, not 52: at 52 the subline breaks mid-clause ("what people are / saying about
           you"). 62 puts the break on the sentence boundary, so line two is "All from one
           screen." on its own. -->
      <HLText size="lg" class="text-gray-600 mb-6! max-w-[62ch] mx-auto!">
        {{ hero ? hero.body : '' }}
      </HLText>
      <HLButton variant="primary" color="blue" size="md" @click="open">
        {{ hero ? hero.cta : 'Select your niche to get started' }}
        <template #iconRight><ArrowRightIcon /></template>
      </HLButton>
    </div>

    <!-- Simplified (Harsh, 6 Oct): the three cards read as buttons, as if each led somewhere.
         They are a preview of what picking an industry opens, so they sit under their own
         label, set apart from the call to action, with no card chrome and nothing to click. -->
    <div v-if="simple" class="flex items-center gap-3 mt-8 mb-5" aria-hidden="true">
      <span class="sl-dot-rule flex-1" />
      <HLText html-tag="span" size="md" weight="medium" class="text-gray-500">Here's what you'll discover</HLText>
      <span class="sl-dot-rule flex-1" />
    </div>

    <!-- Three across from md up; below that each card's copy line would wrap and the three
         would stop matching heights, so they stack. -->
    <div v-if="simple" class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1200px] mx-auto">
      <div v-for="card in SIMPLE_CARDS" :key="card.key" class="flex flex-col gap-2">
        <div :ref="observeBox" class="sl-box-plate" aria-hidden="true">
          <div class="sl-box-stage">
            <template v-if="card.key === 'topics'">
              <div class="sl-box-frag absolute left-[21px] top-[21px] w-[244px] h-[152px] px-4 py-3 flex flex-col gap-2">
                <HLText size="md" weight="medium" class="text-gray-500 whitespace-nowrap">Trending topics</HLText>
                <div class="flex flex-col gap-2.5">
                  <div v-for="t in BOX_TOPICS" :key="t.label" class="flex items-center gap-2">
                    <span :class="['w-5.5 h-5.5 rounded-lg grid place-items-center shrink-0', t.chip]"><HLText html-tag="span" size="md" weight="semibold" :class="t.hash">#</HLText></span>
                    <span class="flex-1 min-w-0 flex flex-col gap-1">
                      <HLText html-tag="span" size="md" weight="medium" class="text-gray-900 whitespace-nowrap">{{ t.label }}</HLText>
                      <span class="block h-1.5 rounded bg-gray-100 overflow-hidden"><span :class="['block h-full rounded', t.fill]" :style="{ width: t.w + 'px' }" /></span>
                    </span>
                  </div>
                </div>
              </div>
              <HLTag size="sm" color="success" round :bordered="false" :interactive="false" class="absolute! left-[211px] top-[14px]">
                <span class="inline-flex items-center gap-1"><TrendUp01Icon class="w-3.5 h-3.5" />Rising</span>
              </HLTag>
              <!-- On the list's bottom-right corner, over empty track only. -->
              <span class="sl-box-frag absolute left-[209px] top-[117px] w-20 h-14">
                <img :src="sparklineArt" alt="" width="60" height="40" class="absolute left-2 top-2" />
              </span>
            </template>
            <template v-else-if="card.key === 'mentions'">
              <div class="sl-box-frag absolute left-1/2 -translate-x-1/2 w-max px-3 py-2 flex items-center gap-2 top-[26px]">
                <img :src="avatarArt" alt="" width="24" height="24" />
                <span class="w-16 h-1.5 rounded bg-gray-200" />
                <HLTag size="sm" color="warning" round :bordered="false" :interactive="false">Negative</HLTag>
              </div>
              <div class="sl-box-frag absolute left-1/2 -translate-x-1/2 w-[261px] h-[104px] px-4 py-3 flex flex-col gap-2 top-[63px]">
                <div class="flex items-center gap-2">
                  <HLText html-tag="span" size="md" weight="medium" class="w-6 h-6 rounded-full bg-gray-100 text-gray-600 grid place-items-center shrink-0">GS</HLText>
                  <span class="flex-1 min-w-0 flex flex-col">
                    <HLText html-tag="span" size="md" weight="semibold" class="text-gray-900 whitespace-nowrap">Glow Studio</HLText>
                    <HLText html-tag="span" size="md" class="text-gray-500 whitespace-nowrap">2h ago</HLText>
                  </span>
                  <HLTag size="sm" color="success" round :bordered="false" :interactive="false">Positive</HLTag>
                </div>
                <HLText size="md" class="text-gray-600">Loving how fast the new booking flow is. Clients actually show up now.</HLText>
              </div>
            </template>
            <template v-else>
              <div class="sl-box-frag sl-box-board absolute left-1/2 -translate-x-1/2 top-[27px] w-[248px] h-[165px]">
                <template v-for="r in BOX_RANKS" :key="r.rank">
                  <span :class="r.faded && 'opacity-55'">
                    <HLText html-tag="span" size="md" weight="semibold" :class="['absolute left-[27.67px]', r.faded ? 'text-gray-500' : 'text-gray-900']" :style="{ top: r.top + 3 + 'px' }">{{ r.rank }}</HLText>
                    <span :class="['absolute left-[47.67px] w-5.5 h-5.5 rounded-lg', r.mark]" :style="{ top: r.top + 'px' }" />
                    <span class="absolute left-[79.67px] w-[105px] h-1.5 rounded bg-gray-200 overflow-hidden" :style="{ top: r.top + 8 + 'px' }">
                      <span :class="['block h-full rounded', r.faded ? 'bg-gray-300' : 'bg-gray-400']" :style="{ width: r.score + '%' }" />
                    </span>
                    <HLText v-if="!r.faded" html-tag="span" size="md" weight="semibold" class="absolute left-[194.67px] text-gray-900" :style="{ top: r.top + 3 + 'px' }">{{ r.score }}</HLText>
                  </span>
                </template>
                <div class="absolute left-[11px] w-[224px] h-10 rounded-lg bg-primary-50 border border-primary-200 top-[50px]">
                  <HLText html-tag="span" size="md" weight="semibold" class="absolute left-[17px] top-[10px] text-primary-600">2</HLText>
                  <HLTag size="sm" color="primary" round :interactive="false" class="absolute! left-[34px] top-[8px]">You</HLTag>
                  <HLText html-tag="span" size="md" weight="semibold" class="absolute left-[80px] top-[3px] text-primary-600 whitespace-nowrap">Your brand</HLText>
                  <span class="absolute left-[80px] top-[24px] w-[88px] h-1.5 rounded bg-primary-100 overflow-hidden"><span class="block h-full rounded bg-primary-600" style="width: 87%" /></span>
                  <HLText html-tag="span" size="md" weight="semibold" class="absolute left-[184px] top-[10px] text-primary-600">87</HLText>
                </div>
              </div>
              <span class="sl-box-frag absolute left-[200px] top-[14px] h-[26px] px-2.5 rounded-full! flex items-center gap-1">
                <Trophy01Icon class="w-3.5 h-3.5 text-warning-strong" /><HLText html-tag="span" size="md" weight="semibold" class="text-gray-900 whitespace-nowrap">You're #2</HLText>
              </span>
            </template>
          </div>
        </div>
        <div class="flex gap-3">
          <span class="flex flex-col gap-0.5 min-w-0">
            <span class="flex items-center gap-2">
              <!-- 16px and 14px: HighRise's lg and md are 14px and 13px. -->
              <HLText html-tag="h3" weight="semibold" class="text-gray-900 text-[16px]! leading-[normal]!">{{ card.title }}</HLText>
            </span>
            <HLText class="text-gray-600 text-[14px]! leading-[normal]!">{{ card.line }}</HLText>
          </span>
        </div>
      </div>
    </div>

    <div v-if="!simple" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Native buttons, not HLCard: each card is one click to the niche picker, and HLCard
           is not interactive. The focus ring stands in for what HLButton would give. -->
      <button
        v-for="(card, i) in cards" :key="card.key"
        type="button"
        :style="{ '--i': i + 1 }"
        class="sl-enter sl-lift group text-left bg-white border border-gray-200 rounded-xl p-2 pb-5 hover:border-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
        @click="open()"
      >
        <div class="sl-zero-plate relative h-49 overflow-hidden mb-4 rounded-lg border border-primary-100 bg-linear-to-br from-primary-25 via-accent-purple-light to-white" aria-hidden="true">
          <!-- Sujeet's plates: their text in HLText and the square marks on rounded-lg. -->
          <template v-if="true">
            <template v-if="card.key === 'topics'">
              <div :class="[FRAG, 'left-[7%] top-[13%] w-[64%] px-3.5 py-3']">
                <HLText size="md" weight="medium" class="text-gray-500 mb-2!">Trending topics</HLText>
                <div class="flex flex-col gap-2.5">
                  <div v-for="t in TOPICS" :key="t.label" class="flex items-center gap-2">
                    <HLText html-tag="span" size="md" weight="semibold" :class="['w-5.5 h-5.5 rounded-lg grid place-items-center shrink-0', t.chip]">#</HLText>
                    <div class="flex-1 min-w-0">
                      <HLText size="md" weight="medium" class="text-gray-900 truncate mb-1!">{{ t.label }}</HLText>
                      <span class="block h-1.5 rounded-full bg-gray-100 overflow-hidden"><span :class="['block h-full rounded-full', t.bar]" :style="{ width: t.width + '%' }" /></span>
                    </div>
                  </div>
                </div>
              </div>
              <span :class="[FRAG, 'sl-zero-chip right-[4%] top-[7%] rounded-full px-2.5 py-1 flex items-center gap-1']">
                <TrendUp01Icon class="w-3.5 h-3.5 text-positive-strong" /><HLText html-tag="span" size="md" weight="semibold" class="text-positive-strong">Rising</HLText>
              </span>
              <span :class="[FRAG, 'sl-zero-chip right-[4%] bottom-[10%] w-[26%] h-[30%] p-2']">
                <svg viewBox="0 0 88 36" class="w-full h-full fill-none stroke-primary-600" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="2,30 18,26 30,28 44,18 56,20 70,12 84,6" />
                  <circle cx="84" cy="6" r="3" class="fill-primary-600 stroke-none" />
                </svg>
              </span>
            </template>
            <template v-else-if="card.key === 'mentions'">
              <div :class="[FRAG, 'left-[13%] top-[9%] w-[64%] px-3 py-2 opacity-60 flex items-center gap-2']">
                <span class="w-6 h-6 rounded-full bg-warning-light shrink-0" />
                <span class="h-1.5 w-18 rounded-full bg-gray-200" />
                <HLTag size="sm" color="warning" round :bordered="false" class="ml-auto">Negative</HLTag>
              </div>
              <div :class="[FRAG, 'left-[7%] top-[28%] w-[74%] px-3.5 py-3']">
                <div class="flex items-center gap-2">
                  <HLText html-tag="span" size="md" weight="semibold" class="w-6 h-6 rounded-full bg-primary-50 text-primary-600 grid place-items-center shrink-0">GS</HLText>
                  <div class="min-w-0">
                    <HLText size="md" weight="semibold" class="text-gray-900">Glow Studio</HLText>
                    <HLText size="md" class="text-gray-500">2h ago</HLText>
                  </div>
                  <HLTag size="sm" color="success" round :bordered="false" class="ml-auto">Positive</HLTag>
                </div>
                <HLText size="md" class="text-gray-600 mt-2!">Loving how fast the new booking flow is. Clients actually show up now.</HLText>
              </div>
              <span :class="[FRAG, 'sl-zero-chip right-[5%] bottom-[10%] rounded-full px-3 py-1.5 flex items-center gap-2']">
                <span class="flex">
                  <span class="w-3.5 h-3.5 rounded-full bg-positive ring-2 ring-white" />
                  <span class="w-3.5 h-3.5 rounded-full bg-gray-400 ring-2 ring-white -ml-1" />
                  <span class="w-3.5 h-3.5 rounded-full bg-warning ring-2 ring-white -ml-1" />
                </span>
                <HLText html-tag="span" size="md" weight="semibold" class="text-gray-900">Mood</HLText>
              </span>
            </template>
            <template v-else>
              <div :class="[FRAG, 'left-[7%] top-[14%] w-[74%] px-3.5 py-3 flex flex-col gap-4']">
                <template v-for="r in LEADERS" :key="r.rank">
                  <div v-if="r.you" class="flex items-center gap-2.5 bg-primary-50 border border-primary-200 rounded-lg px-2.5 py-2 -mx-2.5 -my-1.5">
                    <HLText html-tag="span" size="md" weight="semibold" class="w-2.5 text-primary-600">{{ r.rank }}</HLText>
                    <HLTag size="sm" color="primary" round>You</HLTag>
                    <HLText html-tag="span" size="md" weight="semibold" class="text-primary-600">Your brand</HLText>
                    <HLText html-tag="span" size="md" weight="semibold" class="ml-auto text-primary-600 tabular-nums">{{ r.score }}</HLText>
                  </div>
                  <div v-else class="flex items-center gap-2.5">
                    <HLText html-tag="span" size="md" weight="semibold" class="w-2.5 text-gray-900">{{ r.rank }}</HLText>
                    <span :class="['w-5.5 h-5.5 rounded-lg shrink-0', r.mark]" />
                    <span :class="['h-1.5 rounded-full bg-gray-200', r.line]" />
                    <HLText html-tag="span" size="md" weight="semibold" class="ml-auto text-gray-900 tabular-nums">{{ r.score }}</HLText>
                  </div>
                </template>
                <div class="flex items-center gap-2.5 opacity-45">
                  <HLText html-tag="span" size="md" weight="semibold" class="w-2.5 text-gray-500">4</HLText>
                  <span class="w-5.5 h-5.5 rounded-lg bg-gray-200 shrink-0" />
                  <span class="h-1.5 w-12 rounded-full bg-gray-200" />
                </div>
              </div>
              <span :class="[FRAG, 'sl-zero-chip right-[4%] top-[9%] w-10 h-10 grid place-items-center']">
                <Trophy01Icon class="w-4 h-4 text-warning-strong" />
              </span>
            </template>
          </template>
        </div>

        <div class="px-3">
          <HLText html-tag="h3" size="lg" weight="semibold" class="text-gray-900">{{ card.title }}</HLText>
          <HLText size="md" class="text-gray-600 mt-1!">{{ card.line }}</HLText>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* WBR 12 Oct (7C): the industry card and chips under the hero copy. */
.sl-prefill-pill { display: inline-flex; align-items: center; gap: 12px; height: 44px; padding: 0 10px 0 18px; border-radius: 9999px; background: #fff; border: 1px solid var(--color-gray-300); box-shadow: 0 1px 2px rgb(16 24 40 / .05); }
.sl-prefill-rule { width: 1px; height: 20px; background: var(--color-gray-200); }
.sl-industry-chip { display: inline-flex; align-items: center; height: 38px; padding: 0 16px; border-radius: 9999px; border: 1px solid var(--color-gray-200); background: #fff; font-size: 14px; font-weight: 500; color: var(--color-gray-900); box-shadow: 0 1px 2px rgb(16 24 40 / .05); cursor: pointer; transition: border-color .15s, background .15s; }
.sl-industry-chip:hover { border-color: var(--color-primary-300); background: var(--color-primary-25, #f5f8ff); }
.sl-industry-chip:focus-visible { outline: 2px solid var(--color-primary-600); outline-offset: 2px; }
.sl-industry-chip.is-more { border-style: dashed; color: var(--color-primary-600); }

/* The floating chips lift a little when the card is hovered or focused, the one moment of
   motion on this screen. Off for anyone who asks for reduced motion. */
.sl-zero-chip { transition: transform .2s ease; }
.group:hover .sl-zero-chip,
.group:focus-visible .sl-zero-chip { transform: translateY(-2px); }
@media (prefers-reduced-motion: reduce) {
  .sl-zero-chip { transition: none; }
  .group:hover .sl-zero-chip, .group:focus-visible .sl-zero-chip { transform: none; }
}

/* Simplified hero, open (8 Oct). No panel, edge or dot field: a small blue glow behind the
   left-hand pieces and a violet one behind the right, each fading out well inside the hero so
   nothing reads as a box. HighRise defines the violet steps but the app has no tokens for them,
   so they are read straight from HighRise. */
.sl-hero { container-type: inline-size; }
.sl-hero-box {
  /* 440px, the same as the Topics first visit (F3, 7 Oct), so the two tabs share one frame. */
  height: 440px;
  background:
    radial-gradient(20% 34% at 16% 46%, color-mix(in srgb, var(--color-primary-200) 42%, transparent), transparent 75%),
    radial-gradient(20% 34% at 84% 54%, color-mix(in srgb, var(--violet-200) 58%, transparent), transparent 75%);
}
/* The stage is centred on the copy and scales around it, so the two sides stay mirrored.
   80% in a 440px box (F3, 7 Oct), the same scale the Topics first visit uses. */
.sl-hero-stage {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 1120px;
  height: 540px;
  transform: translate(-50%, -50%) scale(var(--k, .8));
  transform-origin: 50% 50%;
}
@container (max-width: 940px) { .sl-hero-stage { --k: .8; } }
@container (max-width: 780px) {
  .sl-hero-stage { display: none; }
  .sl-hero-box { height: auto; padding: 56px 0; }
}
/* A soft white halo behind the words, so no glow ever reads against the text. */
.sl-hero-copy::before {
  content: "";
  position: absolute;
  inset: -56px -90px;
  z-index: -1;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--color-white) 96%, transparent) 55%, transparent);
}

.sl-violet-fill { background: var(--violet-300); }
.sl-violet-fill-soft { background: var(--violet-200); }
.sl-bar { background: linear-gradient(var(--color-primary-400), var(--color-accent-purple)); }

/* One glass recipe for both hubs: frosted fill, fine gradient edge tinted to its side. */
.sl-glass {
  position: absolute;
  width: 76px;
  height: 76px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  border: 1px solid transparent;
  transform: translate(-50%, -50%) rotate(var(--r));
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--color-white) 78%, transparent), color-mix(in srgb, var(--color-white) 50%, transparent)) padding-box,
    linear-gradient(140deg, var(--color-white), color-mix(in srgb, var(--color-primary-200) 90%, transparent) 55%, var(--color-white)) border-box;
  box-shadow: 0 18px 36px -16px color-mix(in srgb, var(--color-primary-600) 32%, transparent), var(--shadow-xs);
}
.sl-glass-violet {
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--color-white) 78%, transparent), color-mix(in srgb, var(--color-white) 50%, transparent)) padding-box,
    linear-gradient(140deg, var(--color-white), color-mix(in srgb, var(--violet-300) 95%, transparent) 55%, var(--color-white)) border-box;
  box-shadow: 0 18px 36px -16px color-mix(in srgb, var(--color-accent-purple) 30%, transparent), var(--shadow-xs);
}

/* One sticker: white, die-cut, a tinted icon chip, tilted to its side. They float gently
   (8 Oct, F1): each bobs about 6px at its own pace and phase, so they never move together,
   in place of the old hover tilt. */
.sl-stk {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px 5px 5px;
  white-space: nowrap;
  border-radius: 9999px;
  background: var(--color-white);
  border: 3px solid var(--color-white);
  box-shadow: var(--shadow-lg);
  transform: translate(-50%, -50%) rotate(var(--r));
  animation: sl-stk-float calc(5s + var(--i, 0) * .8s) ease-in-out calc(var(--i, 0) * -1.7s) infinite;
}
@keyframes sl-stk-float { 0%, 100% { translate: 0 0; } 50% { translate: 0 -6px; } }

/* The divider under the hero. */
.sl-dot-rule { border-top: 2px dotted var(--color-primary-100); }
/* Simplified box cards (8 Oct): a borderless grey-blue box at about a third of HighRise's
   gray-blue-100, the art composition centred in it and scaled by --k. */
.sl-box-plate {
  position: relative; height: calc(196px * var(--k, 1)); overflow: hidden; border-radius: 12px;
  background: color-mix(in srgb, var(--gray-blue-100) 36%, var(--color-white));
}
.sl-box-plate :deep(.hr-tag) { font-weight: 500; }
.sl-box-stage { position: absolute; left: 50%; top: 50%; width: 312px; height: 196px; transform: translate(-50%, -50%) scale(var(--k, 1)); }
.sl-box-frag { background: var(--color-white); border: 1px solid var(--color-gray-200); border-radius: 8px; overflow: hidden; }
/* The ranking runs past its fourth row, so it fades out rather than ending on a cut edge. */
.sl-box-board { -webkit-mask-image: linear-gradient(#000 76%, transparent); mask-image: linear-gradient(#000 76%, transparent); }
@media (prefers-reduced-motion: reduce) {
  .sl-stk { animation: none; }
}
</style>
