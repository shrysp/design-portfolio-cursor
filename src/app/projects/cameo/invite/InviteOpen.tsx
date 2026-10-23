"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEntrance } from "@/components/cameo/entrance/context";
import PowerOn from "@/components/cameo/entrance/PowerOn";
import { TOUR } from "@/components/cameo/entrance/context";
import type { Invitation } from "@/lib/tour/server/access";

/**
 * Opens the way in once the screen is switched on (PowerOn), from where PIP
 * will wake: that press is what lets the opening be heard. It is
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
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on) return;
    open({
      origin: [window.innerWidth / 2, window.innerHeight * 0.39],
      theme: "screen",
      unlocked: true,
      invite: invitation ?? undefined,
      onClosed: () => {
        if (window.location.pathname !== TOUR) router.push("/projects/cameo");
      },
    });
    // Once, on switching on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);
  if (!on) return <PowerOn name={invitation?.name} onOn={() => setOn(true)} />;
  // The dark of the room, until the takeover is over it.
  return <div className="fixed inset-0 bg-[#0b0d10]" data-dark-room aria-hidden />;
}
