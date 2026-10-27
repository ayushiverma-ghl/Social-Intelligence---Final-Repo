<script setup>
import { computed } from 'vue'
import { useSocialListening } from '../../composables/useSocialListening.js'

const { state, account, toast, simple } = useSocialListening()

const banners = computed(() => {
  const list = []
  const viewer = state.role === 'viewer'
  if (viewer && !account.value.space) {
    list.push({
      tone: 'info',
      title: 'Setup isn’t finished yet',
      body: `You have view-only access to ${account.value.short}. An admin needs to pick a niche before this fills in.`,
      action: 'Notify an admin', onClick: () => (simple.value ? toast("We've told your admin") : toast('Admin notified', 'They’ll get a note that this account still needs setup.')),
    })
  }
  if (account.value.stale) {
    list.push({
      tone: 'error',
      title: 'Social connection expired',
      body: 'We lost access to this account, so new mentions have stopped arriving. Everything below is the last data we collected.',
      action: viewer ? 'Notify an admin' : 'Reconnect', onClick: () => { if (viewer) { if (simple.value) toast("We've told your admin"); else toast('Admin notified', 'Reconnect request sent.') } else state.modal = 'connect' },
    })
  }
  // No setup-incomplete banner. The day-7 connect nudge is a popover on the toolbar's
  // Connect socials button (SocialListening.vue); the competitor ask lives in its own card.
  return list
})

// HLAlert carries the tone, icon and surface; this only maps our tone names onto its colours.
const COLOR = { info: 'blue', warning: 'orange', error: 'red' }
</script>

<template>
  <div v-if="banners.length" class="flex flex-col gap-2.5">
    <HLAlert
      v-for="(b, i) in banners" :key="b.title"
      :id="`dashboard-banner-${i}`"
      type="alert"
      :color="COLOR[b.tone]"
      :role="b.tone === 'error' ? 'alert' : 'status'"
      :closable="false"
      width="100%"
      max-width="100%"
      :title="b.title"
      :content="b.body"
    >
      <template #alertActions>
        <div class="mt-2">
          <HLButton :id="`dashboard-banner-${i}-action`" variant="secondary" size="sm" @click="b.onClick">{{ b.action }}</HLButton>
        </div>
      </template>
    </HLAlert>
  </div>
</template>
