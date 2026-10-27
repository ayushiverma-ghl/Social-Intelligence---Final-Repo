<script setup>
import { computed, h, resolveComponent } from 'vue'
import { ChevronDownIcon } from '@gohighlevel/ghl-icons/24/outline'
import { ACCOUNTS } from '../../data/socialListening.js'
import { useSocialListening } from '../../composables/useSocialListening.js'

const { account, acct, selectAccount } = useSocialListening()
const HLText = resolveComponent('HLText')

// HLDropdown in place of the hand-built menu: `header` for the count, `avatar` rows so the
// initials come from HLAvatar, and the status on the right through titleRightSlot.
// "Disconnected" rather than "Reconnect": the column says what state the account is in, and
// reconnecting is the action the banner on that account offers.
const STATUS = {
  setup: ['Needs setup', 'text-warning-strong'],
  stale: ['Disconnected', 'text-negative-strong'],
  ready: ['Ready', 'text-gray-500'],
}

const options = computed(() => [
  { key: 'header', type: 'header', label: `${ACCOUNTS.length} client accounts` },
  ...ACCOUNTS.map((a) => {
    const full = acct(a.id)
    const [label, cls] = STATUS[!full.space ? 'setup' : full.stale ? 'stale' : 'ready']
    return {
      key: full.id,
      type: 'avatar',
      label: full.name,
      selected: full.id === account.value.id,
      titleRightSlot: () => h(HLText, { htmlTag: 'span', size: 'sm', weight: 'medium', class: `shrink-0 ${cls}` }, () => label),
    }
  }),
])
</script>

<template>
  <HLDropdown
    id="account-switcher"
    :options="options"
    trigger="click"
    placement="bottom-start"
    :width="320"
    max-height="360px"
    :show-search="false"
    @select="(key) => selectAccount(key)"
  >
    <HLButton id="account-switcher-trigger" variant="secondary" size="xs">
      <span class="flex items-center gap-2">
        <HLAvatar :name="account.name" size="2xs" />
        {{ account.name }}
      </span>
      <template #iconRight><ChevronDownIcon /></template>
    </HLButton>
  </HLDropdown>
</template>
