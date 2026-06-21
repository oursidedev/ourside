"use client";

import { RefreshCw } from "lucide-react";

/**
 * Refresh is intentionally isolated behind a client boundary.
 * Server Components cannot attach browser event handlers to DOM elements.
 */
export function RefreshButton() {
  return <button
    type="button"
    onClick={() => window.location.reload()}
    className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border bg-paper px-4 text-sm font-bold text-wine"
  >
    <RefreshCw className="h-4 w-4" />
    Refresh
  </button>;
}
