// Shared demo data for the Social Listening feature.
// Mirrors the product's own conceptual model: a "space" (industry category)
// supplies niche-wide benchmarks until an account has enough history of its own.

// Ordered by real-world prevalence (share of accounts on the platform).
// The first 6 are shown as tiles by default in the space picker; the rest
// live behind a "Show all 21 industries" expand, in the same tile style.
export const SPACES = {
  'Marketing & Advertising': {
    nicheVolume: 284000, nicheSent: 57, watch: 'retainer pricing and slow reporting',
    keywords: ['ai automation', 'lead gen funnels', 'client retainers', 'white label tools', 'cold email'],
    trends: [
      { label: 'Client results case studies', value: 79 },
      { label: 'Before/after ad creative', value: 41 },
      { label: 'Founder-led video', value: 23 },
    ],
    competitors: ['Bright Path Marketing', 'Ignite Digital Co.', 'Northstar Ad Group'],
  },
  'Real Estate & Property': {
    nicheVolume: 248000, nicheSent: 53,
    keywords: ['first-time buyers', 'open house reels', 'mortgage rates', 'staging tips', 'listing photos'],
    trends: [
      { label: 'Weekend open house tours', value: 63 },
      { label: 'First-time buyer breakdowns', value: 34 },
      { label: 'Rate-drop explainers', value: 18 },
    ],
    competitors: ['Beacon Realty Group', 'Harbor & Vale Homes', 'Meridian Property Co.'],
  },
  'Construction, Remodeling & Solar': {
    nicheVolume: 186000, nicheSent: 48,
    keywords: ['solar payback', 'permit delays', 'kitchen remodels', 'contractor quotes', 'heat pumps'],
    trends: [
      { label: 'Kitchen remodel time-lapses', value: 66 },
      { label: 'Solar payback breakdowns', value: 38 },
      { label: 'Permit-day explainers', value: 19 },
    ],
    competitors: ['Ridgeline Builders', 'SunCrest Solar', 'Anchor Construction Co.'],
  },
  'Coaching & Business Consulting': {
    nicheVolume: 173000, nicheSent: 60,
    keywords: ['group coaching', 'client results', 'discovery calls', 'pricing packages', 'niching down'],
    trends: [
      { label: 'Client win breakdowns', value: 74 },
      { label: 'Free-workshop replays', value: 36 },
      { label: 'Behind-the-scenes strategy calls', value: 21 },
    ],
    competitors: ['Ascend Coaching Group', 'Bright Trajectory Consulting', 'Summit Business Partners'],
  },
  'Medical & Healthcare': {
    nicheVolume: 171000, nicheSent: 46,
    keywords: ['wait times', 'patient portals', 'telehealth visits', 'insurance billing', 'same-day appointments'],
    trends: [
      { label: 'Patient FAQ series', value: 58 },
      { label: 'New-treatment explainers', value: 33 },
      { label: 'Meet-the-provider intros', value: 17 },
    ],
    competitors: ['Wellview Medical Group', 'Cornerstone Health Partners', 'Crestpoint Clinic'],
  },
  'Financial Services, Lending & Accounting': {
    nicheVolume: 152000, nicheSent: 44,
    keywords: ['tax deadlines', 'refinance rates', 'bookkeeping apps', 'small business loans', 'quarterly filings'],
    trends: [
      { label: 'Tax-season explainers', value: 55 },
      { label: 'Rate-change breakdowns', value: 29 },
      { label: 'Client-savings stories', value: 16 },
    ],
    competitors: ['Ledgerline Advisors', 'Northbridge Financial', 'Clearpoint Lending'],
  },
  'Home Maintenance & Trades': {
    nicheVolume: 140000, nicheSent: 39,
    keywords: ['emergency callouts', 'flat-rate pricing', 'water heaters', 'same-day service', 'drain cleaning'],
    trends: [
      { label: 'Same-day emergency callouts', value: 57 },
      { label: 'Winter pipe prep', value: 31 },
      { label: 'Flat-rate pricing posts', value: 16 },
    ],
    competitors: ['RapidFlow Services', 'Sterling Home Pros', 'Anchor Mechanical'],
  },
  'Fitness & Nutrition': {
    nicheVolume: 135000, nicheSent: 55,
    keywords: ['protein targets', 'strength programs', 'gym check-ins', 'meal prep', 'recovery days'],
    trends: [
      { label: '30-day mobility challenges', value: 69 },
      { label: 'Beginner lifting form', value: 37 },
      { label: 'Recovery-day routines', value: 20 },
    ],
    competitors: ['Forge Athletic Club', 'Basecamp Fitness Co.', 'Motion Lab'],
  },
  'Education & Training': {
    nicheVolume: 118000, nicheSent: 50,
    keywords: ['course completion', 'cohort learning', 'study routines', 'certification prep', 'tutoring rates'],
    trends: [
      { label: 'Free mini-course drops', value: 52 },
      { label: 'Student result stories', value: 28 },
      { label: 'Study-tips carousels', value: 14 },
    ],
    competitors: ['Brightline Academy', 'Pinnacle Training Co.', 'Keystone Learning Group'],
  },
  'Retail & E-commerce': {
    nicheVolume: 99000, nicheSent: 49,
    keywords: ['shipping times', 'restock alerts', 'bundle deals', 'returns policy', 'unboxing'],
    trends: [
      { label: 'Unboxing clips', value: 60 },
      { label: 'Restock countdowns', value: 32 },
      { label: 'Behind-the-label stories', value: 18 },
    ],
    competitors: ['Northgate Goods Co.', 'Harlow & Finch', 'Bramblewood Supply'],
  },
  'Automotive & Transportation': {
    nicheVolume: 96000, nicheSent: 45,
    keywords: ['ceramic coating', 'paint correction', 'detailing prices', 'ev servicing', 'tint laws'],
    trends: [
      { label: 'Ceramic coating results', value: 61 },
      { label: 'Paint-correction time-lapses', value: 35 },
      { label: 'Winter prep checklists', value: 19 },
    ],
    competitors: ['Apex Auto Studio', 'Gleam Detail Works', 'Torque & Shine'],
  },
  'Beauty, Salon & Spa': {
    nicheVolume: 95000, nicheSent: 58,
    keywords: ['balayage', 'glass skin', 'lash extensions', 'booking apps', 'walk-in slots'],
    trends: [
      { label: 'Glass-skin routines', value: 82 },
      { label: 'Balayage transformations', value: 41 },
      { label: 'Five-minute makeup', value: 22 },
    ],
    competitors: ['Luster Beauty Bar', 'Halo Salon Group', 'Tint & Tone Studio'],
  },
  'Photography & Creative Media': {
    nicheVolume: 89000, nicheSent: 54,
    keywords: ['wedding packages', 'editing presets', 'client galleries', 'booking deposits', 'natural light'],
    trends: [
      { label: 'Golden-hour session reels', value: 56 },
      { label: 'Client gallery reveals', value: 27 },
      { label: 'Behind-the-lens clips', value: 15 },
    ],
    competitors: ['Lumen & Frame Studio', 'Silverlight Creative', 'Northlight Photography'],
  },
  'Insurance': {
    nicheVolume: 73000, nicheSent: 38,
    keywords: ['premium hikes', 'claim delays', 'bundle discounts', 'coverage gaps', 'renewal quotes'],
    trends: [
      { label: 'Claim-story walkthroughs', value: 44 },
      { label: 'Bundle-savings explainers', value: 24 },
      { label: 'What-is-covered breakdowns', value: 13 },
    ],
    competitors: ['Guardpoint Insurance', 'Harborstone Coverage', 'Truenorth Assurance'],
  },
  'Technology & Software': {
    nicheVolume: 69000, nicheSent: 51,
    keywords: ['onboarding flows', 'api limits', 'pricing tiers', 'uptime', 'migration guides'],
    trends: [
      { label: 'Feature-launch demos', value: 65 },
      { label: 'Customer workflow walkthroughs', value: 30 },
      { label: 'Behind-the-build threads', value: 17 },
    ],
    competitors: ['Northline Software', 'Vertex Cloud Co.', 'Brightstack Technologies'],
  },
  'Mental Health & Wellness': {
    nicheVolume: 53000, nicheSent: 56,
    keywords: ['therapy waitlists', 'burnout', 'sliding scale', 'first session', 'journaling'],
    trends: [
      { label: 'Normalize-therapy posts', value: 71 },
      { label: 'Grounding-technique clips', value: 33 },
      { label: 'Practitioner Q&A', value: 18 },
    ],
    competitors: ['Clearmind Counseling', 'Harborview Therapy Group', 'Rooted Wellness Collective'],
  },
  'Events, Travel & Hospitality': {
    nicheVolume: 45000, nicheSent: 52,
    keywords: ['venue deposits', 'shoulder season', 'group rates', 'late checkout', 'itineraries'],
    trends: [
      { label: 'Behind-the-scenes setup reels', value: 59 },
      { label: 'Guest-experience recaps', value: 28 },
      { label: 'Off-season deal drops', value: 15 },
    ],
    competitors: ['Wayfarer Events Co.', 'Bluecrest Hospitality', 'Northshore Travel Group'],
  },
  'Dental': {
    nicheVolume: 43000, nicheSent: 44,
    keywords: ['clear aligners', 'whitening', 'insurance coverage', 'emergency slots', 'anxiety-free visits'],
    trends: [
      { label: 'Free whitening consults', value: 71 },
      { label: 'Invisalign before/after', value: 29 },
      { label: 'Anxious-patient tips', value: 14 },
    ],
    competitors: ['BrightGrin Dental Group', 'Cityline Smile Co.', 'Northside Orthodontics'],
  },
  'Restaurants & Food': {
    nicheVolume: 41000, nicheSent: 62, watch: 'queues and card machines',
    keywords: ['late-night orders', 'delivery fees', 'tasting menus', 'patio seating', 'weekend brunch'],
    trends: [
      { label: 'Seasonal drink drops', value: 88 },
      { label: 'Behind-the-counter clips', value: 44 },
      { label: 'Local sourcing stories', value: 25 },
    ],
    competitors: ['Copper Kettle Cafe', 'Field & Flour', 'Morning Order Co.'],
  },
  'Legal': {
    nicheVolume: 39000, nicheSent: 40,
    keywords: ['flat-fee quotes', 'consultation calls', 'case timelines', 'document prep', 'retainer terms'],
    trends: [
      { label: 'Know-your-rights explainers', value: 48 },
      { label: 'Small-claims walkthroughs', value: 26 },
      { label: 'Contract red flags', value: 15 },
    ],
    competitors: ['Wexford Legal', 'Bayline Attorneys', 'Kessler & Roe'],
  },
  'Non-profit, Religious & Community': {
    nicheVolume: 32000, nicheSent: 66,
    keywords: ['volunteer signups', 'giving campaigns', 'community events', 'impact reports', 'youth programs'],
    trends: [
      { label: 'Volunteer spotlight reels', value: 50 },
      { label: 'Fundraiser countdowns', value: 22 },
      { label: 'Community-impact stories', value: 12 },
    ],
    competitors: ['Riverside Community Fund', 'Hopewell Outreach', 'Cornerstone Volunteers'],
  },
}

