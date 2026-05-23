/**
 * Configure fetch behavior for the application
 * Handles SSL certificate issues in development/corporate environments
 */

// Set up Node.js TLS behavior for development
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  // In development, allow self-signed certificates
  // This helps with corporate proxies and local development
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

/**
 * Create a fetch wrapper with better error handling
 */
export async function safeFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; sonichigo-portfolio/1.0)',
        ...options?.headers,
      },
    });
    return response;
  } catch (error: any) {
    // Log detailed error information
    console.error(`Fetch error for ${url}:`, {
      message: error.message,
      code: error.code,
      cause: error.cause?.message,
    });

    // If it's a certificate error, provide helpful context
    if (error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY') {
      console.warn(
        `Certificate validation failed for ${url}. ` +
        `This is likely due to a corporate proxy or firewall. ` +
        `In production, ensure NODE_TLS_REJECT_UNAUTHORIZED is not set.`
      );
    }

    // Re-throw so callers can handle it
    throw error;
  }
}

/**
 * Fetch with automatic retry on network errors
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries: number = 2
): Promise<Response> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await safeFetch(url, options);
    } catch (error: any) {
      lastError = error;

      // Don't retry on HTTP errors, only network errors
      if (error.code && attempt < maxRetries) {
        console.log(`Retry ${attempt + 1}/${maxRetries} for ${url}`);
        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }

      break;
    }
  }

  throw lastError;
}
