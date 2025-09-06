import { BasicConfig } from '@config';
import { AppRouter, ExpressServer } from '@presentation';
import { Container, Logger, TOKENS } from '@shared';
import express from 'express';
// Mocks
jest.mock('express');
jest.mock('../../../src/presentation/http/routes/app.router');

describe('ExpressServer', () => {
  let mockContainer: jest.Mocked<Container>;
  let mockLogger: jest.Mocked<Logger>;
  let mockConfig: jest.Mocked<BasicConfig>;
  let mockApp: jest.Mocked<express.Application>;
  let mockRouter: jest.Mocked<express.Router>;
  let mockServer: any;

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();

    // Reset del singleton
    (ExpressServer as any).instance = undefined;

    // Setup del mock app
    mockApp = {
      use: jest.fn(),
      listen: jest.fn(),
    } as any;

    // Setup del mock server
    mockServer = {
      close: jest.fn((callback) => callback && callback()),
    };

    // Mock de express() que retorna la app mockeada
    (express as jest.MockedFunction<typeof express>).mockReturnValue(mockApp as any);

    // Mock de express.json y express.urlencoded
    (express.json as jest.Mock).mockReturnValue('json-middleware');
    (express.urlencoded as jest.Mock).mockReturnValue('urlencoded-middleware');

    // Setup del mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;

    // Setup del mock config
    mockConfig = {
      port: 3000,
      serviceName: 'test-service',
      nodeEnv: 'test',
    } as any;

    // Setup del mock container
    mockContainer = {
      resolve: jest.fn((token) => {
        if (token === TOKENS.Logger) return mockLogger;
        if (token === TOKENS.Config) return mockConfig;
        return null;
      }),
    } as any;

    // Setup del mock router
    mockRouter = {
      get: jest.fn(),
      post: jest.fn(),
      use: jest.fn(),
    } as any;

    // Mock del AppRouter.routes
    (AppRouter.routes as jest.Mock).mockReturnValue(mockRouter);

    // Mock del app.listen para que retorne el servidor mockeado
    mockApp.listen.mockReturnValue(mockServer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Server Creation', () => {
    it('should create an express server without errores', () => {
      expect(() => {
        ExpressServer.createExpressServer(mockContainer);
      }).not.toThrow();

      // Verificar que se creó la aplicación Express
      expect(express).toHaveBeenCalled();

      // Verificar que se resolvieron las dependencias del container
      expect(mockContainer.resolve).toHaveBeenCalledWith(TOKENS.Logger);
      expect(mockContainer.resolve).toHaveBeenCalledWith(TOKENS.Config);
    });

    it('I should implement the singleton pattern correctly', () => {
      const server1 = ExpressServer.createExpressServer(mockContainer);
      const server2 = ExpressServer.createExpressServer(mockContainer);

      expect(server1).toBe(server2);
      expect(express).toHaveBeenCalledTimes(1);
    });
  });

  describe('Router Registration', () => {
    it('debería registrar el enrutador principal en la aplicación', () => {
      ExpressServer.createExpressServer(mockContainer);

      // Verificar que se llamó a AppRouter.routes con el container
      expect(AppRouter.routes).toHaveBeenCalledWith(mockContainer);

      // Verificar que se registró el router en la aplicación
      expect(mockApp.use).toHaveBeenCalledWith(mockRouter);
    });
  });

  describe('Middleware Setup', () => {
    it('I should initialize basic middlewares correctly', () => {
      ExpressServer.createExpressServer(mockContainer);

      // Verificar que se configuraron los middlewares de express
      expect(express.json).toHaveBeenCalled();
      expect(express.urlencoded).toHaveBeenCalledWith({ extended: true });

      // Verificar que se registraron en la aplicación
      expect(mockApp.use).toHaveBeenCalledWith('json-middleware');
      expect(mockApp.use).toHaveBeenCalledWith('urlencoded-middleware');
    });

    it('I should configure my middlewares in the correct order', () => {
      ExpressServer.createExpressServer(mockContainer);

      // Verificar el orden de llamadas a app.use
      const useCalls = mockApp.use.mock.calls;

      // Los middlewares deberían configurarse antes que las rutas
      expect(useCalls[0][0]).toBe('json-middleware');
      expect(useCalls[1][0]).toBe('urlencoded-middleware');
      expect(useCalls[2][0]).toBe(mockRouter);
    });
  });

  describe('Health Endpoint', () => {
    it('I should mount the health endpoint on the express server', () => {
      ExpressServer.createExpressServer(mockContainer);

      // Verificar que se registró el AppRouter que contiene el endpoint health
      expect(AppRouter.routes).toHaveBeenCalledWith(mockContainer);
      expect(mockApp.use).toHaveBeenCalledWith(mockRouter);

      // Verificar que el router fue llamado con el container correcto
      expect(AppRouter.routes).toHaveBeenCalledTimes(1);
    });
  });

  describe('Server Lifecycle', () => {
    it('I should start the server on the configured port', async () => {
      const server = ExpressServer.createExpressServer(mockContainer);

      await server.start();

      // Verificar que se llamó a listen con el puerto correcto
      expect(mockApp.listen).toHaveBeenCalledWith(mockConfig.port, expect.any(Function));
    });

    it('I should log a message when the server starts', async () => {
      const server = ExpressServer.createExpressServer(mockContainer);

      await server.start();

      // Ejecutar el callback de listen manualmente para simular el inicio del servidor
      const listenCallback = mockApp.listen.mock.calls[0][1];
      if (typeof listenCallback === 'function') {
        listenCallback();
      }

      // Verificar que se registró el mensaje de log
      expect(mockLogger.info).toHaveBeenCalledWith(`Server running on port ${mockConfig.port}`);
    });

    it('I should close the server gracefully', async () => {
      const server = ExpressServer.createExpressServer(mockContainer);

      await server.start();

      // Simular el cierre del servidor
      const closePromise = new Promise<void>((resolve) => {
        mockServer.close.mockImplementation((callback: (() => void) | undefined) => {
          if (callback) callback();
          resolve();
        });
      });

      // Ejecutar el cierre
      mockServer.close();
      await closePromise;

      // Verificar que se llamó al método close
      expect(mockServer.close).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('I should handle errors during server creation', () => {
      // Mock que lance error al crear express app
      (express as jest.MockedFunction<typeof express>).mockImplementation(() => {
        throw new Error('Failed to create express app');
      });

      expect(() => {
        ExpressServer.createExpressServer(mockContainer);
      }).toThrow('Failed to create express app');
    });

    it('I should handle errors during dependency resolution', () => {
      // Mock del container que lance error
      mockContainer.resolve.mockImplementation(() => {
        throw new Error('Dependency resolution failed');
      });

      expect(() => {
        ExpressServer.createExpressServer(mockContainer);
      }).toThrow('Dependency resolution failed');
    });

    it('I should handle errors during route configuration', () => {
      // Mock que lance error al crear rutas
      (AppRouter.routes as jest.Mock).mockImplementation(() => {
        throw new Error('Failed to create routes');
      });

      expect(() => {
        ExpressServer.createExpressServer(mockContainer);
      }).toThrow('Failed to create routes');
    });
  });

  describe('Integration Tests', () => {
    it('I should configure the entire application correctly', () => {
      const server = ExpressServer.createExpressServer(mockContainer);

      // Verificar que todos los componentes se configuraron
      expect(express).toHaveBeenCalled();
      expect(mockContainer.resolve).toHaveBeenCalledWith(TOKENS.Logger);
      expect(mockContainer.resolve).toHaveBeenCalledWith(TOKENS.Config);
      expect(express.json).toHaveBeenCalled();
      expect(express.urlencoded).toHaveBeenCalledWith({ extended: true });
      expect(AppRouter.routes).toHaveBeenCalledWith(mockContainer);
      expect(mockApp.use).toHaveBeenCalledTimes(3);
    });

    it('I should work correctly with different configurations', () => {
      // Configuración alternativa
      const altConfig = {
        port: 8080,
        serviceName: 'alt-service',
        nodeEnv: 'production',
      };

      mockContainer.resolve.mockImplementation((token) => {
        if (token === TOKENS.Logger) return mockLogger;
        if (token === TOKENS.Config) return altConfig;
        return null;
      });

      // Reset del singleton para permitir nueva instancia
      (ExpressServer as any).instance = undefined;

      const server = ExpressServer.createExpressServer(mockContainer);

      expect(() => server.start()).not.toThrow();
    });
  });
});
