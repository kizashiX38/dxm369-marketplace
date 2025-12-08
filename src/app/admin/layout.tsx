// src/app/admin/layout.tsx
// DXM369 Admin Console Layout
// Clean full-width admin layout

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DXM369 Admin Console",
  description: "DXM369 Executive Dashboard - Analytics, Newsletter, Products",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#080c12] text-slate-200">
      {/* Main Content - Full Width */}
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}

