import { Request, Response } from 'express';

import { BasicConfig } from '@config';
import { Container, Logger, TOKENS } from '@shared';
import { HealthStatus } from '@domain';

export class HealthController {
  constructor(private readonly container: Container) {}
  getHealth = (req: Request, res: Response) => {
    const logger = this.container.resolve<Logger>(TOKENS.Logger);
    const cfg = this.container.resolve<BasicConfig>(TOKENS.Config);

    const payload: HealthStatus = {
      status: 'ok',
      service: cfg.serviceName,
      time: new Date().toISOString(),
      env: cfg.nodeEnv,
    };

    logger.info('Health check', { env: cfg.nodeEnv, service: cfg.serviceName });
    res.status(200).json(payload);
  };
}
