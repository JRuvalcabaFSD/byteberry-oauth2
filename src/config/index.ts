import { Container, createLogger, TOKENS } from '@shared';
import { BasicConfig } from './config';

// Contenedor global (puedes instanciar otro en tests)
export const container = new Container();

// Registro de singletons base
container.registerSingleton(TOKENS.Config, () => new BasicConfig());
container.registerSingleton(TOKENS.Logger, (c) => {
  const cfg = c.resolve<BasicConfig>(TOKENS.Config);
  return createLogger(cfg.serviceName);
});

// Re-export tokens para uso externo
export { TOKENS, Container };
