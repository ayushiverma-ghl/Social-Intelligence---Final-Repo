<script setup>
// After a niche is picked: the orbit loader (O1, 7 Oct loader review), the same one Create
// topic plays. Five lines, one per 500ms tick; analyze() hands off at 3s.
import { computed } from 'vue'
import { useSocialListening } from '../../composables/useSocialListening.js'
import OrbitLoader from './OrbitLoader.vue'

const { state } = useSocialListening()

// "Niche", not "category": niche is the word the picker, the pill and every card use.
const LINES = [
  'Matching to a tracked industry…',
  'Pulling the last 30 days of conversation…',
  'Ranking trends and competitors…',
  'Finding what works in your industry…',
  'Building your overview…',
]
const title = computed(() => `Setting up “${state.analyzing.space}”`)
</script>

<template>
  <OrbitLoader :title="title" :lines="LINES" />
</template>
