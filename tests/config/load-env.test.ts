/* eslint-disable @typescript-eslint/no-explicit-any */
// File: tests/config/load-env.spec.ts
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

jest.unmock('dotenv');
describe('T004 - loadEnv (dotenv loader)', () => {
  const ORIGINAL_ENV = process.env;

  const makeTempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'bb-oauth2-env-'));

  beforeEach(() => {
    jest.resetModules();
    process.env = {};
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  test('load .env and populate process.env with SERVICE_NAME/PORT', async () => {
    const tmp = makeTempDir();
    const envPath = path.join(tmp, '.env');
    fs.writeFileSync(envPath, 'SERVICE_NAME=dotenv-name\nPORT=5050\n');

    jest.resetModules();
    jest.doMock('dotenv', () => ({
      config: (opts?: any) => {
        // simula éxito cuando pides el path correcto
        if (opts?.path === envPath) {
          process.env.SERVICE_NAME = 'dotenv-name';
          process.env.PORT = '5050';
          return { parsed: { SERVICE_NAME: 'dotenv-name', PORT: '5050' } };
        }
        return { parsed: {}, error: undefined };
      },
    }));

    const { loadEnv } = await import('../../src/config/loadEnv');
    loadEnv(tmp); // pasa el cwd para que coincida

    expect(process.env.SERVICE_NAME).toBe('dotenv-name');
    expect(process.env.PORT).toBe('5050');
  });

  test('in development, without .env → emits warning', async () => {
    const tmp = makeTempDir();
    process.env.NODE_ENV = 'development';

    jest.resetModules();
    jest.doMock('dotenv', () => ({
      config: () => ({ parsed: undefined, error: new Error('ENOENT') }), // simula error
    }));

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { loadEnv } = await import('../../src/config/loadEnv');
    loadEnv(tmp);

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
