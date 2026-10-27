import { reactive, computed, ref } from 'vue'
import { ACCOUNTS, SPACES, spaceOf, spaceInText, DAYS, JOURNEY, RANGES, FORMATS, FORMAT_COPY, NETWORKS, fmtNum, midSentence, sentimentReading, quickSearchResult, nicheSuggestions, LISTENING_SOURCES, TOPIC_SHOWN_LIMIT } from '../data/socialListening.js'

// Four, agreed on the 28 Sep call. Shivam: "let's stick to 4." Sujith: "maximum of 4."
export const MAX_COMPETITORS = 4

// Sujeet's prototype (5 Oct) runs two designs side by side: "current" (this product as it was)
// and "simplified" (his redesign). /new or ?design=simplified opens the simplified one.
// 27 Oct (developers): one design only. Every URL opens the final design, so an old link or a
// missing /new can't land anyone on an earlier version.
function designFromUrl() { return 'simplified' }
// How the Topics tab reads before anything is saved: 'gradient', 'cards' or 'basic' (the Demo
// panel's three versions, 7 Oct), or 'suggestions', reachable by URL only.
const EXPLORE_MODES = ['gradient', 'cards', 'basic', 'suggestions']
function exploreFromUrl() {
  try {
    const mode = new URLSearchParams(window.location.search).get('explore')
    return EXPLORE_MODES.includes(mode) ? mode : 'gradient'
  } catch { return 'gradient' }
}
// The simplified design tracks three competitors; the current one four.
export function maxCompetitorsFor(design) { return design === 'simplified' ? 3 : 4 }

// Module-scoped singleton: every component that calls useSocialListening()
// shares the same reactive state, so this behaves like a tiny store without
// pulling in a state-management dependency for one page's worth of demo state.
const state = reactive({
  design: designFromUrl(),
  explore: exploreFromUrl(),
  // Every load opens on day 0, the state Reset leaves behind (30 Sep): the zero state is the
  // first thing a reviewer sees, and picking a niche walks them into the journey from there.
  day: 0,
  // 21 Oct (Ayushi): no one-time tips anywhere (the industry and Start listening tips are gone).
  // 19 Oct: Your topics, one level in from the Overview.
  topicsPage: false,
  // 19 Oct: Trending everywhere, one level in from the Overview.
  trendsPage: false,
  // 19 Oct (option E): Trending everywhere in the insights pop-up, opened from View all.
  trendsPeek: false,
  trendsPeekSource: 'google',
  // 19 Oct (option D): every topic in the industry, one level in from Industry trends.
  industryPage: false,
  // 19 Oct: the topic waiting on a Stop listening confirmation.
  confirmStop: null,
  // 19 Oct: Create alert inside the pop-up, picked from Demo controls. 'flyout' or 'form'.
  alertLayout: 'flyout',
  // 19 Oct: the Mentions card's layout, picked from Demo controls. 'compare', 'platforms' or 'tabs'.
  // 21 Oct: Tabs (the line graph) is the default.
  mentionsLayout: 'tabs',
  // 21 Oct review picks, switchable from the review guide in Demo controls:
  // 16 the Mentions | Industry trends row: 'half' (Halves) or 'third' (Mentions a third).
  mentionsSize: 'half',
  // 15 the tabs: 'compare' (c15 V2 tab cells) or 'compact' (c15 V3 underline tabs).
  // 21 Oct round 2: V3 Compact tabs is the default (with Halves, % on right and 12px cards).
  mentionsTabs: 'compact',
  // 17 Trending everywhere, one row per source ranked by weekly change: 1 change in the sub
  // line, 2 with rank numbers, 3 change on the right.
  trendsStyle: 3,
  // 19 the trends pop-up's small cards: top and bottom padding in px (12, 10 or 8).
  trendCardPad: 12,
  showTiles: false, // the three glance cards, off by default as agreed on the review call
  // Day 30 has two versions: the baseline, and the month where nothing took. Only day 30
  // carries an `alt`, so this is inert on every other beat and survives a trip through them.
  accountId: 'maya',
  tab: 'overview', // overview | insights | trends | competitors
  range: 'last-7', // which window is shown — independent of `day`, which is account age
  view: 'dashboard', // dashboard | triage | recipient | archive
  role: 'admin', // admin | viewer
  // No control for this any more — the Week switch retired with the journey. TriageTable
  // still reads it, so it stays as state and the quiet-week empty state is now unreachable.
  quietWeek: false,
  format: 'carousel',
  overrides: { // { [accountId]: { space, connected, competitor, stale } }
    // Maya is the account the page opens on, so she starts blank, exactly as resetAccount()
    // leaves her. The other clients keep their seeded setup, so switching client still lands
    // on a populated dashboard.
    maya: { space: null, connected: false, competitors: [], connectedNetworks: [], stale: false },
  },
  // No `volume` or `change` stored on a topic. They were invented at creation time while the
  // dashboard derived its own from quickSearchResult, so the list and the dashboard printed
  // different numbers for the same topic. One function owns those figures now.
  //
  // `term` is what the topic actually listens to. The title is only what you call it — which
  // is why renaming a saved search used to leave the page locked: the lock matched the title.
  // Empty on load: a saved topic would leave Insights off its zero state while every other
  // tab showed day 0, the same mismatch resetAccount() clears topics to avoid.
  topicsByAccount: {},
  bulk: [],
  // Quick search lives in shared state, not in the tab component, so a result survives a
  // trip to another tab. Deleting what someone spent one of three searches on, because
  // they clicked Insights, is not a thing to do to them.
  //
  // Keyed by account: this was one global object, so switching subaccounts carried the
  // previous account's result AND their spent searches across. A fresh account could open
  // with none of its three left.
  searches: {},
  // A topic the user asked to rename from somewhere that isn't the topics list.
  renameRequest: null,
  // 26 Oct: the topic being renamed from the page's "now listening" alert.
  renaming: null,
  // Which topic the Insights tab is showing, keyed by account. null means show the topics
  // list instead — Insights is the topics area, so its empty state is your topics, not a
  // sign pointing at another tab. Per-account for the same reason searches are: one global
  // value meant switching subaccounts left account A's topic open under account B.
  insightsTopics: {},
  // The topic detail view's section nav. The shell's vertical tabs read `detailSection` and
  // write `detailJump`; TopicDetail owns the scroll position and reconciles the two.
  detailSection: 'snapshot',
  detailJump: null,
  // Which sources the detail view is filtered to. `null` means all of them, which is not the
  // same as listing them: the available platforms change with the term, so storing the list
  // would leave a stale set selected the moment you open a different topic.
  //
  // It lives here rather than inside TopicSections because the back-toolbar dropdown and the
  // Messages pill row are two views of one filter, and two controls for one thing must not
  // be able to disagree.
  detailPlatforms: null,
  // Which topic a menu action is about, for the modals that act on one.
  alertTopic: null,
  // 27 Oct: the term whose Facebook sources setup is open (public Pages to monitor).
  fbSources: null,
  fbPagesBy: {},
  removeTopicTitle: null,
  modal: null,
  // WBR 12 Oct (5B): a saved topic opens in a side panel over whatever tab you're on.
  peekTopic: null,
  // 14 Oct (4C): a search or a trend opens in the same modal as a saved topic.
  peekSearch: null,
  askAI: null, // { prompt, topic } — set to open the Ask AI panel, null to close
  // Accounts that closed the day-7 connect popover. Per account, like searches: closing it
  // for one client shouldn't silence it for the next. The button's dot stays regardless.
  connectNudgeClosed: {},
  connectPick: null,
  connectLink: '',
  connectError: null,
  spaceDraft: '',
  compDraft: '',
  analyzing: null,
  // True while the topic detail view shows its listening loader; the vertical tabs read it.
  detailLoading: false,
  toasts: [],
  triageQuery: '',
  triageFilter: 'all',
  archiveAccountId: null,
  postCaption: '',
  postFormat: 'carousel',
  postNets: ['instagram'],
  // Which metric a glance tile opened the alert modal for; the modal preselects it.
  alertMetric: null,
  // Alerts per `${accountId}|${topic or account}`, up to three each.
  alertsBy: {},
  // Set when the alert modal is opened from an unsaved search: creating the alert saves it.
  alertSavesSearch: false,
  deliver: 'email',
  sent: null,
})

