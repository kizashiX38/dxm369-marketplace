import * as fs from 'fs';
import * as path from 'path';

const ADMIN_KEY = 'ak3693';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function importRealSeeds() {
    console.log('🌱 Starting Real Product Seed Import...');

    const seedFile = path.join(process.cwd(), 'data/asin-seed.json');
    if (!fs.existsSync(seedFile)) {
        console.error(`❌ Seed file not found: ${seedFile}`);
        return;
    }

    const content = fs.readFileSync(seedFile, 'utf-8');
    const data = JSON.parse(content);

    const allProducts: any[] = [];

    // Flatten categories
    for (const category in data.products) {
        const products = data.products[category];
        products.forEach((p: any) => {
            allProducts.push({
                asin: p.asin,
                category: p.category || category,
                title: p.title,
                price: p.price / 100, // Convert cents to dollars
                image_url: p.imageUrl,
                brand: p.brand,
                rating: p.dxmScore,
                data_raw: p
            });
        });
    }

    console.log(`📦 Found ${allProducts.length} real products. Importing in batches...`);

    const batchSize = 20;
    let successCount = 0;

    for (let i = 0; i < allProducts.length; i += batchSize) {
        const batch = allProducts.slice(i, i + batchSize);

        try {
            const response = await fetch(`${BASE_URL}/api/admin/products/bulkImport`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': ADMIN_KEY,
                },
                body: JSON.stringify({ products: batch }),
            });

            if (!response.ok) {
                const err = await response.text();
                console.error(`❌ Batch failed: ${err}`);
            } else {
                const result = await response.json();
                successCount += result.data?.success || 0;
                console.log(`✅ Batch ${i / batchSize + 1} imported successfully (${successCount}/${allProducts.length})`);
            }
        } catch (error) {
            console.error(`❌ Network error for batch: ${error}`);
        }
    }

    console.log(`\n🎉 Import Complete! Total Real Products: ${successCount}`);
}

importRealSeeds().catch(console.error);
