// src/app/legal/affiliate-disclosure/page.tsx
// Affiliate Disclosure Page

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure | DXM369',
  description: 'DXM369 Affiliate Disclosure - How we earn commissions through affiliate links.',
};

export default function AffiliateDisclosurePage() {
  const lastUpdated = 'December 6, 2025';
  
  return (
    <div className="prose prose-invert prose-cyan max-w-none">
      <h1 className="text-3xl font-bold text-cyan-400 mb-2">Affiliate Disclosure</h1>
      <p className="text-slate-400 text-sm mb-8">Last updated: {lastUpdated}</p>
      
      {/* Important Notice Box */}
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-cyan-400 mt-0 mb-3">Important Notice</h2>
        <p className="text-slate-300 m-0">
          <strong>DXM369 is a participant in the Amazon Services LLC Associates Program</strong>, 
          an affiliate advertising program designed to provide a means for sites to earn advertising 
          fees by advertising and linking to Amazon.com.
        </p>
      </div>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">How We Earn Money</h2>
        <p className="text-slate-300 leading-relaxed">
          DXM369 is a free service. We earn money through affiliate commissions when you click on 
          product links on our website and make purchases on Amazon or other retail partners. This 
          is how we keep our lights on and continue providing deal recommendations.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">What This Means for You</h2>
        <ul className="list-disc pl-6 text-slate-300 space-y-3">
          <li>
            <strong>No Extra Cost:</strong> You pay the same price whether you use our links or not. 
            The commission comes from the retailer, not from you.
          </li>
          <li>
            <strong>Editorial Independence:</strong> Our DXM Scores and recommendations are calculated 
            algorithmically based on value metrics. We do not receive payment to rank products higher.
          </li>
          <li>
            <strong>Transparency:</strong> We clearly identify affiliate links and disclose our 
            relationships with retail partners.
          </li>
          <li>
            <strong>Your Choice:</strong> You are never obligated to use our links. You can always 
            search for products directly on Amazon or other retailers.
          </li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Amazon Associates Program</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          As an Amazon Associate, we earn from qualifying purchases. This means:
        </p>
        <ul className="list-disc pl-6 text-slate-300 space-y-2">
          <li>When you click a product link and buy on Amazon within 24 hours, we may earn a commission</li>
          <li>Commission rates vary by product category (typically 1-10%)</li>
          <li>We only earn if you complete a purchase; clicks alone do not generate revenue</li>
          <li>Amazon tracks your purchases through cookies placed when you click our links</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Price and Availability</h2>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
          <p className="text-slate-300 m-0">
            Product prices and availability are accurate as of the date/time indicated and are subject 
            to change. Any price and availability information displayed on Amazon at the time of purchase 
            will apply to the purchase of the product.
          </p>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Our Commitment to You</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          We are committed to providing honest, unbiased product recommendations. Here&apos;s our promise:
        </p>
        <ul className="list-disc pl-6 text-slate-300 space-y-2">
          <li>We will never recommend a product solely because it offers a higher commission</li>
          <li>Our DXM Score algorithm does not factor in affiliate commission rates</li>
          <li>We prioritize your interests as a shopper over our commission earnings</li>
          <li>We clearly disclose our affiliate relationships as required by the FTC</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">FTC Compliance</h2>
        <p className="text-slate-300 leading-relaxed">
          In accordance with the Federal Trade Commission (FTC) guidelines, we disclose that we 
          have financial relationships with some of the merchants mentioned on this website. We 
          may receive compensation when you click on links to those merchants and/or make purchases.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Other Affiliate Relationships</h2>
        <p className="text-slate-300 leading-relaxed">
          While Amazon is our primary affiliate partner, we may also participate in other affiliate 
          programs in the future. Any additional affiliate relationships will be disclosed on this page.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Questions?</h2>
        <p className="text-slate-300 leading-relaxed">
          If you have any questions about our affiliate relationships or how we make money, 
          please contact us at affiliate@dxm369.com. We&apos;re happy to explain how our business works.
        </p>
      </section>
      
      {/* Final Disclaimer */}
      <div className="mt-8 pt-6 border-t border-slate-700">
        <p className="text-slate-400 text-sm italic">
          Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.
        </p>
      </div>
    </div>
  );
}

