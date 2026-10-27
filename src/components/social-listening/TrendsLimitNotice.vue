<script setup>
// 19 Oct: at 50 topics, one notice where trends are listed, instead of a tooltip on every row.
// One line, the same strip the insights pop-up shows.
import { TOPIC_SHOWN_LIMIT } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'
const { state } = useSocialListening()
// 23 Oct: topics live on the Explore tab.
function manage() { state.trendsPage = false; state.peekTopic = null; state.peekSearch = null; state.trendsPeek = false; state.tab = 'insights' }
</script>

<template>
  <!-- Round 7: HighRise HLAlert (orange, as on Your topics), not a hand-built strip. -->
  <HLAlert
    id="trends-limit" type="alert" color="orange" :closable="false" width="100%" max-width="100%" role="status"
    :title="`You’re listening to all ${TOPIC_SHOWN_LIMIT} topics.`" content="Stop listening to one to add a new trend."
  >
    <template #alertActions>
      <div class="mt-2">
        <HLButton id="trends-limit-manage" variant="text" color="orange" size="xs" @click="manage">Manage topics</HLButton>
      </div>
    </template>
  </HLAlert>
</template>
