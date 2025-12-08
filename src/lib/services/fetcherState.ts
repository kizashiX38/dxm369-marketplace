// src/lib/services/fetcherState.ts
// In-memory fetcher state management

export interface FetcherState {
  status: 'online' | 'offline' | 'error';
  startTime: number;
  totalFetches: number;
  successfulFetches: number;
  failedFetches: number;
  lastFetch: string;
  cacheSize: number;
  memory: number;
}

// In-memory state (replace with database in production)
let fetcherState: FetcherState = {
  status: 'online',
  startTime: Date.now(),
  totalFetches: 0,
  successfulFetches: 0,
  failedFetches: 0,
  lastFetch: new Date().toISOString(),
  cacheSize: 0,
  memory: typeof process !== 'undefined' ? process.memoryUsage().heapUsed : 0,
};

export function getFetcherState(): FetcherState {
  return { ...fetcherState };
}

export function updateFetcherState(updates: Partial<FetcherState>): void {
  fetcherState = { ...fetcherState, ...updates };
}

export function resetFetcherState(): void {
  fetcherState = {
    status: 'online',
    startTime: Date.now(),
    totalFetches: 0,
    successfulFetches: 0,
    failedFetches: 0,
    lastFetch: new Date().toISOString(),
    cacheSize: 0,
    memory: typeof process !== 'undefined' ? process.memoryUsage().heapUsed : 0,
  };
}