// Trend values are authored as independent momentum scores; rescale each space's
// top 3 to read as "share of trending conversation" so the Industry Trend card's
// bars sum to 100% (largest-remainder rounding — last item absorbs any remainder).
Object.values(SPACES).forEach((space) => {
  const total = space.trends.reduce((sum, t) => sum + t.value, 0)
  let running = 0
  space.trends = space.trends.map((t, i) => {
    const pct = i === space.trends.length - 1 ? 100 - running : Math.round((t.value / total) * 100)
    running += pct
    return { ...t, value: pct }
  })
})

export const SPACE_NAMES = Object.keys(SPACES)

// out9 q01: a typed-in industry (Pet grooming, Kids dance classes) has no stocked profile. It used
// to borrow Home Maintenance & Trades, so a groomer saw "Winter pipe prep" and plumbers as
// suggested competitors. It now gets a neutral profile: the topics every local business shares,
// a modest volume seeded off the name, and no suggested competitors (we can't know them).
const CUSTOM_CACHE = new Map()
function customSpace(name) {
  if (CUSTOM_CACHE.has(name)) return CUSTOM_CACHE.get(name)
  const seed = [...String(name).toLowerCase()].reduce((n, c) => n + c.charCodeAt(0), 0)
  const sp = {
    custom: true,
    nicheVolume: 14000 + (seed % 9) * 2600,
    nicheSent: 46 + (seed % 14),
    keywords: ['booking online', 'price lists', 'gift cards', 'seasonal offers', 'local events'],
    trends: [
      { label: 'Before and after results', value: 50 },
      { label: 'Customer reviews', value: 31 },
      { label: 'How-to tips', value: 19 },
    ],
    competitors: [],
  }
  CUSTOM_CACHE.set(name, sp)
  return sp
}
export function spaceOf(name) {
  if (!name) return null
  return SPACES[name] || customSpace(name)
}
export const isListedSpace = (name) => !!SPACES[name]
// out9 q12: listed industries are names ("in Marketing & Advertising"); a typed one reads
// mid-sentence in lower case ("in pet grooming right now"), acronyms kept.
export function spaceInText(name) {
  if (!name) return 'your industry'
  return SPACES[name] ? name : midSentence(name)
}
// out9 q12/q13: what a typed industry is saved as. Emoji and doubled spaces go, the first letter is
// a capital, so it reads as a label on the Industry button.
export function cleanIndustryName(raw) {
  const t = String(raw || '').replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').replace(/\s+/g, ' ').trim()
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : ''
}

export const ACCOUNTS = [
  { id: 'maya', name: 'Maya Cole Creative', short: 'Maya Cole', initials: 'MC', tint: 'accent-purple', space: 'Restaurants & Food', knownIndustry: 'Marketing & Advertising', connected: true, competitors: ['Copper Kettle Cafe', 'Field & Flour', 'Morning Order Co.'], solo: true, connectedNetworks: ['instagram', 'tiktok'] },
  { id: 'golden', name: 'Golden Smile Dental & Orthodontics', short: 'Golden Smile', initials: 'GS', tint: 'primary-600', space: null, connected: false, competitors: [], connectedNetworks: [] },
  { id: 'sunset', name: 'Sunset Realty', short: 'Sunset Realty', initials: 'SR', tint: 'warning', space: 'Real Estate & Property', connected: true, competitors: ['Beacon Realty Group', 'Harbor & Vale Homes', 'Meridian Property Co.'], connectedNetworks: ['facebook', 'instagram'] },
  { id: 'glow', name: 'Glow Studio', short: 'Glow Studio', initials: 'GL', tint: 'positive', space: 'Beauty, Salon & Spa', connected: true, competitors: ['Luster Beauty Bar', 'Halo Salon Group', 'Tint & Tone Studio'], connectedNetworks: ['instagram', 'pinterest'] },
  { id: 'profix', name: 'ProFix Plumbing', short: 'ProFix', initials: 'PF', tint: 'primary-600', space: 'Home Maintenance & Trades', connected: true, competitors: ['RapidFlow Services', 'Sterling Home Pros', 'Anchor Mechanical'], connectedNetworks: ['facebook', 'youtube'] },
  { id: 'bites', name: 'Bright Bites Café', short: 'Bright Bites', initials: 'BB', tint: 'warning', space: 'Restaurants & Food', connected: true, competitors: ['Copper Kettle Cafe', 'Field & Flour', 'Morning Order Co.'], connectedNetworks: ['instagram', 'facebook'] },
  { id: 'ironline', name: 'Ironline Fitness', short: 'Ironline', initials: 'IF', tint: 'negative', space: 'Fitness & Nutrition', connected: true, competitors: ['Forge Athletic Club', 'Basecamp Fitness Co.', 'Motion Lab'], connectedNetworks: ['instagram', 'tiktok', 'youtube'] },
  { id: 'harbor', name: 'Harbor Law Group', short: 'Harbor Law', initials: 'HL', tint: 'gray-700', space: 'Legal', connected: true, competitors: [], connectedNetworks: ['linkedin'] },
  { id: 'peak', name: 'Peak Auto Detail', short: 'Peak Auto', initials: 'PA', tint: 'primary-600', space: 'Automotive & Transportation', connected: true, competitors: ['Apex Auto Studio', 'Gleam Detail Works', 'Torque & Shine'], connectedNetworks: ['instagram', 'youtube'] },
  { id: 'verdant', name: 'Verdant Landscaping', short: 'Verdant', initials: 'VL', tint: 'positive', space: 'Home Maintenance & Trades', connected: false, competitors: [], connectedNetworks: [] },
  { id: 'willow', name: 'Willow & Co Interiors', short: 'Willow & Co', initials: 'WC', tint: 'warning', space: 'Home Maintenance & Trades', connected: true, stale: true, competitors: ['RapidFlow Services', 'Sterling Home Pros', 'Anchor Mechanical'], connectedNetworks: ['pinterest', 'instagram'] },
  { id: 'nova', name: 'Nova Dental Care', short: 'Nova Dental', initials: 'ND', tint: 'primary-600', space: 'Dental', connected: true, competitors: ['BrightGrin Dental Group', 'Cityline Smile Co.', 'Northside Orthodontics'], connectedNetworks: ['instagram', 'facebook'] },
  { id: 'coastal', name: 'Coastal Roofing', short: 'Coastal Roofing', initials: 'CR', tint: 'gray-700', space: 'Home Maintenance & Trades', connected: true, competitors: ['RapidFlow Services', 'Sterling Home Pros', 'Anchor Mechanical'], connectedNetworks: ['facebook', 'youtube'] },
  { id: 'grind', name: 'The Daily Grind', short: 'Daily Grind', initials: 'DG', tint: 'warning', space: 'Restaurants & Food', connected: true, competitors: ['Copper Kettle Cafe', 'Field & Flour', 'Morning Order Co.'], connectedNetworks: ['instagram', 'tiktok'] },
]

// Identity colours for account initials. They used to include the warning, success and error
// fills, which put status colours on something that isn't a status (right next to real status
// labels) and failed contrast under white initials (2.1:1 and 2.5:1). The keys stay so account
// data doesn't change; every fill now clears 4.5:1 against white text.
export const TINT_CLASSES = {
  'accent-purple': 'bg-accent-purple',
  'primary-600': 'bg-primary-600',
  'warning': 'bg-accent-indigo',
  'positive': 'bg-primary-800',
  'negative': 'bg-gray-900',
  'gray-700': 'bg-gray-700',
}

export const NETWORKS = [
  { key: 'instagram', label: 'Instagram', letter: 'IG', domain: 'instagram.com' },
  { key: 'facebook', label: 'Facebook', letter: 'FB', domain: 'facebook.com' },
  { key: 'tiktok', label: 'TikTok', letter: 'TT', domain: 'tiktok.com' },
  { key: 'youtube', label: 'YouTube', letter: 'YT', domain: 'youtube.com' },
  { key: 'x', label: 'X / Twitter', letter: 'X', domain: 'x.com' },
  { key: 'linkedin', label: 'LinkedIn', letter: 'LI', domain: 'linkedin.com' },
  { key: 'pinterest', label: 'Pinterest', letter: 'P', domain: 'pinterest.com' },
]

// aspect: CSS aspect-ratio value · res: reference export resolution · kind: thumbnail treatment
// networks: which connected platforms this format applies to — drives the "What to post next" tabs
export const FORMATS = [
  { key: 'video', label: 'Quick video', base: 87, aspect: '9 / 16', res: '1080×1920', kind: 'video', networks: ['instagram', 'tiktok', 'youtube'] },
  { key: 'howto', label: 'How it works', base: 55, aspect: '9 / 16', res: '1080×1920', kind: 'video', networks: ['instagram', 'youtube', 'tiktok', 'linkedin'] },
  { key: 'customerStory', label: 'Customer story', base: 45, aspect: '9 / 16', res: '1080×1920', kind: 'video', networks: ['instagram', 'youtube', 'tiktok', 'linkedin', 'facebook'] },
  { key: 'carousel', label: 'Carousel', base: 37, aspect: '4 / 5', res: '1080×1350', kind: 'carousel', networks: ['instagram', 'facebook'] },
  { key: 'photo', label: 'Static photo', base: 31, aspect: '4 / 5', res: '1080×1350', kind: 'photo', networks: ['instagram', 'facebook', 'linkedin', 'x'] },
  { key: 'story', label: 'Story', base: 40, aspect: '9 / 16', res: '1080×1920', kind: 'story', networks: ['instagram', 'facebook'] },
  { key: 'long', label: 'Long-form video', base: 33, aspect: '16 / 9', res: '1920×1080', kind: 'video', networks: ['youtube'] },
  { key: 'doc', label: 'Document', base: 28, aspect: '4 / 5', res: '1080×1350', kind: 'doc', networks: ['linkedin'] },
  { key: 'pin', label: 'Pin', base: 22, aspect: '2 / 3', res: '1000×1500', kind: 'pin', networks: ['pinterest'] },
]

