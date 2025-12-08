/**
 * AWS Signature Version 4 Implementation for Amazon Product Advertising API
 * 
 * This handles the cryptographic signing required for Amazon API requests
 */

import crypto from 'crypto';

interface SigningParams {
  method: string;
  url: string;
  headers: Record<string, string>;
  payload: string;
  accessKey: string;
  secretKey: string;
  region: string;
  service: string;
}

export class AWSSignatureV4 {
  private static readonly ALGORITHM = 'AWS4-HMAC-SHA256';
  private static readonly SIGNED_HEADERS = 'content-type;host;x-amz-date;x-amz-target';

  /**
   * Sign an AWS request with Signature Version 4
   */
  static sign(params: SigningParams): Record<string, string> {
    const { method, url, headers, payload, accessKey, secretKey, region, service } = params;
    
    // Parse URL
    const urlObj = new URL(url);
    const host = urlObj.hostname;
    const path = urlObj.pathname || '/';
    const queryString = urlObj.search.slice(1); // Remove leading '?'
    
    // Create timestamp
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    
    // Add required headers
    const signedHeaders = {
      ...headers,
      'host': host,
      'x-amz-date': amzDate
    };

    // Step 1: Create canonical request
    const canonicalRequest = this.createCanonicalRequest(
      method,
      path,
      queryString,
      signedHeaders,
      payload
    );

    // Step 2: Create string to sign
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = this.createStringToSign(
      amzDate,
      credentialScope,
      canonicalRequest
    );

    // Step 3: Calculate signature
    const signature = this.calculateSignature(
      secretKey,
      dateStamp,
      region,
      service,
      stringToSign
    );

    // Step 4: Create authorization header
    const authorizationHeader = `${this.ALGORITHM} ` +
      `Credential=${accessKey}/${credentialScope}, ` +
      `SignedHeaders=${this.SIGNED_HEADERS}, ` +
      `Signature=${signature}`;

    return {
      ...signedHeaders,
      'Authorization': authorizationHeader
    };
  }

  /**
   * Create canonical request string
   */
  private static createCanonicalRequest(
    method: string,
    path: string,
    queryString: string,
    headers: Record<string, string>,
    payload: string
  ): string {
    // Canonical URI
    const canonicalUri = this.encodeURIComponent(path);

    // Canonical query string
    const canonicalQueryString = this.createCanonicalQueryString(queryString);

    // Canonical headers
    const canonicalHeaders = this.createCanonicalHeaders(headers);

    // Signed headers
    const signedHeaders = this.SIGNED_HEADERS;

    // Hashed payload
    const hashedPayload = this.sha256(payload);

    return [
      method.toUpperCase(),
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      hashedPayload
    ].join('\n');
  }

  /**
   * Create canonical query string
   */
  private static createCanonicalQueryString(queryString: string): string {
    if (!queryString) return '';

    const params = new URLSearchParams(queryString);
    const sortedParams: string[] = [];

    // Sort parameters by name
    const sortedKeys = Array.from(params.keys()).sort();
    
    for (const key of sortedKeys) {
      const values = params.getAll(key);
      for (const value of values) {
        const encodedKey = this.encodeURIComponent(key);
        const encodedValue = this.encodeURIComponent(value);
        sortedParams.push(`${encodedKey}=${encodedValue}`);
      }
    }

    return sortedParams.join('&');
  }

  /**
   * Create canonical headers string
   */
  private static createCanonicalHeaders(headers: Record<string, string>): string {
    const headerNames = this.SIGNED_HEADERS.split(';');
    const canonicalHeaders: string[] = [];

    for (const name of headerNames) {
      const value = headers[name] || '';
      canonicalHeaders.push(`${name.toLowerCase()}:${value.trim()}\n`);
    }

    return canonicalHeaders.join('');
  }

  /**
   * Create string to sign
   */
  private static createStringToSign(
    amzDate: string,
    credentialScope: string,
    canonicalRequest: string
  ): string {
    const hashedCanonicalRequest = this.sha256(canonicalRequest);

    return [
      this.ALGORITHM,
      amzDate,
      credentialScope,
      hashedCanonicalRequest
    ].join('\n');
  }

  /**
   * Calculate the signature
   */
  private static calculateSignature(
    secretKey: string,
    dateStamp: string,
    region: string,
    service: string,
    stringToSign: string
  ): string {
    const kDate = this.hmacSha256(`AWS4${secretKey}`, dateStamp);
    const kRegion = this.hmacSha256(kDate, region);
    const kService = this.hmacSha256(kRegion, service);
    const kSigning = this.hmacSha256(kService, 'aws4_request');
    
    return this.hmacSha256(kSigning, stringToSign).toString('hex');
  }

  /**
   * SHA256 hash function
   */
  private static sha256(data: string): string {
    return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
  }

  /**
   * HMAC-SHA256 function
   */
  private static hmacSha256(key: string | Buffer, data: string): Buffer {
    return crypto.createHmac('sha256', key).update(data, 'utf8').digest();
  }

  /**
   * URI encode function (AWS specific)
   */
  private static encodeURIComponent(str: string): string {
    return encodeURIComponent(str)
      .replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
      .replace(/%20/g, '+');
  }
}

/**
 * Convenience function to sign Amazon Product Advertising API requests
 */
export function signAmazonRequest(
  method: string,
  url: string,
  payload: string,
  config: {
    accessKey: string;
    secretKey: string;
    region: string;
  }
): Record<string, string> {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1'
  };

  return AWSSignatureV4.sign({
    method,
    url,
    headers,
    payload,
    accessKey: config.accessKey,
    secretKey: config.secretKey,
    region: config.region,
    service: 'ProductAdvertisingAPI'
  });
}
