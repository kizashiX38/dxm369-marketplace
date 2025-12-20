export interface LinkCheckResult {
  url: string;
  isValid: boolean;
  status?: number;
  error?: string;
}

export async function checkAmazonLink(url: string): Promise<LinkCheckResult> {
  try {
    const response = await fetch(url, { 
      method: 'GET',
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      redirect: 'follow'
    });
    
    return {
      url,
      isValid: response.ok,
      status: response.status
    };
  } catch (error) {
    return {
      url,
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function validateProductLinks(urls: string[]): Promise<LinkCheckResult[]> {
  return Promise.all(urls.map(checkAmazonLink));
}
