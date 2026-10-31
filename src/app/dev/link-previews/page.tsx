import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { HOME_PREVIEW, SITE_URL, type HomePreview } from "@/lib/linkPreview";

export const metadata = { title: "Link previews", robots: { index: false } };

/** What iMessage calls itself when it fetches a link, and so what every page here is fetched as. */
const PREVIEWER = "facebookexternalhit/1.1 Facebot Twitterbot/1.0";

type Tags = Record<string, string>;
type Preview = { path: string; tags: Tags; error?: string };

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
const decode = (s: string) =>
  s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e: string) =>
    e[0] === "#" ? String.fromCodePoint(parseInt(e.slice(1).replace(/^x/i, ""), e[1] === "x" ? 16 : 10)) : (ENTITIES[e] ?? m),
  );

/** Every <meta> on the page, by property or name; the first of each wins, as the apps read them. */
function readTags(html: string): Tags {
  const tags: Tags = {};
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attr = (n: string) => tag.match(new RegExp(`\\b${n}=["']([^"']*)["']`, "i"))?.[1];
    const key = attr("property") ?? attr("name");
    const content = attr("content");
    if (key && content !== undefined && !(key in tags)) tags[key] = decode(content);
  }
  tags["<title>"] = decode(html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "");
  return tags;
}

async function fetchPreview(origin: string, path: string): Promise<Preview> {
  try {
    const res = await fetch(new URL(path, origin), { headers: { "user-agent": PREVIEWER }, cache: "no-store" });
    // Addresses on the site as configured (localhost:3000 by default) are this server's
    const html = (await res.text()).replaceAll(SITE_URL, origin);
    return { path, tags: readTags(html) };
  } catch (err) {
    return { path, tags: {}, error: String(err) };
  }
}

/**
 * Development only: each of the site's links as the apps it gets sent through
 * would draw it, from the tags the page actually serves to them — fetched
 * here as iMessage fetches (which is also what an invitation link checks
 * for). Where an app plays og:video the card plays it. The cards are close
 * to each app's, not pixel copies; the real test is sending the link.
 *
 * `?add=/some/path` adds a link. With TOUR_DEV_CODE set, its invitation link
 * is here too (TOUR_DEV_INVITE makes it one with a ticket).
 */
