<script setup>
// Insights, top level. Quick search folded into this tab on 30 Sep: one search, one list of
// saved topics, and one detail view behind both.
//
// Until something is saved the page is only the search, a little above centre. The first
// save changes it for good: the search moves to the top and the saved topics fill the page.
// A search or a topic opens TopicDetail, whose Back returns here.
import { ref, computed, watch } from 'vue'
import { SearchMdIcon } from '@gohighlevel/ghl-icons/24/outline'
import { nicheSuggestions } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'
import TopicsList from './TopicsList.vue'
import ExploreStarter from './ExploreStarter.vue'
import OverviewListening from './OverviewListening.vue'
import YourTopicsPage from './YourTopicsPage.vue'

const { state, account, search, runSearch, isSavedTerm, simple } = useSocialListening()

const topics = computed(() => state.topicsByAccount[state.accountId] || [])
const hasTopics = computed(() => topics.value.length > 0)
const pending = computed(() => search.value.pending)

const query = ref(search.value.term || '')
watch(() => search.value.term, (t) => { if (t) query.value = t })

// From the niche, and without anything already saved: offering a chip for a topic you are
// already tracking would open a search for something one row below.
const chips = computed(() => nicheSuggestions(account.value.space).filter((c) => !isSavedTerm(c)))

function go(term = query.value) {
  if (pending.value || !term.trim()) return
  query.value = term
  runSearch(term)
}
</script>

<template>
  <!-- Simplified, nothing saved: the 7 Oct search over a blurred preview (8 Oct) -->
  <ExploreStarter v-if="simple && !hasTopics" />

  <!-- 23 Oct (Sujith, Shivam): Explore is the home for searches and topics. The 21 Oct search
       block (Search, Create a topic, five trending keywords) on top, every topic below. -->
  <div v-else-if="simple" id="explore-home" class="flex flex-col gap-8">
    <OverviewListening :intro="false" :tiles="false" wrap />
    <section id="explore-topics" class="flex flex-col gap-4" aria-labelledby="explore-topics-title">
      <HLText id="explore-topics-title" html-tag="h2" size="lg" weight="semibold" class="text-gray-900">Your topics</HLText>
      <YourTopicsPage />
    </section>
  </div>

  <!-- At least one topic: search on top, topics below -->
  <div v-else-if="hasTopics" class="flex flex-col gap-8 pt-2">
    <!-- 14 Oct (7B): in the simplified design this is "See all topics"; search lives on the page. -->
    <div v-if="!simple" class="flex flex-col gap-3">
      <div class="flex gap-2">
        <div class="flex-1">
          <HLInput
            id="insights-search" v-model="query" size="md" clearable :show-count="!simple" :maxlength="100"
            :disabled="pending" :prefix-icon="SearchMdIcon"
            placeholder="Search a brand, topic, person or hashtag"
            @keydown.enter="go()"
          />
        </div>
        <HLButton variant="primary" color="blue" size="md" :disabled="!query.trim() || pending" :loading="pending" @click="go()">
          {{ pending ? 'Searching' : 'Search' }}
        </HLButton>
      </div>
      <HLText v-if="pending" size="md" class="text-gray-500" role="status">
        Checking Facebook, Instagram, LinkedIn, X, Reddit and YouTube
      </HLText>
      <div v-else-if="chips.length" class="flex items-center flex-wrap gap-2">
        <HLText html-tag="span" size="md" class="text-gray-500">Try:</HLText>
        <HLTag v-for="c in chips" :key="c" size="md" interactive @click="go(c)">{{ c }}</HLTag>
      </div>
    </div>

    <TopicsList />
  </div>

  <!-- Nothing saved: the search is the whole page -->
  <div v-else class="flex flex-col items-center pt-18 pb-30">
    <div class="w-full max-w-170 flex flex-col gap-3.5">
      <div class="text-center">
        <HLText html-tag="h2" size="2xl" weight="semibold" class="text-gray-900">What do you want to hear about?</HLText>
        <HLText size="lg" class="text-gray-600 mt-1.5!">Search any brand, topic, person or hashtag across six platforms. Save it and we'll keep listening.</HLText>
      </div>
      <div class="flex gap-2">
        <div class="flex-1">
          <HLInput
            id="insights-search" v-model="query" size="lg" clearable show-count :maxlength="100"
            :disabled="pending" :prefix-icon="SearchMdIcon" autofocus
            placeholder="Search a brand, topic, person or hashtag"
            @keydown.enter="go()"
          />
        </div>
        <!-- lg, to stand the same height as the lg field beside it. -->
        <HLButton variant="primary" color="blue" size="lg" :disabled="!query.trim() || pending" :loading="pending" @click="go()">
          {{ pending ? 'Searching' : 'Search' }}
        </HLButton>
      </div>
      <!-- No HLSpin here: the Search button beside it is already spinning, and two spinners
           for one wait read as two things loading. -->
      <HLText v-if="pending" size="md" class="text-gray-500 text-center" role="status">
        Checking Facebook, Instagram, LinkedIn, X, Reddit and YouTube
      </HLText>
      <div v-else-if="chips.length" class="flex items-center justify-center flex-wrap gap-2">
        <HLText html-tag="span" size="md" class="text-gray-500">Try:</HLText>
        <HLTag v-for="c in chips" :key="c" size="md" interactive @click="go(c)">{{ c }}</HLTag>
      </div>
    </div>
  </div>
</template>
