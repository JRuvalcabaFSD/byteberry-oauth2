/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import request from 'supertest';
import { ExpressServer } from '@presentation';
import { container } from '@shared';

// Mock del ExpressServer para tests unitarios
jest.mock('@presentation');

// Función helper que replica la lógica de app.ts para testing
async function startApp(testContainer = container) {
  const server = ExpressServer.createExpressServer(testContainer);
  try {
    await server.start();
    return server;
  } catch (error) {
    console.error('[fatal] Unable to start HTTP server', error);
    process.exit(1);
  }
}

describe('App', () => {
  let mockExpressServer: jest.Mocked<ExpressServer>;
  let originalConsoleError: typeof console.error;
  let originalProcessExit: typeof process.exit;

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();

    // Limpiar el cache de módulos para permitir re-importación
    jest.resetModules();

    // Setup del mock ExpressServer
    mockExpressServer = {
      start: jest.fn(),
    } as any;

    // Mock del método estático createExpressServer
    (ExpressServer.createExpressServer as jest.Mock).mockReturnValue(mockExpressServer);

    // Mock de console.error para capturar errores
    originalConsoleError = console.error;
    console.error = jest.fn();

    // Mock de process.exit para evitar que termine el proceso durante tests
    originalProcessExit = process.exit;
    process.exit = jest.fn() as any;
  });

  afterEach(() => {
    // Restaurar console.error y process.exit
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
    jest.clearAllMocks();
  });

  describe('Application Startup', () => {
    it('debe iniciar la aplicación correctamente', async () => {
      // Configurar mock para éxito
      mockExpressServer.start.mockResolvedValue();

      // Ejecutar la función de inicio
      await startApp();

      // Verificar que se creó el servidor con el container correcto
      expect(ExpressServer.createExpressServer).toHaveBeenCalledWith(container);

      // Verificar que se intentó iniciar el servidor
      expect(mockExpressServer.start).toHaveBeenCalled();
    });

    it('debe manejar errores durante el inicio', async () => {
      // Mock que simula error en el inicio del servidor
      const testError = new Error('Server startup failed');
      mockExpressServer.start.mockRejectedValue(testError);

      // Ejecutar la función de inicio
      await startApp();

      // Verificar que se registró el error
      expect(console.error).toHaveBeenCalledWith('[fatal] Unable to start HTTP server', testError);

      // Verificar que se llamó a process.exit con código 1
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('debe crear el servidor usando el container compartido', async () => {
      // Configurar mock para éxito
      mockExpressServer.start.mockResolvedValue();

      // Ejecutar la función de inicio
      await startApp();

      // Verificar que se pasó el container correcto
      expect(ExpressServer.createExpressServer).toHaveBeenCalledWith(container);
    });

    it('debe permitir usar un container personalizado', async () => {
      // Configurar mock para éxito
      mockExpressServer.start.mockResolvedValue();

      // Container personalizado para testing
      const customContainer = { resolve: jest.fn() } as any;

      // Ejecutar la función de inicio con container personalizado
      await startApp(customContainer);

      // Verificar que se usó el container personalizado
      expect(ExpressServer.createExpressServer).toHaveBeenCalledWith(customContainer);
    });

    it('debe manejar errores de creación del servidor', async () => {
      // Mock que simula error en la creación del servidor
      const createError = new Error('Failed to create server');
      (ExpressServer.createExpressServer as jest.Mock).mockImplementation(() => {
        throw createError;
      });

      // Verificar que el error se propaga
      await expect(startApp()).rejects.toThrow('Failed to create server');
    });
  });
});

