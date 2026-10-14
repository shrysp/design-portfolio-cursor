import { notFound } from "next/navigation";
import InvitePreview from "./InvitePreview";

export const metadata = { title: "Tour invitation", robots: { index: false } };

/**
 * Development only: the way in as an invited guest sees it — PIP prints them
 * a ticket instead of asking for a code. Tearing the stub prints it again.
 * `?name=Jordan&no=7&note=…`
 */
export default function TourInvitePage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <InvitePreview />;
}
