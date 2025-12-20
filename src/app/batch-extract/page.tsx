import ProductExtractor from '@/components/ProductExtractor';

export default function BatchExtractPage() {
  const urls = [
    'https://www.amazon.com/dp/B0C5M7J967?tag=dxm369-20',
    'https://www.amazon.com/dp/B0BZHTVHN5?tag=dxm369-20',
    'https://www.amazon.com/dp/B0C1RGLVZ8?tag=dxm369-20',
    'https://www.amazon.com/dp/B0DNTQJGN1?tag=dxm369-20',
    'https://www.amazon.com/dp/B09R7S7PXC?tag=dxm369-20',
    'https://www.amazon.com/dp/B0F7RY9V4N?tag=dxm369-20',
    'https://www.amazon.com/dp/B0CHSBV9CN?tag=dxm369-20',
    'https://www.amazon.com/dp/B0BLYL79TT?tag=dxm369-20',
    'https://www.amazon.com/dp/B0DNTNX7GV?tag=dxm369-20',
    'https://www.amazon.com/dp/B08SQRF8MJ?tag=dxm369-20',
    'https://www.amazon.com/dp/B0C5XL213T?tag=dxm369-20',
    'https://www.amazon.com/dp/B0CTHXMYL8?tag=dxm369-20',
    'https://www.amazon.com/dp/B09XB3ZNHC?tag=dxm369-20',
    'https://www.amazon.com/dp/B0DPHSQSR9?tag=dxm369-20',
    'https://www.amazon.com/dp/B0DNTQYW2X?tag=dxm369-20',
    'https://www.amazon.com/dp/B0DYVGZ69K?tag=dxm369-20'
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Batch Product Extraction</h1>
      <p className="text-gray-400 mb-6">Extracting metadata from {urls.length} Amazon products...</p>
      <ProductExtractor urls={urls} />
    </div>
  );
}