// Reference thumbnails for the "Get inspired" ideas. One shared pool — each format
// draws a different permutation (see IDEA_THUMBS) so no two format tabs show the same
// photo in the same slot and the rows never look lined up.
const THUMBS = [
  '/thumbs/ideas/laptop-website.jpg',      // 0
  '/thumbs/ideas/business-paper.jpg',      // 1
  '/thumbs/ideas/cafe-workday.jpg',        // 2
  '/thumbs/ideas/planning-whiteboard.jpg', // 3
  '/thumbs/ideas/laptop-smile.jpg',        // 4
  '/thumbs/ideas/team-handshake.jpg',      // 5
  '/thumbs/ideas/desk-flatlay.jpg',        // 6
  '/thumbs/ideas/team-cabin.jpg',          // 7
  '/thumbs/ideas/blazer-portrait.jpg',     // 8
  '/thumbs/ideas/corridor-walk.jpg',       // 9
]

// Column-distinct by construction: read any slot down the list and every format has a
// different photo there. Document keeps its folded-page treatment and takes none.
const IDEA_THUMBS = {
  video:         [3, 4, 5, 6, 7],
  howto:         [6, 7, 8, 9, 0],
  customerStory: [9, 0, 1, 2, 3],
  carousel:      [0, 1, 3, 4, 2, 5],
  photo:         [2, 3, 4, 5, 6],
  story:         [5, 6, 7, 8, 9],
  long:          [8, 9, 0, 1, 5],
}

export const FORMAT_COPY = {
  video: {
    insight: 'Short video is outperforming static images across {space} {period}',
    stat: '2.8×',
    statUnit: 'the reach of a static photo',
    doit: 'Make the next post a quick video rather than a static photo.',
    ideas: [
      { badge: '0:24', title: 'A 24-second offer announcement, straight to camera', metric: '38K plays · this week' },
      { badge: '0:47', title: 'One-minute answer to the question customers ask most', metric: '21K plays · this week' },
      { badge: '0:31', title: 'A fast walk-through of what happens on day one', metric: '16K plays · this week' },
      { badge: '0:15', title: 'A quick “us vs everyone else” comparison, no fluff', metric: '14K plays · this week' },
      { badge: '0:52', title: 'Answering the one question that comes up every time', metric: '9.8K plays · this week' },
      { badge: '0:18', title: 'A fast "yes or no" myth-buster, straight to camera', metric: '8.9K plays · this week' },
      { badge: '0:36', title: 'Reacting to a common complaint, on camera', metric: '7.4K plays · this week' },
      { badge: '0:22', title: '"Here\'s what nobody tells you," then the answer', metric: '6.8K plays · this week' },
      { badge: '0:41', title: 'A day-in-the-life clip, sped up', metric: '5.9K plays · this week' },
      { badge: '0:28', title: 'Three rapid tips, one per cut', metric: '5.1K plays · this week' },
      { badge: '0:33', title: 'Showing the result before explaining how', metric: '4.6K plays · this week' },
      { badge: '0:12', title: 'A single bold claim, text on screen', metric: '4.0K plays · this week' },
    ],
  },
  howto: {
    insight: 'How-it-works clips are the most-shared format in {space} {period}',
    stat: '3.4×',
    statUnit: 'more shares than your average post',
    doit: 'Film one clip that explains your single most-asked-about service.',
    ideas: [
      { badge: '1:10', title: 'Step-by-step of a single service, no talking head', metric: '12K plays · this week' },
      { badge: '0:38', title: 'Tools-of-the-trade close-ups with captions', metric: '9.4K plays · this week' },
      { badge: '0:52', title: 'Before, during, and after in one continuous take', metric: '7.1K plays · this week' },
      { badge: '1:24', title: 'A common mistake people make, and the fix', metric: '6.5K plays · this week' },
      { badge: '0:45', title: 'The three tools you actually need, nothing else', metric: '5.2K plays · this week' },
      { badge: '1:05', title: 'A side-by-side of doing it right vs. doing it wrong', metric: '4.8K plays · this week' },
      { badge: '0:50', title: 'Unboxing what\'s actually used, one item at a time', metric: '4.2K plays · this week' },
      { badge: '1:18', title: 'The setup nobody shows you, start to finish', metric: '3.7K plays · this week' },
      { badge: '0:42', title: 'A rapid-fire FAQ, one answer per cut', metric: '3.3K plays · this week' },
      { badge: '1:00', title: 'What "good" actually looks like, close up', metric: '2.9K plays · this week' },
      { badge: '0:55', title: 'The step most people skip, and why it matters', metric: '2.5K plays · this week' },
      { badge: '1:12', title: 'A full run-through with captions, no cuts', metric: '2.1K plays · this week' },
    ],
  },
  customerStory: {
    insight: 'Customer stories hold attention longer than any other format in {space}',
    stat: '1:48',
    statUnit: 'average watch time, the longest of any format',
    doit: 'Ask your happiest recent customer for two minutes on camera.',
    ideas: [
      { badge: '1:24', title: 'A single customer, one question, unedited answer', metric: '6.8K plays · this week' },
      { badge: '0:44', title: 'Text-on-screen version for people watching muted', metric: '5.2K plays · this week' },
      { badge: '1:02', title: 'Two customers, same question, cut side by side', metric: '4.1K plays · this week' },
      { badge: '0:58', title: '"Why I switched", a customer who used to go elsewhere', metric: '3.6K plays · this week' },
      { badge: '1:15', title: 'A skeptical customer, before and after working with you', metric: '3.1K plays · this week' },
      { badge: '0:50', title: 'A customer walks through their before and after', metric: '2.8K plays · this week' },
      { badge: '1:08', title: 'What almost stopped me from booking', metric: '2.4K plays · this week' },
      { badge: '0:36', title: 'A one-word reaction, then why', metric: '2.1K plays · this week' },
      { badge: '1:20', title: 'Three customers, one shared theme', metric: '1.8K plays · this week' },
      { badge: '0:48', title: 'A returning customer explains why they came back', metric: '1.5K plays · this week' },
      { badge: '1:05', title: 'The moment it clicked for them, on camera', metric: '1.3K plays · this week' },
      { badge: '0:40', title: 'A quick testimonial over B-roll of the work', metric: '1.1K plays · this week' },
    ],
  },
  carousel: {
    insight: 'Carousels are your strongest format for saves {period}',
    stat: '2.1×',
    statUnit: 'more saves than single photos',
    doit: 'Try turning a case study into a swipeable carousel.',
    ideas: [
      { badge: '1/4', title: 'A real-looking case study, four slides, one per stage', metric: '2.6K saves · this week' },
      { badge: '1/5', title: 'Five customer questions, one slide each, plain answers', metric: '1.4K saves · this week' },
      { badge: '1/6', title: 'Pricing explained, one line item per slide', metric: '980 saves · this week' },
      { badge: '1/6', title: 'Myth on one slide, the truth on the next', metric: '1.9K saves · this week' },
      { badge: '1/7', title: 'A week in the business, one slide per day', metric: '1.2K saves · this week' },
      { badge: '1/5', title: 'What to bring to your first appointment', metric: '860 saves · this week' },
      { badge: '1/8', title: 'A full walkthrough, one step per slide', metric: '750 saves · this week' },
      { badge: '1/4', title: 'The three things to know before you book', metric: '690 saves · this week' },
      { badge: '1/6', title: 'Before/after gallery, four projects', metric: '610 saves · this week' },
      { badge: '1/5', title: 'Common questions, answered one per slide', metric: '540 saves · this week' },
      { badge: '1/7', title: "A week's worth of behind-the-scenes, one shot per day", metric: '480 saves · this week' },
      { badge: '1/4', title: "What's included vs. what costs extra", metric: '420 saves · this week' },
    ],
  },
  photo: {
    insight: 'Static photos are the weakest performer in {space} {period}',
    stat: '0.4×',
    statUnit: 'the engagement of a video post',
    doit: 'Keep photos for announcements and put effort into video instead.',
    ideas: [
      { badge: 'Photo', title: 'One clean product shot, price in the caption', metric: '1.1K likes · this week' },
      { badge: 'Photo', title: 'Team photo with a name and a one-line bio', metric: '870 likes · this week' },
      { badge: 'Photo', title: 'A single before/after split, no text overlay', metric: '740 likes · this week' },
      { badge: 'Photo', title: 'A behind-the-scenes shot from earlier today', metric: '610 likes · this week' },
      { badge: 'Photo', title: 'A close-up detail shot people always ask about', metric: '540 likes · this week' },
      { badge: 'Photo', title: 'A quick poll graphic: "which do you prefer?"', metric: '470 likes · this week' },
      { badge: 'Photo', title: "A stack of the week's finished work, one photo", metric: '410 likes · this week' },
      { badge: 'Photo', title: 'A simple thank-you graphic for a milestone', metric: '360 likes · this week' },
      { badge: 'Photo', title: 'A wide shot of the space, no people', metric: '300 likes · this week' },
      { badge: 'Photo', title: 'A flat-lay of everything included in the offer', metric: '260 likes · this week' },
      { badge: 'Photo', title: 'A quote graphic from a recent review', metric: '210 likes · this week' },
      { badge: 'Photo', title: 'A "meet the team" grid, one face per corner', metric: '180 likes · this week' },
    ],
  },
  story: {
    insight: 'Stories reach the followers you already have faster than anything else in {space}',
    stat: '62%',
    statUnit: 'of your followers, within the first hour',
    doit: "Post a Story about your newest offer. It's gone in 24 hours, so it costs nothing to try.",
    ideas: [
      { badge: '24h', title: 'New offer: book your consultation today', metric: '2.1K taps · this week' },
      { badge: '24h', title: 'Behind the scenes, one photo and a poll sticker', metric: '1.4K taps · this week' },
      { badge: '24h', title: "Countdown to this weekend's event", metric: '980 taps · this week' },
      { badge: '24h', title: 'A quick "ask me anything" sticker for the day', metric: '860 taps · this week' },
      { badge: '24h', title: 'Today only: a link sticker straight to booking', metric: '720 taps · this week' },
      { badge: '24h', title: 'A quick "rate this 1-10" poll sticker', metric: '640 taps · this week' },
      { badge: '24h', title: "Reposting a customer's tag with a thank-you", metric: '560 taps · this week' },
      { badge: '24h', title: 'A "swipe up" countdown for a limited spot', metric: '490 taps · this week' },
      { badge: '24h', title: 'One before/after photo, no caption needed', metric: '420 taps · this week' },
      { badge: '24h', title: 'A quiz sticker: "guess the price"', metric: '360 taps · this week' },
      { badge: '24h', title: "Today's hours or availability, quick update", metric: '310 taps · this week' },
      { badge: '24h', title: 'A quick thank-you to everyone who showed up', metric: '260 taps · this week' },
    ],
  },
  long: {
    insight: 'Long-form video is where people go for the full explanation in {space}',
    stat: '6:12',
    statUnit: 'average watch time on a full walkthrough',
    doit: 'Film one complete walkthrough of your most-asked-about process, start to finish.',
    ideas: [
      { badge: '12:40', title: 'The complete guide to a first visit, start to finish', metric: '4.8K views · this week' },
      { badge: '8:15', title: 'A full walkthrough of how the work actually gets done', metric: '3.1K views · this week' },
      { badge: '6:02', title: 'Answering the ten questions we get asked most', metric: '2.4K views · this week' },
      { badge: '15:30', title: 'A real project, start to finish, nothing cut', metric: '1.9K views · this week' },
      { badge: '9:45', title: "What we'd do differently if we started over", metric: '1.5K views · this week' },
      { badge: '11:20', title: 'A day working the floor, unscripted', metric: '1.3K views · this week' },
      { badge: '7:40', title: 'Every question from a live Q&A, answered', metric: '1.1K views · this week' },
      { badge: '18:05', title: 'The full story of how the business started', metric: '940 views · this week' },
      { badge: '5:55', title: 'A myth-busting episode, one myth per chapter', metric: '800 views · this week' },
      { badge: '10:15', title: 'Touring the space, top to bottom', metric: '690 views · this week' },
      { badge: '13:30', title: 'A real client project, filmed start to finish', metric: '590 views · this week' },
      { badge: '6:48', title: 'What changed after a year in business', metric: '510 views · this week' },
    ],
  },
  doc: {
    insight: 'Document carousels get the most reposts of any format in {space} on LinkedIn',
    stat: '4.7×',
    statUnit: 'more reposts than a plain text post',
    doit: 'Turn what you know into a short slide deck people can swipe through and save.',
    ideas: [
      { badge: '1/6', title: 'What we learned after our first 100 clients', metric: '640 reposts · this week' },
      { badge: '1/5', title: 'Five mistakes new customers make early on', metric: '410 reposts · this week' },
      { badge: '1/4', title: 'A one-page breakdown of how pricing works', metric: '290 reposts · this week' },
      { badge: '1/5', title: 'The one question we get in every first call', metric: '240 reposts · this week' },
      { badge: '1/6', title: 'A before/after, one slide per stage', metric: '190 reposts · this week' },
      { badge: '1/7', title: 'A step-by-step process breakdown, one slide per step', metric: '160 reposts · this week' },
      { badge: '1/5', title: 'What we wish we knew when we started', metric: '130 reposts · this week' },
      { badge: '1/6', title: 'A checklist for people considering this service', metric: '110 reposts · this week' },
      { badge: '1/4', title: 'The numbers behind a typical project', metric: '95 reposts · this week' },
      { badge: '1/5', title: 'A case study, one client, one result', metric: '80 reposts · this week' },
      { badge: '1/6', title: "Industry trends we're watching this quarter", metric: '70 reposts · this week' },
      { badge: '1/4', title: 'A short glossary of terms clients ask about', metric: '60 reposts · this week' },
    ],
  },
  pin: {
    insight: 'Pins keep working long after you post them in {space}',
    stat: '5 mo',
    statUnit: 'median time a Pin keeps sending traffic',
    doit: 'Save your best checklist or before/after as a Pin people can find later.',
    ideas: [
      { badge: 'Pin', title: 'A checklist people will want to save for later', metric: '3.2K saves · this week' },
      { badge: 'Pin', title: 'Before/after of your most recent project', metric: '1.8K saves · this week' },
      { badge: 'Pin', title: 'Five ideas people can act on this weekend', metric: '1.1K saves · this week' },
      { badge: 'Pin', title: 'A seasonal round-up people will want to reference later', metric: '890 saves · this week' },
      { badge: 'Pin', title: 'A step-by-step graphic worth pinning', metric: '640 saves · this week' },
      { badge: 'Pin', title: 'A color-palette inspiration board', metric: '520 saves · this week' },
      { badge: 'Pin', title: 'A printable planning worksheet', metric: '430 saves · this week' },
      { badge: 'Pin', title: 'A "what to expect" timeline graphic', metric: '360 saves · this week' },
      { badge: 'Pin', title: 'A budget breakdown, one line per item', metric: '300 saves · this week' },
      { badge: 'Pin', title: 'A styled mood board for the season', metric: '250 saves · this week' },
      { badge: 'Pin', title: 'A quick-reference size or measurement guide', metric: '200 saves · this week' },
      { badge: 'Pin', title: 'A gift-idea round-up graphic', metric: '160 saves · this week' },
    ],
  },
}

