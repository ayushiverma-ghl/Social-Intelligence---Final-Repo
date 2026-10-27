# Social Intelligence — final design

The final, reviewed design for Social Intelligence (Marketing › Social planner › Social intelligence). This repo holds only the design the team builds from. Earlier iterations live elsewhere and are not part of it.

Vue 3, Vite and Tailwind CSS v4, built on HighRise (`@platform-ui/highrise`) and `@gohighlevel/ghl-icons`. All data is sample data in `src/data/socialListening.js`; there are no API calls.

## Run it

1. Make sure your machine can install the private packages (`@platform-ui/highrise`, `@gohighlevel/*`), as for any HighLevel frontend repo.
2. `npm install`
3. `npm run dev`, then open http://localhost:5173/

Every URL opens the final design.

## Screens

| Tab / screen | What it is | Main files |
|---|---|---|
| Landing | First visit for an account with no industry on file: "Pick your industry" | `ZeroState.vue`, `SpacePickerModal.vue` |
| Overview | AI summary · Mentions (last 7 days) + Industry trends · Competitors + Trending now · What to post next | `DashboardOverview.vue`, `MentionsTabsCard.vue`, `CompetitorsCard.vue`, `TrendsCard.vue` |
| Explore | Search, trending keywords (one line, "+N"), Create a topic, Your topics table | `InsightsTab.vue`, `ExploreStarter.vue`, `OverviewListening.vue`, `TrendChipRow.vue`, `YourTopicsPage.vue` |
| Trends | Six sources (Google, Pinterest, Wikipedia, YouTube videos / searches / channels), 12 each, "12 of 50 · Show more" up to 50 | `TrendsHome.vue`, `TrendsScroll.vue`, `trendsData.js` |
| Competitors | Coming soon (disabled tab) | `pages/SocialListening.vue` |
| Results (a search or a topic) | Full page: date range 7 / 15 / 30 days with a Refreshing state, platform multi-select with logos, Facebook public Pages, sections with a scroll-following side list, top 10 posts + Show more, alerts, Start / Stop listening | `TopicPanel.vue` (page mode), `TopicSections.vue`, `FacebookSourcesModal.vue`, `CreateAlertModal.vue` |
| Create a topic | Two-step modal; ticking Facebook opens its public Pages setup | `CreateTopicModal.vue` |

App state lives in `src/composables/useSocialListening.js`.

## States (Demo button, bottom right)

The Demo panel switches the account between the states QA should cover: **No industry** (the landing), **New**, **Growing**, **Problem**, **Steady**, plus **Start over**. Other cases (the 50-topic limit, a search with no posts, alerts) are reachable in the product itself.

## Decisions behind this version

- Single design; no older-design switch (developer review, 27 Oct).
- Mentions on the Overview: last 7 days, count only (no last-week comparison, no tabs).
- Your topics table: Mentions · 7 days, Change, Alerts (no 7-day chart, no Positive %), for API cost.
- Trends: 50 per source from the API, 12 shown first.
- Posts on the results page: 10 at a time.
- Industry trends numbers stay until the API cost is confirmed.
