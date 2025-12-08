// src/app/legal/cookies/page.tsx
// Cookie Policy Page

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | DXM369',
  description: 'DXM369 Cookie Policy - Information about how we use cookies on our website.',
};

export default function CookiePolicyPage() {
  const lastUpdated = 'December 6, 2025';
  
  return (
    <div className="prose prose-invert prose-cyan max-w-none">
      <h1 className="text-3xl font-bold text-cyan-400 mb-2">Cookie Policy</h1>
      <p className="text-slate-400 text-sm mb-8">Last updated: {lastUpdated}</p>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">What Are Cookies?</h2>
        <p className="text-slate-300 leading-relaxed">
          Cookies are small text files that are stored on your computer or mobile device when you 
          visit a website. They are widely used to make websites work more efficiently and provide 
          information to website owners.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">How We Use Cookies</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          DXM369 uses cookies for the following purposes:
        </p>
        
        <h3 className="text-lg font-medium text-slate-300 mb-2">Essential Cookies</h3>
        <p className="text-slate-300 leading-relaxed mb-4">
          These cookies are necessary for the website to function properly. They enable core 
          functionality such as security and accessibility.
        </p>
        <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 text-slate-400">Cookie</th>
                <th className="text-left py-2 text-slate-400">Purpose</th>
                <th className="text-left py-2 text-slate-400">Duration</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-slate-800">
                <td className="py-2 font-mono text-xs">session_id</td>
                <td className="py-2">Session management</td>
                <td className="py-2">Session</td>
              </tr>
              <tr>
                <td className="py-2 font-mono text-xs">preferences</td>
                <td className="py-2">User preferences</td>
                <td className="py-2">1 year</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <h3 className="text-lg font-medium text-slate-300 mb-2">Analytics Cookies</h3>
        <p className="text-slate-300 leading-relaxed mb-4">
          These cookies help us understand how visitors interact with our website by collecting 
          and reporting information anonymously.
        </p>
        <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 text-slate-400">Cookie</th>
                <th className="text-left py-2 text-slate-400">Purpose</th>
                <th className="text-left py-2 text-slate-400">Duration</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-slate-800">
                <td className="py-2 font-mono text-xs">_dxm_analytics</td>
                <td className="py-2">Page views, clicks</td>
                <td className="py-2">30 days</td>
              </tr>
              <tr>
                <td className="py-2 font-mono text-xs">_dxm_visitor</td>
                <td className="py-2">Unique visitor ID</td>
                <td className="py-2">1 year</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Third-Party Cookies</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          Some cookies are placed by third-party services that appear on our pages:
        </p>
        
        <h3 className="text-lg font-medium text-slate-300 mb-2">Amazon Associates</h3>
        <p className="text-slate-300 leading-relaxed mb-4">
          When you click on Amazon product links, Amazon may set cookies to track your purchases 
          for affiliate commission purposes. These cookies are governed by Amazon&apos;s Privacy Policy.
        </p>
        <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 text-slate-400">Cookie</th>
                <th className="text-left py-2 text-slate-400">Purpose</th>
                <th className="text-left py-2 text-slate-400">Duration</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-slate-800">
                <td className="py-2 font-mono text-xs">session-id</td>
                <td className="py-2">Amazon session</td>
                <td className="py-2">2 years</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="py-2 font-mono text-xs">session-id-time</td>
                <td className="py-2">Session timing</td>
                <td className="py-2">2 years</td>
              </tr>
              <tr>
                <td className="py-2 font-mono text-xs">ubid-main</td>
                <td className="py-2">User identification</td>
                <td className="py-2">2 years</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Managing Cookies</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          You can control and manage cookies in various ways:
        </p>
        
        <h3 className="text-lg font-medium text-slate-300 mb-2">Browser Settings</h3>
        <p className="text-slate-300 leading-relaxed mb-4">
          Most browsers allow you to refuse or delete cookies through their settings. Here&apos;s how 
          to manage cookies in popular browsers:
        </p>
        <ul className="list-disc pl-6 text-slate-300 space-y-2">
          <li>
            <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data
          </li>
          <li>
            <strong>Firefox:</strong> Settings → Privacy &amp; Security → Cookies and Site Data
          </li>
          <li>
            <strong>Safari:</strong> Preferences → Privacy → Manage Website Data
          </li>
          <li>
            <strong>Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies
          </li>
        </ul>
        
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-4">
          <p className="text-slate-300 m-0 text-sm">
            <strong>Note:</strong> Blocking all cookies may impact your experience on DXM369 and 
            other websites. Some features may not function properly without cookies.
          </p>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Do Not Track</h2>
        <p className="text-slate-300 leading-relaxed">
          Some browsers offer a &quot;Do Not Track&quot; feature that sends a signal to websites you visit. 
          Our website currently does not respond to Do Not Track signals, but you can manage your 
          cookie preferences through browser settings.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Updates to This Policy</h2>
        <p className="text-slate-300 leading-relaxed">
          We may update this Cookie Policy from time to time to reflect changes in our practices 
          or for other operational, legal, or regulatory reasons. Please check this page periodically 
          for updates.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Contact Us</h2>
        <p className="text-slate-300 leading-relaxed">
          If you have questions about our use of cookies, please contact us at privacy@dxm369.com.
        </p>
      </section>
    </div>
  );
}

