import clips from "./og-videos.json";

// Where the site lives, so share previews can point at full addresses.
// Vercel supplies the production domain; set NEXT_PUBLIC_SITE_URL to override it.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

/**
 * The loops that play in a link's preview, in the apps that play them —
 * iMessage plays an og:video inline, muted, in place of the picture; Discord
 * plays it in its embed. Everywhere else (Slack, WhatsApp, LinkedIn, X) shows
 * og:image as before, so every page keeps one.
 *
 * Cut by `npm run og:videos` from the list in og-videos.json, plus `invite`,
 * recorded from the invitation itself.
 */
export type PreviewVideo = Exclude<keyof typeof clips, "$comment"> | "invite" | HomePreview;

/** Recorded from the site rather than cut from footage (scripts/generate-og-videos.mjs). */
const RECORDED = ["invite", "home-journal", "home-work"];

export function hasPreviewVideo(name: string): name is PreviewVideo {
  return RECORDED.includes(name) || (name in clips && name !== "$comment");
}

/**
 * How the home link is shared, of the two scenes made for it
 * (src/app/dev/og-scenes): `home-work`, the case studies dealt like cards with
 * the name sticker slapped on last; `home-journal`, the homepage's journal
 * getting its sticker, opening, turning two pages and shutting between its
 * stickers. Each scene's last frame is its picture (public/og/<name>.jpg).
 */
export type HomePreview = "home-work" | "home-journal";
export const HOME_PREVIEW: HomePreview = "home-work";

/** The home link's picture, for openGraph.images. */
export function homeImage(name: HomePreview = HOME_PREVIEW) {
  return { url: `/og/${name}.jpg`, width: 1200, height: 630, alt: "Shreyas Patil, product designer" };
}

/**
 * A loop as Next's openGraph.videos takes it: one entry, the size of the share
 * images. Its address in full, since Next resolves only images against
 * metadataBase and leaves a video's as written.
 */
export function previewVideo(name: PreviewVideo) {
  const url = new URL(`/og/video/${name}.mp4`, SITE_URL).toString();
  return [{ url, secureUrl: url, type: "video/mp4", width: 1200, height: 630 }];
}

/**
 * Apps that fetch a link to draw its preview, by the name they give. iMessage
 * reads as facebookexternalhit and Twitterbot both; Signal fetches as
 * WhatsApp; Teams as SkypeUriPreview.
 */
const PREVIEWERS =
  /facebookexternalhit|facebot|twitterbot|slackbot|slack-imgproxy|discordbot|whatsapp|linkedinbot|telegrambot|skypeuripreview|applebot|redditbot|embedly|iframely|pinterest|vkshare|mastodon|bluesky|cardyb|google-pagerenderer|snapchat|viber/i;

/** Whether a request is an app drawing a link preview, not a person following the link. */
export function isLinkPreviewer(request: Request): boolean {
  return PREVIEWERS.test(request.headers.get("user-agent") ?? "");
}
