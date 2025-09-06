import { Container, TOKENS } from '@shared';

describe('Integration: Dependency Injection Container', () => {
  let container: Container;
  interface ITestConfig {
    env: string;
    port: number;
  }
  interface ILogger {
    info: (msg: string) => string;
    error: (msg: string) => string;
  }

  beforeEach(() => {
    container = new Container();
    container.registerSingleton(TOKENS.Config, () => ({ env: 'test', port: 4000 }));
    container.registerSingleton(TOKENS.Logger, () => ({
      info: (msg: string) => `INFO: ${msg}`,
      error: (msg: string) => `ERROR: ${msg}`,
    }));
  });

  test('should solve conflict as singleton', () => {
    const cfg1 = container.resolve<ITestConfig>(TOKENS.Config);
    const cfg2 = container.resolve<ITestConfig>(TOKENS.Config);
    expect(cfg1).toBe(cfg2);
    expect(cfg1.env).toBe('test');
  });

  test('should solve logger as_singleton', () => {
    const logger1 = container.resolve<ILogger>(TOKENS.Logger);
    const logger2 = container.resolve<ILogger>(TOKENS.Logger);
    expect(logger1).toBe(logger2);
    expect(logger1.info('hola')).toContain('INFO: hola');
  });

  test('Logger should work to generate logs from the container', () => {
    const logger = container.resolve<ILogger>(TOKENS.Logger);
    expect(logger.error('fail')).toBe('ERROR: fail');
  });

  test('A controller can inject Logger and Config from the container', () => {
    class FakeController {
      constructor(
        private readonly cfg: ITestConfig,
        private readonly log: ILogger,
      ) {}

      getStatus() {
        this.log.info('status invoked');
        return { env: this.cfg.env, port: this.cfg.port };
      }
    }

    const controller = new FakeController(container.resolve(TOKENS.Config), container.resolve(TOKENS.Logger));

    const status = controller.getStatus();
    expect(status.env).toBe('test');
    expect(status.port).toBe(4000);
  });
});
