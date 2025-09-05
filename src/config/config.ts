export interface IConfig {
  nodeEnv: string;
  port: number;
  serviceName: string;
}

export class BasicConfig implements IConfig {
  nodeEnv = process.env.NODE_ENV ?? 'development';
  port = Number(process.env.PORT) || 4000;
  serviceName = process.env.SERVICE_NAME || 'oauth2';
}
