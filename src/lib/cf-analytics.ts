// Cloudflare GraphQL Analytics Client
// Server-side only - never expose CF_API_TOKEN to client

const CF_GRAPHQL_ENDPOINT = 'https://api.cloudflare.com/client/v4/graphql';

interface CFGraphQLResponse<T = unknown> {
  data: T;
  errors?: Array<{ message: string; path?: string[] }>;
}

export async function cfQuery<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  try {
    const token = process.env.CF_API_TOKEN;

    if (!token) {
      throw new Error('CF_API_TOKEN not configured');
    }

    const response = await fetch(CF_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Cloudflare API error ${response.status}: ${text}`);
    }

    const json: CFGraphQLResponse<T> = await response.json();

    if (json.errors && json.errors.length > 0) {
      throw new Error(`GraphQL errors: ${json.errors.map(e => e.message).join(', ')}`);
    }

    return json.data;
  } catch (err) {
    console.error("[DXM-CF-ANALYTICS] Fetch failed:", err);
    return {
      ok: false,
      error: "cloudflare_fetch_failed",
      data: [],
    } as T;
  }
}
