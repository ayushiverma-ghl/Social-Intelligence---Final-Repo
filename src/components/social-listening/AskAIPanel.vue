<script setup>
import { computed, h, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Stars01Icon, ArrowUpIcon, Edit05Icon } from '@gohighlevel/ghl-icons/24/outline'
import { midSentence } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'

const { state, account } = useSocialListening()

// A HighRise drawer docked to the right, over the page rather than pushing it — the glance
// tiles drop to one per row if the content squeezes, and there is no reason to make anyone
// watch that. HLDrawer brings the focus trap, Esc and the close button. The purple chip stays
// because the Ask AI entry point in the top bar is purple; this is the same surface.

// The chip, passed to HLDrawerContent as its header icon.
const AiChip = () => h('span', { class: 'sl-ai-chip w-5 h-5 rounded-lg bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center shrink-0', 'aria-hidden': 'true' }, [
  h(Stars01Icon, { class: 'w-3.5 h-3.5 text-white' }),
])

// The parent mounts this behind `v-if="state.askAI"`, so `show` starts false and flips on
// mount; closing sets it false and state.askAI is cleared once the drawer has animated out.
const show = ref(false)
// A caller can hand over its own answer (`reply`) and ask for it to send itself (`autoSend`),
// so a CTA opens straight onto the response instead of a prefilled prompt.
onMounted(() => {
  show.value = true
  if (state.askAI?.reply && state.askAI?.prompt) {
    draft.value = state.askAI.prompt
    if (state.askAI.autoSend) setTimeout(() => send(), 350)
  }
})

const sent = ref(null)     // the prompt once submitted
const answer = ref('')     // revealed so far
const done = ref(false)
const draft = ref('')
const inputEl = ref(null)
const bodyEl = ref(null)
let timer = null

const niche = computed(() => midSentence(account.value.space || 'your niche'))

// A shot list is something text can genuinely produce. Sujith asked not to show a video
// being generated, and this doesn't — it plans one.
const reply = computed(() => {
  if (state.askAI?.reply) return state.askAI.reply
  const topic = state.askAI?.topic || 'this week\'s trend'
  return `Here's a quick video plan for ${account.value.short}.\n\n`
    + `Hook: open on the moment itself, no talking.\n`
    + `Middle: show the one part of ${midSentence(topic)} customers never get to see.\n`
    + `End: the finished thing, with your name on it.\n\n`
    + `Shoot it vertical and keep it under 20 seconds. That length is doing best in ${niche.value} right now.`
})

function stop() {
  if (timer) { clearInterval(timer); timer = null }
}
function cleanup() {
  stop()
  state.askAI = null
}

// Reveals on a timer rather than calling anything. Nothing to fail mid-review.
function send() {
  const text = draft.value.trim()
  if (!text || sent.value) return
  sent.value = text
  draft.value = ''
  answer.value = ''
  done.value = false
  const full = reply.value
  let i = 0
  timer = setInterval(() => {
    i = Math.min(full.length, i + 2)
    answer.value = full.slice(0, i)
    scroll()
    if (i >= full.length) { stop(); done.value = true }
  }, 16)
}

// One question per thread: the prototype has one canned answer, so a follow-up used to be
// typed and then silently dropped. Once answered, the field locks and says how to go again.
function reset() {
  stop()
  sent.value = null
  answer.value = ''
  done.value = false
  draft.value = ''
  focusInput()
}

// The drawer body is HighRise's own scroller; keep the newest line of the answer in view.
function scroll() {
  nextTick(() => {
    const scroller = bodyEl.value?.closest('.hr-scrollbar-container')
    if (scroller) scroller.scrollTop = scroller.scrollHeight
  })
}
function focusInput() {
  nextTick(() => inputEl.value?.$el?.querySelector('textarea')?.focus())
}

// Opening from a CTA arrives with the prompt written but not sent — the user reads it,
// edits if they want, and presses enter.
watch(() => state.askAI, (v) => {
  if (!v) return
  stop()
  sent.value = null
  answer.value = ''
  done.value = false
  draft.value = v.prompt || ''
  focusInput()
}, { immediate: true, deep: true })

onBeforeUnmount(stop)
</script>

<template>
  <HLDrawer
    id="ask-ai-drawer"
    :show="show"
    :width="400"
    placement="right"
    @update:show="(v) => { show = v }"
    @after-enter="focusInput"
    @after-leave="cleanup"
  >
    <HLDrawerContent id="ask-ai-content" title="Ask AI" :icon="AiChip" closable>
      <div ref="bodyEl" class="flex-1 px-3 py-3 flex flex-col">
        <!-- Landing state, until something is sent -->
        <div v-if="!sent" class="flex-1 flex flex-col items-center justify-center text-center">
          <HLText size="2xl" weight="semibold" class="text-gray-900">What can I help with?</HLText>
          <HLText size="md" class="text-gray-500 mt-1.5! max-w-[30ch]">
            Ask about your niche, your competitors, or what to post next.
          </HLText>
        </div>

        <template v-else>
          <HLText html-tag="span" size="md" class="self-end bg-gray-100 rounded-lg px-3 py-2 text-gray-900 max-w-[88%] mb-4!">{{ sent }}</HLText>
          <div class="flex gap-2.5" aria-live="polite">
            <AiChip class="mt-0.5" />
            <HLText size="md" class="text-gray-600 whitespace-pre-line">{{ answer }}<span
              v-if="!done"
              class="inline-block w-[1.5px] h-[13px] bg-accent-purple align-[-2px] ml-px motion-safe:animate-pulse"
            /></HLText>
          </div>
        </template>
      </div>

      <template #footer>
        <!-- HLDrawerContent pads its footer by 8px; the composer takes 12 more so it sits on the
             same inset as the Help and Notifications drawers' content. -->
        <div class="w-full flex flex-col gap-2 p-3">
          <div class="flex items-end gap-2">
            <div class="flex-1 min-w-0">
              <HLInput
                id="ask-ai-input"
                ref="inputEl"
                v-model="draft"
                type="textarea"
                :autosize="{ minRows: 1, maxRows: 4 }"
                size="md"
                :disabled="!!sent"
                :placeholder="sent ? 'Start a new question to ask something else' : 'Ask anything'"
                @keydown.enter.exact.prevent="send"
              />
            </div>
            <HLTooltip v-if="!sent" trigger="hover">
              <template #trigger>
                <HLButton variant="primary" color="blue" size="xs" :disabled="!draft.trim()" aria-label="Send" @click="send">
                  <template #iconLeft><ArrowUpIcon /></template>
                </HLButton>
              </template>
              Send
            </HLTooltip>
          </div>
          <div v-if="sent" class="flex items-center justify-between gap-2">
            <HLText size="md" class="text-gray-500">This preview answers one question at a time.</HLText>
            <HLButton variant="secondary" size="sm" :disabled="!done" @click="reset">
              <template #iconLeft><Edit05Icon /></template>
              New question
            </HLButton>
          </div>
        </div>
      </template>
    </HLDrawerContent>
  </HLDrawer>
</template>

<!-- Unscoped: the drawer teleports. The body's content wrapper is at least the body's height,
     so the landing line sits in the middle of the panel rather than at its top. -->
<style>
.hr-v-4-8-5 #ask-ai-content .hr-drawer-body-content-wrapper { min-height: 100%; display: flex; flex-direction: column; }
</style>