// Ideas past the end of a format's list keep the illustrated placeholder — "See more"
// is meant to run longer than the reference shots we have on hand.
Object.entries(IDEA_THUMBS).forEach(([format, order]) => {
  order.forEach((thumb, i) => {
    const idea = FORMAT_COPY[format].ideas[i]
    if (idea) idea.image = THUMBS[thumb]
  })
})


export const SNAPSHOT_ARCHIVE = [
  { period: 'Aug 2026', headline: 'Mentions up 22%, sentiment up 11 pts', tone: 'up', sent: 'Emailed Sep 1' },
  { period: 'Jul 2026', headline: 'Mentions up 8%, sentiment flat', tone: 'up', sent: 'Emailed Aug 1' },
  { period: 'Jun 2026', headline: 'Mentions down 4%, sentiment up 3 pts', tone: 'flat', sent: 'Link shared Jul 2' },
]

// The demo's story, one authored beat per stop. `day` is the account's age; `name` and
// `line` are what the demo controls show, so whoever is presenting knows which scene they
// are on without reading the screen first.
//
// Day 1 is gone. It sat between 0 and 7 and said the same thing day 7 now says — barely any
// data of your own yet — so it was a stop with nothing of its own to show.
export const JOURNEY = [
  // The demo's story. Each beat owns its numbers AND its words, because the two were
  // written together and drift apart the moment they live in different files.
  //
  // Copy is templated on the account and niche rather than hardcoded to Maya, so switching
  // client or niche in the demo does not leave the prose describing someone else. Tokens:
  //   {space} {period} {share} {nicheVolume} {leader} {leaderShare} {watch}
  //   {topic1} {topic2} {topic3}  the niche's own trend labels, mid-sentence
  //
  // No mention COUNTS in the prose. `volume` is a 30-day figure and the Mentions card scales
  // it to whatever the range picker is on, so a count quoted here contradicts the screen.
  // Share, sentiment and the delta strings are range-independent and safe to quote.
  {
    day: 0, name: 'Nothing yet',
    line: 'No niche, no connected account. One decision to make.',
    zero: {
      headline: 'Your insights start with your niche',
      // "see what people are saying about you" went with the account-level product. What
      // this screen actually leads to is the niche, the brands you track, and a search.
      body: 'Track what your industry is talking about, watch the brands you compete with, and search anything. All from one screen.',
      cta: 'Select your niche to get started',
    },
  },
  {
    day: 7, name: 'Early signals',
    line: 'The niche is full, the account is not. Both numbers are on the screen.',
    metrics: { volume: 180, sentiment: 10, share: 6, lowConfidence: true },
    copy: {
      headline: 'Your industry is busy. Yours is just starting.',
      // H5, the repetition cut. The niche name sat in the picker two inches away and the
      // share was repeated verbatim by the stat below it, so the sentence keeps only the
      // figure neither of them states.
      p1: '{nicheVolume} conversations ran here {period}.',
      // H2. The card directly beneath this one is the trends, so telling people to use it
      // was a sentence spent pointing at the next thing on screen.
      p2: null,
      topic: null,
      // The sentiment and share tails are no longer authored per beat: both stat rows now
      // carry the same shape at every beat, a split and a count. `topic` stays, because day
      // 45 points that column at a complaint rather than an opportunity.
      nextTrends: null,
      nextComp: 'Add a competitor to see how your share compares.',
    },
  },
  {
    day: 15, name: 'First spike',
    line: 'One post carried the fortnight. Worth knowing why before repeating it.',
    metrics: { volume: 430, dVolume: '+139% vs prev', sentiment: 25, dSent: '+15 pts', share: 11, dShare: '+5 pts', lowConfidence: true },
    copy: {
      headline: 'Your {topic2} are pulling ahead',
      p1: 'They drove 62% of the mentions you got {period}.',
      p2: '{Topic2} are the second biggest topic in {space} right now.',
      topic: null,
      nextTrends: null,
      nextComp: null,
    },
  },
  {
    day: 30, name: 'Your baseline',
    line: 'Four weeks in. Enough history to notice when something moves against it.',
    metrics: { volume: 890, dVolume: '+34% vs prev', sentiment: 46, dSent: '+21 pts', share: 18, dShare: '+7 pts' },
    copy: {
      headline: 'Now we know your normal',
      p1: 'Four weeks of history. Enough to spot it when something changes.',
      p2: 'You hold {share}% of the conversation in {space}. {leader} holds {leaderShare}%.',
      topic: null,
      nextTrends: null,
      nextComp: 'You’re behind {leader}. See what they post.',
    },
  },
  {
    // `dip` is what DemoControls colours amber. It was styled for and never set, so the one
    // beat the demo wants to single out has always rendered in the same blue as the rest.
    day: 45, name: 'A dip', dip: true,
    line: 'Mentions up, sentiment down a whole reading. The one beat post analytics cannot produce.',
    metrics: { volume: 1240, dVolume: '+39% vs prev', sentiment: 12, dSent: '−34 pts', share: 21, dShare: '+3 pts' },
    copy: {
      headline: 'More people are talking. Fewer are happy.',
      p1: 'Mentions are up 39%, but sentiment has fallen below your usual level.',
      p2: 'Posts about {watch} have tripled this month. Replying to them is the fastest way to turn it around.',
      // The only beat whose trending topic is a problem rather than an opportunity. That
      // switch is what makes the beat land.
      topic: '{watch}',
      nextTrends: 'Reply to the complaints about {watch} before they set the tone.',
      nextComp: null,
    },
  },
  {
    day: 60, name: 'Recovering',
    line: 'Complaints settled. The format that carried month one has run out.',
    metrics: { volume: 1180, dVolume: '−5% vs prev', sentiment: 30, dSent: '+18 pts', share: 22, dShare: '+1 pt', down: true },
    copy: {
      headline: 'Things are settling. One thing still needs attention.',
      p1: 'Complaints have halved since you started replying to them.',
      p2: 'The format that carried you through month one has stopped earning saves. {Topic3} are what your niche is saving now.',
      topic: '{topic3}',
      nextTrends: null,
      nextComp: null,
    },
  },
  {
    day: 90, name: 'Your pattern',
    line: 'Steady, and a topic climbing in the niche that you have no share of.',
    metrics: { volume: 1310, dVolume: '+11% vs prev', sentiment: 47, dSent: '+17 pts', share: 27, dShare: '+5 pts' },
    copy: {
      headline: 'Here’s what tends to work for you',
      p1: 'Your share has gone from single digits to {share}% since July.',
      p2: '{Topic1} is the biggest topic in {space}, and it is where most of your remaining headroom sits.',
      topic: '{topic1}',
      nextTrends: '{Topic1} has the volume and you have the smallest share of it. Start there.',
      nextComp: 'Four points behind {leader}, from 29 in July.',
    },
  },
]

