/**
 * Scraper Data Types & Python Playwright REST API Contracts
 * Language: Azerbaijani & TypeScript
 */

export type JobStatus = 'idle' | 'running' | 'completed' | 'cancelled' | 'error';

export interface CreateJobPayload {
  query: string;
  location?: string;
  targetCount: number;
  filename: string;
}

export interface CreateJobResponse {
  jobId: string;
  status: JobStatus | string;
  message: string;
}

export interface ScraperJobStatusResponse {
  jobId: string;
  status: JobStatus;
  inspected: number;
  skipped: number;
  found: number;
  errors: number;
  message: string;
}

export interface ScrapedBusiness {
  businessName: string;
  rating: number;
  reviewsCount: number;
  phoneNumber: string;
  instagram: string;
  address: string;
  googleMapsUrl: string;
  category?: string;
  scrapedAt?: string;
  website?: string;
}

export interface CancelJobResponse {
  success: boolean;
  message: string;
}

export interface HealthResponse {
  status: string;
}

export interface FilterOptions {
  search: string;
  minRating: number;
  onlyWithInstagram: boolean;
  sortBy: 'latest' | 'rating' | 'reviews' | 'name';
}

export type ViewMode = 'cards' | 'table';
export type ApiMode = 'rest' | 'mock';
