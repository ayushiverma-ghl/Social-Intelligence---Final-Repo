// Brand marks for every listening source, in one place.
//
// This map was copy-pasted in ConnectSocialModal and ConnectedAccountsModal, and the topics
// table would have been the third copy — which is how a newly added platform ends up with a
// logo in one flow and a blank in another.
//
// It lives here rather than in socialListening.js because that file is deliberately
// framework-free: it holds data, not Vue components. Same data/presentation split as
// FORMAT_ICONS in DashboardOverview and the per-kind thumbnail treatments.
//
// `misc` is the brand set — full-colour marks with their own gradients — not the outline
// set. There is also a `*DefaultIcon` variant of several of these carrying the official
// brand hex (Reddit #FF4500 against #FC471E here); the connect modals have always used the
// non-Default ones, so these match what is already on screen.
import {
  InstagramIcon, FacebookIcon, TiktokIcon, YoutubeIcon,
  LinkedinIcon, PinterestIcon, RedditIcon, TelegramIcon,
} from '@gohighlevel/ghl-icons/24/misc'
// The open web has no brand, so it takes the outline globe.
import { Globe01Icon } from '@gohighlevel/ghl-icons/24/outline'

import { h } from 'vue'
// 19 Oct: X's current mark; the icon set only has the old bird.
const XIcon = (props) => h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', ...props }, [h('path', { d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z' })])
export const NETWORK_ICONS = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  tiktok: TiktokIcon,
  youtube: YoutubeIcon,
  x: XIcon,
  linkedin: LinkedinIcon,
  pinterest: PinterestIcon,
  reddit: RedditIcon,
  telegram: TelegramIcon,
  web: Globe01Icon,
}
