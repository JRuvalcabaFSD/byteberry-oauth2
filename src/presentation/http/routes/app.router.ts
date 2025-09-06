import { Router } from 'express';

import { Container } from '@shared';
import { HealthRoutes } from './health.routes';

export class AppRouter {
  static routes(container: Container): Router {
    const router = Router();
    router.use(HealthRoutes.routes(container));
    return router;
  }
}