export default async function LinkPreviewsPage({ searchParams }: { searchParams: Promise<{ add?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const { add } = await searchParams;
  const paths = [
    "/",
    "/projects/cameo",
    "/projects/itinerai",
    "/projects/quinn",
    ...(process.env.TOUR_DEV_CODE ? [`/invite/${process.env.TOUR_DEV_CODE}`] : []),
    ...(add ? [add.startsWith("/") ? add : `/${add}`] : []),
  ];
  const previews = await Promise.all(paths.map((p) => fetchPreview(origin, p)));
  // The home link's other candidate, as it would read if HOME_PREVIEW named it
  const home = previews[0];
  const others: HomePreview[] = (["home-work", "home-journal"] as const).filter((n) => n !== HOME_PREVIEW);
  previews.splice(
    1,
    0,
    ...others.map((n) => ({
      path: `/  (if HOME_PREVIEW were "${n}")`,
      tags: { ...home.tags, "og:image": `${origin}/og/${n}.jpg`, "twitter:image": `${origin}/og/${n}.jpg`, "og:video": `${origin}/og/video/${n}.mp4` },
    })),
  );
  previews[0] = { ...home, path: `/  (HOME_PREVIEW: "${HOME_PREVIEW}")` };

  return (
    <main className="min-h-screen bg-stone-100 px-8 py-10 text-stone-900">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-xl font-semibold">Link previews</h1>
          <p className="mt-1 max-w-xl text-sm text-stone-500">
            Each link as it would unfurl, from the tags served to a link previewer. iMessage and Discord play og:video in
            place of the picture; the others show og:image.
          </p>
        </div>
        <form className="flex gap-2">
          <input
            name="add"
            defaultValue={add}
            placeholder="/projects/dashworks"
            className="w-64 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm"
          />
          <button className="rounded-lg bg-stone-900 px-3 py-1.5 text-sm text-white">Add link</button>
        </form>
      </header>
      <div className="flex flex-col gap-14">
        {previews.map((p) => (
          <section key={p.path}>
            <h2 className="mb-4 font-mono text-sm text-stone-600">{p.path}</h2>
            {p.error ? (
              <p className="text-sm text-red-600">{p.error}</p>
            ) : (
              <div className="flex flex-wrap items-start gap-6">
                <Messages tags={p.tags} />
                <Discord tags={p.tags} />
                <Slack tags={p.tags} />
                <WhatsApp tags={p.tags} />
                <X tags={p.tags} />
              </div>
            )}
            <details className="mt-4 text-xs text-stone-500">
              <summary className="cursor-pointer">Tags served</summary>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-white p-3 leading-relaxed">
                {Object.entries(p.tags)
                  .filter(([k]) => /^(og:|twitter:|<title>|description)/.test(k))
                  .map(([k, v]) => `${k.padEnd(22)} ${v}`)
                  .join("\n")}
              </pre>
            </details>
          </section>
        ))}
      </div>
    </main>
  );
}

const title = (t: Tags) => t["og:title"] || t["twitter:title"] || t["<title>"];
const description = (t: Tags) => t["og:description"] || t["twitter:description"] || t.description;
const image = (t: Tags) => t["og:image"] || t["twitter:image"];
const video = (t: Tags) => (t["og:video:type"] ?? "video/mp4") === "video/mp4" ? t["og:video"] || t["og:video:url"] : undefined;
const domain = (t: Tags) => {
  try {
    return new URL(t["og:url"] || image(t) || "").host.replace(/^www\./, "");
  } catch {
    return "";
  }
};

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-stone-400">{children}</p>;
}

/** The picture, or the loop where the app plays one: muted, looping, as a preview plays it. */
function Media({ tags, plays, className = "" }: { tags: Tags; plays: boolean; className?: string }) {
  const v = plays ? video(tags) : undefined;
  if (v) return <video src={v} poster={image(tags)} autoPlay muted loop playsInline className={`aspect-[1200/630] w-full object-cover ${className}`} />;
  const src = image(tags);
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt="" className={`aspect-[1200/630] w-full object-cover ${className}`} /> : null;
}

/** iMessage: the loop or picture over a grey strip with the title and the site. */
function Messages({ tags }: { tags: Tags }) {
  return (
    <div className="w-[290px]">
      <Label>iMessage</Label>
      <div className="overflow-hidden rounded-[18px] bg-[#e9e9eb]">
        <Media tags={tags} plays />
        <div className="px-3.5 py-2.5">
          <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-black">{title(tags)}</p>
          <p className="text-[13px] text-[#8e8e93]">{domain(tags)}</p>
        </div>
      </div>
    </div>
  );
}

/** Discord: an embed with a coloured edge; the loop plays in it. */
function Discord({ tags }: { tags: Tags }) {
  return (
    <div className="w-[310px]">
      <Label>Discord</Label>
      <div className="rounded-md border-l-4 border-[#1e1f22] bg-[#2b2d31] p-3 text-[14px]">
        <p className="text-[12px] text-[#b5bac1]">{tags["og:site_name"] ?? domain(tags)}</p>
        <p className="mt-1 font-semibold text-[#00a8fc]">{title(tags)}</p>
        <p className="mt-1 line-clamp-3 text-[#dbdee1]">{description(tags)}</p>
        <Media tags={tags} plays className="mt-3 rounded" />
      </div>
    </div>
  );
}

/** Slack: an unfurl beside a grey rule; pictures only. */
function Slack({ tags }: { tags: Tags }) {
  return (
    <div className="w-[310px]">
      <Label>Slack</Label>
      <div className="border-l-4 border-[#dddddd] bg-white py-1 pl-3 pr-2 text-[15px]">
        <p className="font-bold text-[#1d1c1d]">{tags["og:site_name"] ?? domain(tags)}</p>
        <p className="font-bold text-[#1264a3]">{title(tags)}</p>
        <p className="line-clamp-3 text-[#1d1c1d]">{description(tags)}</p>
        <Media tags={tags} plays={false} className="mt-2 max-w-[300px] rounded-lg" />
      </div>
    </div>
  );
}

/** WhatsApp: the picture on top of a green bubble. */
function WhatsApp({ tags }: { tags: Tags }) {
  return (
    <div className="w-[290px]">
      <Label>WhatsApp</Label>
      <div className="rounded-lg bg-[#d9fdd3] p-1">
        <div className="overflow-hidden rounded-md bg-[#cdf0c6]">
          <Media tags={tags} plays={false} />
          <div className="px-2.5 py-2">
            <p className="line-clamp-2 text-[14px] font-semibold text-[#111b21]">{title(tags)}</p>
            <p className="line-clamp-2 text-[13px] text-[#54656f]">{description(tags)}</p>
            <p className="text-[12px] text-[#667781]">{domain(tags)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** X: the picture alone, with the title over its foot and the site under it. */
function X({ tags }: { tags: Tags }) {
  return (
    <div className="w-[290px]">
      <Label>X</Label>
      <div className="relative overflow-hidden rounded-2xl border border-[#cfd9de]">
        <Media tags={tags} plays={false} />
        <p className="absolute bottom-2 left-2 max-w-[90%] truncate rounded bg-black/75 px-1.5 text-[13px] text-white">
          {tags["twitter:title"] || title(tags)}
        </p>
      </div>
      <p className="mt-1 text-[13px] text-[#536471]">From {domain(tags)}</p>
    </div>
  );
}
