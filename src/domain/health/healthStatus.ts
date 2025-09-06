export type DependencyStatus = 'up' | 'down';

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  time: string;
  service: string;
  env: string;
  // Solo se listan dependencias que realmente se verifican
  dependencies?: Record<string, DependencyStatus>;
}