export const DAYS = JOURNEY.map((b) => b.day)

// The window the user is looking at — entirely separate from DAYS, which is how much
// history the account has. The old pills conflated the two, so picking a range appeared
// to age the account. "Last 6 months" cannot be mistaken for an account age.
// `phrase` slots straight into a sentence; `past` moves the verb, because four of these
// six describe a window that has already closed.
// `days` is what the Mentions chart plots. It follows this picker rather than carrying its
// own 30/60/90, which is what "the date picker is for the entire product" means in practice.
// Three trailing windows. The PM's note: "last 7, 15 and 30 days only; no monthly
// granularity." The six calendar windows that used to live here carried a problem the spec
// already records — a trailing window is not a whole number of months, so "last month" and
// "3 months" were always a little untrue. Days say exactly what they measure.
//
// `past` is now false on all three: these all end today, so nothing needs the past tense.
// The field stays because the copy branches on it and a closed prior window may return.
export const RANGES = [
  { key: 'last-7',  label: 'Last 7 days',  phrase: 'in the last 7 days',  short: 'last 7 days',  past: false, days: 7 },
  { key: 'last-15', label: 'Last 15 days', phrase: 'in the last 15 days', short: 'last 15 days', past: false, days: 15 },
  { key: 'last-30', label: 'Last 30 days', phrase: 'in the last 30 days', short: 'last 30 days', past: false, days: 30 },
]

// Lowercases a label for mid-sentence use without destroying acronyms:
// "Patient FAQ series" has to read "patient FAQ series", never "patient faq series".
export function midSentence(label) {
  return String(label)
    .split(' ')
    .map((w) => (w.length > 1 && w === w.toUpperCase() ? w : w.toLowerCase()))
    .join(' ')
}

// 56 of the 63 topic labels are plural ("Behind-the-counter clips"), 7 are not
// ("Founder-led video"). Without this the sentence reads "clips is getting". The
// exceptions are the singulars that end in s anyway — "business", "consensus", "analysis".
export function isPlural(label) {
  return /s$/.test(String(label)) && !/(ss|us|is)$/.test(String(label))
}

export function trendChange(label, share) {
  const seed = String(label).split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  const headroom = Math.round((100 - share) / 11)
  return headroom - 7 + (seed % 9)
}

export function fmtNum(n) {
  return n == null ? '–' : Math.round(n).toLocaleString('en-US')
}

// A net-sentiment integer carries no unit and means nothing to a café owner. Say the
// thing the number is telling them instead. Lives here rather than in a component
// because three tabs show this metric, and writing the label inline in each is exactly
// how "Net sentiment" came back on two of them after it was removed from the third.
export const SENTIMENT_LABEL = 'Sentiment'
export function sentimentReading(score) {
  const n = Math.round(score || 0)
  if (n >= 45) return 'Mostly positive'
  if (n >= 15) return 'Leaning positive'
  if (n > -15) return 'Mixed'
  return 'Mostly negative'
}

// What an account the same size as this one gets in the same window, so the headline
// figure has something to be measured against. Square-root scaling, because a niche
// with 7× the conversation does not hand its median account 7× the mentions.
function peerBenchmark(nicheVolume) {
  return Math.round((6 * Math.sqrt(nicheVolume || 0)) / 10) * 10
}

// A per-point series whose total is exactly `total`, so the chart and the headline
// figure above it can never disagree. Deterministic — a sine wobble rather than
// Math.random(), or the line would redraw itself on every keystroke elsewhere on the page.
function mentionSeries(total, points, { down = false, fade = false, spike = true } = {}) {
  if (!total || points < 2) return []
  // One post breaking out reads as a story over a month or a year, and as a broken
  // chart over seven days, where it would swallow most of the week's total.
  const burstAt = spike && !down && !fade && points >= 12 ? Math.round(points * 0.48) : -1
  const weights = Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1)
    // `fade` peaks around a fifth of the way in and decays to roughly a quarter of that by
    // the end: a launch that was noticed and then was not. `down` is a straight slope, which
    // is the wrong shape for it because it never shows the attention that was lost.
    const trend = fade
      ? (0.5 + 5 * t) * Math.exp(-3.4 * t)
      : down ? 1.35 - 0.7 * t : 0.62 + 0.76 * t
    // Two waves with periods fixed in points, not in the window, so a 52-week line
    // undulates at the same visual rhythm as a 7-day one instead of aliasing into a
    // sawtooth once the points outrun the wavelength.
    const wobble = 1 + 0.13 * Math.sin((i * Math.PI) / 3) + 0.06 * Math.sin((i * Math.PI) / 11 + 1.3)
    const burst = i === burstAt ? 3.2 : 1
    return Math.max(0.05, trend * wobble * burst)
  })
  const scale = total / weights.reduce((sum, w) => sum + w, 0)
  const raw = weights.map((w) => w * scale)
  const floors = raw.map((v) => Math.floor(v))
  let left = total - floors.reduce((sum, v) => sum + v, 0)
  // Largest-remainder, same technique the competitor shares use: hand the leftover
  // units to the points that lost the most to rounding.
  raw
    .map((v, i) => ({ i, frac: v - floors[i] }))
    .sort((a, b) => b.frac - a.frac)
    .forEach(({ i }) => { if (left > 0) { floors[i] += 1; left -= 1 } })
  return floors
}

// A y-axis top that lands on a round number four ticks up, so every gridline is
// labelled with a value a person would write down themselves.
export function niceScale(max) {
  // out9 q03/q18: safe on 0, NaN and Infinity; tiny counts get whole-number ticks (0, 1, 2) instead
  // of 0, 0, 1, 1; and the top is the smallest round number on 3 or 4 steps (4,400 -> 4,500, not
  // 6,000), so the peak sits near the top.
  const peak = Number.isFinite(max) && max > 0 ? max : 0
  if (peak <= 4) { const m = Math.max(1, Math.ceil(peak)); return { max: m, ticks: Array.from({ length: m + 1 }, (_, i) => i) } }
  const STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 8, 10]
  let best = null
  for (const k of [3, 4]) {
    const target = peak / k
    const mag = Math.pow(10, Math.floor(Math.log10(target)))
    const step = STEPS.map((m) => m * mag).find((v) => v >= target && (v >= 10 || Number.isInteger(v)))
    if (!best || step * k < best.max) best = { max: step * k, step, k }
  }
  return { max: best.max, ticks: Array.from({ length: best.k + 1 }, (_, i) => best.step * i) }
}

// ---------------------------------------------------------------------------------------
// Quick search
// ---------------------------------------------------------------------------------------

// Listening sources are NOT the same set as NETWORKS. NETWORKS is what an account can
// *connect and publish to*, which is why ConnectSocialModal and ConnectedAccountsModal
// iterate it. You can listen to Reddit, Telegram and the open web without an account
// there, so those three live here and nowhere else — adding them to NETWORKS would put
// "Connect your Reddit account" in a flow that has no such thing.
export const LISTENING_SOURCES = [
  ...NETWORKS,
  { key: 'reddit', label: 'Reddit', letter: 'R' },
  { key: 'telegram', label: 'Telegram', letter: 'TG' },
  { key: 'web', label: 'Web', letter: 'W' },
]


// The eight sections of a search result, in render order.
//
// Four of these used to be locked behind saving a topic. Feature gating is deferred to
// post-beta — "everything is free in beta" — so every section is free. The `locked` flag is
// kept rather than deleted because the gate is coming back after beta and the PM has a list
// of which four; flipping them here is then a one-line change, not a rebuild.
//
// Original split, for whoever turns it back on: engagement, conversations, messages and
// audience were the locked four.
//
// `quick` is a different axis and is not a gate. Quick Search is the quick look and shows
// four; Insights is the full dashboard and shows all eight. The PM: "charts should appear in
// Quick Search before the Save as Topic flow starts — PRD specifies 4 charts to show here."
// The four are the ones that were free in his prototype, which is the only list written down. `heading` is the card's sentence; `blurb` is the line inside the
// lock panel and is his copy, kept verbatim so the nudge reads the way he wrote it.
//
// Every locked section needs continuous listening to compute at all, which is what makes
// the lock a description of how the product works rather than an arbitrary wall.
// Sujeet's plain-language section names, used by the simplified design (5 Oct).
export const SECTION_NAMES = {
  snapshot: 'Overview', sentiment: 'How people feel', engagement: 'Interactions', trends: 'Best time to post',
  conversations: 'What people say', share: 'Where people talk', messages: 'Posts', audience: 'Who is posting',
}

export const QUICK_SEARCH_SECTIONS = [
  // `alt` is the label used where nothing is withheld — on Insights this card is simply the
  // overview of the topic, and calling it a "quick snapshot" there would be borrowing a word
  // from a tab the reader is not on.
  { id: 'snapshot',      label: 'Quick snapshot',        heading: 'What people are saying about', locked: false, quick: true, alt: 'Overview' },
  { id: 'sentiment',     label: 'Sentiment and emotion', heading: 'How people feel about',        locked: false, quick: true },
  { id: 'engagement',    label: 'Interactions',          heading: 'How people interact with',     locked: false,
    blurb: 'Likes, comments, shares and saves over time.' },
  { id: 'trends',        label: 'Trends',                heading: 'When people talk about',       locked: false, quick: true },
  { id: 'conversations', label: 'Conversation insights', heading: 'What comes up in posts about', locked: false,
    blurb: 'Trending topics, hashtags and the live conversation feed.' },
  { id: 'share',         label: 'Share of voice',        heading: 'Where people talk about',       locked: false, quick: true },
  { id: 'messages',      label: 'Messages',              heading: 'Posts that mention',           locked: false,
    blurb: 'The posts themselves, filtered by platform.' },
  { id: 'audience',      label: 'Audience insights',     heading: 'Who is talking about',         locked: false,
    blurb: 'Language and top locations behind the conversation.' },
]

