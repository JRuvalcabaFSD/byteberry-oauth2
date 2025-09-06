import express, { Application } from 'express';
import request from 'supertest';

import { HealthController, HealthRoutes } from '@presentation';
import { Container } from '@shared';

jest.mock('../../../src/presentation/http/controllers/health.controller');

describe('Health Routes', () => {
  let app: Application;
  let mockContainer: jest.Mocked<Container>;
  let mockHealthController: jest.Mocked<HealthController>;

  beforeEach(() => {
    mockContainer = {
      resolve: jest.fn(),
    } as any;

    // Setup del mock controller
    mockHealthController = {
      getHealth: jest.fn((req, res) => {
        res.status(200).json({
          status: 'ok',
          service: 'test-service',
          time: new Date().toISOString(),
          env: 'test',
        });
      }),
    } as any;

    // Mock del constructor del HealthController
    (HealthController as jest.MockedClass<typeof HealthController>).mockImplementation(() => mockHealthController);

    // Setup de la aplicación Express
    app = express();
    app.use('/', HealthRoutes.routes(mockContainer));
  });
  describe('GET /health', () => {
    it('should expose the GET route on the Health Route', async () => {
      const response = await request(app).get('/health');

      expect(response.status).not.toBe(404);
      expect(mockHealthController.getHealth).toHaveBeenCalled();
    });
    it('should return a valid JSON format response', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['content-type']).toMatch(/json/);
      expect(() => JSON.parse(JSON.stringify(response.body))).not.toThrow();
      expect(typeof response.body).toBe('object');
    });
    it('should delegate logic to the health controller', async () => {
      await request(app).get('/health');

      expect(HealthController).toHaveBeenCalledWith(mockContainer);
      expect(mockHealthController.getHealth).toHaveBeenCalledTimes(1);
    });
    it('should respond with status ok when the controller indicates it', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('status', 'ok');
    });
    it('should respond with status 200 on the health route', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
    });
  });

  describe('Integración completa', () => {
    it('should correctly create the routes with the container provided', () => {
      const routes = HealthRoutes.routes(mockContainer);
      expect(routes).toBeDefined();
      expect(typeof routes).toBe('function');
    });
    it('should instant the controller with the correct container', async () => {
      await request(app).get('/health');

      expect(HealthController).toHaveBeenCalledWith(mockContainer);
    });
  });
});
