import { AppRouter, HealthRoutes } from '@presentation';
import { Container } from '@shared';
import express from 'express';
import request from 'supertest';

jest.mock('../../../src/presentation/http/routes/health.routes');

describe('AppRouter', () => {
  let mockContainer: jest.Mocked<Container>;
  let mockHealthRouter: express.Router;

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();

    // Setup del mock container
    mockContainer = {
      resolve: jest.fn(),
    } as any;

    // Setup del mock health router
    mockHealthRouter = express.Router();
    mockHealthRouter.get('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        service: 'test-service',
        time: new Date().toISOString(),
        env: 'test',
      });
    });

    // Mock del HealthRoutes.routes
    (HealthRoutes.routes as jest.Mock).mockReturnValue(mockHealthRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createApp = (): express.Application => {
    const testApp = express();
    testApp.use('/', AppRouter.routes(mockContainer));
    return testApp;
  };

  describe('Router Registration', () => {
    it('You must register the Health Subrouter in the main router', () => {
      // Crear el router
      const router = AppRouter.routes(mockContainer);

      // Verificar que se llamó a HealthRoutes.routes con el container correcto
      expect(HealthRoutes.routes).toHaveBeenCalledWith(mockContainer);
      expect(HealthRoutes.routes).toHaveBeenCalledTimes(1);

      // Verificar que el router se creó correctamente
      expect(router).toBeDefined();
      expect(typeof router).toBe('function'); // Router es una función
    });
  });
  it('Should expose the Health route in the main application', async () => {
    const app = createApp();
    const response = await request(app).get('/health');

    // Verificar que la ruta está disponible (no devuelve 404)
    expect(response.status).not.toBe(404);
    expect(HealthRoutes.routes).toHaveBeenCalled();
  });
  it('Should return 200 when health is consult from the main router', async () => {
    const app = createApp();
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });
  it('I should spread errors if the subrouter fails', async () => {
    // Mock del health router que lanza error
    const errorHealthRouter = express.Router();
    errorHealthRouter.get('/health', (req, res, next) => {
      const error = new Error('Health check failed');
      next(error);
    });

    (HealthRoutes.routes as jest.Mock).mockReturnValue(errorHealthRouter);

    // Crear nueva app con el router que falla
    const errorApp = createApp();

    // Middleware para capturar errores
    let capturedError: any = null;
    errorApp.use((err: any, req: any, res: any, _next: any) => {
      capturedError = err;
      res.status(500).json({ error: err.message });
    });

    const response = await request(errorApp).get('/health');

    // Verificar que el error se propagó
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Health check failed');
    expect(capturedError).toBeDefined();
    expect(capturedError.message).toBe('Health check failed');
  });
  it('Should not overwritten other application routes', async () => {
    // Crear app con rutas adicionales
    const testApp = express();

    // Agregar una ruta personalizada ANTES del AppRouter
    testApp.get('/custom', (req, res) => {
      res.status(200).json({ route: 'custom' });
    });

    // Agregar el AppRouter
    testApp.use('/', AppRouter.routes(mockContainer));

    // Agregar otra ruta personalizada DESPUÉS del AppRouter
    testApp.get('/another', (req, res) => {
      res.status(200).json({ route: 'another' });
    });

    // Verificar que todas las rutas funcionan correctamente
    const customResponse = await request(testApp).get('/custom');
    expect(customResponse.status).toBe(200);
    expect(customResponse.body).toEqual({ route: 'custom' });

    const healthResponse = await request(testApp).get('/health');
    expect(healthResponse.status).toBe(200);
    expect(healthResponse.body).toHaveProperty('status', 'ok');

    const anotherResponse = await request(testApp).get('/another');
    expect(anotherResponse.status).toBe(200);
    expect(anotherResponse.body).toEqual({ route: 'another' });
  });
});
