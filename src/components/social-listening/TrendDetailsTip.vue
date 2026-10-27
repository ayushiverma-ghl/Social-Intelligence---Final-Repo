<script setup>
// 28 Oct (Ayushi, from the live product): hovering a trend's name shows what the API gives for it,
// weekly / monthly / yearly growth and the top regions, in HighRise's dark tooltip (option A).
// Sample figures until the source provides them (trendsData.js).
import { computed } from 'vue'

const props = defineProps({ row: { type: Object, required: true } })
const d = computed(() => props.row.details || {})
const pct = (v) => (v == null ? '–' : `${v >= 0 ? '+' : '−'}${Math.abs(v).toLocaleString('en-US')}%`)
</script>

<template>
  <HLTooltip trigger="hover" placement="top-start" variant="dark" :show-arrow="true">
    <template #trigger><slot /></template>
    <span class="sl-trend-tip">
      <span class="sl-trend-tip-title">{{ row.term }}</span>
      <span class="sl-trend-tip-row"><span>Weekly growth</span><b>{{ row.isNew ? 'New this week' : pct(d.weekly) }}</b></span>
      <span class="sl-trend-tip-row"><span>Monthly growth</span><b>{{ pct(d.monthly) }}</b></span>
      <span class="sl-trend-tip-row"><span>Yearly growth</span><b>{{ pct(d.yearly) }}</b></span>
      <template v-if="d.regions && d.regions.length">
        <span class="sl-trend-tip-label">Top regions</span>
        <span v-for="r in d.regions" :key="r.name" class="sl-trend-tip-row"><span>{{ r.name }}</span><b>{{ r.score }}</b></span>
      </template>
    </span>
  </HLTooltip>
</template>

<style scoped>
/* Inside HighRise's dark tooltip: the name, then label / figure rows, 13px, figures right-aligned. */
.sl-trend-tip { display: flex; flex-direction: column; gap: 4px; min-width: 200px; max-width: 280px; font-size: 13px; line-height: 18px; text-align: left; white-space: normal; }
.sl-trend-tip-title { font-weight: 600; margin-bottom: 4px; }
.sl-trend-tip-row { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; }
.sl-trend-tip-row span { opacity: .8; }
.sl-trend-tip-row b { font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
.sl-trend-tip-label { opacity: .8; margin-top: 4px; }
</style>
