import ProductExtractor from '@/components/ProductExtractor';
import ASINFinder from '@/components/ASINFinder';

export default function TestValidatorPage() {
  const urls = [
    'https://www.amazon.com/dp/B0CG3BL7C2?tag=dxm369-20', // Dead link
    'https://www.amazon.com/dp/B0BGP8FGNZ?tag=dxm369-20'  // Valid RTX 4090
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">DXM369 Product Tools</h1>
      
      {/* ASIN Finder */}
      <ASINFinder />
      
      {/* Product Extractor */}
      <ProductExtractor urls={urls} />
    </div>
  );
}
