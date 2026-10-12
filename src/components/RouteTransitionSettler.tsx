"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { routeSettled } from "@/lib/routeTransition";

// Tells a waiting page transition that the new route has been drawn
export default function RouteTransitionSettler() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    routeSettled();
  }, [pathname]);

  return null;
}
