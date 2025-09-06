import { TOKENS } from '@shared';

describe('TOKENS (symbols de DI)', () => {
  test('should expose the required tokens', () => {
    expect(TOKENS).toHaveProperty('Config');
    expect(TOKENS).toHaveProperty('Logger');
  });

  test('should have clear and consistent descriptions', () => {
    expect(String(TOKENS.Config.description)).toBe('Config');
    expect(String(TOKENS.Logger.description)).toBe('Logger');
  });

  test('Each token should be unique and different', () => {
    expect(TOKENS.Config).not.toBe(TOKENS.Logger);
    // Un símbolo es estrictamente igual a sí mismo
    expect(TOKENS.Config).toBe(TOKENS.Config);
    expect(TOKENS.Logger).toBe(TOKENS.Logger);
  });

  test('Tokens should function as keys in a MAP without collisions', () => {
    const map = new Map<symbol, string>();
    map.set(TOKENS.Config, 'cfg');
    map.set(TOKENS.Logger, 'log');

    expect(map.get(TOKENS.Config)).toBe('cfg');
    expect(map.get(TOKENS.Logger)).toBe('log');
    expect(map.size).toBe(2);
  });

  test('The tokens object should contain only symbols', () => {
    for (const key of Object.keys(TOKENS) as Array<keyof typeof TOKENS>) {
      expect(typeof TOKENS[key]).toBe('symbol');
    }
  });

  test('The descriptions should be stable through imports', async () => {
    // Simula una segunda importación dinámica y verifica descripciones
    const { TOKENS: TOKENS2 } = await import('@shared');
    expect(TOKENS2.Config.description).toBe('Config');
    expect(TOKENS2.Logger.description).toBe('Logger');
    // y siguen siendo símbolos distintos entre sí
    expect(TOKENS2.Config).not.toBe(TOKENS2.Logger);
  });
});
