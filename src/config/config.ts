import { get } from 'env-var';

export type NodeEnv = 'development' | 'test' | 'production';

export interface IConfig {
  nodeEnv: NodeEnv;
  port: number;
  serviceName: string;
  logLevel: 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';
}

export class BasicConfig implements IConfig {
  nodeEnv = get('NODE_ENV').default('development').asEnum<NodeEnv>(['development', 'test', 'production']);
  logLevel = get('LOG_LEVEL').default('info').asEnum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']);
  port = get('PORT').default('4000').asPortNumber();
  serviceName = get('SERVICE_NAME').default('oauth2').asString();
}
