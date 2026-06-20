"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** Gives route clicks a frame-one response while Next.js fetches the next route. */
export function NavigationFeedback() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  useEffect(() => { setPending(false); }, [pathname]);
  useEffect(() => {
    function detectNavigation(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || (url.pathname === window.location.pathname && url.search === window.location.search) || url.hash) return;
      setPending(true);
      window.setTimeout(() => setPending(false), 5000);
    }
    document.addEventListener("click", detectNavigation, true);
    return () => document.removeEventListener("click", detectNavigation, true);
  }, []);

  return pending ? <div className="pointer-events-none fixed inset-x-0 top-0 z-[300] h-1 overflow-hidden bg-wine/10" role="progressbar" aria-label="Opening page"><div className="route-progress h-full w-2/3 bg-gradient-to-r from-rose via-wine to-rose" /></div> : null;
}
