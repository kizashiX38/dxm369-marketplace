// src/app/legal/terms/page.tsx
// Terms of Service Page

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | DXM369',
  description: 'DXM369 Terms of Service - Rules and guidelines for using our website.',
};

export default function TermsOfServicePage() {
  const lastUpdated = 'December 6, 2025';
  
  return (
    <div className="prose prose-invert prose-cyan max-w-none">
      <h1 className="text-3xl font-bold text-cyan-400 mb-2">Terms of Service</h1>
      <p className="text-slate-400 text-sm mb-8">Last updated: {lastUpdated}</p>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">1. Acceptance of Terms</h2>
        <p className="text-slate-300 leading-relaxed">
          By accessing and using DXM369 (&quot;the Website&quot;), you accept and agree to be bound by these 
          Terms of Service. If you do not agree to these terms, please do not use our website.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">2. Description of Service</h2>
        <p className="text-slate-300 leading-relaxed">
          DXM369 is a deal discovery and comparison platform for computer hardware and technology products. 
          We aggregate product information, calculate value scores using our proprietary DXM Score algorithm, 
          and provide affiliate links to third-party retailers including Amazon.com.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">3. User Responsibilities</h2>
        <p className="text-slate-300 leading-relaxed mb-4">When using our website, you agree to:</p>
        <ul className="list-disc pl-6 text-slate-300 space-y-2">
          <li>Use the website only for lawful purposes</li>
          <li>Not attempt to interfere with the proper functioning of the website</li>
          <li>Not attempt to gain unauthorized access to any part of the website</li>
          <li>Not use automated tools to scrape or collect data without permission</li>
          <li>Provide accurate information when subscribing to newsletters or contacting us</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">4. Intellectual Property</h2>
        <p className="text-slate-300 leading-relaxed">
          The DXM369 name, logo, DXM Score algorithm, and all original content on this website are 
          the intellectual property of DXM369. You may not reproduce, distribute, or create derivative 
          works without our express written permission.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">5. Product Information and Pricing</h2>
        <p className="text-slate-300 leading-relaxed">
          While we strive to provide accurate and up-to-date product information:
        </p>
        <ul className="list-disc pl-6 text-slate-300 space-y-2 mt-4">
          <li>Prices and availability may change without notice</li>
          <li>We do not guarantee the accuracy of product specifications</li>
          <li>DXM Scores are calculated estimates and should be used as guidance, not guarantees</li>
          <li>Final product details should be verified on the retailer&apos;s website before purchase</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">6. Affiliate Relationships</h2>
        <p className="text-slate-300 leading-relaxed">
          DXM369 participates in affiliate programs, including the Amazon Services LLC Associates Program. 
          When you click on affiliate links and make purchases, we may earn a commission at no additional 
          cost to you. For more information, please see our{' '}
          <a href="/legal/affiliate-disclosure" className="text-cyan-400 hover:text-cyan-300">
            Affiliate Disclosure
          </a>.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">7. Disclaimer of Warranties</h2>
        <p className="text-slate-300 leading-relaxed">
          THE WEBSITE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, 
          EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
        </p>
        <ul className="list-disc pl-6 text-slate-300 space-y-2 mt-4">
          <li>Implied warranties of merchantability</li>
          <li>Fitness for a particular purpose</li>
          <li>Non-infringement</li>
          <li>Accuracy or reliability of any information provided</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">8. Limitation of Liability</h2>
        <p className="text-slate-300 leading-relaxed">
          IN NO EVENT SHALL DXM369, ITS OWNERS, OPERATORS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, 
          INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
        </p>
        <ul className="list-disc pl-6 text-slate-300 space-y-2 mt-4">
          <li>Loss of profits or revenue</li>
          <li>Loss of data</li>
          <li>Business interruption</li>
          <li>Purchasing decisions based on information from this website</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">9. Third-Party Links</h2>
        <p className="text-slate-300 leading-relaxed">
          Our website contains links to third-party websites. We are not responsible for the content, 
          privacy practices, or terms of service of these external sites. Your use of third-party 
          websites is at your own risk.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">10. Modifications to Terms</h2>
        <p className="text-slate-300 leading-relaxed">
          We reserve the right to modify these Terms of Service at any time. Changes will be effective 
          immediately upon posting to the website. Your continued use of the website after changes 
          constitutes acceptance of the modified terms.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">11. Termination</h2>
        <p className="text-slate-300 leading-relaxed">
          We reserve the right to terminate or restrict access to our website for any user who 
          violates these Terms of Service or for any other reason at our sole discretion.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">12. Governing Law</h2>
        <p className="text-slate-300 leading-relaxed">
          These Terms of Service shall be governed by and construed in accordance with the laws 
          of the United States, without regard to its conflict of law provisions.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">13. Contact Information</h2>
        <p className="text-slate-300 leading-relaxed">
          For questions about these Terms of Service, please contact us at legal@dxm369.com.
        </p>
      </section>
    </div>
  );
}

