import { BasicConfig } from '@config';
import { Container, Logger, TOKENS } from '@shared';
import express, { Application } from 'express';
import { AppRouter } from './routes/app.router';

export class ExpressServer {
  private readonly app: Application;
  private readonly logger: Logger;
  private readonly cfg: BasicConfig;
  private static instance: ExpressServer;

  private constructor(private readonly container: Container) {
    this.app = express();
    this.logger = this.container.resolve<Logger>(TOKENS.Logger);
    this.cfg = this.container.resolve<BasicConfig>(TOKENS.Config);
    this.setupMiddlewares();
    this.app.use(AppRouter.routes(this.container));
  }
  private setupMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  async start(): Promise<void> {
    this.app.listen(this.cfg.port, () => {
      this.logger.info(`Server running on port ${this.cfg.port}`);
    });
  }

  static createExpressServer(container: Container): ExpressServer {
    if (!ExpressServer.instance) {
      ExpressServer.instance = new ExpressServer(container);
    }
    return ExpressServer.instance;
  }
}
