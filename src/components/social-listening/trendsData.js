// 19 Oct: trends for the Overview card and the Trends page. The feed has volumes only, so the
// weekly change and the 7-day shape are sample figures until the source provides them.
import { GoogleIcon } from '@gohighlevel/ghl-icons/24/misc'
import { Globe01Icon } from '@gohighlevel/ghl-icons/24/outline'
import { platformTrends, fmtNum } from '../../data/socialListening.js'
import { NETWORK_ICONS } from './networkIcons.js'

export const SOURCE_ICONS = { google: GoogleIcon, pinterest: NETWORK_ICONS.pinterest, youtube: NETWORK_ICONS.youtube, wikipedia: Globe01Icon }
export const PLATFORMS = [
  { key: 'google', label: 'Google' }, { key: 'pinterest', label: 'Pinterest' },
  { key: 'wikipedia', label: 'Wikipedia' }, { key: 'youtube', label: 'YouTube' },
]
const SHORT = { google: 'Google', pinterest: 'Pinterest', wikipedia: 'Wikipedia', 'yt-videos': 'YouTube videos', 'yt-channels': 'YouTube channels', 'yt-keywords': 'YouTube searches' }
const LONG = { 'yt-videos': 'YouTube trending videos', 'yt-keywords': 'YouTube popular searches' }
const hash = (t) => [...t].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)

// 27 Oct (developers): each source returns 50 trends. Past the first 12 these are sample terms.
const MORE_TERMS = [
  'Winter skincare routine', 'Budget meal prep', 'Home workout plan', 'Small business ideas', 'Holiday gift guide', 'Easy weeknight dinners',
  'Remote work setup', 'Minimalist living', 'Sourdough starter', 'Pet adoption tips', 'Electric car charging', 'Mortgage rates today',
  'Wedding guest outfits', 'Indoor plant care', 'Travel packing list', 'Side hustle ideas', 'Kids science projects', 'Coffee shop near me',
  'Morning stretch routine', 'Thrift store finds', 'Garage organization', 'First home checklist', 'Weekend road trips', 'Meal kit reviews',
  'Phone photography tips', 'Desk plant ideas', 'Sleep hygiene', 'Running shoes guide', 'Local farmers market', 'Smart home gadgets',
  'Book club picks', 'Budget travel tips', 'Kitchen remodel ideas', 'Hiking trails nearby', 'Self care Sunday', 'Productivity apps',
  'Christmas markets', 'Yoga for beginners', 'Cozy fall recipes', 'New year goals', 'Back to school deals', 'Spring cleaning hacks',
]
function toFifty(rows) {
  if (rows.length >= 50) return rows.slice(0, 50)
  const last = rows[rows.length - 1]?.value || 100000
  const seen = new Set(rows.map((r) => r.term))
  const extra = MORE_TERMS.filter((t) => !seen.has(t)).slice(0, 50 - rows.length)
  return [...rows, ...extra.map((term, i) => ({ term, value: Math.round(last * Math.pow(0.95, i + 1)), isNew: (i * 5) % 7 < 2, sample: true }))]
}
export function trendSources(rangeKey) {
  return platformTrends(rangeKey).sources.map((s) => ({
    key: s.key, label: LONG[s.key] || s.label, short: SHORT[s.key] || s.label, unit: s.unit, platform: s.icon,
    rows: toFifty(s.rows).map((r) => {
      const h = hash(r.term)
      const change = 8 + (h % 160)
      const base = r.value / 7
      return {
        ...r, change, unit: s.unit,
        series: Array.from({ length: 7 }, (_, d) => Math.round(base * (0.55 + d * (0.06 + change / 2000) + ((h >> d) % 5) / 40))),
      }
    }),
  }))
}
export function shortNum(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1e3) return Math.round(n / 1e3) + 'K'
  return fmtNum(n)
}
export function sparkPath(d, w = 120, h = 28) {
  if (!d || d.length < 2) return { line: '', area: '' }
  const mx = Math.max(...d), mn = Math.min(...d), rg = mx - mn || 1
  const pts = d.map((v, i) => [(i / (d.length - 1)) * w, h - 3 - ((v - mn) / rg) * (h - 6)])
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  return { line, area: `${line} L${w},${h} L0,${h} Z` }
}
