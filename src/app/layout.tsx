import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CyberSidebar from "@/components/CyberSidebar";
import TelemetryBeacon from "@/components/TelemetryBeacon";
import { baseSEO, generateOrganizationStructuredData, generateWebsiteStructuredData } from "@/lib/seo";

export const metadata: Metadata = baseSEO;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationData = generateOrganizationStructuredData();
  const websiteData = generateWebsiteStructuredData();

  return (
    <html lang="en">
      <head>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteData),
          }}
        />
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://amazon.com" />
        <link rel="preconnect" href="https://images-na.ssl-images-amazon.com" />
        {/* Canonical URL */}
        <link rel="canonical" href="https://dxm369.com" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#080c12] text-slate-200 relative">
        {/* Enhanced ambient background layers */}
        <div className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-br from-[#080c12] via-[#0a0f18] to-[#0c1220]" />
        
        {/* Holographic ambient lighting */}
        <div 
          className="pointer-events-none fixed inset-0 -z-19 opacity-[0.08]"
          style={{
            background: "radial-gradient(ellipse at 20% 30%, rgba(6, 182, 212, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(34, 211, 238, 0.1) 0%, transparent 50%)"
          }}
        />
        
        {/* Enhanced grid overlay with depth */}
        <div
          className="pointer-events-none fixed inset-0 -z-18 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(6, 182, 212, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.08) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        
        {/* Glass scanlines with enhanced opacity */}
        <div
          className="pointer-events-none fixed inset-0 -z-17 opacity-[0.02] scanline-overlay"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.12) 0.5px, transparent 0.5px)",
            backgroundSize: "100% 3px",
            mixBlendMode: "screen",
          }}
        />
        
        {/* Subtle film grain overlay */}
        <div 
          className="pointer-events-none fixed inset-0 -z-16 opacity-[0.008]"
          style={{
            backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjMiLz48L3N2Zz4=')",
            backgroundSize: "200px 200px"
          }}
        />

        <Header />

        <div className="flex pt-16 min-h-screen">
          {/* Left Sidebar Navigation */}
          <CyberSidebar />

          {/* Main Content Area */}
          <main className="flex-1 pb-10 md:ml-0 ml-0">
            <div className="max-w-none px-4 md:px-6 pt-4 md:pt-0">
              {children}
            </div>
          </main>
        </div>

        <Footer />
        <TelemetryBeacon />
        <Analytics />
      </body>
    </html>
  );
}
