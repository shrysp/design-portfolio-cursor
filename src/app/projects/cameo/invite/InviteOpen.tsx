"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEntrance } from "@/components/cameo/entrance/context";
import { TOUR } from "@/components/cameo/entrance/context";
import type { Invitation } from "@/lib/tour/server/access";

/**
 * Opens the way in as soon as the page is up, from where PIP will wake. It is
 * the layout's takeover (EntranceHost), so it carries on across the move into
 * the tour exactly as it does from the case study. Leaving it — its own Back —
 * goes to the case study, since there is no page under it here to return to.
 */
export default function InviteOpen({
  invitation,
}: {
  invitation: Invitation | null;
}) {
  const open = useEntrance();
  const router = useRouter();
  useEffect(() => {
    open({
      origin: [window.innerWidth / 2, window.innerHeight * 0.39],
      theme: "screen",
      unlocked: true,
      invite: invitation ?? undefined,
      onClosed: () => {
        if (window.location.pathname !== TOUR) router.push("/projects/cameo");
      },
    });
    // Once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // The dark of the room, until the takeover is over it.
  return <div className="fixed inset-0 bg-[#0b0d10]" aria-hidden />;
}
