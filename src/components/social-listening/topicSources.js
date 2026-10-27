// The sources a topic can listen to, in one place (7 Oct). The Create topic modal lists them and
// the Topics landing shows their marks, so the two can never disagree on how many there are.
import { MusicNote02Icon, Globe02Icon, Send01Icon, File06Icon } from '@gohighlevel/ghl-icons/24/outline'

// The reference's ten sources, in its order. Keys match the rest of the app (x, not twitter).
// White marks on the brand colour, the same treatment as the orbit loader: six are drawn from
// paths, the four without a brand mark use outline icons.
export const TOPIC_SOURCES = [
  { key: 'facebook', name: 'Facebook', desc: 'Posts, visitor posts and comments', color: '#1877F2', d: 'M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.2-1.5 1.5-1.5h1.6V4.9c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.4v7h3.1z' },
  { key: 'x', name: 'X (Twitter)', desc: 'Posts, replies and reposts', color: '#0F172A', d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z' },
  { key: 'instagram', name: 'Instagram', desc: 'Posts and reels', color: '#E1306C' },
  { key: 'youtube', name: 'YouTube', desc: 'Videos only', color: '#FF0000', d: 'M23.5 6.2c-.3-1-1-1.8-2-2C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.5.6c-1 .3-1.7 1.1-2 2C0 8.2 0 12 0 12s0 3.8.5 5.8c.3 1 1 1.8 2 2 2 .5 9.5.5 9.5.5s7.5 0 9.5-.5c1-.3 1.7-1.1 2-2 .5-2 .5-5.8.5-5.8s0-3.8-.5-5.8zM9.5 15.6V8.4l6.4 3.6-6.4 3.6z' },
  { key: 'tiktok', name: 'TikTok', desc: 'Videos and comments', color: '#010101', icon: MusicNote02Icon },
  { key: 'linkedin', name: 'LinkedIn', desc: 'Posts, articles and comments', color: '#0A66C2', d: 'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z' },
  { key: 'reddit', name: 'Reddit', desc: 'Posts and comments', color: '#FF4500', d: 'M22 11.8c0-1.1-.9-2-2-2-.5 0-1 .2-1.4.6-1.4-.9-3.2-1.5-5.2-1.6l1-4.2 3 .7c0 .9.7 1.6 1.6 1.6.9 0 1.6-.7 1.6-1.6 0-.9-.7-1.6-1.6-1.6-.6 0-1.2.4-1.4.9L14.2 4c-.1 0-.2 0-.3.1-.1.1-.1.2-.1.3l-1.1 4.6c-2.1 0-4 .6-5.4 1.6-.4-.4-.9-.6-1.5-.6-1.1 0-2 .9-2 2 0 .8.5 1.5 1.1 1.8 0 .2-.1.4-.1.6 0 2.9 3.4 5.3 7.5 5.3s7.5-2.4 7.5-5.3c0-.2 0-.4-.1-.6.7-.3 1.2-1 1.2-1.8zM7 13.4c0-.7.6-1.3 1.3-1.3.7 0 1.3.6 1.3 1.3 0 .7-.6 1.3-1.3 1.3-.7 0-1.3-.6-1.3-1.3zm8 3.7c-1 1-2.6 1-3 1s-2 0-3-1c-.1-.1-.1-.3 0-.4.1-.1.3-.1.4 0 .6.6 2 .9 2.6.9.6 0 2-.2 2.6-.9.1-.1.3-.1.4 0 .1.1.1.3 0 .4zm-.3-2.4c-.7 0-1.3-.6-1.3-1.3 0-.7.6-1.3 1.3-1.3.7 0 1.3.6 1.3 1.3 0 .7-.6 1.3-1.3 1.3z' },
  { key: 'web', name: 'Web', desc: 'Blogs, articles and comments', color: '#155EEF', icon: Globe02Icon },
  { key: 'telegram', name: 'Telegram', desc: 'Posts and channels', color: '#0088CC', icon: Send01Icon },
  { key: 'news', name: 'News', desc: 'News articles and press releases', color: '#16A34A', icon: File06Icon },
]
