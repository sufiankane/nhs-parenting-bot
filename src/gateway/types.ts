export interface Env {
  SIMILARITY_THRESHOLD?: string;
  RATE_LIMIT_PER_MINUTE?: string;
  ALLOWED_ORIGINS?: string;
  [key: string]: unknown;
}
