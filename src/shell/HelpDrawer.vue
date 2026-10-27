<script setup>
import { ref, onMounted } from 'vue'
import { XCloseIcon, Stars01Icon, Copy01Icon, HelpCircleIcon, BookOpen01Icon, Users01Icon, Announcement01Icon, CalendarIcon, Phone01Icon, ChevronRightIcon, LinkExternal01Icon } from '@gohighlevel/ghl-icons/24/outline'

// Whitelabel: a sub-account sees this under its agency's brand. Every destination below is a
// placeholder for a link the agency configures (help centre, courses, community, support
// line). No platform mascot, phone number or community is named here.
const HELP_LINKS = [
  { id: 'help-center', icon: HelpCircleIcon, iconBg: 'bg-warning-light', iconColor: 'text-warning-strong', title: 'Help center', description: 'Your support tickets, help articles and FAQs.' },
  { id: 'courses', icon: BookOpen01Icon, iconBg: 'bg-primary-50', iconColor: 'text-primary-600', title: 'Courses', description: 'Browse the course library your agency provides.' },
  { id: 'community', icon: Users01Icon, iconBg: 'bg-primary-50', iconColor: 'text-primary-600', title: 'Community', description: 'Ask questions and share ideas with other users.' },
  { id: 'announcements', icon: Announcement01Icon, iconBg: 'bg-negative-light', iconColor: 'text-negative-strong', title: 'Announcements', description: 'The latest news and releases.' },
  { id: 'events', icon: CalendarIcon, iconBg: 'bg-positive-light', iconColor: 'text-positive-strong', title: 'Events', description: 'Live sessions with the support team.' },
  { id: 'contact', icon: Phone01Icon, iconBg: 'bg-primary-50', iconColor: 'text-primary-600', title: 'Contact us', description: "Call your agency's support line." },
]

const props = defineProps({
  onClose: Function,
})

const show = ref(false)
const copied = ref(false)

onMounted(() => { show.value = true })

function copyRelNumber() {
  navigator.clipboard?.writeText('0-034-522')
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

const ROW = 'w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left focus-visible:outline-2 focus-visible:outline-primary-600 focus-visible:-outline-offset-2'
</script>

<template>
  <HLDrawer
    id="shell-help"
    :show="show"
    placement="right"
    :width="400"
    @update:show="(v) => { show = v }"
    @after-leave="onClose?.()"
  >
    <HLDrawerContent id="shell-help-content" show-header header-style="padding: 20px 20px 12px" body-content-style="padding: 0">
      <template #header>
        <div class="flex items-start justify-between gap-3 w-full">
          <div class="flex flex-col gap-1">
            <!-- The drawer header is already the dialog heading, so this is a span. -->
            <HLText html-tag="span" size="2xl" weight="semibold" class="text-gray-900">Help and support</HLText>
            <HLText size="md" class="text-gray-600 max-w-70">
              Talk to the support team, ask the community, or learn on your own.
            </HLText>
          </div>
          <HLTooltip trigger="hover">
            <template #trigger>
              <HLButton variant="ghost" size="xs" aria-label="Close help" class="shrink-0" @click="show = false">
                <template #iconLeft><XCloseIcon /></template>
              </HLButton>
            </template>
            Close
          </HLTooltip>
        </div>
      </template>

      <!-- Relationship number -->
      <div class="flex items-center gap-2 px-5 pt-4 pb-4">
        <HLText html-tag="span" size="md" weight="semibold" class="text-gray-900">Relationship number</HLText>
        <HLTooltip trigger="hover">
          <template #trigger>
            <HelpCircleIcon class="w-3.5 h-3.5 text-gray-400" tabindex="0" aria-label="What is this?" />
          </template>
          Quote this number when you contact support.
        </HLTooltip>
        <HLText html-tag="span" size="md" class="text-gray-600">0-034-522</HLText>
        <HLTooltip trigger="hover">
          <template #trigger>
            <HLButton variant="ghost" size="2xs" aria-label="Copy relationship number" @click="copyRelNumber">
              <template #iconLeft><Copy01Icon /></template>
            </HLButton>
          </template>
          Copy
        </HLTooltip>
        <HLText v-if="copied" html-tag="span" size="sm" weight="medium" class="text-positive-strong" role="status">Copied</HLText>
      </div>

      <!-- AI support assistant -->
      <div class="px-5 pb-4">
        <button
          type="button"
          class="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-accent-purple-light border border-accent-purple-border hover:bg-accent-purple-border transition-colors focus-visible:outline-2 focus-visible:outline-accent-purple focus-visible:outline-offset-2"
        >
          <span class="flex items-center gap-2">
            <Stars01Icon class="w-4 h-4 text-accent-purple" />
            <HLText html-tag="span" size="lg" weight="medium" class="text-gray-900">AI support assistant</HLText>
            <HLTag size="sm" color="purple" round :interactive="false">Beta</HLTag>
          </span>
          <ChevronRightIcon class="w-4 h-4 text-accent-purple" />
        </button>
      </div>

      <HLDivider class="!m-0" />

      <!-- Talk to support. One primary: chat is the fastest route, the other two are there when
           it isn't enough. -->
      <div class="flex flex-col gap-3 px-5 py-5">
        <div class="flex flex-col gap-0.5">
          <HLText html-tag="span" size="lg" weight="semibold" class="text-gray-900">Talk to support</HLText>
          <HLText html-tag="span" size="md" class="text-gray-600">Chat, a video call or a ticket, whichever suits you.</HLText>
        </div>
        <div class="grid grid-cols-3 gap-2 w-full">
          <HLButton variant="primary" color="blue" size="sm" :full-width="true">Start chat</HLButton>
          <HLButton variant="secondary" size="sm" :full-width="true">Video call</HLButton>
          <HLButton variant="secondary" size="sm" :full-width="true">Raise ticket</HLButton>
        </div>
      </div>

      <HLDivider class="!m-0" />

      <!-- Help links -->
      <div class="divide-y divide-gray-200">
        <button v-for="link in HELP_LINKS" :key="link.id" type="button" :class="ROW">
          <span :class="`size-10 rounded-lg flex items-center justify-center shrink-0 ${link.iconBg}`">
            <component :is="link.icon" class="w-5 h-5" :class="link.iconColor" />
          </span>
          <span class="flex flex-col gap-0.5 flex-1 min-w-0">
            <span class="flex items-center gap-1.5">
              <HLText html-tag="span" size="lg" weight="semibold" class="text-gray-900">{{ link.title }}</HLText>
              <LinkExternal01Icon class="w-3.5 h-3.5 text-gray-400" aria-label="Opens in a new tab" />
            </span>
            <HLText html-tag="span" size="md" class="text-gray-600">{{ link.description }}</HLText>
          </span>
        </button>
      </div>
    </HLDrawerContent>
  </HLDrawer>
</template>