// Simplified order (Harsh, 6 Oct): the four a search opens first, the four saving adds after.
export const SIMPLE_SECTION_ORDER = [
  ...QUICK_SEARCH_SECTIONS.filter((s) => s.quick),
  ...QUICK_SEARCH_SECTIONS.filter((s) => !s.quick),
]



// Searches a free account gets per day, or `null` for no cap.
//
// Currently null — Ayushi asked for search to be open while the tabs are being reviewed.
// It is one value rather than a deleted feature because the cap is very likely coming
// back: Sujith described exhausting three tries as the whole tactic ("so I can put them on
// a paywall"), and Shivam's plan sketch was 2 topics and 3 searches on free. Set this to a
// number and the counter, the pips, the disabled field and the reset copy all return —
// every one of them is gated on this being non-null, nothing else has to change.
export const SEARCH_LIMIT = null

// Topics a free account can keep, or `null` for no cap. Null for beta, same reasoning as
// SEARCH_LIMIT: feature gating is deferred to post-beta, and everything gated on this being
// a number disappears while it is null. Shivam's sketch when it returns was 2.
// WBR 12 Oct: shown openly ("1 of 50 topics") rather than enforced while in beta. 50 is a
// placeholder until Shivam sets the real number.
export const TOPIC_SHOWN_LIMIT = 50
export const TOPIC_LIMIT = null

const SEARCH_PLATFORMS = ['Facebook', 'Instagram', 'LinkedIn', 'X', 'Reddit', 'YouTube']

// Which platforms a section can actually be filtered by. The PM asked for a "not supported"
// mark on tables that cannot take one, and this is the map that decides — one place, so the
// answer moves when the backend does.
//
// UNVERIFIED: nobody has told us which sections support which sources. These four are a
// placeholder matching what the prototype showed; do not read them as the real matrix.
export const PLATFORM_SUPPORT = {
  messages: ['Facebook', 'Instagram', 'LinkedIn', 'X'],
}

export function platformOptions(sectionId) {
  const supported = PLATFORM_SUPPORT[sectionId]
  if (!supported) return null
  const KEY = { Facebook: 'facebook', Instagram: 'instagram', LinkedIn: 'linkedin', X: 'x', Reddit: 'reddit', YouTube: 'youtube' }
  return SEARCH_PLATFORMS.map((label) => ({ label, key: KEY[label], supported: supported.includes(label) }))
}
const EMOTIONS = ['Joy', 'Anger', 'Disgust', 'Sadness', 'Fear', 'Surprise', 'Anticipation', 'Trust']
const HEAT_HOURS = ['0:00', '3:00', '6:00', '9:00', '12:00', '15:00', '18:00', '21:00']
const HEAT_DAYS = ['Sun', 'Sat', 'Fri', 'Thu', 'Wed', 'Tue', 'Mon']

// Rebase a list of raw weights to integers summing to exactly 100, largest remainder —
// the same block the SPACES trends and competitor shares already use. The share-of-voice
// track stands for 100% of the conversation, so it has to actually total 100.
function rebase100(weights) {
  const sum = weights.reduce((n, w) => n + w, 0) || 1
  const raw = weights.map((w) => (w / sum) * 100)
  const floors = raw.map((v) => Math.floor(v))
  let left = 100 - floors.reduce((n, v) => n + v, 0)
  raw
    .map((v, i) => ({ i, frac: v - floors[i] }))
    .sort((a, b) => b.frac - a.frac)
    .forEach(({ i }) => { if (left > 0) { floors[i] += 1; left -= 1 } })
  return floors
}

// Everything a search result shows, derived from the term itself so the same keyword
// always returns the same dashboard. No Math.random(): the charts would redraw on every
// unrelated keystroke, which is the bug the Mentions row already had to fix once.
// A search that comes back with nothing. In the real product this is whatever the index
// says; here it needs a rule that is deterministic and demonstrable, so: any word carrying
// four or more consonants in a row is keyboard mash. "asdfgh" returns empty, "openai" does
// not, and — the reason the threshold is four rather than three — neither does "CRM".
//
// This is a stand-in for a backend, labelled as one. Do not mistake it for a heuristic
// worth keeping when real data arrives.
function isEmptyTerm(term) {
  // out9 q14: "4 consonants in a row" called real words empty ("Birthday cakes", "Matchday",
  // "rhythm"). Only keyboard mash reads as empty now: a word with no vowels (y counts), or a run
  // straight along a keyboard row ("asdfgh", "qwerty", "lkjh").
  const t = (term || '').trim().toLowerCase()
  if (!t) return false
  const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
  return t.split(/[^a-z]+/).filter((w) => w.length >= 4).some((w) => {
    if (!/[aeiouy]/.test(w)) return true
    return ROWS.some((r) => r.includes(w) || [...r].reverse().join('').includes(w))
  })
}

// Which platform, if any, failed to answer. Six networks per search makes partial failure
// the normal case rather than the edge case, so the dashboard has to be able to say so.
function downPlatform(term) {
  const seed = [...(term || '').toLowerCase()].reduce((n, c) => n + c.charCodeAt(0), 0) || 7
  return seed % 7 === 0 ? 'Reddit' : null
}

// 15 Oct (review 6): what people say is built from the search term and the industry, so a search
// for "Lead gen funnels" talks about funnels, not "Product launch 2026" and #BrandLove. Sample
// data still, but sample data about the thing that was searched.
const TOPIC_SHAPES = ['{T} examples', '{K1}', '{T} mistakes', '{K2}', '{K3}']
const POST_SHAPES = [
  ['Design Weekly', '@designweekly', '4h ago', 'positive', 'Facebook', 'Three {t} ideas that worked this quarter, and the one detail they all had in common.'],
  ['Amara Studio', '@amarastudio', '2h ago', 'positive', 'Instagram', 'Swipe for the before. We rethought how we do {t} and replies doubled in a month.'],
  ['u/smallbizowner', 'r/smallbusiness', '12h ago', 'positive', 'Reddit', 'Honest question: what actually moved the needle for your {t}? Ours finally started working after we cut it in half.'],
  ['Priya Raman', 'Head of Growth', '8h ago', 'neutral', 'LinkedIn', 'Most attempts at {t} fail at the same step, and it is rarely the one people test first. Data from 40 clients below.'],
  ['Tech Insider', '@techinsider', '8h ago', 'negative', 'X', 'Spent the month testing what people recommend for {t}. Most of it promised more than it delivered.'],
  ['The Growth Room', '@thegrowthroom', '11h ago', 'positive', 'Instagram', 'Save this {t} checklist. Five steps, ten minutes, no new software.'],
  ['Lumen Studio', '@lumenstudio', '1d ago', 'positive', 'Facebook', 'Our {t} guide is live. Link in the comments, and the first fifty get the template free.'],
  ['Mark Chen', '@markchen', '6h ago', 'neutral', 'X', 'Everyone is talking about {k1} this week. Curious whether it changes anything for {t}.'],
  ['Dana Whitfield', 'Operations Lead', '2d ago', 'positive', 'LinkedIn', 'What a year of {t} taught us, and the one change that cut our cost per lead by a third.'],
  ['Glow Weekly', '@glowweekly', '2d ago', 'neutral', 'Instagram', 'Getting {t} right takes longer than anyone admits. Here is why we plan it in two passes.'],
]
const STOP = new Set(['the', 'and', 'for', 'with', 'from', 'your', 'our', 'how', 'what', 'about', 'a', 'an', 'of', 'to', 'in', 'on'])
function termContent(t, sp, seed) {
  const term = t.trim()
  const low = term.toLowerCase()
  // Keep a name's own capitals ("World Cup qualifiers"); lowercase a plain phrase mid-sentence.
  const named = /[A-Z]/.test(term.slice(1))
  const Term = named ? term.charAt(0).toUpperCase() + term.slice(1) : keywordLabel(low)
  const mid = named ? term : low
  const kw = ((sp && sp.keywords) || ['customer reviews', 'pricing', 'social media']).filter((k) => k.toLowerCase() !== low)
  const k = (i) => kw[i % kw.length]
  const fill = (str) => str.replace(/\{T\}/g, Term).replace(/\{t\}/g, mid).replace(/\{K(\d)\}/g, (_, n) => keywordLabel(k(+n - 1))).replace(/\{k(\d)\}/g, (_, n) => midSentence(k(+n - 1)))
  const changes = [38, 64, 21, 12, -8].map((c, i) => (i === 4 ? c : c + ((seed * (i + 2)) % 30)))
  const topics = TOPIC_SHAPES.map((shape, i) => ({ label: fill(shape), value: [3420, 2180, 1950, 1420, 1280][i], change: changes[i] }))
  const words = [...new Set([
    ...low.split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w)),
    ...kw.flatMap((x) => x.toLowerCase().split(/[^a-z0-9]+/)).filter((w) => w.length > 2 && !STOP.has(w)),
    ...((sp && sp.trends) || []).flatMap((x) => x.label.toLowerCase().split(/[^a-z0-9/]+/)).filter((w) => w.length > 3 && !STOP.has(w) && !w.includes('/')),
  ])].slice(0, 15).map((w, i) => ({ w: keywordLabel(w) === w.toUpperCase() ? w.toUpperCase() : w, n: Math.max(30, 100 - i * 5 - ((seed * (i + 1)) % 9)) }))
  const tag = (x) => '#' + x.toLowerCase().replace(/[^a-z0-9]+/g, '')
  const hashtags = [tag(low), tag(k(0)), tag(k(1)), tag(k(2)), tag(k(3))].filter((h, i, a) => h.length > 2 && a.indexOf(h) === i)
    .map((label, i) => ({ label, value: [5200, 3800, 2900, 2100, 1800][i], isNew: i === 1 || i === 3 }))
  // 27 Oct (developers): posts come 10 at a time; past the first ten these are sample authors.
  const MORE_AUTHORS = [['Northside Studio', '@northside'], ['Kim Alvarez', '@kimalvarez'], ['Brightline Co.', '@brightline'], ['The Daily Edit', '@thedailyedit'], ['Oak & Ivy', '@oakandivy'], ['Sam Rivera', '@samrivera'], ['Local Loop', '@localloop'], ['Harper Lane', '@harperlane'], ['Maple Works', '@mapleworks'], ['Field Notes', '@fieldnotes'], ['Juniper Co.', '@juniperco'], ['Riverbend', '@riverbend'], ['Studio Nine', '@studionine'], ['Ana Park', '@anapark']]
  const messages = Array.from({ length: 24 }, (_, i) => {
    const [who0, handle0, ago0, tone, platform, text] = POST_SHAPES[i % POST_SHAPES.length]
    const more = i >= POST_SHAPES.length ? MORE_AUTHORS[(i - POST_SHAPES.length) % MORE_AUTHORS.length] : null
    const k = i % 10, scale = Math.pow(0.82, Math.floor(i / 10))
    return {
      who: more ? more[0] : who0, handle: more ? more[1] : handle0, ago: more ? `${(i % 6) + 1}d ago` : ago0, tone, platform, text: fill(text),
      likes: Math.round([1240, 3420, 420, 680, 56, 2180, 760, 89, 540, 1520][k] * scale), comments: Math.round([156, 412, 187, 120, 92, 240, 88, 34, 96, 165][k] * scale), shares: Math.round([320, 890, 65, 210, 28, 510, 140, 12, 175, 300][k] * scale),
    }
  })
  return { words, topics, hashtags, messages }
}

