import { BasicConfig, loadEnv } from '@config';
import { Container, Factory } from './di/container';
import { createLogger, Logger } from './logging/logger';
import { TOKENS } from './di/tokens';

export const container = new Container();
loadEnv();

container.registerSingleton<BasicConfig>(TOKENS.Config, () => new BasicConfig());
container.registerSingleton<Logger>(TOKENS.Logger, (c) => {
  const cfg = c.resolve<BasicConfig>(TOKENS.Config);
  return createLogger(cfg.serviceName, cfg.logLevel);
});

export { Container, TOKENS, Logger, createLogger, Factory };
