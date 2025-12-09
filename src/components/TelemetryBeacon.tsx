"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Simple DJB2 hash (same as Worker)
function djb2Hash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

interface TelemetryPayload {
  path: string;
  ref: string;
  uaHash: string;
}

export default function TelemetryBeacon() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const telemetryUrl = process.env.NEXT_PUBLIC_TELEMETRY_URL;

    // Skip if no URL configured or same path (prevent double-fires)
    if (!telemetryUrl || pathname === lastPath.current) {
      return;
    }

    lastPath.current = pathname;

    const payload: TelemetryPayload = {
      path: pathname,
      ref: typeof document !== 'undefined' ? document.referrer : '',
      uaHash: typeof navigator !== 'undefined' ? djb2Hash(navigator.userAgent) : '',
    };

    // Use sendBeacon for reliability (doesn't block navigation)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(`${telemetryUrl}/ingest`, blob);
    } else {
      // Fallback to fetch with keepalive
      fetch(`${telemetryUrl}/ingest`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {
        // Silently fail - telemetry is non-critical
      });
    }
  }, [pathname]);

  // Render nothing - this is a side-effect component
  return null;
}