export function quickSearchResult(term, rangeKey = 'last-30', space = null) {
  const t = (term || '').trim()
  const seed = [...t.toLowerCase()].reduce((n, c) => n + c.charCodeAt(0), 0) || 7
  const at = (n) => (seed * (n + 3) * 37) % 100

  const rng = RANGES.find((r) => r.key === rangeKey) || RANGES[2]
  const down = downPlatform(t)

  if (isEmptyTerm(t)) {
    return { term: t, empty: true, range: rng, down: null, platforms: [], messages: [] }
  }

  // The niche is the yardstick. Without it every figure on these two tabs is a number with
  // nothing to be read against — which is the one thing the overview never does.
  const sp = spaceOf(space)

  // Volume scales with the window rather than ignoring it. Sub-linear — a month does not
  // carry four times a week's conversation, because the same story gets talked about once
  // and then stops. Square root is the same shape peerBenchmark already uses.
  const span = Math.sqrt(rng.days / 30)

  // A term is sized as a SHARE of its niche, not as an absolute. Sized absolutely it came
  // out at 181% of the niche it sits inside — a search cannot be bigger than the
  // conversation containing it, and the comparison is the whole point of showing one.
  // nicheVolume in SPACES is a monthly figure, so it takes the same span.
  // *7 before the modulo: raw char sums for similar-length phrases land within a few of each
  // other, so "eye makeup looks", "glass skin" and "balayage" all came out at 34-39%.
  const nicheShare = 4 + ((seed * 7) % 36)
  const mentions = Math.round((sp ? sp.nicheVolume * (nicheShare / 100) : 150000 + (seed % 120) * 1000) * span)
  const delta = +(4 + (seed % 170) / 10).toFixed(1)
  const reach = mentions * (11000 + (seed % 4000))

  const pos = 56 + (seed % 15)
  const neg = 8 + (seed % 8)
  const neu = 100 - pos - neg
  const net = pos - neg

  // Point count follows the window, not a fixed 30. A seven-day range drawing thirty points
  // labelled across a month is the chart contradicting the sentence above it — which is what
  // it was doing. Past a month the marks become weeks; dates a quarter apart say nothing.
  const points = rng.days <= 30 ? rng.days : Math.round(rng.days / 7)
  const stepDays = rng.days / points
  const series = mentionSeries(mentions, points, { spike: true })
  const peakAt = series.indexOf(Math.max(...series))

  // The platform that didn't answer is dropped before the rebase, so the remaining shares
  // still total 100 — which is exactly why the card has to say one is missing. Nothing
  // about the chart looks wrong.
  const live = SEARCH_PLATFORMS.filter((label) => label !== down)
  const shares = rebase100(live.map((_, i) => 30 + at(i) * (i < 2 ? 0.9 : 0.45) - i * 4))
  const platforms = live.map((label, i) => ({ label, value: shares[i] }))
    .sort((a, b) => b.value - a.value)

  // Emotion is a profile, not a ranking: joy and trust lead for a brand people like, and
  // the negative four stay low unless net sentiment is poor. Scaled 0–100.
  const emotions = EMOTIONS.map((label, i) => {
    const warm = i === 0 || i === 7 || i === 6
    const base = warm ? 52 + at(i) * 0.38 : 14 + at(i) * 0.22
    return { label, value: Math.round(Math.max(8, Math.min(96, base + (net - 44) * (warm ? 0.3 : -0.2)))) }
  })

  const weeks = [0, 1, 2, 3].map((w) => {
    const p = Math.round(pos - 4 + w * 1.6 + (at(w) % 5) * 0.4)
    const n = Math.round(neg + 1 - w * 0.4)
    return { label: `Week ${w + 1}`, pos: p, neu: 100 - p - n, neg: n }
  })

  const trendPoints = 11
  const trendBars = mentionSeries(Math.round(mentions / 28), trendPoints, { spike: false })
  const trendLine = trendBars.map((_, i) => Math.round(38 + (i / (trendPoints - 1)) * (net - 38) + ((at(i) % 12) - 6) * 0.8))

  const heat = HEAT_DAYS.map((day, r) => ({
    day,
    cells: HEAT_HOURS.map((_, c) => Math.round(18 + ((seed * (r + 2) * (c + 5)) % 78))),
  }))

  const totalEng = Math.round(mentions * (0.5 + (seed % 30) / 100))
  const engSplit = rebase100([63, 20, 11, 6])
  const engagement = {
    total: totalEng,
    parts: ['Likes', 'Comments', 'Shares', 'Saves'].map((label, i) => ({ label, value: engSplit[i] })),
    byWeek: mentionSeries(totalEng, 6, { spike: false }),
  }

  const audience = {
    language: [
      { label: 'English', value: 62 }, { label: 'Spanish', value: 14 },
      { label: 'French', value: 8 }, { label: 'German', value: 6 },
      { label: 'Other languages', value: 10, rest: true },
    ],
    age: [
      { label: '18–24', value: 18 }, { label: '25–34', value: 32 }, { label: '35–44', value: 26 },
      { label: '45–54', value: 14 }, { label: '55+', value: 10 },
    ],
    places: [
      { label: 'United States', value: 38 }, { label: 'United Kingdom', value: 14 },
      { label: 'India', value: 11 }, { label: 'Germany', value: 7 },
      { label: 'Other countries', value: 30, rest: true },
    ],
  }

  // Comparisons, one per section, all destined for the figure row rather than a sentence.
  const avgDay = Math.round(mentions / points)
  const peakMultiple = avgDay ? +(series[peakAt] / avgDay).toFixed(1) : 0
  const niche = sp ? {
    name: space,
    // The same number the volume was derived from — so the figure and the comparison are
    // one fact stated twice, never two facts that can drift apart.
    sharePct: nicheShare,
    sentiment: Math.round(sp.nicheSent),
    // `engRate` and `leanPlatform` used to live here, derived from the niche NAME because
    // SPACES carries no engagement rate or platform profile. They rendered on the figure row
    // beside real derivations, which made the whole row look equally sourced. Removed rather
    // than marked: add them back only when SPACES carries the real thing.
  } : null

  return {
    term: t,
    empty: false, range: rng, down, niche,
    peakMultiple,
    mentions, delta, reach,
    pos, neu, neg, net,
    series, peakAt, peak: series[peakAt], points, stepDays,
    platforms, emotions, weeks,
    trendBars, trendLine,
    heat, heatHours: HEAT_HOURS,
    engagement, audience,
    ...termContent(t, sp, seed),
  }
}

// ---------------------------------------------------------------------------------------
// Social trends
// ---------------------------------------------------------------------------------------

// The PM's build lists global trends — "napoli vs milan", "bank holiday", "atlético
// nacional". Every other tab in this product is framed by the account's niche, so that one
// would show Serie A results to a hair salon. These are derived from the niche instead.
//
// Three sources, five rows each, built by crossing the niche's own trend labels with the
// phrasings people actually search in. Deterministic from the niche name: the same salon
// sees the same list until its niche changes.
//
// Instagram hashtags stand in for the prototype's Wikipedia pageviews — a social source in
// a social tab, and one that has a brand mark, which Wikipedia does not.
const TREND_PATTERNS = {
  google: ['{l} near me', 'best {l}', '{l} prices', '{l} ideas', '{l} 2026'],
  pinterest: ['{l} inspo', '{l} ideas', '{l} at home', '{l} before and after', '{l} step by step'],
  instagram: null, // hashtags, built from the label itself
}

const TREND_SOURCES = [
  { key: 'google', label: 'Google Trends', unit: 'searches', icon: 'google' },
  { key: 'pinterest', label: 'Pinterest keywords', unit: 'pins', icon: 'pinterest' },
  { key: 'instagram', label: 'Instagram hashtags', unit: 'posts', icon: 'instagram' },
]

// Three niche labels have to fill five rows, so the last two take a suffix. Years are not
// used: "2026 - (i % 3)" produced #…2025, a hashtag for a year that has already been.
const HASH_SUFFIX = ['', '', '', 'inspo', 'tutorial']

function hashtag(label, i) {
  return '#' + (label + HASH_SUFFIX[i]).toLowerCase().replace(/[^a-z0-9]+/g, '')
}

// The five keywords carrying a niche's mentions, for the Mentions card. Shivam on the
// 28 Sep call: "top mentions around the niche" as keywords, "top 5, maximum top 5".
//
// Volumes are a decaying share of the niche's own window total rather than free-standing
// numbers, so the five always sit inside the figure above them and the first is visibly the
// biggest. Deterministic per niche and per window — a keyword list that reshuffles between
// renders is the fastest way to lose trust in a demo.
// What to offer someone who has not searched yet. Was a fixed list — "Marketing
// automation", "CRM for agencies", "Local SEO" — shown to every account whatever its niche,
// so a restaurant was invited to search CRM software. Twenty of the twenty-one niches got
// suggestions belonging to the twenty-first.
//
// The niche's biggest trend first, because it is the one thing most likely to return a full
// result, then its own keywords behind it.
// A keyword turned into a label: first letter up, and acronyms kept in capitals, so
// "ai automation" reads "AI automation" rather than "Ai automation".
const ACRONYMS = new Set(['ai', 'api', 'ev', 'seo', 'crm', 'ugc', 'roi', 'ppc', 'b2b', 'b2c', 'sms', 'faq', 'ux', 'ui'])
export function keywordLabel(t) {
  const words = String(t || '').split(' ').map((w) => (ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w))
  const out = words.join(' ')
  return out.charAt(0).toUpperCase() + out.slice(1)
}