// Tests E2E - Estos tests prueban la aplicación completa sin mocks
describe('App E2E Tests', () => {
  let server: any;
  let app: any;

  beforeAll(async () => {
    // Configurar el entorno de test
    process.env.NODE_ENV = 'test';
    process.env.PORT = '0'; // Puerto aleatorio para evitar conflictos

    // Importar las dependencias reales (sin mocks)
    jest.unmock('@presentation');
    jest.unmock('@shared');

    // Crear el servidor real
    const { ExpressServer } = await import('@presentation');
    const { container } = await import('@shared');

    const expressServer = ExpressServer.createExpressServer(container);

    // Obtener la app de Express para testing
    app = (expressServer as any).app;

    // Iniciar el servidor en un puerto aleatorio
    server = app.listen(0);
  });

  afterAll(async () => {
    // Cerrar el servidor después de las pruebas
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    }
  });

  describe('Health Endpoint E2E', () => {
    it('debe exponer la ruta health en la aplicación completa', async () => {
      const response = await request(app).get('/health');

      // Verificar que la ruta existe (no devuelve 404)
      expect(response.status).not.toBe(404);
    });

    it('debe responder con estado ok al consultar health en pruebas e2e', async () => {
      const response = await request(app).get('/health');

      // Verificar que el body contiene el estado correcto
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('time');
      expect(response.body).toHaveProperty('env');
    });

    it('debe devolver código 200 en la consulta de health', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
    });

    it('debe devolver una respuesta JSON válida', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['content-type']).toMatch(/json/);
      expect(typeof response.body).toBe('object');
      expect(response.body).not.toBeNull();
    });

    it('debe incluir información del servicio en la respuesta', async () => {
      const response = await request(app).get('/health');

      expect(response.body.service).toBeDefined();
      expect(response.body.time).toBeDefined();
      expect(response.body.env).toBeDefined();

      // Verificar que el tiempo es una fecha válida
      expect(new Date(response.body.time)).toBeInstanceOf(Date);
      expect(isNaN(new Date(response.body.time).getTime())).toBe(false);
    });
  });

  describe('Application Lifecycle E2E', () => {
    it('debe permitir detener la aplicación después de las pruebas', async () => {
      // Crear un servidor temporal para probar el cierre
      const { ExpressServer } = await import('@presentation');
      const { container } = await import('@shared');

      const testServer = ExpressServer.createExpressServer(container);
      const testApp = (testServer as any).app;
      const testHttpServer = testApp.listen(0);

      // Verificar que el servidor está funcionando
      const response = await request(testApp).get('/health');
      expect(response.status).toBe(200);

      // Cerrar el servidor
      const closePromise = new Promise<void>((resolve, reject) => {
        testHttpServer.close((err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });

      await expect(closePromise).resolves.toBeUndefined();
    });

    it('debe manejar múltiples requests concurrentes', async () => {
      const requests = Array.from({ length: 10 }, () => request(app).get('/health'));

      const responses = await Promise.all(requests);

      // Verificar que todas las requests fueron exitosas
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
      });
    });

    it('debe mantener la estabilidad durante requests consecutivas', async () => {
      const iterations = 5;

      for (let i = 0; i < iterations; i++) {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');

        // Pequeña pausa entre requests
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    });
  });

  describe('Error Handling E2E', () => {
    it('debe manejar rutas no existentes correctamente', async () => {
      const response = await request(app).get('/non-existent-route');

      expect(response.status).toBe(404);
    });

    it('debe manejar métodos HTTP no soportados en health', async () => {
      const deleteResponse = await request(app).delete('/health');
      const putResponse = await request(app).put('/health');

      // Verificar que los métodos no soportados devuelven error apropiado
      expect([404, 405]).toContain(deleteResponse.status);
      expect([404, 405]).toContain(putResponse.status);
    });

    it('debe manejar requests malformados', async () => {
      // Test 1: Request GET normal (sin body) debería funcionar
      const normalResponse = await request(app).get('/health');
      expect(normalResponse.status).toBe(200);

      // Test 2: Request con headers adicionales pero sin body malformado
      const headerResponse = await request(app).get('/health').set('X-Custom-Header', 'test-value');
      expect(headerResponse.status).toBe(200);

      // Test 3: Request POST con JSON malformado debería manejar el error apropiadamente
      const malformedResponse = await request(app).post('/health').set('Content-Type', 'application/json').send('{"invalid": json}'); // JSON inválido

      // El servidor debería manejar el JSON malformado con un error apropiado
      expect([400, 404, 405]).toContain(malformedResponse.status);
    });
  });

  describe('Performance E2E', () => {
    it('debe responder en tiempo razonable', async () => {
      const startTime = Date.now();

      const response = await request(app).get('/health');

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000); // Menos de 1 segundo
    });
  });
});
