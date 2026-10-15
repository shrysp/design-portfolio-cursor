import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { invitationFor } from "@/lib/tour/server/access";
import { ACCESS_COOKIE, verifyAccess } from "@/lib/tour/server/auth";
import { onPhone } from "@/lib/tour/server/phone";
import LaptopOnly from "@/components/cameo/entrance/LaptopOnly";
import InviteOpen from "./InviteOpen";

export const metadata: Metadata = {
  title: "An invitation from PIP",
  robots: { index: false, follow: false },
};

/**
 * Where an invitation link (/invite/<code>) lands, unlocked: the way in opens
 * at once — on their ticket if their row is ticked Invite, straight through
 * into the tour if not.
 */
export default async function InvitePage() {
  const id = await verifyAccess((await cookies()).get(ACCESS_COOKIE)?.value);
  if (!id) redirect("/projects/cameo#tour");
  const invitation = await invitationFor(id).catch(() => null);
  // Their link still works on a laptop, so a phone is told to open it there.
  if (await onPhone()) return <LaptopOnly name={invitation?.name} />;
  return <InviteOpen invitation={invitation} />;
}
