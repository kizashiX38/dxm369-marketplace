// src/app/legal/privacy/page.tsx
// Privacy Policy Page

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | DXM369',
  description: 'DXM369 Privacy Policy - How we collect, use, and protect your information.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'December 6, 2025';
  
  return (
    <div className="prose prose-invert prose-cyan max-w-none">
      <h1 className="text-3xl font-bold text-cyan-400 mb-2">Privacy Policy</h1>
      <p className="text-slate-400 text-sm mb-8">Last updated: {lastUpdated}</p>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">1. Introduction</h2>
        <p className="text-slate-300 leading-relaxed">
          DXM369 (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the DXM369 website. This Privacy Policy 
          explains how we collect, use, disclose, and safeguard your information when you visit our website.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">2. Information We Collect</h2>
        
        <h3 className="text-lg font-medium text-slate-300 mb-2">Automatically Collected Information</h3>
        <p className="text-slate-300 leading-relaxed mb-4">
          When you visit our website, we automatically collect certain information about your device, including:
        </p>
        <ul className="list-disc pl-6 text-slate-300 space-y-2 mb-4">
          <li>Browser type and version</li>
          <li>Operating system</li>
          <li>Pages visited and time spent on pages</li>
          <li>Referring website address</li>
          <li>IP address (anonymized/hashed for privacy)</li>
        </ul>
        
        <h3 className="text-lg font-medium text-slate-300 mb-2">Information You Provide</h3>
        <p className="text-slate-300 leading-relaxed">
          We may collect information you voluntarily provide, such as:
        </p>
        <ul className="list-disc pl-6 text-slate-300 space-y-2">
          <li>Email address (if you subscribe to our newsletter)</li>
          <li>Any information you submit through contact forms</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">3. How We Use Your Information</h2>
        <p className="text-slate-300 leading-relaxed mb-4">We use the information we collect to:</p>
        <ul className="list-disc pl-6 text-slate-300 space-y-2">
          <li>Provide and maintain our website</li>
          <li>Improve user experience and website functionality</li>
          <li>Analyze usage patterns and trends</li>
          <li>Send newsletters and promotional communications (with your consent)</li>
          <li>Respond to your inquiries and support requests</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">4. Third-Party Services</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          We use third-party services that may collect information about you:
        </p>
        
        <h3 className="text-lg font-medium text-slate-300 mb-2">Amazon Associates Program</h3>
        <p className="text-slate-300 leading-relaxed mb-4">
          DXM369 is a participant in the Amazon Services LLC Associates Program. When you click on 
          product links and make purchases on Amazon, we may earn a commission. Amazon has its own 
          privacy practices. Please review Amazon&apos;s Privacy Notice at amazon.com/privacy.
        </p>
        
        <h3 className="text-lg font-medium text-slate-300 mb-2">Analytics</h3>
        <p className="text-slate-300 leading-relaxed">
          We may use analytics services to understand how visitors interact with our website. 
          These services may collect information such as pages visited, time spent on site, 
          and other engagement metrics.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">5. Cookies</h2>
        <p className="text-slate-300 leading-relaxed">
          We use cookies and similar tracking technologies to enhance your browsing experience. 
          For detailed information about the cookies we use, please see our{' '}
          <a href="/legal/cookies" className="text-cyan-400 hover:text-cyan-300">Cookie Policy</a>.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">6. Data Security</h2>
        <p className="text-slate-300 leading-relaxed">
          We implement appropriate technical and organizational security measures to protect your 
          information. However, no method of transmission over the Internet is 100% secure, and 
          we cannot guarantee absolute security.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">7. Your Rights</h2>
        <p className="text-slate-300 leading-relaxed mb-4">Depending on your location, you may have the right to:</p>
        <ul className="list-disc pl-6 text-slate-300 space-y-2">
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Opt-out of marketing communications</li>
          <li>Object to certain processing of your data</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">8. Children&apos;s Privacy</h2>
        <p className="text-slate-300 leading-relaxed">
          Our website is not intended for children under 13 years of age. We do not knowingly 
          collect personal information from children under 13.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">9. Changes to This Policy</h2>
        <p className="text-slate-300 leading-relaxed">
          We may update this Privacy Policy from time to time. We will notify you of any changes 
          by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">10. Contact Us</h2>
        <p className="text-slate-300 leading-relaxed">
          If you have questions about this Privacy Policy, please contact us at privacy@dxm369.com.
        </p>
      </section>
    </div>
  );
}

