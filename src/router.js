import { createRouter, createWebHistory } from 'vue-router'
import Page1 from './pages/Page1.vue'
import SocialListening from './pages/SocialListening.vue'
import Demo_MainNav_Simple from './pages/Demo_MainNav_Simple.vue'
import Demo_MainNav_Tabbed from './pages/Demo_MainNav_Tabbed.vue'
import Demo_MainNav_Tabbed_VerticalTabs from './pages/Demo_MainNav_Tabbed_VerticalTabs.vue'
import Demo_MainNav_VerticalTabs_BackToolbar from './pages/Demo_MainNav_VerticalTabs_BackToolbar.vue'
import Demo_Level2 from './pages/Demo_Level2.vue'
import Demo_Fullscreen_Builder from './pages/Demo_Fullscreen_Builder.vue'
import Demo_Settings_Tabbed from './pages/Demo_Settings_Tabbed.vue'
import Demo_TopBar_VerticalTabs from './pages/Demo_TopBar_VerticalTabs.vue'
import Demo_Settings_VerticalTabs_BackToolbar from './pages/Demo_Settings_VerticalTabs_BackToolbar.vue'
import Demo_Fullscreen_VerticalTabs_BackToolbar from './pages/Demo_Fullscreen_VerticalTabs_BackToolbar.vue'

const routes = [
  { path: '/', redirect: '/social-listening' },
  // Sujeet's prototype links: the simplified and current designs.
  { path: '/new', redirect: '/social-listening?design=simplified' },
  { path: '/current', redirect: '/social-listening?design=current' },
  { path: '/ref/layouts', component: Page1 },
  { path: '/social-listening', component: SocialListening },
  { path: '/ref/main-nav-simple', component: Demo_MainNav_Simple },
  { path: '/ref/main-nav-tabbed', component: Demo_MainNav_Tabbed },
  { path: '/ref/main-nav-tabbed-vertical-tabs', component: Demo_MainNav_Tabbed_VerticalTabs },
  { path: '/ref/main-nav-vertical-tabs-back-toolbar', component: Demo_MainNav_VerticalTabs_BackToolbar },
  { path: '/ref/level2', component: Demo_Level2 },
  { path: '/ref/fullscreen-builder', component: Demo_Fullscreen_Builder },
  { path: '/ref/settings-tabbed', component: Demo_Settings_Tabbed },
  { path: '/ref/settings-vertical-tabs', component: Demo_TopBar_VerticalTabs },
  { path: '/ref/settings-vertical-tabs-back-toolbar', component: Demo_Settings_VerticalTabs_BackToolbar },
  { path: '/ref/fullscreen-vertical-tabs-back-toolbar', component: Demo_Fullscreen_VerticalTabs_BackToolbar },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