export function nicheSuggestions(space) {
  const sp = spaceOf(space)
  if (!sp) return []
  const lead = (sp.trends && sp.trends[0] && sp.trends[0].label) || null
  const rest = (sp.keywords || []).map(keywordLabel)
  // Trends and keywords overlap on some niches — Beauty leads on "Glass-skin routines" and
  // then offers "Glass skin" two chips later, which reads as the list stuttering. Anything
  // contained in something already taken is dropped.
  const norm = (v) => v.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const out = []
  for (const v of [lead, ...rest].filter(Boolean)) {
    const n = norm(v)
    if (out.some((t) => norm(t).includes(n) || n.includes(norm(t)))) continue
    out.push(v)
    if (out.length === 5) break
  }
  return out
}

// 15 Oct (review 1): the industry's growing topics and keywords, fastest first. Trending now and
// Industry trends' Next step both read this, so the page names one climber, not two.
export function industryRisers(space, rangeKey) {
  const sp = spaceOf(space)
  if (!sp) return []
  const seen = new Set()
  return [
    ...(sp.trends || []).map((t) => ({ term: t.label, delta: trendChange(t.label, t.value) })),
    ...nicheKeywords(space, rangeKey).map((k) => ({ term: keywordLabel(k.term), delta: k.delta })),
  ].filter((t) => t.delta > 0 && !seen.has(t.term.toLowerCase()) && seen.add(t.term.toLowerCase()))
    .sort((a, b) => b.delta - a.delta)
}

export function nicheKeywords(space, rangeKey) {
  const sp = spaceOf(space)
  if (!sp || !sp.keywords) return []
  const rng = RANGES.find((r) => r.key === rangeKey) || RANGES[0]
  const total = Math.round((sp.nicheVolume || 0) * Math.pow(rng.days / 30, 0.88))
  const seed = [...space].reduce((n, ch) => n + ch.charCodeAt(0), 0)
  return sp.keywords.map((term, i) => ({
    term,
    // ~24% of the window for the leader, tapering: the five come to about 60% of it, which
    // leaves the long tail the card does not name.
    value: Math.round(total * (0.24 * Math.pow(0.72, i))),
    // Never exactly zero — a keyword reading "0%" looks like a bug rather than a flat week.
    delta: (((seed * (i + 5)) % 31) - 8) || 3,
  }))
}

// Daily series for the five keywords, so the Mentions card can draw them as lines rather
// than rank them as rows. One curve per keyword, each normalised to the window total that
// nicheKeywords already publishes, so the line and the legend can never disagree.
//
// The five deliberately do NOT sum to the card's headline: nicheKeywords cuts them to about
// 60% of the window and leaves the tail unnamed. The tooltip therefore shows the day's total
// and the five beneath it without implying the one is the sum of the others.
export function keywordSeries(space, rangeKey) {
  const rng = RANGES.find((r) => r.key === rangeKey) || RANGES[0]
  const points = rng.days
  const kws = nicheKeywords(space, rangeKey)
  if (!kws.length || points < 2) return { points: [], series: [], totals: [] }

  const seed = [...(space || '')].reduce((n, ch) => n + ch.charCodeAt(0), 0)

  // Largest-remainder, the same technique the competitor shares use: hand the leftover units
  // to the days that lost the most to rounding, so each row sums to its published figure.
  const spread = (total, weights) => {
    const sum = weights.reduce((a, b) => a + b, 0)
    const raw = weights.map((w) => (w / sum) * total)
    const out = raw.map(Math.floor)
    let left = total - out.reduce((a, b) => a + b, 0)
    raw.map((v, i) => ({ i, frac: v - out[i] }))
      .sort((a, b) => b.frac - a.frac)
      .slice(0, left)
      .forEach((o) => { out[o.i]++ })
    return out
  }

  // Each keyword gets its own phase and amplitude off the seed, so the five lines have
  // genuinely different shapes instead of five copies of one curve at different heights.
  const series = kws.map((k, i) => {
    const phase = ((seed + i * 37) % 11) / 11 * Math.PI * 2
    const amp = 0.16 + ((seed + i * 13) % 7) / 100
    const drift = (((seed * (i + 3)) % 9) - 4) / 60
    const weights = Array.from({ length: points }, (_, j) => {
      const t = j / (points - 1)
      return Math.max(0.05, 1 + amp * Math.sin(t * Math.PI * 2 + phase) + drift * (t - 0.5) * 2)
    })
    return { term: k.term, value: k.value, delta: k.delta, days: spread(k.value, weights) }
  })

  // The niche's own daily total, on its own gentle curve. Always at least the five, since
  // the five are a subset of it by construction.
  const windowTotal = Math.round((spaceOf(space) ? spaceOf(space).nicheVolume : 0) * Math.pow(rng.days / 30, 0.88))
  const baseWeights = Array.from({ length: points }, (_, j) => {
    const t = j / (points - 1)
    return 1 + 0.12 * Math.sin(t * Math.PI * 2 + (seed % 7) / 7 * Math.PI * 2)
  })
  const totals = spread(windowTotal, baseWeights).map((v, j) => {
    const five = series.reduce((a, sr) => a + sr.days[j], 0)
    return Math.max(v, five)
  })

  return { points, series, totals }
}

export function nicheTrends(space, rangeKey = 'last-7') {
  const sp = spaceOf(space)
  if (!sp) return null
  const rng = RANGES.find((r) => r.key === rangeKey) || RANGES[0]
  const span = Math.sqrt(rng.days / 7)
  const labels = sp.trends.map((t) => midSentence(t.label))
  const seed = [...space.toLowerCase()].reduce((n, c) => n + c.charCodeAt(0), 0)

  const sources = TREND_SOURCES.map((src, si) => {
    const rows = Array.from({ length: 5 }, (_, i) => {
      const l = labels[i % labels.length]
      const term = src.key === 'instagram'
        ? hashtag(l, i)
        : TREND_PATTERNS[src.key][i].replace('{l}', l)
      // Descending by construction: a ranked list whose numbers don't descend is a bug
      // waiting to be reported, and these are ranked.
      const base = Math.round((sp.nicheVolume / (14 + si * 9)) * span)
      return {
        term,
        value: Math.round(base * (1 - i * 0.17) * (0.85 + ((seed * (i + 2) * (si + 3)) % 30) / 100)),
        isNew: (seed + i * 7 + si * 11) % 5 < 2,
      }
    }).sort((a, b) => b.value - a.value)
    return { ...src, rows }
  })

  const rows = sources.flatMap((s) => s.rows)
  return {
    range: rng,
    sources,
    climbing: rows.length,
    fresh: rows.filter((r) => r.isNew).length,
    // The fastest riser across all three, for the closing line.
    top: sources[0].rows[0],
  }
}


// Platform trends for the simplified Trends tab (Shivam, 5 Oct): what is trending on each source
// regardless of industry, from the six feeds the product already pulls. Snapshot per range; the
// range picker stops at 30 days, which is as far back as these go. 21 Oct: twelve per source, so
// the pop-up's three-across cards fill their rows (Sujit: "show 12 instead of 10").
const PLATFORM_TRENDS = [
  { key: 'google', label: 'Google Trends', unit: 'searches', icon: 'google', terms: ['World Cup qualifiers', 'iPhone 18 release date', 'Diwali sale', 'Monsoon forecast', 'Champions League', 'Halloween costumes', 'Black Friday deals', 'Pumpkin spice latte', 'Flu shot near me', 'Fantasy football', 'Election results', 'Northern lights tonight'] },
  { key: 'pinterest', label: 'Pinterest', unit: 'pins', icon: 'pinterest', terms: ['Autumn nail ideas', 'Festive table setting', 'Capsule wardrobe 2026', 'Small balcony garden', 'Minimal home office', 'Halloween door decor', 'Cozy reading nook', 'Thanksgiving board', 'Diwali rangoli', 'Gift wrap ideas', 'Fall wreath DIY', 'Winter skincare routine'] },
  { key: 'wikipedia', label: 'Wikipedia', unit: 'page views', icon: 'wikipedia', terms: ['FIFA World Cup 2026', 'Nobel Prize in Physics', 'Diwali', 'James Webb Space Telescope', 'Cricket World Cup', 'Halloween', 'Artemis III', 'Marie Curie', 'Day of the Dead', 'F1 2026 season', 'Guy Fawkes Night', 'Interstellar comet 3I/ATLAS'] },
  { key: 'yt-channels', label: 'YouTube popular channels', unit: 'views', icon: 'youtube', terms: ['MrBeast', 'Mark Rober', 'Kurzgesagt', 'Dude Perfect', 'Veritasium', 'Ryan Trahan', 'Marques Brownlee', 'Yes Theory', 'Smarter Every Day', 'Tasty', 'Airrack', 'Good Mythical Morning'] },
  { key: 'yt-keywords', label: 'YouTube popular keywords', unit: 'searches', icon: 'youtube', terms: ['Highlights', 'Live match', 'Recipe', 'Unboxing', 'Workout at home', 'Study with me', 'Room makeover', 'Travel vlog', 'Car review', 'Guitar lesson', 'Meal prep', 'Skincare routine'] },
  { key: 'yt-videos', label: 'YouTube trending videos', unit: 'views', icon: 'youtube', terms: ['Official trailer', 'Match highlights', 'Phone review', 'Street food tour', 'Late night monologue', 'Halloween makeup', 'Diwali recipes', 'Day in my life vlog', 'Fall outfit haul', 'Budget travel tips', 'Gaming setup tour', 'Pumpkin carving'] },
]
export function platformTrends(rangeKey = 'last-7') {
  const rng = RANGES.find((r) => r.key === rangeKey) || RANGES[0]
  const span = Math.sqrt(rng.days / 7)
  const sources = PLATFORM_TRENDS.map((src, si) => {
    const rows = src.terms.map((term, i) => ({
      term,
      // 19 Oct: ten per source for the trends pop-up; the first five keep their figures.
      value: Math.round((2400000 / (1 + si * 0.6)) * span * (i < 5 ? 1 - i * 0.16 : 0.36 * Math.pow(0.85, i - 4))),
      isNew: (i * 7 + si * 3) % 5 < 2,
    }))
    return { key: src.key, label: src.label, unit: src.unit, icon: src.icon, rows }
  })
  const rows = sources.flatMap((s) => s.rows)
  return { range: rng, sources, climbing: rows.length, fresh: rows.filter((r) => r.isNew).length, top: sources[0].rows[0] }
}
