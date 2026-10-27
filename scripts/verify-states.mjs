// Renders the real page through Vue's SSR renderer for every reachable state.
// Grepping the bundle proves markup shipped; it cannot prove the template renders. This
// catches the class of fault that took Quick search blank — a v-if chain falling through to
// a branch that dereferences a null result.
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createServer } from 'vite'
import { execSync } from 'node:child_process'

const HL_NAMES = [...new Set(
  execSync("grep -rhoE '<HL[A-Za-z]+' src/ | sort -u", { encoding: 'utf8' })
    .split('\n').filter(Boolean).map((s) => s.slice(1)),
)]

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const Page = (await vite.ssrLoadModule('/src/pages/SocialListening.vue')).default
const { useSocialListening } = await vite.ssrLoadModule('/src/composables/useSocialListening.js')
const { quickSearchResult } = await vite.ssrLoadModule('/src/data/socialListening.js')

// analyze() runs a 1.56s setup animation and the page shows a spinner until it lands. Driving
// the real function and waiting for it is the only way to reach the states behind it — setting
// the space directly would skip the very clearing analyze() does on the way out.
const setNiche = async (sl, space) => {
  sl.analyze(space)
  // Poll rather than sleep 1.7s a state: 50 fixed waits is a minute and a half of the run
  // spent doing nothing, and a fixed wait also silently passes if the timing ever changes.
  const until = Date.now() + 5000
  while (sl.state.analyzing && Date.now() < until) await new Promise((r) => setTimeout(r, 20))
  if (sl.state.analyzing) throw new Error('analyze() never settled')
}

// Highrise installs browser-side; every HL* name becomes a transparent wrapper so the only
// thing under test is our own templates.
const HLStub = { inheritAttrs: false, setup: (_, { slots }) => () => h('div', slots.default ? slots.default() : []) }

// Keys, not labels. The Quick search tab is 'search' — driving it by the label rendered an
// empty tab for every state and looked exactly like the blank-screen fault being tested for.
const TABS = ['overview', 'search', 'insights', 'trends', 'competitors']
const SPACE = 'Restaurants & Food'

const STATES = {
  'blank slate': async (sl) => { sl.resetAccount() },
  'mid-analysis': async (sl) => { sl.resetAccount(); sl.analyze(SPACE) },
  'niche, nothing else': async (sl) => { sl.resetAccount(); await setNiche(sl, SPACE) },
  'searched, not saved': async (sl) => {
    sl.resetAccount(); await setNiche(sl, SPACE)
    const s = sl.ensureSearch(); s.result = quickSearchResult('brunch', 'last-30', SPACE); s.used = 1
  },
  'search returned nothing': async (sl) => {
    sl.resetAccount(); await setNiche(sl, SPACE)
    const s = sl.ensureSearch(); s.result = quickSearchResult('zzzzqq', 'last-30', SPACE); s.used = 1
  },
  'pending search': async (sl) => {
    sl.resetAccount(); await setNiche(sl, SPACE)
    const s = sl.ensureSearch(); s.pending = true; s.result = null
  },
  'topic saved, search cleared': async (sl) => {
    sl.resetAccount(); await setNiche(sl, SPACE)
    sl.createTopic({ title: 'Brunch', term: 'brunch', keywords: ['brunch'], nets: ['instagram'], silent: true })
  },
  'topic saved, result open': async (sl) => {
    sl.resetAccount(); await setNiche(sl, SPACE)
    sl.createTopic({ title: 'Brunch', term: 'brunch', keywords: ['brunch'], nets: ['instagram'], silent: true })
    const s = sl.ensureSearch(); s.result = quickSearchResult('brunch', 'last-30', SPACE); s.used = 1
  },
  'last topic deleted': async (sl) => {
    sl.resetAccount(); await setNiche(sl, SPACE)
    sl.createTopic({ title: 'Brunch', term: 'brunch', keywords: ['brunch'], nets: ['instagram'], silent: true })
    sl.removeTopic('Brunch')
  },
  'day 45 dip': async (sl) => { sl.resetAccount(); await setNiche(sl, SPACE); sl.setDay(45) },
  'day 90': async (sl) => { sl.resetAccount(); await setNiche(sl, SPACE); sl.setDay(90) },
  'competitors tracked': async (sl) => {
    sl.resetAccount(); await setNiche(sl, SPACE)
    sl.addCompetitor('Luster'); sl.addCompetitor('Harbour'); sl.addCompetitor('Nine Yards'); sl.addCompetitor('Overflow')
  },
}

const failures = []
const lengths = []
for (const tab of TABS) {
  for (const [name, mutate] of Object.entries(STATES)) {
    const label = `${tab} / ${name}`
    const app = createSSRApp({ setup: () => () => h(Page) })
    app.config.warnHandler = () => {}
    for (const n of HL_NAMES) app.component(n, HLStub)
    const sl = useSocialListening()
    try {
      await mutate(sl); sl.state.tab = tab
      // The composable is a module singleton, so toasts raised by one state's setup are still
      // on screen for the next. Left in, they pad every render and the length check measures
      // the toast stack rather than the tab.
      sl.state.toasts.splice(0)
      sl.state.modal = null
    } catch (e) { failures.push(`${label}: SETUP — ${e.message}`); continue }
    let html = ''
    try { html = await renderToString(app) } catch (e) { failures.push(`${label}: THREW — ${e.message}`); continue }
    // A tab that renders an empty shell is the blank screen, and it throws nothing.
    // The page header renders on every tab, so measuring the whole document would let an
    // empty tab body pass. Strip everything up to and including the tab strip first.
    const afterTabs = html.split('Competitor landscape').pop()
    const body = afterTabs.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    lengths.push(`${label}: ${body.length} :: ${body.slice(0, 90)}`)
    if (body.length < 80) failures.push(`${label}: tab body is ${body.length} chars — "${body.slice(0, 80)}"`)
  }
}

if (process.env.SHOW_LENGTHS) console.log(lengths.join('\n'))
console.log(failures.length ? failures.join('\n') : `all ${TABS.length * Object.keys(STATES).length} states rendered`)
await vite.close()
process.exit(failures.length ? 1 : 0)
