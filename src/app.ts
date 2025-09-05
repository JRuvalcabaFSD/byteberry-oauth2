// src/presentation/example.ts

import { container, TOKENS } from '@config';
import { BasicConfig } from '@config/config';
import { Logger } from '@shared';

const logger = container.resolve<Logger>(TOKENS.Logger);
const config = container.resolve<BasicConfig>(TOKENS.Config);

logger.info(`Starting service on port ${config.port}`);
