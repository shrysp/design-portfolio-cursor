"use client";

import { useEffect, useState } from "react";
import CrtLayer from "@/components/cameo/crt/CrtLayer";
import { Takeover } from "@/components/cameo/entrance/TourEntrance";
import type { Invite } from "@/components/cameo/entrance/InviteTicket";
import PowerOn from "@/components/cameo/entrance/PowerOn";

const SAMPLE_NOTE =
  "You were the first person I told about Cameo. Come say hi to PIP, it has been waiting for you.";

/** `printOnly`: tearing always prints again, whatever the address says — for the live review copy. */
export default function InvitePreview({ printOnly = false }: { printOnly?: boolean }) {
  const [invite, setInvite] = useState<(Invite & { preview: boolean }) | null>(
    null,
  );
  const [run, setRun] = useState(0);
  // Switched on as the real link is (InviteOpen), so the opening is heard here too.
  const [on, setOn] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setInvite({
      name: q.get("name") || "Jordan",
      number: Number(q.get("no")) || 7,
      note: q.has("note") ? q.get("note") || undefined : SAMPLE_NOTE,
      // ?enter=1: tearing goes in for real (the glitch, the dive), rather than printing again.
      preview: printOnly || q.get("enter") !== "1",
    });
  }, [printOnly]);
  if (!invite) return null;
  if (!on) return <PowerOn name={invite.name} onOn={() => setOn(true)} />;
  return (
    <>
      {/* The dark of the room, as on the real link (InviteOpen), until the takeover is over it. */}
      <div className="fixed inset-0 bg-[#0b0d10]" data-dark-room aria-hidden />
      <CrtLayer />
      <Takeover
        key={run}
        unlocked={false}
        origin={[
          typeof window === "undefined" ? 0 : window.innerWidth / 2,
          typeof window === "undefined" ? 0 : window.innerHeight / 2,
        ]}
        theme="screen"
        invite={invite}
        // Back to the case study, here: open the whole way in again.
        onClosed={() => setRun((n) => n + 1)}
      />
    </>
  );
}
