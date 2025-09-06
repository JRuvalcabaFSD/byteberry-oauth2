import { Router } from 'express';

import { Container } from '@shared';
import { HealthController } from '../controllers/health.controller';

export class HealthRoutes {
  static routes(container: Container): Router {
    const router = Router();
    const controller = new HealthController(container);
    router.get('/health', controller.getHealth);
    return router;
  }
}
