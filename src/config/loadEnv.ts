import { config } from 'dotenv';
import path from 'path';

export function loadEnv(cwd = process.cwd()): void {
  const envPath = path.join(cwd, '.env');
  const result = config({ path: envPath, override: false });

  if (result.error && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(`[config] .env not found at ${envPath} (using process env only)`);
  }
}
