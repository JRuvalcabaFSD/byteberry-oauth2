/* eslint-disable @typescript-eslint/no-explicit-any */
import { loadEnv } from '@config';
import fs from 'fs';
import os from 'os';
import path from 'path';

describe('Config', () => {
  const ORIGINAL_ENVS = process.env;
  const makeTempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'bb-oauth2-env-'));

  beforeEach(() => {
    jest.mock('dotenv', () => ({
      config: (_opts?: any) => ({ parsed: {}, error: undefined }),
    }));
    jest.resetModules(); // Limpia el caché de módulos para asegurar una carga fresca
    process.env = {}; // Restaura las variables de entorno originales antes de cada test
  });

  afterAll(() => {
    process.env = ORIGINAL_ENVS; // Restaura las variables de entorno originales después de todos los tests
  });
  it('should load variables with default values ​​when they do not exist in the environment', async () => {
    const { BasicConfig } = await import('@config');
    const cfg = new BasicConfig();
    expect(cfg.nodeEnv).toBe('development');
    expect(cfg.port).toBe(4000);
    expect(cfg.serviceName).toBe('oauth2');
    expect(cfg.logLevel).toBe('info');
  });
  it('should correctly parse data types (number, enum, string)', async () => {
    process.env.NODE_ENV = 'production';
    process.env.PORT = '8080';
    process.env.SERVICE_NAME = 'oauth2-service';
    process.env.LOG_LEVEL = 'debug';

    const { BasicConfig } = await import('@config');
    const cfg = new BasicConfig();

    expect(typeof cfg.port).toBe('number');
    expect(typeof cfg.nodeEnv).toBe('string');
    expect(typeof cfg.serviceName).toBe('string');
    expect(typeof cfg.logLevel).toBe('string');
  });
  it('should throw an error if invalid values are provided in the environment', async () => {
    process.env.NODE_ENV = 'testEnv';
    await expect(async () => {
      const { BasicConfig } = await import('@config');
      new BasicConfig();
    }).rejects.toThrow();

    process.env.NODE_ENV = 'testLevel';
    await expect(async () => {
      const { BasicConfig } = await import('@config');
      new BasicConfig();
    }).rejects.toThrow();
  });
  it('should respect values defined in the .env', async () => {
    const { BasicConfig } = await import('@config');
    const tmp = makeTempDir();
    const envPath = path.join(tmp, '.env');
    fs.writeFileSync(envPath, 'NODE_ENV=test\nPORT=4100\nSERVICE_NAME=from-dotenv\nLOG_LEVEL=warn\n');

    loadEnv(tmp);
    const cfg = new BasicConfig();
    expect(cfg.nodeEnv).toBe('test');
    expect(cfg.port).toBe(4100);
    expect(cfg.serviceName).toBe('from-dotenv');
    expect(cfg.logLevel).toBe('warn');
  });
  it('should allow overwriting variables through process env', async () => {
    const { BasicConfig } = await import('@config');
    const tmp = makeTempDir();
    const envPath = path.join(tmp, '.env');
    fs.writeFileSync(envPath, 'PORT=4100\n');
    loadEnv(tmp);
    process.env.PORT = '4200';
    const cfg = new BasicConfig();
    expect(cfg.port).toBe(4200);
  });
});