let toastId = 0

// Toasts render through HighRise's notification provider, which lives in HLContentWrap and can
// only be reached from a component's setup. The page registers a renderer here on mount; until
// then (and in the SSR state check, which has no provider) toasts queue in state.toasts.
let notifier = null
export function setNotifier(fn) { notifier = fn }

// Simplified toasts (8 Oct) name a network the short way: "X", not "X / Twitter".
const shortNet = (label) => (label === 'X / Twitter' ? 'X' : label)

export function useSocialListening() {
  function acct(id) {
    const base = ACCOUNTS.find((a) => a.id === (id || state.accountId)) || ACCOUNTS[0]
    const o = state.overrides[base.id] || {}
    return {
      ...base,
      space: 'space' in o ? o.space : base.space,
      connected: 'connected' in o ? o.connected : !!base.connected,
      competitors: 'competitors' in o ? o.competitors : (base.competitors || []),
      stale: 'stale' in o ? o.stale : !!base.stale,
      knownIndustry: 'knownIndustry' in o ? o.knownIndustry : base.knownIndustry,
      connectedNetworks: 'connectedNetworks' in o ? o.connectedNetworks : (base.connectedNetworks || []),
    }
  }

  const account = computed(() => acct())
  // out9 q01: a typed industry gets its own neutral profile instead of Home Maintenance & Trades.
  const spaceData = computed(() => spaceOf(account.value.space) || SPACES['Home Maintenance & Trades'])

  // Metrics now live on the beat in JOURNEY, next to the words written about them. Keeping
  // them apart is how a number and the sentence describing it drift.
  //
  // `sentiment` is a NET score on -100..+100, not a percentage. sentimentReading() reads
  // >= 45 as Mostly positive, >= 15 as Leaning positive, above -15 as Mixed. Values are set
  // so the READING changes at the beats where the story turns, because a fall that leaves
  // the words unchanged is a fall nobody notices. Day 45 crosses into Mixed, which is a
  // 34-point drop rather than the 14 I first pitched it at.
  //
  // `down` means mentions are falling, which drives the arrow and the chart shape. At day 45
  // mentions are UP and it is sentiment that drops, so `down` stays off there.
  // One beat per day. The struggle branch went with the account-level product — Sujith on
  // the 28 Sep call: "it is going to be directly a niche, no one will struggle." It was a
  // story about an account failing to land, and there is no account on these screens to fail.
  const beatFor = (day) =>
    JOURNEY.find((x) => x.day === day) || JOURNEY[JOURNEY.length - 1]

  function metricsFor(a, day) {
    const seed = a.id.charCodeAt(0) + a.id.length
    if (!a.space) return { mode: 'niche' }
    // Connecting an account is no longer a gate. The PM's note: "wrong assumption that users
    // can't use Social Listening without connecting." Everything on this page except the
    // account's OWN mentions is niche-level and never needed a connection — this line was
    // withholding all of it until one was made.
    const b = beatFor(day)
    if (!b.metrics) return { mode: 'niche' }
    // Enough per-account jitter that two clients never read identically, small enough that
    // the authored shape and the sentiment readings both survive it.
    return {
      mode: 'real',
      ...b.metrics,
      volume: b.metrics.volume + (seed % 7) * 3,
      sentiment: b.metrics.sentiment + (seed % 3),
      share: b.metrics.share + (seed % 3),
    }
  }

  const metrics = computed(() => metricsFor(account.value, state.day))
  const range = computed(() => RANGES.find((r) => r.key === state.range) || RANGES[0])
  // `period` is now a full phrase — "this week", "over the last 6 months" — so it drops
  // straight into a sentence without a preceding "this".
  const period = computed(() => range.value.phrase)

  // `nicheVolume` in the data file is a 30 day figure. Mentions has always scaled it to the
  // window; Industry trends and the AI card printed it raw and labelled it "in the last 7
  // days", so the same number appeared as 41,000 on one card and 11,392 on another for the
  // same week. One computed, used by all three, so they cannot drift again.
  const nicheWindowVolume = computed(() =>
    Math.round((spaceData.value.nicheVolume || 0) * Math.pow(range.value.days / 30, 0.88)))

  // The account's own mentions, derived from its share rather than authored beside it.
  // Both numbers used to exist: `volume` on the beat and `share` of the niche, and they
  // disagreed by up to five times because nothing tied them together. Share carries the
  // journey's arc and the copy leans on it, so volume follows share rather than the reverse.
  // 27 Oct (Ayushi): a new account is listened to from day one, so it has a small count of its own.
  const NEW_MENTIONS = 18
  const newFew = computed(() => state.design === 'simplified' && state.day === 0 && !!acct().space)
  const brandVolume = computed(() => (newFew.value ? NEW_MENTIONS :
    Math.round(nicheWindowVolume.value * ((metrics.value.share || 0) / 100))))

  // Movement against the beat before this one, derived the same way, so the figure and its
  // delta can never tell different stories. Null at the first beat, which has nothing behind it.
  const brandPrevVolume = computed(() => {
    const i = JOURNEY.findIndex((b) => b.day === state.day)
    const prev = i > 0 ? JOURNEY[i - 1] : null
    if (!prev || !prev.metrics || !metrics.value.share) return null
    return Math.round(nicheWindowVolume.value * ((prev.metrics.share || 0) / 100)) || null
  })
  // out9 q03: a fall that rounds to 100% while there are still mentions reads as "↓100%" and
  // divided last week by zero; it's held at 99%.
  const brandDelta = computed(() => {
    const prevVol = brandPrevVolume.value
    if (!prevVol) return null
    const d = Math.round(((brandVolume.value - prevVol) / prevVol) * 100)
    return brandVolume.value > 0 ? Math.max(-99, d) : d
  })

  const beat = computed(() => beatFor(state.day))

  // The journey's copy is templated so switching client or niche does not leave the prose
  // describing someone else's business. Every token resolves from data already on the page.
  function fillCopy(str) {
    if (!str) return ''
    const sd = spaceData.value
    const trends = sd.trends || []
    const comps = account.value.competitors || []
    const rows = competitorRows.value
    const leadRow = rows.comps.slice().sort((x, y) => y.value - x.value)[0]
    const map = {
      space: account.value.space ? spaceInText(account.value.space) : 'your niche',
      period: period.value,
      share: metrics.value.share || 0,
      nicheVolume: fmtNum(nicheWindowVolume.value),
      leader: leadRow ? leadRow.name : (comps[0] || 'the leader'),
      leaderShare: leadRow ? leadRow.value : 0,
      // Only Marketing names its own gripe; the other 20 niches fall back. The old fallback
      // was "the same few complaints", which rendered day 45 as "the complaints about the
      // same few complaints". A concrete noun phrase reads in both sentences that use it.
      watch: sd.watch || 'pricing and wait times',
      // The struggle beat quotes its own volume in prose and names the share it does not
      // hold. Both are figures already drawn on the page, so neither can disagree with one.
      volume: fmtNum(metrics.value.volume || 0),
      rest: 100 - (metrics.value.share || 0),
      // The niche's own sentiment reading, which is knowable on day 7 even when the account's
      // is not. It is the comparison no other card on the page can make.
      nicheReading: sentimentReading(sd.nicheSent || 0),
      // Your share expressed as a count rather than a percentage, so the share stat can say
      // something the sentence above it does not.
      yourSlice: fmtNum(brandVolume.value),
      topic1: midSentence(trends[0] ? trends[0].label : 'the top topic'),
      topic2: midSentence(trends[1] ? trends[1].label : 'that topic'),
      topic3: midSentence(trends[2] ? trends[2].label : 'that topic'),
    }
    // Capitalised variants for tokens that open a sentence. midSentence() lowercases the
    // label, which is right mid-clause and wrong as the first word: "behind-the-counter
    // clips are the second biggest topic" was starting a sentence lowercase.
    Object.keys(map).forEach((k) => {
      const v = map[k]
      if (typeof v === 'string' && v) map[k[0].toUpperCase() + k.slice(1)] = v[0].toUpperCase() + v.slice(1)
    })
    return str.replace(/\{(\w+)\}/g, (m, k) => (k in map ? String(map[k]) : m))
  }

  function completionFor(a) {
    const steps = [!!a.space, !!a.connected, !!(a.competitors && a.competitors.length)]
    return { pct: Math.round((steps.filter(Boolean).length / 3) * 100), steps }
  }
  // Rebase You + each tracked competitor + Others into shares that sum to 100%.
  // Shared, because the glance tile and the Competitors card must quote the same figure —
  // metrics.share is the raw number and is NOT what the card draws.
  // The tracked brands, rebased to 100% between themselves. No "you" row and no "everyone
  // else" — both went on the 28 Sep call.
  //
  // Sujith: "do we still have the U component in competitors?" — "No. No, no. You're going
  // to add 4 competitors, maximum."
  //
  // And the rebase is Shivam's: four brands can never be 100% of a niche, so the honest
  // thing is not to claim they are. "We might make it 100% amongst these four" — these
  // percentages are shares of the tracked set, which is why the card's unit line says so
  // rather than "of the conversation".
  //
  // Whether that rebase is what the backend can actually return is his answer tomorrow.
  // You plus the brands you track, rebased to 100% of that set.
  //
  // The "you" row came out on the 28 Sep call, on the grounds that competitors are a set you
  // chose rather than a league you are in. Sujith reversed that on the 30th: a leaderboard
  // always shows you, even when you are nowhere near the top, because "where am I" is the
  // question the card exists to answer. Four rows, you and three, as agreed on that call.
  //
  // "Everyone else" stays out. That was Shivam's call for a separate reason which still
  // holds: four brands cannot claim the rest of a niche between them.
  const competitorRows = computed(() => {
    const names = account.value.competitors || []
    if (!names.length) return { comps: [], you: 0 }
    // Seeded off the niche so a brand's share is stable per account rather than per render,
    // and spaced enough that the leader is visibly leading.
    const seed = [...(account.value.space || '')].reduce((n, ch) => n + ch.charCodeAt(0), 0)
    const compWeights = names.map((n, i) => Math.max(8, 40 - i * 9 + ((seed + n.length) % 7)))
    // Your weight tracks the journey, so climbing through the beats moves you up the board
    // rather than leaving you pinned at the bottom of it.
    const youWeight = Math.max(4, metrics.value.share || 8)
    const weights = [...compWeights, youWeight]
    const total = weights.reduce((sum, w) => sum + w, 0)
    let running = 0
    const pcts = weights.map((w, i) => {
      const pct = i === weights.length - 1 ? 100 - running : Math.round((w / total) * 100)
      running += pct
      return pct
    })
    return {
      comps: names.map((name, i) => ({ name, value: pcts[i] })),
      you: pcts[pcts.length - 1],
    }
  })

  const completion = computed(() => completionFor(account.value))

  // `actions` lets a toast carry undo. That matters where the alternative is a confirm
  // dialog: a modal asks everyone to approve something almost nobody changes, where undo
  // costs nothing and only the few who care ever reach for it.
  function toast(title, body, tone = 'positive', actions = null) {
    if (notifier) { notifier({ title, body, tone, actions }); return }
    const id = ++toastId
    state.toasts.push({ id, title, body, tone, actions })
    setTimeout(() => {
      const i = state.toasts.findIndex((t) => t.id === id)
      if (i > -1) state.toasts.splice(i, 1)
    }, actions ? 7000 : 3600)
  }

  // Refresh.
  //
  // Everything on this screen is derived from the term, the range and the niche, so there is
  // no request to re-issue and nothing can come back different. The button was asked for, so
  // it does the one true thing a refresh does when the data has not moved: it re-stamps the
  // time and says so. `refreshedAt` is the only state it owns, and the toolbar reads it.
  const refreshedAt = ref(Date.now())
  const refreshing = ref(false)
  let refreshTimer = null
  function refreshDetail() {
    if (refreshing.value) return
    refreshing.value = true
    clearTimeout(refreshTimer)
    refreshTimer = setTimeout(() => {
      refreshing.value = false
      refreshedAt.value = Date.now()
      if (state.design === 'simplified') toast("You're seeing the latest")
      else toast('Up to date', 'Nothing has changed since you opened this.')
    }, 700)
  }

  function dismissToast(id) {
    const i = state.toasts.findIndex((t) => t.id === id)
    if (i > -1) state.toasts.splice(i, 1)
  }

  function patchAccount(id, patch) {
    state.overrides[id] = { ...(state.overrides[id] || {}), ...patch }
  }

  // A client with no niche is at day 0 by definition: the dashboard renders the zero state
  // whatever the day says, so any other value is a number the screen never honours. The
  // journey list refuses those days too, and this is the backstop for every other route in.
  function setDay(day) {
    if (!account.value.space && day !== 0) return
    state.day = day
    if (day === 7 && !account.value.solo) state.view = 'triage'
    else state.view = 'dashboard'
    state.bulk = []
  }

  // The demo panel's account stages (Sujeet). Past day 0 an industry is needed, so one is picked;
  // day 0 clears it again, with its competitors.
  const STAGE_SPACE = { maya: 'Photography & Creative Media' }
  function setStage(day) {
    const id = state.accountId
    // 27 Oct: the first visit for an account with no industry on file, the "pick your niche" landing.
    if (day === 'landing') {
      patchAccount(id, { space: null, knownIndustry: null, competitors: [] })
      state.modal = null
      state.analyzing = null
      state.day = 0
      state.view = 'dashboard'
      state.tab = 'overview'
      return
    }
    // 15 Oct: in the one-page design the industry comes from the account, so New keeps it and
    // shows a just-started account instead of reopening the picker (which then landed on Growing).
    if (day === 0 && state.design === 'simplified') patchAccount(id, { space: acct(id).space || acct(id).knownIndustry || 'Marketing & Advertising', competitors: [] })
    else if (day === 0) patchAccount(id, { space: null, competitors: [] })
    else if (!acct(id).space) patchAccount(id, { space: STAGE_SPACE[id] || ACCOUNTS.find((a) => a.id === id)?.space || 'Marketing & Advertising' })
    state.modal = null
    state.analyzing = null
    state.day = day
    state.view = 'dashboard'
    state.bulk = []
  }
  const simple = computed(() => state.design === 'simplified')
  const maxCompetitors = computed(() => maxCompetitorsFor(state.design))

  function selectAccount(id) {
    state.accountId = id
    state.modal = null
    state.view = 'dashboard'
    if (!acct(id).space) state.day = 0
  }

  // The picker closes itself (show = false, then state.modal = null on after-leave) so its
  // leave animation plays; clearing state.modal here would unmount it mid-transition.
  function analyze(space) {
    const id = state.accountId
    state.analyzing = { space }
    state.spaceDraft = ''
    // 3s: the orbit loader's five 500ms ticks plus the reference's 500ms hand-off. The loader
    // keeps its own progress, so there is no step to bump here any more.
    // Only the account's first industry moves it on to Growing; changing it later keeps the stage.
    const firstPick = !acct(id).space
    setTimeout(() => {
      // Competitors are cleared with the niche. They are brands within an industry, so a
      // set picked for Restaurants is meaningless under Technology — and leaving them left
      // the modal showing three ticked restaurants above a list of software companies.
      const hadComps = (acct(id).competitors || []).length
      patchAccount(id, { space, competitors: [] })
      state.analyzing = null
      // Simplified (Sujit, 8 Oct): the first industry pick lands on Growing (day 15), not New.
      // Day 0 with an industry only says "too early to tell"; Growing shows it already working.
      // A later change of industry keeps whatever stage the account is on.
      if (state.design === 'simplified' && state.day === 0 && firstPick) state.day = 15
      if (state.design === 'simplified') toast(space + ' selected')
      else toast('Niche set to ' + space, hadComps
        ? 'Trends and ideas now match it. Add competitors for this niche when you are ready.'
        : 'Trends, competitors, and ideas now match it.')
      // No connect prompt on the way out. Setting a niche used to open the connect modal
      // 250ms later — the PM confirmed that is the "day zero modal" he wants gone, and it
      // followed from the assumption we have already dropped: that Social Listening needs a
      // connected account to be useful. It does not. Connecting is still offered by the
      // day-seven nudge, the Mentions card and the accounts modal, where it is asked for
      // rather than sprung.
    }, 3000)
  }

  function pickNetwork(n) {
    state.connectPick = n
    state.connectLink = ''
    state.connectError = null
  }

  // Returns true once connected. The modal closes itself on that, and clears the pick and the
  // link in its after-leave, so the leave animation plays and nothing leaks into the next open.
  function submitConnectLink() {
    const v = (state.connectLink || '').trim()
    if (!v) { state.connectError = 'Paste the profile link or handle before connecting.'; return false }
    if (state.connectPick.key === 'tiktok' && !state._tiktokRetried) {
      state._tiktokRetried = true
      state.connectError = 'TikTok declined the permission request. The account may not be a Business account. Try again, or pick another platform.'
      return false
    }
    const label = state.connectPick.label
    const nets = new Set(acct(state.accountId).connectedNetworks)
    nets.add(state.connectPick.key)
    patchAccount(state.accountId, { connected: true, stale: false, connectedNetworks: [...nets] })
    state.connectError = null
    if (state.design === 'simplified') toast(`${shortNet(label)}'s connected. Mentions will appear soon.`)
    else toast(label + ' connected', 'Brand mentions unlock as soon as data arrives.')
    return true
  }

  function addCompetitor(name) {
    if (!name) return
    const current = acct(state.accountId).competitors
    if (current.includes(name) || current.length >= maxCompetitors.value) return
    patchAccount(state.accountId, { competitors: [...current, name] })
    if (state.design === 'simplified') toast(`Now tracking ${name}`)
    else toast('Now watching ' + name, 'Share of conversation is tracked from today.')
  }
  function removeCompetitor(name) {
    const id = state.accountId
    const current = acct(id).competitors
    const i = current.indexOf(name)
    patchAccount(id, { competitors: current.filter((c) => c !== name) })
    // Undo puts it back in the same slot, unless the list has filled up or re-added it since.
    toast(...(state.design === 'simplified' ? [`Stopped tracking ${name}`, ''] : ['Competitor removed', `${name} is no longer tracked.`]), 'positive', [
      { label: 'Undo', run: () => {
        const now = acct(id).competitors
        if (now.includes(name) || now.length >= maxCompetitors.value) return
        const next = [...now]
        next.splice(Math.min(i, next.length), 0, name)
        patchAccount(id, { competitors: next })
      } },
    ])
  }

  function disconnectNetwork(key) {
    const id = state.accountId
    const current = acct(id).connectedNetworks
    const next = current.filter((n) => n !== key)
    patchAccount(id, { connectedNetworks: next, connected: next.length > 0 })
    const label = NETWORKS.find((n) => n.key === key)?.label || 'Account'
    toast(...(state.design === 'simplified' ? [`Disconnected ${shortNet(label)}`, ''] : [label + ' disconnected', 'You can reconnect it any time.']), 'positive', [
      { label: 'Undo', run: () => {
        const now = acct(id).connectedNetworks
        if (now.includes(key)) return
        patchAccount(id, { connectedNetworks: [...now, key], connected: true })
      } },
    ])
  }

  // Resets everything this account has: niche, connections, competitors, day, saved topics
  // and the current search.
  //
  // It used to keep topics and searches, on the grounds that they belong to the listening
  // work rather than the setup story and are expensive to lose mid-review. That was right
  // while Quick Search had one landing. It stopped being right once the tab gained a zero
  // state that only exists until the first topic is saved: a reset that left a topic behind
  // put the account back to day zero everywhere except the one screen built to show day
  // zero, which is the screen most likely to be demoed.
  function resetAccount(id) {
    const target = id || state.accountId
    // Everything reset clears, so Undo can put it back. Shallow copies are enough: nothing is
    // mutated in place after this point, the entries are replaced or deleted.
    const before = {
      override: state.overrides[target] ? { ...state.overrides[target] } : undefined,
      topics: state.topicsByAccount[target],
      search: state.searches[target],
      insights: state.insightsTopics[target],
      day: state.day,
      view: state.view,
    }
    patchAccount(target, { space: null, connected: false, competitors: [], connectedNetworks: [], stale: false })
    // Start over brings back the industry on file, so it never stays on the no-industry landing.
    delete state.overrides[target].knownIndustry
    delete state.topicsByAccount[target]
    delete state.searches[target]
    delete state.insightsTopics[target]
    delete state.connectNudgeClosed[target]
    state.modal = null
    if (target === state.accountId) {
      state.view = 'dashboard'
      // Reset used to leave the day alone, so resetting from day 45 put the screen back to
      // the zero state while the demo launcher still read "Day 45 · The dip".
      state.day = 0
    }
    // From the no-industry landing the page's own pick-up never re-runs (the industry was already
    // empty), so Start over puts the industry on file back itself, as a first visit would.
    const known = acct(target).knownIndustry
    if (state.design === 'simplified' && known) {
      patchAccount(target, { space: known })
      if (target === state.accountId) state.day = 15
    }
    toast(...(state.design === 'simplified' ? [`Started over for ${acct(target).short}`, ''] : ['Setup reset', acct(target).short + ' is back to a blank slate: niche, connections and saved topics all cleared.']), 'positive', [
      { label: 'Undo', run: () => {
        if (before.override) state.overrides[target] = before.override
        else delete state.overrides[target]
        for (const [bag, v] of [[state.topicsByAccount, before.topics], [state.searches, before.search], [state.insightsTopics, before.insights]]) {
          if (v !== undefined) bag[target] = v
        }
        if (target === state.accountId) { state.day = before.day; state.view = before.view }
      } },
    ])
  }

  const DEFAULT_SEARCH = { result: null, used: 0, pending: false, term: '' }
  // Read-only view; call ensureSearch() before writing so the entry exists.
  const search = computed(() => state.searches[state.accountId] || DEFAULT_SEARCH)
  function ensureSearch(id = state.accountId) {
    if (!state.searches[id]) state.searches[id] = { ...DEFAULT_SEARCH }
    return state.searches[id]
  }

  // Reads and writes the current account's open topic. A getter rather than a plain field so
  // every call site stays a one-liner while the storage is per-account underneath.
  const insightsTopic = computed({
    get: () => state.insightsTopics[state.accountId] || null,
    set: (v) => { state.insightsTopics[state.accountId] = v },
  })

  function removeTopic(title) {
    const list = state.topicsByAccount[state.accountId] || []
    const i = list.findIndex((t) => t.title === title)
    if (i < 0) return
    const [gone] = list.splice(i, 1)
    if (insightsTopic.value === title) insightsTopic.value = null
    toast(...(state.design === 'simplified' ? [`Stopped listening to “${title}”`, ''] : ['Topic removed', `“${title}” is no longer being tracked.`]), 'positive', [
      { label: 'Undo', run: () => list.splice(Math.min(i, list.length), 0, gone) },
    ])
  }

  // Paused keeps the topic and its history but stops collection, so it is the undoable
  // alternative to removing one.
  function togglePause(title) {
    const t = (state.topicsByAccount[state.accountId] || []).find((x) => x.title === title)
    if (!t) return
    t.paused = !t.paused
    if (state.design === 'simplified') toast(t.paused ? `Paused listening to “${t.title}”` : `“${t.title}” is back on`)
    else toast(t.paused ? 'Listening paused' : 'Listening resumed',
      t.paused ? `“${t.title}” keeps its history but stops collecting.` : `“${t.title}” is collecting again.`)
  }

  // ---- search: one path for the landing, Trends and the filter's "Search for it" ----
  let searchTimer = null
  function runSearch(term) {
    const t = (term || '').trim()
    if (!t) return
    const sc = ensureSearch()
    const fresh = !sc.result || sc.result.term !== t
    sc.pending = true
    sc.term = t
    clearTimeout(searchTimer)
    // The result is computed locally and lands at once, which real platforms won't. The beat
    // is the searching state: the field locks and the button spins before the detail opens.
    searchTimer = setTimeout(() => {
      const r = quickSearchResult(t, state.range, account.value.space)
      sc.result = r
      sc.pending = false
      state.detailSection = 'snapshot'
      if (fresh && !r.empty) sc.used += 1
    }, 900)
  }
  function clearSearch() {
    const sc = ensureSearch()
    clearTimeout(searchTimer)
    sc.result = null
    sc.pending = false
    sc.term = ''
  }
  function isSavedTerm(term) {
    const k = (term || '').trim().toLowerCase()
    return (state.topicsByAccount[state.accountId] || []).some((t) => (t.term || t.title).trim().toLowerCase() === k)
  }
  function saveSearchAsTopic() {
    const term = search.value.result?.term
    if (!term || isSavedTerm(term)) return
    // 19 Oct: 50 is the limit; the pop-up turns Start listening off there too.
    if ((state.topicsByAccount[state.accountId] || []).length >= TOPIC_SHOWN_LIMIT) return
    createTopic({ title: term, term, keywords: [term], nets: [], silent: true })
    toast(...(state.design === 'simplified' ? [`Now listening to “${term}”`, ''] : ['Saved as a topic', `We'll keep listening to “${term}”.`]), 'positive', [
      { label: 'Rename', run: () => { closeDetail(); state.renameRequest = term } },
      { label: 'Undo', run: () => removeTopicQuietly(term) },
    ])
  }
  // 14 Oct: one entry point for the insights modal. A term you already listen to opens as
  // that topic; anything else opens as a one-off search.
  function peek(term) {
    const t = (term || '').trim()
    if (!t) return
    const k = t.toLowerCase()
    const saved = (state.topicsByAccount[state.accountId] || []).find((x) => (x.term || x.title).trim().toLowerCase() === k)
    state.peekSearch = saved ? null : t
    state.peekTopic = saved ? saved.title : null
  }
  // The modal says what happened in place, so no toast on top of it.
  function listenTo(term) {
    if (!term || isSavedTerm(term)) return
    // 19 Oct: 50 is the limit; the pop-up turns Start listening off there too.
    if ((state.topicsByAccount[state.accountId] || []).length >= TOPIC_SHOWN_LIMIT) return
    createTopic({ title: term, term, keywords: [term], nets: [], silent: true })
  }
  function removeTopicQuietly(title) {
    const list = state.topicsByAccount[state.accountId] || []
    const i = list.findIndex((t) => t.title === title)
    if (i > -1) list.splice(i, 1)
  }

  // The Insights tab is two levels: the landing (search + saved topics) and one topic's
  // detail. A search result and a saved topic open the same detail; Back returns to the
  // landing. Which one is open is derived, so there is no third flag to fall out of step.
  const detail = computed(() => {
    if (state.tab !== 'insights') return null
    // Simplified opens the result page as soon as a search starts, and loads there.
    if (state.design === 'simplified' && search.value.pending && search.value.term) return { kind: 'search', term: search.value.term, title: search.value.term, pending: true }
    const r = search.value.result
    if (r) return { kind: 'search', term: r.term, title: r.term }
    const title = insightsTopic.value
    const t = title && (state.topicsByAccount[state.accountId] || []).find((x) => x.title === title)
    return t ? { kind: 'topic', term: t.term || t.title, title: t.title, topic: t } : null
  })
  function openTopic(title) {
    // 15 Oct (audit 6): the one-page design has no full page. A topic opens in the pop-up.
    if (state.design === 'simplified') { state.peekSearch = null; state.peekTopic = title; return }
    clearSearch()
    insightsTopic.value = title
    state.detailSection = 'snapshot'
    state.tab = 'insights'
  }
  function closeDetail() {
    clearSearch()
    insightsTopic.value = null
  }

  function renameTopic(title, next) {
    const t = (state.topicsByAccount[state.accountId] || []).find((x) => x.title === title)
    if (!t || !next.trim()) return
    t.title = next.trim()
    if (insightsTopic.value === title) insightsTopic.value = t.title
  }

  // `term` is what is listened to; `title` is only the label. `ignore` and `match` come from
  // step 2 of CreateTopicModal and are carried rather than read — nothing renders them yet,
  // but dropping them on the floor is how a field quietly stops working the day something does.
  // "Instagram and Facebook", "Instagram, Facebook and X", or a count past three.
  function listeningOn(nets) {
    const names = (nets.length ? nets : ['instagram']).map((k) => (LISTENING_SOURCES.find((n) => n.key === k) || { label: k }).label)
    if (names.length > 3) return `${names.length} networks`
    return names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
  }

  function createTopic({ title, term, keywords, nets, ignore = [], match = 'any', silent = false }) {
    const id = state.accountId
    const list = state.topicsByAccount[id] || []
    // out9 q04: the 50-topic limit holds here too (Create a topic went to 51 of 50).
    if (list.length >= TOPIC_SHOWN_LIMIT) return
    state.topicsByAccount[id] = [...list, {
      title, term: (term || title).trim(),
      keywords: keywords.length ? keywords : [title], nets: nets.length ? nets : ['instagram'],
      ignore, match, by: 'Jordan Reyes',
      // Made from the modal there is no search behind it yet, so the first hours are empty.
      created: 'Today', collecting: !silent,
      // When it was made, so the list can mark its arrival (7 Oct review, 3C).
      createdAt: silent ? null : Date.now(),
    }]
    // No state.modal = null: CreateTopicModal closes itself so its leave animation plays, and
    // the alert modal (which saves a search through here) moves on to its list instead of
    // vanishing mid-save.
    // 27 Oct: the prototype's stand-in for the first fetch. A few seconds after it is made the topic
    // has its first data, so its row fills in and can take an alert, as it would in the product.
    if (!silent) setTimeout(() => {
      const t = (state.topicsByAccount[id] || []).find((x) => x.title === title)
      if (t) t.collecting = false
    }, 6000)
    if (!silent && state.design === 'simplified') toast(`You’re now listening to “${title}”. Find it in Your topics.`)
    else if (!silent) toast('Topic created', `“${title}” is now listening on ${listeningOn(nets)}. First data in about an hour.`)
  }

  // Demo only: five saved topics, so Overview's topics section can be shown without saving
  // five searches by hand. Each was last refreshed at a different time, because a topic's
  // numbers only move when someone refreshes it or an alert runs (Shivam, 6 Oct: refreshes
  // cost money, so nothing refreshes on its own).
  const SEED_HOURS = [3, 26, 50, 7, 75]
  const SEED_FALLBACK = ['Short-form video', 'Pricing tips', 'Client results', 'Behind the scenes', 'Booking deposits']
  function seedTopics(on) {
    const id = state.accountId
    if (!on) {
      for (const t of state.topicsByAccount[id] || []) delete state.alertsBy[`${id}|${t.title}`]
      state.topicsByAccount[id] = []
      return
    }
    const terms = [...nicheSuggestions(account.value.space), ...SEED_FALLBACK].slice(0, 5)
    // Two carry an alert. An alert checks its topic daily, so those two are always fresh, and
    // the first one has just fired.
    const ALERTED = [0, 2]
    state.topicsByAccount[id] = terms.map((term, i) => ({
      title: term, term, keywords: [term.toLowerCase()], nets: ['instagram', 'facebook', 'x'],
      ignore: [], match: 'any', by: 'Jordan Reyes', created: `${i + 2} days ago`, collecting: false,
      alert: ALERTED.includes(i),
      refreshedAt: Date.now() - (ALERTED.includes(i) ? [2, 5][ALERTED.indexOf(i)] : SEED_HOURS[i]) * 3600e3,
      firedAt: i === 0 ? Date.now() - 2 * 3600e3 : null,
    }))
    ALERTED.forEach((i, n) => {
      if (!terms[i]) return
      state.alertsBy[`${id}|${terms[i]}`] = [{
        id: Date.now() + n, on: true, name: 'All metrics, daily', sensitivity: 'balanced', frequency: 'daily',
        metrics: ['volume', 'impressions', 'negative', 'positive', 'engagements', 'sov'], recipients: [], template: 'default',
      }]
    })
  }
  // Refreshing a topic is one fetch per topic, so it is always something someone asks for.
  function refreshTopics(titles) {
    const id = state.accountId
    const now = Date.now()
    state.topicsByAccount[id] = (state.topicsByAccount[id] || []).map((t) => (titles.includes(t.title) ? { ...t, refreshedAt: now } : t))
  }

  const formatCopy = computed(() => {
    const fc = FORMAT_COPY[state.format]
    const space = (account.value.space || 'your niche').toLowerCase()
    return {
      ...fc,
      // {period} so the post card follows the header range like every other section.
      insight: fc.insight.replace('{space}', space).replace('{period}', period.value),
      statUnit: fc.statUnit.replace('{space}', space),
    }
  })
  const bestFormat = FORMATS.slice().sort((a, b) => b.base - a.base)[0]

  return {
    state, ACCOUNTS, DAYS, FORMATS, NETWORKS, search, ensureSearch, insightsTopic, removeTopic, renameTopic, dismissToast, seedTopics, refreshTopics,
    togglePause, runSearch, clearSearch, isSavedTerm, saveSearchAsTopic, removeTopicQuietly, detail, openTopic, closeDetail, peek, listenTo,
    account, spaceData, metrics, range, period, RANGES, completion, competitorRows, formatCopy, bestFormat,
    nicheWindowVolume, brandVolume, brandDelta, brandPrevVolume,
    beat, fillCopy, refreshedAt, refreshDetail, refreshing,
    acct, toast, patchAccount, setDay, setStage, simple, maxCompetitors, selectAccount, analyze,
    pickNetwork, submitConnectLink, disconnectNetwork, addCompetitor, removeCompetitor, createTopic, resetAccount,
    fmtNum,
  }
}
