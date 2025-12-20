export interface ProductMetadata {
  url: string;
  isValid: boolean;
  asin?: string;
  title?: string;
  price?: string;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  brand?: string;
  availability?: string;
  error?: string;
}

export async function extractProductMetadata(url: string): Promise<ProductMetadata> {
  try {
    console.log('Extracting metadata for:', url);
    
    const response = await fetch('/api/scrape-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return { url, isValid: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    const data = await response.json();
    console.log('Extracted data:', data);
    return data.product;
  } catch (error) {
    console.error('Extract error:', error);
    return {
      url,
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function extractMultipleProducts(urls: string[]): Promise<ProductMetadata[]> {
  return Promise.all(urls.map(extractProductMetadata));
}
