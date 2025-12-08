// src/lib/launchReadinessChecks.ts
// Launch Readiness Checklist Data Model
// CLIENT-SAFE: Types and static data only

export type CheckStatus = "pass" | "warn" | "fail" | "unknown";
export type CheckCategory = "scan" | "env" | "deploy" | "security" | "final";
export type CheckGroup = "external" | "environment" | "deployment" | "security" | "final";

export interface LaunchCheck {
  id: string;
  label: string;
  description?: string;
  group: CheckGroup;
  category: CheckCategory;
  status: CheckStatus;
}

// All checks from the security checklist document
export const LAUNCH_CHECKS: LaunchCheck[] = [
  // External Security Scan
  { id: "scan-sucuri", label: "Sucuri SiteCheck scan completed", group: "external", category: "scan", status: "unknown" },
  { id: "scan-malware", label: "No malware signatures", group: "external", category: "scan", status: "unknown" },
  { id: "scan-blacklist", label: "No blacklisting (Google/McAfee/Yandex)", group: "external", category: "scan", status: "unknown" },
  { id: "scan-xss", label: "No XSS vulnerabilities", group: "external", category: "scan", status: "unknown" },
  { id: "scan-sql", label: "No SQL injection vectors", group: "external", category: "scan", status: "unknown" },
  { id: "scan-redirects", label: "No open redirects", group: "external", category: "scan", status: "unknown" },
  { id: "scan-path-traversal", label: "No path traversal risks", group: "external", category: "scan", status: "unknown" },
  { id: "scan-sensitive-files", label: "No sensitive files accessible", group: "external", category: "scan", status: "unknown" },
  { id: "scan-cors", label: "CORS configuration validated", group: "external", category: "scan", status: "unknown" },
  { id: "scan-csp", label: "CSP policy tested", group: "external", category: "scan", status: "unknown" },
  { id: "scan-cookies", label: "Cookies marked HttpOnly, Secure, SameSite", group: "external", category: "scan", status: "unknown" },
  { id: "scan-rate-limit", label: "Rate-limiting tested (429 responses)", group: "external", category: "scan", status: "unknown" },
  { id: "scan-directory-index", label: "Directory indexing disabled", group: "external", category: "scan", status: "unknown" },
  { id: "scan-ssl-rating", label: "SSL Labs A or A+ rating", group: "external", category: "scan", status: "unknown" },
  { id: "scan-tls13", label: "TLS 1.3 enabled", group: "external", category: "scan", status: "unknown" },
  { id: "scan-weak-ciphers", label: "No weak ciphers", group: "external", category: "scan", status: "unknown" },
  { id: "scan-hsts", label: "HSTS enabled (1 year minimum)", group: "external", category: "scan", status: "unknown" },
  { id: "scan-mixed-content", label: "Zero mixed-content errors", group: "external", category: "scan", status: "unknown" },
  { id: "scan-spf", label: "SPF valid", group: "external", category: "scan", status: "unknown" },
  { id: "scan-dkim", label: "DKIM valid", group: "external", category: "scan", status: "unknown" },
  { id: "scan-dmarc", label: "DMARC in quarantine or reject", group: "external", category: "scan", status: "unknown" },
  { id: "scan-dnssec", label: "DNSSEC enabled", group: "external", category: "scan", status: "unknown" },
  { id: "scan-caa", label: "CAA record configured", group: "external", category: "scan", status: "unknown" },
  { id: "scan-smtp", label: "No open SMTP relays", group: "external", category: "scan", status: "unknown" },
  { id: "scan-ports", label: "No exposed services on unexpected ports", group: "external", category: "scan", status: "unknown" },
  { id: "scan-robots", label: "robots.txt correct", group: "external", category: "scan", status: "unknown" },
  { id: "scan-sitemap", label: "sitemap.xml generated and accessible", group: "external", category: "scan", status: "unknown" },
  { id: "scan-rich-results", label: "Google Rich Results test passes", group: "external", category: "scan", status: "unknown" },
  { id: "scan-lighthouse", label: "Lighthouse Best Practices score above 95", group: "external", category: "scan", status: "unknown" },

  // Environment Configuration
  { id: "env-node-env", label: "NODE_ENV=production", group: "environment", category: "env", status: "unknown" },
  { id: "env-public-env", label: "NEXT_PUBLIC_ENV=production", group: "environment", category: "env", status: "unknown" },
  { id: "env-site-url", label: "NEXT_PUBLIC_SITE_URL=https://dxm369.com", group: "environment", category: "env", status: "unknown" },
  { id: "env-amazon-key", label: "AMAZON_ACCESS_KEY_ID", group: "environment", category: "env", status: "unknown" },
  { id: "env-amazon-secret", label: "AMAZON_SECRET_ACCESS_KEY", group: "environment", category: "env", status: "unknown" },
  { id: "env-amazon-tag", label: "AMAZON_ASSOCIATE_TAG", group: "environment", category: "env", status: "unknown" },
  { id: "env-amazon-public-tag", label: "NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG", group: "environment", category: "env", status: "unknown" },
  { id: "env-amazon-region", label: "AMAZON_REGION=us-east-1", group: "environment", category: "env", status: "unknown" },
  { id: "env-amazon-host", label: "AMAZON_HOST=webservices.amazon.com", group: "environment", category: "env", status: "unknown" },
  { id: "env-database-url", label: "DATABASE_URL (Neon/Supabase with SSL)", group: "environment", category: "env", status: "unknown" },
  { id: "env-admin-secret", label: "ADMIN_SECRET", group: "environment", category: "env", status: "unknown" },
  { id: "env-app-secret", label: "APP_SECRET", group: "environment", category: "env", status: "unknown" },
  { id: "env-jwt-secret", label: "JWT_SECRET", group: "environment", category: "env", status: "unknown" },
  { id: "env-rate-limit-secret", label: "RATE_LIMIT_SECRET", group: "environment", category: "env", status: "unknown" },
  { id: "env-cron-secret", label: "CRON_SECRET", group: "environment", category: "env", status: "unknown" },
  { id: "env-no-placeholders", label: "No placeholder values remain", group: "environment", category: "env", status: "unknown" },
  { id: "env-no-local-urls", label: "No local URLs in production env", group: "environment", category: "env", status: "unknown" },
  { id: "env-no-sensitive-public", label: "No NEXT_PUBLIC_* contains sensitive info", group: "environment", category: "env", status: "unknown" },
  { id: "env-secrets-load", label: "All secrets load correctly in env.ts", group: "environment", category: "env", status: "unknown" },
  { id: "env-zod-validation", label: "Production env passes Zod validation", group: "environment", category: "env", status: "unknown" },
  { id: "env-vercel-warnings", label: "No warnings in Vercel build logs", group: "environment", category: "env", status: "unknown" },
  { id: "env-amazon-signed-request", label: "Amazon signed request test returns 200", group: "environment", category: "env", status: "unknown" },
  { id: "env-amazon-product-lookup", label: "Amazon product lookup working", group: "environment", category: "env", status: "unknown" },
  { id: "env-amazon-search", label: "Amazon search endpoint functional", group: "environment", category: "env", status: "unknown" },
  { id: "env-amazon-throttle", label: "Amazon throttle and error behavior tested", group: "environment", category: "env", status: "unknown" },
  { id: "env-db-schema", label: "Schema schema-v2.sql applied", group: "environment", category: "env", status: "unknown" },
  { id: "env-db-ssl", label: "DB connection through SSL verified", group: "environment", category: "env", status: "unknown" },
  { id: "env-db-health", label: "/api/health shows DB: OK", group: "environment", category: "env", status: "unknown" },
  { id: "env-db-write-read", label: "Write/read tests succeed", group: "environment", category: "env", status: "unknown" },
  { id: "env-db-backups", label: "Neon retention & backups enabled", group: "environment", category: "env", status: "unknown" },

  // Deployment & Production Hardening
  { id: "deploy-git-repo", label: "Correct Git repo linked", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-build-passes", label: "Production build passes with no errors", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-node-version", label: "Node version >= 18", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-build-cmd", label: "Build command: npm run build", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-output", label: "Output: .next", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-preview-indexing", label: "Preview URL indexing disabled", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-custom-domain", label: "Custom domain dxm369.com connected", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-force-https", label: "Force HTTPS enabled", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-no-server-client", label: "No server code in client bundle", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-no-secrets-logged", label: "No secrets logged", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-no-source-maps", label: "No source maps exposed in production", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-no-exposed-keys", label: "No exposed API keys in browser network tab", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-trusted-images", label: "Images only load from trusted hostnames", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-api-server-only", label: "API routes verified to run server-side only", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-rate-limit-enabled", label: "Rate-limiter enabled using RATE_LIMIT_SECRET", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-rate-limit-429", label: "429 responses under load", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-rate-limit-throttle", label: "User/IP throttling", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-rate-limit-loops", label: "No infinite request loops", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-anti-bot", label: "Anti-bot debounce on click tracking", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-admin-not-discoverable", label: "Admin panel not discoverable", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-admin-auth", label: "Authenticated with x-admin-key header", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-admin-noindex", label: "No indexing (X-Robots-Tag: noindex)", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-admin-no-cache", label: "No caching (Cache-Control: no-store)", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-admin-logs", label: "Logs show no unauthorized attempts", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-click-tracking", label: "Click tracking writes to DB", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-admin-analytics", label: "Admin analytics shows click counts", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-earnings-upload", label: "Earnings CSV upload works", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-earnings-sync", label: "Earnings sync logs visible", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-epc-leaderboard", label: "EPC leaderboard displays correctly", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-tracking-router", label: "Tracking ID router assigns correct tag per category", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-opengraph", label: "OpenGraph images load", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-meta-tags", label: "Meta tags correct", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-canonical", label: "Canonical URLs correct", group: "deployment", category: "deploy", status: "unknown" },
  { id: "deploy-category-indexed", label: "All category pages indexed", group: "deployment", category: "deploy", status: "unknown" },

  // Security & Compliance
  { id: "security-hsts", label: "Strict-Transport-Security header", group: "security", category: "security", status: "unknown" },
  { id: "security-csp", label: "Content-Security-Policy header", group: "security", category: "security", status: "unknown" },
  { id: "security-x-frame", label: "X-Frame-Options: DENY", group: "security", category: "security", status: "unknown" },
  { id: "security-x-content-type", label: "X-Content-Type-Options: nosniff", group: "security", category: "security", status: "unknown" },
  { id: "security-referrer", label: "Referrer-Policy: strict-origin-when-cross-origin", group: "security", category: "security", status: "unknown" },
  { id: "security-permissions", label: "Permissions-Policy configured", group: "security", category: "security", status: "unknown" },
  { id: "security-coop", label: "Cross-Origin-Opener-Policy: same-origin", group: "security", category: "security", status: "unknown" },
  { id: "security-corp", label: "Cross-Origin-Resource-Policy: same-origin", group: "security", category: "security", status: "unknown" },
  { id: "security-sentry-dsn", label: "Sentry DSN active", group: "security", category: "security", status: "unknown" },
  { id: "security-sentry-errors", label: "Server errors visible in Sentry", group: "security", category: "security", status: "unknown" },
  { id: "security-health-monitor", label: "/api/health monitored by UptimeRobot/BetterStack", group: "security", category: "security", status: "unknown" },
  { id: "security-alerts", label: "Alerts configured (Slack/Telegram/Email)", group: "security", category: "security", status: "unknown" },
  { id: "security-vercel-logs", label: "No critical logs in Vercel dashboard", group: "security", category: "security", status: "unknown" },
  { id: "security-backups-auto", label: "Neon automatic backups enabled", group: "security", category: "security", status: "unknown" },
  { id: "security-backups-retention", label: "Retention ≥ 7 days minimum", group: "security", category: "security", status: "unknown" },
  { id: "security-backups-manual", label: "Manual full dump saved pre-launch", group: "security", category: "security", status: "unknown" },
  { id: "security-backups-restore", label: "Restore test performed", group: "security", category: "security", status: "unknown" },
  { id: "security-terms", label: "Terms of Service", group: "security", category: "security", status: "unknown" },
  { id: "security-privacy", label: "Privacy Policy", group: "security", category: "security", status: "unknown" },
  { id: "security-cookie", label: "Cookie Policy", group: "security", category: "security", status: "unknown" },
  { id: "security-affiliate-disclosure", label: "Affiliate Disclosure", group: "security", category: "security", status: "unknown" },
  { id: "security-amazon-tos", label: "Amazon Associates TOS compliance", group: "security", category: "security", status: "unknown" },
  { id: "security-footer-disclaimers", label: "Footer disclaimers visible on every page", group: "security", category: "security", status: "unknown" },

  // Final Launch Gate (12 MUST-PASS)
  { id: "final-amazon-api", label: "Amazon PA-API working (200 response)", group: "final", category: "final", status: "unknown" },
  { id: "final-database", label: "Database connected (health endpoint)", group: "final", category: "final", status: "unknown" },
  { id: "final-env-vars", label: "No missing env vars", group: "final", category: "final", status: "unknown" },
  { id: "final-click-tracking", label: "Click tracking operational", group: "final", category: "final", status: "unknown" },
  { id: "final-admin-gated", label: "Admin dashboard gated", group: "final", category: "final", status: "unknown" },
  { id: "final-earnings", label: "Earnings system functional", group: "final", category: "final", status: "unknown" },
  { id: "final-https-rating", label: "HTTPS A+ rating", group: "final", category: "final", status: "unknown" },
  { id: "final-no-vulns", label: "No critical vulnerabilities in scan", group: "final", category: "final", status: "unknown" },
  { id: "final-no-secrets", label: "No secrets leaked to client", group: "final", category: "final", status: "unknown" },
  { id: "final-db-load", label: "No database errors under load", group: "final", category: "final", status: "unknown" },
  { id: "final-sentry", label: "Sentry monitoring active", group: "final", category: "final", status: "unknown" },
  { id: "final-backups", label: "Backups enabled & verified", group: "final", category: "final", status: "unknown" },
];

// Group checks by group
export function getChecksByGroup(checks: LaunchCheck[]): Record<CheckGroup, LaunchCheck[]> {
  return checks.reduce((acc, check) => {
    if (!acc[check.group]) acc[check.group] = [];
    acc[check.group].push(check);
    return acc;
  }, {} as Record<CheckGroup, LaunchCheck[]>);
}

// Calculate group status
export function getGroupStatus(checks: LaunchCheck[]): CheckStatus {
  if (checks.length === 0) return "unknown";
  const hasFail = checks.some(c => c.status === "fail");
  const hasWarn = checks.some(c => c.status === "warn");
  const allPass = checks.every(c => c.status === "pass");
  
  if (hasFail) return "fail";
  if (hasWarn) return "warn";
  if (allPass) return "pass";
  return "unknown";
}

// Calculate overall status
export function getOverallStatus(checks: LaunchCheck[]): CheckStatus {
  return getGroupStatus(checks);
}

// Get final gate checks
export function getFinalGateChecks(checks: LaunchCheck[]): LaunchCheck[] {
  return checks.filter(c => c.category === "final");
}

